"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isDemoSource } from "@/features/sources/data/mock-sources";
import { getSourceContent } from "@/features/sources/lib/source-db";
import { useSourcesStore } from "@/stores/sources-store";
import type { Source, SourceContent } from "@/types";

type SourceViewerProps = {
  source: Source | undefined;
  onClose: () => void;
};

function describe(source: Source): string {
  const parts = [source.type.toUpperCase()];
  if (source.pageCount) parts.push(`${source.pageCount} pages`);
  if (source.charCount) parts.push(`${source.charCount.toLocaleString()} characters`);
  return parts.join(" · ");
}

export function SourceViewer({ source, onClose }: SourceViewerProps) {
  const removeSource = useSourcesStore((s) => s.removeSource);
  const [loaded, setLoaded] = useState<{ id: string; content?: SourceContent }>();

  const sourceId = source?.status === "ready" ? source.id : undefined;
  useEffect(() => {
    if (!sourceId) return;
    let active = true;
    getSourceContent(sourceId).then((content) => {
      if (active) setLoaded({ id: sourceId, content });
    });
    return () => {
      active = false;
    };
  }, [sourceId]);

  const isDemo = source ? isDemoSource(source.id) : false;
  const content = loaded?.id === sourceId ? loaded?.content : undefined;

  async function handleDelete() {
    if (!source) return;
    await removeSource(source);
    onClose();
  }

  return (
    <Dialog open={Boolean(source)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[85dvh] flex-col sm:max-w-2xl">
        {source ? (
          <>
            <DialogHeader>
              <DialogTitle className="pr-6">{source.name}</DialogTitle>
              <DialogDescription>{describe(source)}</DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border bg-muted/20 p-3">
              {isDemo ? (
                <p className="text-xs text-muted-foreground">
                  This is a demo source with no stored text. Add your own files or notes to read them here.
                </p>
              ) : source.status === "processing" ? (
                <p className="text-xs text-muted-foreground">Reading this source…</p>
              ) : source.status === "failed" ? (
                <p className="text-xs text-destructive">{source.error}</p>
              ) : !content ? (
                <p className="text-xs text-muted-foreground">Loading text…</p>
              ) : (
                <div className="space-y-4">
                  {content.pages.map((page) => (
                    <section key={page.page}>
                      {source.type === "pdf" ? (
                        <p className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                          Page {page.page}
                        </p>
                      ) : null}
                      <p className="text-xs leading-relaxed whitespace-pre-wrap text-foreground">
                        {page.text}
                      </p>
                    </section>
                  ))}
                </div>
              )}
            </div>

            {!isDemo && source.status !== "processing" ? (
              <DialogFooter>
                <Button variant="outline" onClick={handleDelete}>
                  <Trash2 data-icon="inline-start" />
                  Delete source
                </Button>
              </DialogFooter>
            ) : null}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
