"use client";

import {
  FileText,
  Globe,
  LoaderCircle,
  StickyNote,
  Text,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useWorkspaceUIStore } from "@/stores/workspace-ui-store";
import type { Source, SourceType } from "@/types";

const SOURCE_ICONS: Record<SourceType, typeof FileText> = {
  pdf: FileText,
  website: Globe,
  note: StickyNote,
  text: Text,
};

type SourceItemProps = {
  source: Source;
};

export function SourceItem({ source }: SourceItemProps) {
  const selectedSourceId = useWorkspaceUIStore((s) => s.selectedSourceId);
  const setSelectedSourceId = useWorkspaceUIStore((s) => s.setSelectedSourceId);
  const Icon = SOURCE_ICONS[source.type];
  const selected = selectedSourceId === source.id;

  return (
    <button
      type="button"
      onClick={() => setSelectedSourceId(source.id)}
      className={cn(
        "flex w-full items-start gap-2.5 rounded-md border border-transparent px-2 py-2 text-left transition-colors hover:bg-muted/60",
        selected && "border-border bg-muted/80",
      )}
    >
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-foreground">
          {source.name}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {source.type}
          </span>
          <Badge
            variant={
              source.status === "ready"
                ? "secondary"
                : source.status === "failed"
                  ? "destructive"
                  : "outline"
            }
            className="h-4 px-1.5 text-[10px]"
          >
            {source.status === "processing" ? (
              <LoaderCircle className="size-2.5 animate-spin" />
            ) : null}
            {source.status}
          </Badge>
          {source.pageCount ? (
            <span className="text-[10px] text-muted-foreground">
              {source.pageCount} pp
            </span>
          ) : null}
        </div>
        {source.status === "failed" && source.error ? (
          <p className="mt-1 line-clamp-2 text-[10px] text-destructive">
            {source.error}
          </p>
        ) : null}
      </div>
    </button>
  );
}
