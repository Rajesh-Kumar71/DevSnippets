import { db } from "./db";
import { SnippetFile } from "../types/snippet";

export function getFilesForSnippet(snippetId: number): SnippetFile[] {
  return db.getAllSync<SnippetFile>(
    "SELECT * FROM snippet_files WHERE snippetId = ? ORDER BY createdAt DESC",
    [snippetId]
  );
}

export function attachFileToSnippet(
  snippetId: number,
  fileName: string,
  fileUri: string,
  fileType: string
): number {
  const now = new Date().toISOString();

  const result = db.runSync(
    `INSERT INTO snippet_files (snippetId, fileName, fileUri, fileType, createdAt)
     VALUES (?, ?, ?, ?, ?)`,
    [snippetId, fileName, fileUri, fileType, now]
  );

  return Number(result.lastInsertRowId);
}

export function removeFileFromSnippet(id: number) {
  db.runSync("DELETE FROM snippet_files WHERE id = ?", [id]);
}