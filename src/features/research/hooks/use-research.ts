"use client";

import { useCallback } from "react";
import { streamResearch } from "@/features/ai-assistant/lib/stream-research";
import { retrievePassages } from "@/features/research/lib/retrieve-passages";
import { selectSession, useResearchStore } from "@/stores/research-store";
import { useSourcesStore } from "@/stores/sources-store";
import type { ResearchEvent, ResearchPassage } from "@/types";

function retrievalEvent(
  status: ResearchEvent["status"],
  message: string,
): ResearchEvent {
  return { id: "evt_retrieval", type: "retrieval", status, message };
}

/** Sends a research query and applies the streamed events to the workspace's session. */
export function useResearch(workspaceId: string) {
  const isRunning = useResearchStore((s) => selectSession(s).isRunning);

  const submit = useCallback(
    async (query: string) => {
      const store = useResearchStore.getState();
      const trimmed = query.trim();
      if (!trimmed || store.sessions[workspaceId]?.isRunning) return;

      store.addMessage(workspaceId, {
        id: `msg_user_${Date.now()}`,
        role: "user",
        content: trimmed,
      });
      store.resetEvents(workspaceId);
      store.setRunning(workspaceId, true);

      // 1. Search the workspace's own sources (in the browser).
      let passages: ResearchPassage[] = [];
      store.upsertEvent(workspaceId, retrievalEvent("running", "Searching your sources"));
      try {
        const sources = useSourcesStore.getState().byWorkspace[workspaceId] ?? [];
        const result = await retrievePassages(workspaceId, trimmed, sources);
        passages = result.passages;
        const sourceCount = new Set(passages.map((p) => p.sourceId)).size;
        store.upsertEvent(
          workspaceId,
          retrievalEvent(
            "completed",
            result.searched === 0
              ? "No uploaded sources; answering from general knowledge"
              : passages.length === 0
                ? "Nothing relevant in your sources; answering from general knowledge"
                : `Found ${passages.length} relevant passage${passages.length === 1 ? "" : "s"} in ${sourceCount} source${sourceCount === 1 ? "" : "s"}`,
          ),
        );
      } catch (error) {
        console.error("[research] retrieval failed", error);
        store.upsertEvent(
          workspaceId,
          retrievalEvent("failed", "Couldn't search your sources"),
        );
      }

      // 2. Stream the answer, citations and graph from the server.
      const assistantId = `msg_assistant_${Date.now()}`;
      let content = "";
      const showAssistant = (text: string) => {
        const exists = useResearchStore
          .getState()
          .sessions[workspaceId]?.messages.some((m) => m.id === assistantId);
        if (exists) {
          store.updateMessage(workspaceId, assistantId, { content: text });
        } else {
          store.addMessage(workspaceId, {
            id: assistantId,
            role: "assistant",
            content: text,
          });
        }
      };

      try {
        for await (const event of streamResearch(trimmed, passages)) {
          switch (event.type) {
            case "activity":
              store.upsertEvent(workspaceId, event.event);
              break;
            case "token":
              content += event.text;
              showAssistant(content);
              break;
            case "citations":
              store.updateMessage(workspaceId, assistantId, {
                citations: event.citations,
              });
              break;
            case "graph":
              store.setGraph(workspaceId, event.graph);
              break;
            case "error":
              showAssistant(content || `Something went wrong: ${event.message}`);
              break;
            case "done":
              break;
          }
        }
      } catch {
        showAssistant(
          content || "Something went wrong: could not reach the server.",
        );
      } finally {
        store.setRunning(workspaceId, false);
      }
    },
    [workspaceId],
  );

  return { submit, isRunning };
}
