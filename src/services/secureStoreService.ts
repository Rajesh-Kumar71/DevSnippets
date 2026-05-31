import * as SecureStore from "expo-secure-store";

const OPENAI_KEY = "devsnippets_openai_key";
const GEMINI_KEY = "devsnippets_gemini_key";

// SecureStore can fail in Expo Go on Android — wrap everything
async function safeGet(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function safeSet(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (e) {
    throw new Error("Could not save key. Try using a development build instead of Expo Go.");
  }
}

async function safeDelete(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // silently ignore delete failures
  }
}

// OpenAI
export async function saveOpenAiKey(key: string) {
  await safeSet(OPENAI_KEY, key);
}

export async function getOpenAiKey() {
  return safeGet(OPENAI_KEY);
}

export async function deleteOpenAiKey() {
  await safeDelete(OPENAI_KEY);
}

// Gemini
export async function saveGeminiKey(key: string) {
  await safeSet(GEMINI_KEY, key);
}

export async function getGeminiKey() {
  return safeGet(GEMINI_KEY);
}

export async function deleteGeminiKey() {
  await safeDelete(GEMINI_KEY);
}