import type { SourcePage, SourceType } from "@/types";

export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const ACCEPTED_FILE_TYPES = ".pdf,.txt,.md,.markdown";

export class ExtractionError extends Error {}

export type ExtractedText = {
  type: SourceType;
  pages: SourcePage[];
  pageCount?: number;
};

/** Collapses runs of spaces and blank lines left over from extraction. */
function cleanText(text: string): string {
  return text
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractPdf(file: File): Promise<ExtractedText> {
  // Loaded on demand: pdf.js is large and only needed when a PDF is added.
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data });
  let pdf;
  try {
    pdf = await loadingTask.promise;
  } catch {
    throw new ExtractionError("This PDF could not be opened. It may be damaged or password-protected.");
  }

  const pages: SourcePage[] = [];
  for (let page = 1; page <= pdf.numPages; page++) {
    const content = await (await pdf.getPage(page)).getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str + (item.hasEOL ? "\n" : "") : ""))
      .join("");
    const cleaned = cleanText(text);
    if (cleaned) pages.push({ page, text: cleaned });
  }
  const pageCount = pdf.numPages;
  await loadingTask.destroy();

  if (pages.length === 0) {
    throw new ExtractionError(
      "No text found. This looks like a scanned PDF, which needs OCR (not supported yet).",
    );
  }
  return { type: "pdf", pages, pageCount };
}

/** Reads a PDF or plain-text file into pages of clean text. */
export async function extractFileText(file: File): Promise<ExtractedText> {
  if (file.size > MAX_FILE_BYTES) {
    throw new ExtractionError("File is larger than 20 MB.");
  }

  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    return extractPdf(file);
  }
  if (/\.(txt|md|markdown)$/.test(name) || file.type.startsWith("text/")) {
    const text = cleanText(await file.text());
    if (!text) throw new ExtractionError("This file is empty.");
    return { type: "text", pages: [{ page: 1, text }] };
  }

  throw new ExtractionError("Unsupported file type. Use a PDF, .txt or .md file.");
}
