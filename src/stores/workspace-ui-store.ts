"use client";

import { create } from "zustand";

type WorkspaceUIState = {
  selectedNodeIds: string[];
  selectedSourceId: string | null;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  setSelectedNodeIds: (ids: string[]) => void;
  toggleNodeSelection: (id: string) => void;
  setSelectedSourceId: (id: string | null) => void;
  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  clearSelection: () => void;
};

export const useWorkspaceUIStore = create<WorkspaceUIState>((set) => ({
  selectedNodeIds: [],
  selectedSourceId: null,
  leftPanelOpen: true,
  rightPanelOpen: true,
  setSelectedNodeIds: (ids) => set({ selectedNodeIds: ids }),
  toggleNodeSelection: (id) =>
    set((state) => {
      const exists = state.selectedNodeIds.includes(id);
      return {
        selectedNodeIds: exists
          ? state.selectedNodeIds.filter((nodeId) => nodeId !== id)
          : [...state.selectedNodeIds, id],
      };
    }),
  setSelectedSourceId: (id) => set({ selectedSourceId: id }),
  setLeftPanelOpen: (open) => set({ leftPanelOpen: open }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  toggleLeftPanel: () =>
    set((state) => ({ leftPanelOpen: !state.leftPanelOpen })),
  toggleRightPanel: () =>
    set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
  clearSelection: () => set({ selectedNodeIds: [], selectedSourceId: null }),
}));
