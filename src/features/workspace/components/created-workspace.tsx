"use client";

import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useWorkspaces } from "@/features/dashboard/hooks/use-workspaces";
import { WorkspaceShell } from "@/features/workspace/components/workspace-shell";

type CreatedWorkspaceProps = {
  workspaceId: string;
};

/**
 * Workspaces the user created live in the browser, so they are looked up
 * on the client rather than on the server.
 */
export function CreatedWorkspace({ workspaceId }: CreatedWorkspaceProps) {
  const { workspaces, hydrated } = useWorkspaces();
  const workspace = workspaces.find((item) => item.id === workspaceId);

  if (!hydrated) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex h-dvh items-center justify-center p-6">
        <EmptyState
          title="Workspace not found"
          description="It may have been created in another browser, or its saved data was cleared."
          action={
            <Button render={<Link href="/dashboard" />} nativeButton={false}>
              Back to workspaces
            </Button>
          }
        />
      </div>
    );
  }

  return <WorkspaceShell workspace={workspace} />;
}
