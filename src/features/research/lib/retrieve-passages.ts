import { listWorkspaceChunks } from "@/features/sources/lib/source-db";
import { getBrowserEmbedder } from "@/lib/embeddings/browser-embedder";
import { rankChunks } from "@/lib/rag/retrieve";
import type { ResearchPassage, Source } from "@/types";

export type RetrievalResult = {
  passages: ResearchPassage[];
  /** Number of chunks searched; 0 means the workspace has no indexed sources. */
  searched: number;
};

/** Finds the passages in a workspace's sources most relevant to the query. */
export async function retrievePassages(
  workspaceId: string,
  query: string,
  sources: Source[],
): Promise<RetrievalResult> {
  const chunks = await listWorkspaceChunks(workspaceId);
  if (chunks.length === 0) return { passages: [], searched: 0 };

  const [queryEmbedding] = await getBrowserEmbedder().embed([query]);
  const sourcesById = new Map(sources.map((source) => [source.id, source]));

  const passages = rankChunks(queryEmbedding, chunks).map(({ chunk }) => {
    const source = sourcesById.get(chunk.sourceId);
    return {
      chunkId: chunk.id,
      sourceId: chunk.sourceId,
      sourceName: source?.name ?? "Untitled source",
      page: source?.type === "pdf" ? chunk.page : undefined,
      text: chunk.text,
    };
  });

  return { passages, searched: chunks.length };
}
