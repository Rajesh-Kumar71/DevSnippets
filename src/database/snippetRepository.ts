import { db } from "./db";
import {
  CreateSnippetInput,
  Snippet,
  UpdateSnippetInput,
} from "../types/snippet";

export function getAllSnippets(): Snippet[] {
  return db.getAllSync<Snippet>(
    "SELECT * FROM snippets ORDER BY updatedAt DESC"
  );
}

export function searchSnippets(searchText: string): Snippet[] {
  const query = `%${searchText}%`;

  return db.getAllSync<Snippet>(
    `
    SELECT * FROM snippets
    WHERE title LIKE ?
       OR code LIKE ?
       OR language LIKE ?
       OR tags LIKE ?
    ORDER BY updatedAt DESC
    `,
    [query, query, query, query]
  );
}

export function getFavoriteSnippets(): Snippet[] {
  return db.getAllSync<Snippet>(
    "SELECT * FROM snippets WHERE isFavorite = 1 ORDER BY updatedAt DESC"
  );
}

export function getSnippetById(id: number): Snippet | null {
  const snippet = db.getFirstSync<Snippet>(
    "SELECT * FROM snippets WHERE id = ?",
    [id]
  );

  return snippet ?? null;
}

export function createSnippet(input: CreateSnippetInput): number {
  const now = new Date().toISOString();

  const result = db.runSync(
    `
    INSERT INTO snippets (title, code, language, tags, isFavorite, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, 0, ?, ?)
    `,
    [input.title, input.code, input.language, input.tags, now, now]
  );

  return Number(result.lastInsertRowId);
}

export function updateSnippet(input: UpdateSnippetInput) {
  const now = new Date().toISOString();

  db.runSync(
    `
    UPDATE snippets
    SET title = ?, code = ?, language = ?, tags = ?, updatedAt = ?
    WHERE id = ?
    `,
    [input.title, input.code, input.language, input.tags, now, input.id]
  );
}

export function deleteSnippet(id: number) {
  db.runSync("DELETE FROM snippets WHERE id = ?", [id]);
}

export function toggleFavorite(id: number, currentValue: number) {
  const nextValue = currentValue === 1 ? 0 : 1;

  db.runSync(
    "UPDATE snippets SET isFavorite = ?, updatedAt = ? WHERE id = ?",
    [nextValue, new Date().toISOString(), id]
  );
}