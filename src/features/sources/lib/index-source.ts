import { getBrowserEmbedder } from "@/lib/embeddings/browser-embedder";
import { chunkPages } from "@/lib/rag/chunk";
import { saveChunks } from "@/features/sources/lib/source-db";
import type { Source, SourceChunk, SourcePage } from "@/types";

/** Chunks and embeds a source's text for semantic search. Returns the chunk count. */
export async function indexSource(
  source: Pick<Source, "id" | "workspaceId">,
  pages: SourcePage[],
): Promise<number> {
  const textChunks = chunkPages(pages);
  const embeddings = await getBrowserEmbedder().embed(
    textChunks.map((chunk) => chunk.text),
  );

  const chunks: SourceChunk[] = textChunks.map((chunk, i) => ({
    id: `${source.id}:${chunk.index}`,
    sourceId: source.id,
    workspaceId: source.workspaceId,
    page: chunk.page,
    index: chunk.index,
    text: chunk.text,
    embedding: embeddings[i],
  }));

  await saveChunks(chunks);
  return chunks.length;
}
