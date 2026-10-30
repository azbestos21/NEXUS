"use client";

import { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddSourceDialog } from "@/features/sources/components/add-source-dialog";
import { SourceItem } from "@/features/sources/components/source-item";
import { SourceViewer } from "@/features/sources/components/source-viewer";
import { useSourcesStore } from "@/stores/sources-store";
import { useWorkspaceUIStore } from "@/stores/workspace-ui-store";

type SourcesPanelProps = {
  workspaceId: string;
};

export function SourcesPanel({ workspaceId }: SourcesPanelProps) {
  const sources = useSourcesStore((s) => s.byWorkspace[workspaceId]);
  const loadSources = useSourcesStore((s) => s.loadSources);
  const selectedSourceId = useWorkspaceUIStore((s) => s.selectedSourceId);
  const setSelectedSourceId = useWorkspaceUIStore((s) => s.setSelectedSourceId);

  useEffect(() => {
    void loadSources(workspaceId);
  }, [loadSources, workspaceId]);

  const list = sources ?? [];
  const selected = list.find((source) => source.id === selectedSourceId);

  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-background">
      <div className="flex h-10 items-center justify-between border-b border-border px-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Sources
        </h2>
        <AddSourceDialog workspaceId={workspaceId} />
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-0.5 p-2">
          {list.length === 0 ? (
            <p className="px-2 py-6 text-xs text-muted-foreground">
              No sources yet. Use + to upload a PDF or text file, or write a note.
            </p>
          ) : (
            list.map((source) => <SourceItem key={source.id} source={source} />)
          )}
        </div>
      </ScrollArea>

      <SourceViewer
        source={selected}
        onClose={() => setSelectedSourceId(null)}
      />
    </aside>
  );
}
