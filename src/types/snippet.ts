export type Snippet = {
  id: number;
  title: string;
  code: string;
  language: string;
  tags: string;
  isFavorite: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateSnippetInput = {
  title: string;
  code: string;
  language: string;
  tags: string;
};

export type UpdateSnippetInput = {
  id: number;
  title: string;
  code: string;
  language: string;
  tags: string;
};

export type SnippetFile = {
  id: number;
  snippetId: number;
  fileName: string;
  fileUri: string;
  fileType: string;
  createdAt: string;
};