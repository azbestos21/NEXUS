/** A passage of a source, embedded for semantic search. */
export type SourceChunk = {
  id: string;
  sourceId: string;
  workspaceId: string;
  page: number;
  /** Position of the chunk within its source. */
  index: number;
  text: string;
  /** Unit-length vector, so cosine similarity is a dot product. */
  embedding: Float32Array;
};

/** A retrieved passage, as sent to /api/research. */
export type ResearchPassage = {
  chunkId: string;
  sourceId: string;
  sourceName: string;
  /** Present for PDFs only. */
  page?: number;
  text: string;
};
