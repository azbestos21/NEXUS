"use client";

import { useState } from "react";
import { AppHeader } from "@/components/shared/app-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CreateWorkspaceDialog } from "@/features/dashboard/components/create-workspace-dialog";
import { WorkspaceCard } from "@/features/dashboard/components/workspace-card";
import { useWorkspaces } from "@/features/dashboard/hooks/use-workspaces";

export function DashboardView() {
  const { workspaces } = useWorkspaces();
  const [query, setQuery] = useState("");

  const needle = query.trim().toLowerCase();
  const visible = needle
    ? workspaces.filter((workspace) =>
        `${workspace.name} ${workspace.description ?? ""}`
          .toLowerCase()
          .includes(needle),
      )
    : workspaces;

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader search={{ value: query, onChange: setQuery }} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Workspaces
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Research projects with sources, graphs, and grounded answers.
            </p>
          </div>
          <CreateWorkspaceDialog />
        </div>

        {workspaces.length === 0 ? (
          <EmptyState
            title="No workspaces yet"
            description="Create a workspace to start collecting sources and exploring a knowledge graph."
            action={<CreateWorkspaceDialog />}
          />
        ) : visible.length === 0 ? (
          <EmptyState
            title={`No workspaces match "${query.trim()}"`}
            description="Try a different word, or clear the search."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((workspace) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
