"use client";

import { MessageList } from "@/features/ai-assistant/components/message-list";
import { ResearchActivity } from "@/features/ai-assistant/components/research-activity";
import { selectSession, useResearchStore } from "@/stores/research-store";

export function AssistantPanel() {
  const messages = useResearchStore((s) => selectSession(s).messages);
  const events = useResearchStore((s) => selectSession(s).events);
  const isThinking = useResearchStore((s) => selectSession(s).isRunning);

  return (
    <aside className="flex h-full w-full flex-col border-l border-border bg-background">
      <div className="flex h-10 items-center border-b border-border px-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          AI Assistant
        </h2>
      </div>

      {events.length > 0 ? (
        <div className="border-b border-border p-3">
          <ResearchActivity events={events} />
        </div>
      ) : null}

      <MessageList messages={messages} />

      {isThinking ? (
        <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
          Researching…
        </p>
      ) : null}
    </aside>
  );
}
