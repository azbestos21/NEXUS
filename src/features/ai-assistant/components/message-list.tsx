"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { findSource, useSourcesStore } from "@/stores/sources-store";
import type { AIMessage } from "@/types";
import { cn } from "@/lib/utils";

type MessageListProps = {
  messages: AIMessage[];
};

export function MessageList({ messages }: MessageListProps) {
  const sourcesByWorkspace = useSourcesStore((s) => s.byWorkspace);

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-3 p-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "rounded-md border px-2.5 py-2",
              message.role === "user"
                ? "border-border bg-muted/40"
                : "border-transparent bg-transparent",
            )}
          >
            <p className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              {message.role === "user" ? "You" : "Nexus"}
            </p>
            <p className="text-xs leading-relaxed whitespace-pre-wrap text-foreground">
              {message.content}
            </p>
            {message.citations && message.citations.length > 0 ? (
              <div className="mt-2 space-y-1 border-t border-border pt-2">
                {message.citations.map((citation, index) => {
                  const source = findSource(sourcesByWorkspace, citation.sourceId);
                  return (
                    <p
                      key={`${message.id}-${citation.sourceId}-${index}`}
                      className="text-[11px] text-muted-foreground"
                    >
                      <span className="font-medium text-foreground">
                        [{citation.marker ?? index + 1}]{" "}
                        {source?.name ?? "Deleted source"}
                        {citation.page ? `, p. ${citation.page}` : ""}
                      </span>
                      {" — "}
                      {citation.text}
                    </p>
                  );
                })}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
