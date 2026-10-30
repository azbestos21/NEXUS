/** Turns text into unit-length vectors for semantic search. */
export interface Embedder {
  embed(texts: string[]): Promise<Float32Array[]>;
}
