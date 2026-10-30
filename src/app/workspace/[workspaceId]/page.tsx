import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CreatedWorkspace } from "@/features/workspace/components/created-workspace";
import { WorkspaceShell } from "@/features/workspace/components/workspace-shell";
import { getWorkspaceById } from "@/features/research/data/mock-workspaces";

type WorkspacePageProps = {
  params: Promise<{ workspaceId: string }>;
};

function WorkspaceFallback() {
  return (
    <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
      Loading workspace…
    </div>
  );
}

async function WorkspaceContent({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;
  const workspace = getWorkspaceById(workspaceId);

  if (workspace) {
    return <WorkspaceShell workspace={workspace} />;
  }

  // User-created workspaces are stored in the browser, not known to the server.
  if (workspaceId.startsWith("ws_")) {
    return <CreatedWorkspace workspaceId={workspaceId} />;
  }

  notFound();
}

export default function WorkspacePage(props: WorkspacePageProps) {
  return (
    <Suspense fallback={<WorkspaceFallback />}>
      <WorkspaceContent {...props} />
    </Suspense>
  );
}
