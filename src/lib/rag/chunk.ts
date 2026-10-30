import type { SourcePage } from "@/types";

export type TextChunk = {
  page: number;
  index: number;
  text: string;
};

const TARGET_CHARS = 800;
const OVERLAP_CHARS = 150;

/** Splits text into sentences (or sentence-sized pieces), keeping punctuation. */
function pieces(text: string): string[] {
  const sentences =
    text.match(/[^.!?\n]+(?:[.!?]+|\n+|$)/g)?.map((s) => s.trim()).filter(Boolean) ?? [];
  // Hard-split anything longer than a whole chunk.
  return sentences.flatMap((sentence) => {
    const parts: string[] = [];
    for (let start = 0; start < sentence.length; start += TARGET_CHARS) {
      parts.push(sentence.slice(start, start + TARGET_CHARS));
    }
    return parts;
  });
}

/**
 * Splits each page into ~800-character chunks on sentence boundaries, with a
 * ~150-character overlap so a fact spanning two chunks is still retrievable.
 * Chunks never cross pages, so every chunk has an exact page number.
 */
export function chunkPages(pages: SourcePage[]): TextChunk[] {
  const chunks: TextChunk[] = [];

  for (const { page, text } of pages) {
    let current: string[] = [];
    let length = 0;
    // Whether `current` holds anything beyond overlap from the previous chunk.
    let hasNewText = false;

    for (const piece of pieces(text)) {
      if (hasNewText && length + piece.length > TARGET_CHARS) {
        chunks.push({ page, index: chunks.length, text: current.join(" ") });

        const overlap: string[] = [];
        let overlapLength = 0;
        for (let i = current.length - 1; i > 0 && overlapLength < OVERLAP_CHARS; i--) {
          overlap.unshift(current[i]);
          overlapLength += current[i].length + 1;
        }
        current = overlap;
        length = overlapLength;
        hasNewText = false;
      }
      current.push(piece);
      length += piece.length + 1;
      hasNewText = true;
    }

    if (hasNewText) {
      chunks.push({ page, index: chunks.length, text: current.join(" ") });
    }
  }

  return chunks;
}
