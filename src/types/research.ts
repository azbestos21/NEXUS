import type { Citation } from "./ai";
import type { KnowledgeGraph } from "./knowledge-graph";

export type ResearchQuery = {
  id: string;
  workspaceId: string;
  query: string;
  createdAt: string;
};

export type ResearchEventType =
  | "query_analysis"
  | "search"
  | "retrieval"
  | "claim_extraction"
  | "verification"
  | "graph_generation"
  | "answer_generation";

export type ResearchEventStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed";

export type ResearchEvent = {
  id: string;
  type: ResearchEventType;
  status: ResearchEventStatus;
  message: string;
};

/** One line of the newline-delimited JSON stream returned by /api/research. */
export type ResearchStreamEvent =
  | { type: "activity"; event: ResearchEvent }
  | { type: "token"; text: string }
  | { type: "graph"; graph: KnowledgeGraph }
  | { type: "citations"; citations: Citation[] }
  | { type: "error"; message: string }
  | { type: "done" };
