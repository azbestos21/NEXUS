import type { Workspace } from "@/types";

export const MOCK_WORKSPACES: Workspace[] = [
  {
    id: "ws_roman_empire",
    name: "Fall of the Roman Empire",
    description:
      "Why the Western Roman Empire collapsed: politics, money, invasions, and disease.",
    createdAt: "2026-10-24T10:00:00.000Z",
    updatedAt: "2026-10-29T20:15:00.000Z",
  },
  {
    id: "ws_webgpu",
    name: "WebGPU & Browser AI",
    description:
      "How WebGPU is changing browser-based AI inference, privacy, and edge compute.",
    createdAt: "2026-10-20T09:00:00.000Z",
    updatedAt: "2026-10-28T18:30:00.000Z",
  },
  {
    id: "ws_rag_patterns",
    name: "RAG Evaluation Patterns",
    description:
      "Citation grounding, retrieval quality metrics, and hallucination checks.",
    createdAt: "2026-10-12T14:20:00.000Z",
    updatedAt: "2026-10-25T11:05:00.000Z",
  },
  {
    id: "ws_knowledge_graphs",
    name: "Knowledge Graph Extraction",
    description:
      "Entity and relationship extraction from research corpora.",
    createdAt: "2026-10-05T08:15:00.000Z",
    updatedAt: "2026-10-22T16:40:00.000Z",
  },
];

export function getWorkspaceById(id: string): Workspace | undefined {
  return MOCK_WORKSPACES.find((workspace) => workspace.id === id);
}
