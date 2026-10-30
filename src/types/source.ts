export type SourceType = "pdf" | "website" | "note" | "text";

export type SourceStatus = "processing" | "ready" | "failed";

export type Source = {
  id: string;
  workspaceId: string;
  name: string;
  type: SourceType;
  status: SourceStatus;
  createdAt: string;
  /** Number of PDF pages; absent for notes and text files. */
  pageCount?: number;
  /** Length of the extracted text. */
  charCount?: number;
  /** Number of embedded passages; absent until the source is indexed for search. */
  chunkCount?: number;
  /** Why processing failed, shown to the user. */
  error?: string;
};

/** Text extracted from a source. Notes and text files have a single page 1. */
export type SourcePage = {
  page: number;
  text: string;
};

export type SourceContent = {
  sourceId: string;
  pages: SourcePage[];
};
