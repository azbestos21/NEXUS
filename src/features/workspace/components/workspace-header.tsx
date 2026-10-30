"use client";

import Link from "next/link";
import { PanelLeft, PanelRight } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { useWorkspaceUIStore } from "@/stores/workspace-ui-store";
import type { Workspace } from "@/types";

type WorkspaceHeaderProps = {
  workspace: Workspace;
};

export function WorkspaceHeader({ workspace }: WorkspaceHeaderProps) {
  const toggleLeftPanel = useWorkspaceUIStore((s) => s.toggleLeftPanel);
  const toggleRightPanel = useWorkspaceUIStore((s) => s.toggleRightPanel);
  const leftPanelOpen = useWorkspaceUIStore((s) => s.leftPanelOpen);
  const rightPanelOpen = useWorkspaceUIStore((s) => s.rightPanelOpen);

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
      <Link
        href="/"
        className="font-heading text-sm font-semibold tracking-[0.18em] text-foreground"
      >
        NEXUS
      </Link>
      <span className="text-muted-foreground">/</span>
      <Link
        href="/dashboard"
        className="truncate text-sm text-muted-foreground hover:text-foreground"
      >
        Workspaces
      </Link>
      <span className="text-muted-foreground">/</span>
      <h1 className="truncate text-sm font-medium text-foreground">
        {workspace.name}
      </h1>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant={leftPanelOpen ? "secondary" : "ghost"}
          size="icon-sm"
          aria-label="Toggle sources panel"
          aria-pressed={leftPanelOpen}
          onClick={toggleLeftPanel}
        >
          <PanelLeft />
        </Button>
        <Button
          variant={rightPanelOpen ? "secondary" : "ghost"}
          size="icon-sm"
          aria-label="Toggle assistant panel"
          aria-pressed={rightPanelOpen}
          onClick={toggleRightPanel}
        >
          <PanelRight />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
