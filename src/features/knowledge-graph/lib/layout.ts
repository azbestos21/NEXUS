import type { KnowledgeEdge, KnowledgeNode } from "@/types";

const RING_SPACING = 240;

type Position = { x: number; y: number };

/**
 * Radial layout: the most connected node sits in the centre and the rest are
 * placed on rings by their distance from it. Disconnected nodes go on an outer ring.
 */
export function layoutRadial(
  nodes: KnowledgeNode[],
  edges: KnowledgeEdge[],
): Map<string, Position> {
  const neighbours = new Map<string, string[]>(nodes.map((n) => [n.id, []]));
  for (const edge of edges) {
    neighbours.get(edge.source)?.push(edge.target);
    neighbours.get(edge.target)?.push(edge.source);
  }

  const byDegree = [...nodes].sort(
    (a, b) =>
      (neighbours.get(b.id)?.length ?? 0) - (neighbours.get(a.id)?.length ?? 0),
  );
  const root = byDegree[0];
  if (!root) return new Map();

  const depth = new Map<string, number>([[root.id, 0]]);
  const queue = [root.id];
  while (queue.length > 0) {
    const id = queue.shift() as string;
    for (const next of neighbours.get(id) ?? []) {
      if (depth.has(next)) continue;
      depth.set(next, (depth.get(id) ?? 0) + 1);
      queue.push(next);
    }
  }

  const outerRing = Math.max(0, ...depth.values()) + 1;
  const rings = new Map<number, string[]>();
  for (const node of byDegree) {
    const ring = depth.get(node.id) ?? outerRing;
    rings.set(ring, [...(rings.get(ring) ?? []), node.id]);
  }

  const positions = new Map<string, Position>();
  for (const [ring, ids] of rings) {
    const radius = ring * RING_SPACING;
    const offset = ring % 2 === 0 ? 0 : Math.PI / ids.length;
    ids.forEach((id, index) => {
      const angle = offset + (index / ids.length) * Math.PI * 2;
      positions.set(id, {
        x: Math.round(Math.cos(angle) * radius),
        y: Math.round(Math.sin(angle) * radius),
      });
    });
  }

  return positions;
}
