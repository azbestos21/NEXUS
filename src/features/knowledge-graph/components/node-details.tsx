"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { selectSession, useResearchStore } from "@/stores/research-store";
import { findSource, useSourcesStore } from "@/stores/sources-store";
import { useWorkspaceUIStore } from "@/stores/workspace-ui-store";

export function NodeDetails() {
  const selectedNodeIds = useWorkspaceUIStore((s) => s.selectedNodeIds);
  const setSelectedNodeIds = useWorkspaceUIStore((s) => s.setSelectedNodeIds);
  const graph = useResearchStore((s) => selectSession(s).graph);
  const sourcesByWorkspace = useSourcesStore((s) => s.byWorkspace);

  const nodeId = selectedNodeIds[0];
  const node = graph.nodes.find((item) => item.id === nodeId);

  if (!node) return null;

  const sourceIds = node.sourceIds ?? [];
  const connections = graph.edges
    .filter((edge) => edge.source === node.id || edge.target === node.id)
    .map((edge) => {
      const otherId = edge.source === node.id ? edge.target : edge.source;
      const other = graph.nodes.find((item) => item.id === otherId);
      return {
        id: edge.id,
        label: other?.label ?? otherId,
        relationship: edge.relationship,
        outbound: edge.source === node.id,
      };
    });

  return (
    <div className="absolute right-3 bottom-3 left-3 z-10 max-h-[42%] overflow-auto rounded-lg border border-border bg-background/95 p-3 shadow-sm backdrop-blur-sm md:left-auto md:w-80">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            {node.type}
          </p>
          <h3 className="text-sm font-semibold text-foreground">{node.label}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Close details"
          onClick={() => setSelectedNodeIds([])}
        >
          <X />
        </Button>
      </div>

      {node.description ? (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {node.description}
        </p>
      ) : null}

      <Separator className="my-3" />

      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        Connections
      </p>
      <ul className="mt-1.5 space-y-1">
        {connections.map((connection) => (
          <li key={connection.id} className="text-xs text-foreground">
            <span className="text-muted-foreground">
              {connection.outbound ? "→" : "←"} {connection.relationship}
            </span>{" "}
            {connection.label}
          </li>
        ))}
      </ul>

      {sourceIds.length > 0 ? (
        <>
          <Separator className="my-3" />

          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Sources
          </p>
          <ul className="mt-1.5 space-y-1">
            {sourceIds.map((sourceId, index) => {
              const source = findSource(sourcesByWorkspace, sourceId);
              return (
                <li key={sourceId} className="text-xs text-foreground">
                  [{index + 1}] {source?.name ?? "Deleted source"}
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </div>
  );
}
