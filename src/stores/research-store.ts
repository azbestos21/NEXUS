"use client";

import { create } from "zustand";
import {
  getWorkspaceSeed,
  type ResearchSession,
} from "@/features/research/data/workspace-seeds";
import type { AIMessage, KnowledgeGraph, ResearchEvent } from "@/types";

type WorkspaceSession = ResearchSession & {
  /** Bumped whenever the graph is replaced, so the canvas can re-fit to it. */
  graphVersion: number;
  isRunning: boolean;
};

type ResearchState = {
  activeWorkspaceId: string;
  sessions: Record<string, WorkspaceSession>;
  /** Switches workspace, seeding its session on first visit. */
  openWorkspace: (workspaceId: string) => void;
  addMessage: (workspaceId: string, message: AIMessage) => void;
  updateMessage: (
    workspaceId: string,
    id: string,
    patch: Partial<Omit<AIMessage, "id">>,
  ) => void;
  resetEvents: (workspaceId: string) => void;
  upsertEvent: (workspaceId: string, event: ResearchEvent) => void;
  setGraph: (workspaceId: string, graph: KnowledgeGraph) => void;
  setRunning: (workspaceId: string, running: boolean) => void;
};

const EMPTY_SESSION: WorkspaceSession = {
  ...getWorkspaceSeed(""),
  graphVersion: 0,
  isRunning: false,
};

/** Selects the active workspace's session. */
export const selectSession = (state: ResearchState): WorkspaceSession =>
  state.sessions[state.activeWorkspaceId] ?? EMPTY_SESSION;

export const useResearchStore = create<ResearchState>((set) => {
  const updateSession = (
    workspaceId: string,
    update: (session: WorkspaceSession) => Partial<WorkspaceSession>,
  ) =>
    set((state) => {
      const session = state.sessions[workspaceId];
      if (!session) return state;
      return {
        sessions: {
          ...state.sessions,
          [workspaceId]: { ...session, ...update(session) },
        },
      };
    });

  return {
    activeWorkspaceId: "",
    sessions: {},
    openWorkspace: (workspaceId) =>
      set((state) => ({
        activeWorkspaceId: workspaceId,
        sessions: state.sessions[workspaceId]
          ? state.sessions
          : {
              ...state.sessions,
              [workspaceId]: {
                ...getWorkspaceSeed(workspaceId),
                graphVersion: 0,
                isRunning: false,
              },
            },
      })),
    addMessage: (workspaceId, message) =>
      updateSession(workspaceId, (s) => ({ messages: [...s.messages, message] })),
    updateMessage: (workspaceId, id, patch) =>
      updateSession(workspaceId, (s) => ({
        messages: s.messages.map((message) =>
          message.id === id ? { ...message, ...patch } : message,
        ),
      })),
    resetEvents: (workspaceId) => updateSession(workspaceId, () => ({ events: [] })),
    upsertEvent: (workspaceId, event) =>
      updateSession(workspaceId, (s) => ({
        events: s.events.some((e) => e.id === event.id)
          ? s.events.map((e) => (e.id === event.id ? event : e))
          : [...s.events, event],
      })),
    setGraph: (workspaceId, graph) =>
      updateSession(workspaceId, (s) => ({
        graph,
        graphVersion: s.graphVersion + 1,
      })),
    setRunning: (workspaceId, running) =>
      updateSession(workspaceId, () => ({ isRunning: running })),
  };
});
