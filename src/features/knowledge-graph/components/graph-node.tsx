"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { GraphNodeData } from "@/features/knowledge-graph/lib/to-flow-elements";

export type KnowledgeFlowNode = Node<GraphNodeData, "knowledge">;

export function GraphNode({ data, selected }: NodeProps<KnowledgeFlowNode>) {
  return (
    <div
      className={cn(
        "min-w-[140px] rounded-md border bg-background px-3 py-2 shadow-sm transition-colors",
        selected
          ? "border-foreground/40 ring-2 ring-foreground/15"
          : "border-border",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!size-2 !border-border !bg-muted-foreground"
      />
      <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        {data.nodeType}
      </p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{data.label}</p>
      {typeof data.confidence === "number" ? (
        <p className="mt-1 text-[10px] text-muted-foreground">
          {Math.round(data.confidence * 100)}% confidence
        </p>
      ) : null}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!size-2 !border-border !bg-muted-foreground"
      />
    </div>
  );
}
