import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("devsnippets.db");

export function initializeDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS snippets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      code TEXT NOT NULL,
      language TEXT NOT NULL,
      tags TEXT DEFAULT '',
      isFavorite INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS snippet_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      snippetId INTEGER NOT NULL,
      fileName TEXT NOT NULL,
      fileUri TEXT NOT NULL,
      fileType TEXT DEFAULT '',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (snippetId) REFERENCES snippets(id) ON DELETE CASCADE
    );
  `);
}