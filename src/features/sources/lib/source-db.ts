import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Source, SourceChunk, SourceContent } from "@/types";

/**
 * Browser-side storage for user-added sources. Only metadata and extracted
 * text are kept; the original files are discarded after extraction.
 */
interface NexusSourcesDB extends DBSchema {
  sources: {
    key: string;
    value: Source;
    indexes: { byWorkspace: string };
  };
  contents: {
    key: string;
    value: SourceContent;
  };
  chunks: {
    key: string;
    value: SourceChunk;
    indexes: { byWorkspace: string; bySource: string };
  };
}

let dbPromise: Promise<IDBPDatabase<NexusSourcesDB>> | undefined;

function getDB() {
  dbPromise ??= openDB<NexusSourcesDB>("nexus-sources", 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const sources = db.createObjectStore("sources", { keyPath: "id" });
        sources.createIndex("byWorkspace", "workspaceId");
        db.createObjectStore("contents", { keyPath: "sourceId" });
      }
      if (oldVersion < 2) {
        const chunks = db.createObjectStore("chunks", { keyPath: "id" });
        chunks.createIndex("byWorkspace", "workspaceId");
        chunks.createIndex("bySource", "sourceId");
      }
    },
  });
  return dbPromise;
}

export async function listSources(workspaceId: string): Promise<Source[]> {
  const db = await getDB();
  return db.getAllFromIndex("sources", "byWorkspace", workspaceId);
}

export async function saveSource(source: Source): Promise<void> {
  const db = await getDB();
  await db.put("sources", source);
}

export async function saveSourceContent(content: SourceContent): Promise<void> {
  const db = await getDB();
  await db.put("contents", content);
}

export async function getSourceContent(
  sourceId: string,
): Promise<SourceContent | undefined> {
  const db = await getDB();
  return db.get("contents", sourceId);
}

export async function saveChunks(chunks: SourceChunk[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("chunks", "readwrite");
  await Promise.all([...chunks.map((chunk) => tx.store.put(chunk)), tx.done]);
}

export async function listWorkspaceChunks(
  workspaceId: string,
): Promise<SourceChunk[]> {
  const db = await getDB();
  return db.getAllFromIndex("chunks", "byWorkspace", workspaceId);
}

export async function deleteSource(sourceId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(["sources", "contents", "chunks"], "readwrite");
  const chunkKeys = await tx
    .objectStore("chunks")
    .index("bySource")
    .getAllKeys(sourceId);
  await Promise.all([
    tx.objectStore("sources").delete(sourceId),
    tx.objectStore("contents").delete(sourceId),
    ...chunkKeys.map((key) => tx.objectStore("chunks").delete(key)),
    tx.done,
  ]);
}
