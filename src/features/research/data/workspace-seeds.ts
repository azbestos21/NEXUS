import {
  MOCK_MESSAGES,
  MOCK_RESEARCH_EVENTS,
} from "@/features/ai-assistant/data/mock-messages";
import { MOCK_GRAPH } from "@/features/knowledge-graph/data/mock-graph";
import {
  ROME_EVENTS,
  ROME_GRAPH,
  ROME_MESSAGES,
} from "@/features/research/data/rome-seed";
import type { AIMessage, KnowledgeGraph, ResearchEvent } from "@/types";

export type ResearchSession = {
  messages: AIMessage[];
  events: ResearchEvent[];
  graph: KnowledgeGraph;
};

const SEEDS: Record<string, ResearchSession> = {
  ws_webgpu: {
    messages: MOCK_MESSAGES,
    events: MOCK_RESEARCH_EVENTS,
    graph: MOCK_GRAPH,
  },
  ws_roman_empire: {
    messages: ROME_MESSAGES,
    events: ROME_EVENTS,
    graph: ROME_GRAPH,
  },
};

/** Demo content for a workspace, or an empty session if it has none. */
export function getWorkspaceSeed(workspaceId: string): ResearchSession {
  return (
    SEEDS[workspaceId] ?? {
      messages: [],
      events: [],
      graph: { nodes: [], edges: [] },
    }
  );
}
