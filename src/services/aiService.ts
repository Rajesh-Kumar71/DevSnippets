import { Snippet } from "../types/snippet";
import { getGeminiKey, getOpenAiKey } from "./secureStoreService";

export type AiExplanation = {
  summary: string;
  explanation: string[];
  suggestions: string[];
  isMock: boolean;
  provider?: "openai" | "gemini" | "mock";
};

type AiJsonResponse = {
  summary: string;
  explanation: string[];
  suggestions: string[];
};

function buildPrompt(snippet: Snippet): string {
  return `You are a code review assistant. Analyze the following ${snippet.language} code snippet and respond ONLY with a valid JSON object. No extra text, no markdown, no backticks.

The JSON must follow this exact structure:
{
  "summary": "one sentence describing what this code does",
  "explanation": ["point 1", "point 2", "point 3"],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}

Snippet title: ${snippet.title}
Language: ${snippet.language}
Tags: ${snippet.tags}

Code:
${snippet.code}`;
}

async function callOpenAi(
  snippet: Snippet,
  apiKey: string
): Promise<AiExplanation> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: buildPrompt(snippet) }],
      temperature: 0.3,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.status}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content ?? "";
  const parsed: AiJsonResponse = JSON.parse(raw);

  return {
    summary: parsed.summary,
    explanation: parsed.explanation,
    suggestions: parsed.suggestions,
    isMock: false,
    provider: "openai",
  };
}

async function callGemini(
  snippet: Snippet,
  apiKey: string
): Promise<AiExplanation> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(snippet) }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 600,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini error: ${response.status}`);
  }

  const data = await response.json();
  const raw =
    data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // Gemini sometimes wraps JSON in backticks even when asked not to
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const parsed: AiJsonResponse = JSON.parse(cleaned);

  return {
    summary: parsed.summary,
    explanation: parsed.explanation,
    suggestions: parsed.suggestions,
    isMock: false,
    provider: "gemini",
  };
}

export async function generateSnippetExplanation(
  snippet: Snippet
): Promise<AiExplanation> {
  const openAiKey = await getOpenAiKey();
  const geminiKey = await getGeminiKey();

  // try OpenAI first
  if (openAiKey) {
    try {
      return await callOpenAi(snippet, openAiKey);
    } catch (e) {
      console.log("OpenAI failed, trying Gemini...", e);
    }
  }

  // fallback to Gemini
  if (geminiKey) {
    try {
      return await callGemini(snippet, geminiKey);
    } catch (e) {
      console.log("Gemini failed, falling back to mock...", e);
    }
  }

  // both failed or no keys saved
  return buildMockExplanation(snippet);
}

function buildMockExplanation(snippet: Snippet): AiExplanation {
  const code = snippet.code.toLowerCase();

  if (code.includes("flatlist")) {
    return {
      summary: "This React Native snippet renders a scrollable list using FlatList.",
      explanation: [
        "FlatList efficiently renders large lists by only mounting visible items.",
        "The data prop accepts an array of items to display.",
        "keyExtractor gives each row a stable key to avoid re-render issues.",
      ],
      suggestions: [
        "Use a unique ID in keyExtractor instead of index when possible.",
        "Add a ListEmptyComponent to handle the case where data is empty.",
        "Move renderItem outside the component to avoid recreating it on each render.",
      ],
      isMock: true,
      provider: "mock",
    };
  }

  if (code.includes("usestate") || code.includes("useeffect")) {
    return {
      summary: `This ${snippet.language} snippet uses React hooks to manage component state or side effects.`,
      explanation: [
        "useState stores a value that triggers a re-render when changed.",
        "useEffect runs after render and is used for data fetching or subscriptions.",
        "The dependency array controls when the effect re-runs.",
      ],
      suggestions: [
        "Keep state as minimal as possible — derive values instead of storing them.",
        "Always clean up subscriptions or timers in the useEffect return function.",
        "Use separate useEffect calls for unrelated side effects.",
      ],
      isMock: true,
      provider: "mock",
    };
  }

  return {
    summary: `This ${snippet.language} snippet is saved locally for reuse.`,
    explanation: [
      "The snippet is stored in SQLite and available offline.",
      "You can search it by title, language, tags, or code content.",
      "Export it as .txt, .js, or .json and share it with other apps.",
    ],
    suggestions: [
      "Add meaningful tags to make this easier to find later.",
      "Keep the snippet focused on one thing so it stays reusable.",
      "Add a comment at the top describing when to use this snippet.",
    ],
    isMock: true,
    provider: "mock",
  };
}