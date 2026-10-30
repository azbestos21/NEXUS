"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Workspace } from "@/types";

type WorkspacesState = {
  /** Workspaces the user created, newest first. Demo workspaces are not stored. */
  created: Workspace[];
  /** False until saved workspaces have been read from localStorage. */
  hydrated: boolean;
  createWorkspace: (input: {
    name: string;
    description?: string;
  }) => Workspace;
};

export const useWorkspacesStore = create<WorkspacesState>()(
  persist(
    (set, get) => ({
      created: [],
      hydrated: false,
      createWorkspace: ({ name, description }) => {
        const now = new Date().toISOString();
        const workspace: Workspace = {
          id: `ws_${Date.now()}`,
          name: name.trim(),
          description: description?.trim() || undefined,
          createdAt: now,
          updatedAt: now,
        };

        set({ created: [workspace, ...get().created] });
        return workspace;
      },
    }),
    {
      name: "nexus-workspaces",
      partialize: (state) => ({ created: state.created }),
      // Hydrated manually after mount, so server and first client render match.
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useWorkspacesStore.setState({ hydrated: true });
      },
    },
  ),
);

/** Loads saved workspaces from localStorage once, on the client. */
export function hydrateWorkspaces(): void {
  if (!useWorkspacesStore.getState().hydrated) {
    void useWorkspacesStore.persist.rehydrate();
  }
}
