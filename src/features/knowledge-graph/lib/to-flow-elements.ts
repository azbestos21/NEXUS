import type { Edge, Node } from "@xyflow/react";
import { layoutRadial } from "@/features/knowledge-graph/lib/layout";
import type { KnowledgeEdge, KnowledgeNode } from "@/types";

export type GraphNodeData = {
  label: string;
  nodeType: KnowledgeNode["type"];
  description?: string;
  confidence?: number;
  sourceIds?: string[];
  [key: string]: unknown;
};

export function toFlowNodes(
  nodes: KnowledgeNode[],
  edges: KnowledgeEdge[],
): Node<GraphNodeData>[] {
  const layout = nodes.some((node) => !node.position)
    ? layoutRadial(nodes, edges)
    : undefined;

  return nodes.map((node) => ({
    id: node.id,
    type: "knowledge",
    position: node.position ?? layout?.get(node.id) ?? { x: 0, y: 0 },
    data: {
      label: node.label,
      nodeType: node.type,
      description: node.description,
      confidence: node.confidence,
      sourceIds: node.sourceIds,
    },
  }));
}

export function toFlowEdges(edges: KnowledgeEdge[]): Edge[] {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.relationship,
    type: "default",
  }));
}
