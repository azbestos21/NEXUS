import type { SourceChunk } from "@/types";

export type ScoredChunk = {
  chunk: SourceChunk;
  score: number;
};

/** Cosine similarity of two unit-length vectors. */
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

type RetrieveOptions = {
  limit?: number;
  /** Chunks scoring below this are treated as unrelated to the query. */
  minScore?: number;
  /** Cap per source, so one long document can't crowd out the rest. */
  maxPerSource?: number;
};

/** Returns the chunks most similar to the query, best first. */
export function rankChunks(
  queryEmbedding: Float32Array,
  chunks: SourceChunk[],
  { limit = 6, minScore = 0.2, maxPerSource = 4 }: RetrieveOptions = {},
): ScoredChunk[] {
  const scored = chunks
    .map((chunk) => ({ chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
    .filter((item) => item.score >= minScore)
    .sort((a, b) => b.score - a.score);

  const perSource = new Map<string, number>();
  const results: ScoredChunk[] = [];
  for (const item of scored) {
    const count = perSource.get(item.chunk.sourceId) ?? 0;
    if (count >= maxPerSource) continue;
    perSource.set(item.chunk.sourceId, count + 1);
    results.push(item);
    if (results.length >= limit) break;
  }
  return results;
}
