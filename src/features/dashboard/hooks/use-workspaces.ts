"use client";

import { useEffect, useMemo } from "react";
import { MOCK_WORKSPACES } from "@/features/research/data/mock-workspaces";
import { hydrateWorkspaces, useWorkspacesStore } from "@/stores/workspaces-store";

/** The user's workspaces (newest first) followed by the demo workspaces. */
export function useWorkspaces() {
  const created = useWorkspacesStore((state) => state.created);
  const hydrated = useWorkspacesStore((state) => state.hydrated);
  const createWorkspace = useWorkspacesStore((state) => state.createWorkspace);

  useEffect(() => {
    hydrateWorkspaces();
  }, []);

  const workspaces = useMemo(() => [...created, ...MOCK_WORKSPACES], [created]);

  return { workspaces, hydrated, createWorkspace };
}
