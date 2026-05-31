import { File, Paths } from "expo-file-system/next";
import * as Sharing from "expo-sharing";
import { Snippet } from "../types/snippet";
import { ensureExportFolder } from "./fileService";

export type ExportFormat = "txt" | "js" | "json";

export async function exportSnippet(snippet: Snippet, format: ExportFormat) {
  await ensureExportFolder();

  const safeName = toSafeFileName(snippet.title);
  const fileName = `${safeName}-${Date.now()}.${format}`;
  const content = buildContent(snippet, format);

  const file = new File(Paths.document, `devsnippets-exports/${fileName}`);
  file.write(content);

  return { fileName, fileUri: file.uri };
}

export async function shareFile(fileUri: string) {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Sharing is not available on this device.");
  }
  await Sharing.shareAsync(fileUri);
}

function buildContent(snippet: Snippet, format: ExportFormat): string {
  if (format === "json") {
    return JSON.stringify(
      {
        title: snippet.title,
        language: snippet.language,
        tags: snippet.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        code: snippet.code,
        createdAt: snippet.createdAt,
        updatedAt: snippet.updatedAt,
      },
      null,
      2
    );
  }

  if (format === "js") {
    return `// ${snippet.title}\n// Language: ${snippet.language}\n// Tags: ${snippet.tags}\n\n${snippet.code}\n`;
  }

  return `Title: ${snippet.title}\nLanguage: ${snippet.language}\nTags: ${snippet.tags}\n\nCode:\n${snippet.code}\n`;
}

function toSafeFileName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}