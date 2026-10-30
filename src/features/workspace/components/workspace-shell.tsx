"use client";

import { useEffect } from "react";
import { AssistantPanel } from "@/features/ai-assistant/components/assistant-panel";
import { GraphCanvas } from "@/features/knowledge-graph/components/graph-canvas";
import { useResearch } from "@/features/research/hooks/use-research";
import { SourcesPanel } from "@/features/sources/components/sources-panel";
import { ResearchInput } from "@/features/workspace/components/research-input";
import { WorkspaceHeader } from "@/features/workspace/components/workspace-header";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useResearchStore } from "@/stores/research-store";
import { useWorkspaceUIStore } from "@/stores/workspace-ui-store";
import type { Workspace } from "@/types";

type WorkspaceShellProps = {
  workspace: Workspace;
};

export function WorkspaceShell({ workspace }: WorkspaceShellProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const leftPanelOpen = useWorkspaceUIStore((s) => s.leftPanelOpen);
  const rightPanelOpen = useWorkspaceUIStore((s) => s.rightPanelOpen);
  const setLeftPanelOpen = useWorkspaceUIStore((s) => s.setLeftPanelOpen);
  const setRightPanelOpen = useWorkspaceUIStore((s) => s.setRightPanelOpen);

  const { submit, isRunning } = useResearch(workspace.id);
  const openWorkspace = useResearchStore((s) => s.openWorkspace);
  const isReady = useResearchStore((s) => s.activeWorkspaceId === workspace.id);

  useEffect(() => {
    openWorkspace(workspace.id);
  }, [openWorkspace, workspace.id]);

  useEffect(() => {
    if (isDesktop) {
      setLeftPanelOpen(true);
      setRightPanelOpen(true);
    } else {
      setLeftPanelOpen(false);
      setRightPanelOpen(false);
    }
  }, [isDesktop, setLeftPanelOpen, setRightPanelOpen]);

  function handleResearchSubmit(query: string) {
    if (!isDesktop) {
      setRightPanelOpen(true);
    }
    void submit(query);
  }

  // Wait one tick for this workspace's session, so the previous workspace never flashes.
  if (!isReady) {
    return <div className="h-dvh bg-background" />;
  }

  const assistant = <AssistantPanel />;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <WorkspaceHeader workspace={workspace} />

      <div className="flex min-h-0 flex-1">
        {isDesktop ? (
          <div
            className={cn(
              "shrink-0 overflow-hidden transition-[width] duration-200",
              leftPanelOpen ? "w-64" : "w-0",
            )}
          >
            <div className="h-full w-64">
              <SourcesPanel workspaceId={workspace.id} />
            </div>
          </div>
        ) : (
          <Sheet open={leftPanelOpen} onOpenChange={setLeftPanelOpen}>
            <SheetContent side="left" className="w-[min(100%,20rem)] p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Sources</SheetTitle>
              </SheetHeader>
              <SourcesPanel workspaceId={workspace.id} />
            </SheetContent>
          </Sheet>
        )}

        <main className="relative min-w-0 flex-1">
          <GraphCanvas />
        </main>

        {isDesktop ? (
          <div
            className={cn(
              "shrink-0 overflow-hidden transition-[width] duration-200",
              rightPanelOpen ? "w-80 xl:w-96" : "w-0",
            )}
          >
            <div className="h-full w-80 xl:w-96">{assistant}</div>
          </div>
        ) : (
          <Sheet open={rightPanelOpen} onOpenChange={setRightPanelOpen}>
            <SheetContent side="right" className="w-[min(100%,24rem)] p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>AI Assistant</SheetTitle>
              </SheetHeader>
              {assistant}
            </SheetContent>
          </Sheet>
        )}
      </div>

      <ResearchInput
        onSubmit={handleResearchSubmit}
        disabled={isRunning}
        placeholder={`Ask a question about ${workspace.name}…`}
      />
    </div>
  );
}
