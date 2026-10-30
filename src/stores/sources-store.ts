"use client";

import { create } from "zustand";
import {
  ExtractionError,
  extractFileText,
  type ExtractedText,
} from "@/features/sources/lib/extract-text";
import { indexSource } from "@/features/sources/lib/index-source";
import {
  deleteSource,
  getSourceContent,
  listSources,
  saveSource,
  saveSourceContent,
} from "@/features/sources/lib/source-db";
import {
  getSourceById,
  getSourcesByWorkspace,
} from "@/features/sources/data/mock-sources";
import type { Source } from "@/types";

type SourcesState = {
  /** Demo sources first, then the user's own sources (newest first). */
  byWorkspace: Record<string, Source[]>;
  loadSources: (workspaceId: string) => Promise<void>;
  addFile: (workspaceId: string, file: File) => Promise<void>;
  addNote: (workspaceId: string, title: string, text: string) => Promise<void>;
  removeSource: (source: Source) => Promise<void>;
};

export const useSourcesStore = create<SourcesState>((set, get) => {
  const upsert = (source: Source) =>
    set((state) => {
      const list = state.byWorkspace[source.workspaceId] ?? [];
      const exists = list.some((s) => s.id === source.id);
      return {
        byWorkspace: {
          ...state.byWorkspace,
          [source.workspaceId]: exists
            ? list.map((s) => (s.id === source.id ? source : s))
            : [source, ...list],
        },
      };
    });

  /** Shows the source as processing, extracts and indexes its text, then persists the result. */
  const ingest = async (
    pending: Source,
    extract: () => Promise<ExtractedText>,
  ) => {
    upsert(pending);
    let finished: Source;
    try {
      const { type, pages, pageCount } = await extract();
      await saveSourceContent({ sourceId: pending.id, pages });
      const chunkCount = await indexSource(pending, pages);
      finished = {
        ...pending,
        type,
        status: "ready",
        pageCount,
        charCount: pages.reduce((sum, p) => sum + p.text.length, 0),
        chunkCount,
      };
    } catch (error) {
      if (!(error instanceof ExtractionError)) {
        console.error("[sources] processing failed", error);
      }
      finished = {
        ...pending,
        status: "failed",
        error:
          error instanceof ExtractionError
            ? error.message
            : "Something went wrong while reading this source.",
      };
    }
    await saveSource(finished);
    upsert(finished);
  };

  const newSource = (workspaceId: string, name: string, type: Source["type"]): Source => ({
    id: `src_${crypto.randomUUID()}`,
    workspaceId,
    name,
    type,
    status: "processing",
    createdAt: new Date().toISOString(),
  });

  return {
    byWorkspace: {},
    loadSources: async (workspaceId) => {
      if (get().byWorkspace[workspaceId]) return;
      const demo = getSourcesByWorkspace(workspaceId);
      set((state) => ({
        byWorkspace: { ...state.byWorkspace, [workspaceId]: demo },
      }));
      const saved = await listSources(workspaceId);
      saved.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      set((state) => ({
        byWorkspace: { ...state.byWorkspace, [workspaceId]: [...saved, ...demo] },
      }));

      // Sources added before search existed have text but no embeddings yet.
      for (const source of saved) {
        if (source.status !== "ready" || source.chunkCount !== undefined) continue;
        void ingest({ ...source, status: "processing" }, async () => {
          const content = await getSourceContent(source.id);
          if (!content) throw new ExtractionError("The stored text for this source is missing.");
          return { type: source.type, pages: content.pages, pageCount: source.pageCount };
        });
      }
    },
    addFile: (workspaceId, file) =>
      ingest(
        newSource(
          workspaceId,
          file.name,
          file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "text",
        ),
        () => extractFileText(file),
      ),
    addNote: (workspaceId, title, text) =>
      ingest(newSource(workspaceId, title, "note"), async () => {
        const trimmed = text.trim();
        if (!trimmed) throw new ExtractionError("The note is empty.");
        return { type: "note", pages: [{ page: 1, text: trimmed }] };
      }),
    removeSource: async (source) => {
      await deleteSource(source.id);
      set((state) => ({
        byWorkspace: {
          ...state.byWorkspace,
          [source.workspaceId]: (state.byWorkspace[source.workspaceId] ?? []).filter(
            (s) => s.id !== source.id,
          ),
        },
      }));
    },
  };
});

/** Finds a source by id across all loaded workspaces, falling back to demo sources. */
export function findSource(
  byWorkspace: Record<string, Source[]>,
  id: string,
): Source | undefined {
  for (const sources of Object.values(byWorkspace)) {
    const match = sources.find((source) => source.id === id);
    if (match) return match;
  }
  return getSourceById(id);
}
