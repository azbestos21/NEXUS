"use client";

import { Check, Circle, LoaderCircle } from "lucide-react";
import type { ResearchEvent } from "@/types";
import { cn } from "@/lib/utils";

type ResearchActivityProps = {
  events: ResearchEvent[];
};

function StatusIcon({ status }: { status: ResearchEvent["status"] }) {
  if (status === "completed") {
    return <Check className="size-3.5 text-foreground" />;
  }
  if (status === "running") {
    return (
      <LoaderCircle className="size-3.5 animate-spin text-muted-foreground" />
    );
  }
  if (status === "failed") {
    return <Circle className="size-3.5 text-destructive" />;
  }
  return <Circle className="size-3.5 text-muted-foreground/50" />;
}

export function ResearchActivity({ events }: ResearchActivityProps) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-2.5">
      <p className="mb-2 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        Research activity
      </p>
      <ul className="space-y-1.5">
        {events.map((event) => (
          <li key={event.id} className="flex items-center gap-2">
            <StatusIcon status={event.status} />
            <span
              className={cn(
                "text-xs",
                event.status === "pending"
                  ? "text-muted-foreground/60"
                  : "text-foreground",
              )}
            >
              {event.message}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
