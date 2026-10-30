export type KnowledgeNodeType =
  | "concept"
  | "person"
  | "organization"
  | "technology"
  | "event"
  | "document"
  | "claim";

export type KnowledgeNode = {
  id: string;
  label: string;
  type: KnowledgeNodeType;
  description?: string;
  confidence?: number;
  sourceIds?: string[];
  position?: { x: number; y: number };
};

export type KnowledgeEdge = {
  id: string;
  source: string;
  target: string;
  relationship: string;
  confidence?: number;
};

export type KnowledgeGraph = {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
};
