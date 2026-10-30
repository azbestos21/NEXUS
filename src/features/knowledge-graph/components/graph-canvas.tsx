"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTheme } from "next-themes";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type OnSelectionChangeParams,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { EmptyState } from "@/components/shared/empty-state";
import { GraphNode } from "@/features/knowledge-graph/components/graph-node";
import { NodeDetails } from "@/features/knowledge-graph/components/node-details";
import {
  toFlowEdges,
  toFlowNodes,
} from "@/features/knowledge-graph/lib/to-flow-elements";
import { selectSession, useResearchStore } from "@/stores/research-store";
import { useWorkspaceUIStore } from "@/stores/workspace-ui-store";

const nodeTypes = {
  knowledge: GraphNode,
};

function GraphCanvasInner() {
  const setSelectedNodeIds = useWorkspaceUIStore((s) => s.setSelectedNodeIds);
  const graph = useResearchStore((s) => selectSession(s).graph);
  const graphVersion = useResearchStore((s) => selectSession(s).graphVersion);
  const workspaceId = useResearchStore((s) => s.activeWorkspaceId);
  const { resolvedTheme } = useTheme();
  const { fitView } = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);

  // Re-fit when the canvas resizes (side panels opening, window resizing),
  // otherwise the graph stays framed for the old size and drifts off-centre.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => void fitView({ padding: 0.2 }));
    });
    observer.observe(container);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [fitView]);

  const nodes = useMemo(() => toFlowNodes(graph.nodes, graph.edges), [graph]);
  const edges = useMemo(() => toFlowEdges(graph.edges), [graph]);

  useEffect(() => {
    setSelectedNodeIds([]);
  }, [workspaceId, graphVersion, setSelectedNodeIds]);

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      setSelectedNodeIds(selectedNodes.map((node: Node) => node.id));
    },
    [setSelectedNodeIds],
  );

  return (
    <div ref={containerRef} className="relative h-full w-full bg-muted/20">
      <ReactFlow
        key={`${workspaceId}:${graphVersion}`}
        defaultNodes={nodes}
        defaultEdges={edges}
        nodeTypes={nodeTypes}
        colorMode={resolvedTheme === "light" ? "light" : "dark"}
        onSelectionChange={onSelectionChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.4}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent"
      >
        <Background gap={20} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          className="!bg-background !border-border"
        />
      </ReactFlow>
      <NodeDetails />
      {graph.nodes.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
          <EmptyState
            className="bg-background"
            title="No knowledge graph yet"
            description="Ask a research question below. Nexus will answer it and map the key ideas and how they connect."
          />
        </div>
      ) : null}
    </div>
  );
}

export function GraphCanvas() {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner />
    </ReactFlowProvider>
  );
}
