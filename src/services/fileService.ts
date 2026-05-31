import { Directory, File, Paths } from "expo-file-system/next";

export type LocalSnippetFile = {
  name: string;
  uri: string;
  size: number;
};

const exportDir = new Directory(Paths.document, "devsnippets-exports");

export function getExportDir() {
  return exportDir;
}

export async function ensureExportFolder() {
  if (!exportDir.exists) {
    exportDir.create();
  }
}

export async function listExportedFiles(): Promise<LocalSnippetFile[]> {
  await ensureExportFolder();

  const items = exportDir.list();

  const files: LocalSnippetFile[] = items
    .filter((item) => item instanceof File)
    .map((item) => {
      const f = item as File;
      return {
        name: f.name,
        uri: f.uri,
        size: f.size ?? 0,
      };
    });

  return files.sort((a, b) => b.size - a.size);
}

export async function deleteLocalFile(uri: string) {
  const f = new File(uri);
  if (f.exists) {
    f.delete();
  }
}

export function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}