"use client";

import { useRef, useState, type DragEvent } from "react";
import { FileUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ACCEPTED_FILE_TYPES } from "@/features/sources/lib/extract-text";
import { cn } from "@/lib/utils";
import { useSourcesStore } from "@/stores/sources-store";

type Mode = "file" | "note";

type AddSourceDialogProps = {
  workspaceId: string;
};

export function AddSourceDialog({ workspaceId }: AddSourceDialogProps) {
  const addFile = useSourcesStore((s) => s.addFile);
  const addNote = useSourcesStore((s) => s.addNote);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("file");
  const [dragging, setDragging] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  // Processing continues in the background; the panel shows each source's status.
  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      void addFile(workspaceId, file);
    }
    setOpen(false);
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  function handleAddNote() {
    if (!text.trim()) return;
    void addNote(workspaceId, title.trim() || "Untitled note", text);
    setTitle("");
    setText("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="ghost" size="icon-xs" aria-label="Add source" />}
      >
        <Plus />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add source</DialogTitle>
          <DialogDescription>
            Text is read in your browser and stored only on this device.
          </DialogDescription>
        </DialogHeader>

        <div
          role="tablist"
          aria-label="Source type"
          className="grid grid-cols-2 gap-1 rounded-md bg-muted p-0.5"
        >
          {(["file", "note"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              onClick={() => setMode(value)}
              className={cn(
                "rounded-[5px] px-2 py-1 text-xs font-medium text-muted-foreground transition-colors",
                mode === value && "bg-background text-foreground shadow-sm",
              )}
            >
              {value === "file" ? "Upload file" : "Write note"}
            </button>
          ))}
        </div>

        {mode === "file" ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-4 py-8 text-center transition-colors hover:bg-muted/50",
              dragging && "border-foreground/40 bg-muted/60",
            )}
          >
            <FileUp className="size-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Drop files here or click to browse
            </span>
            <span className="text-xs text-muted-foreground">
              PDF, .txt or .md — up to 20 MB each
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              multiple
              className="sr-only"
              onChange={(event) => handleFiles(event.target.files)}
            />
          </button>
        ) : (
          <>
            <div className="grid gap-3">
              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Title
                </span>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Lecture notes, week 3"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Note
                </span>
                <Textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Paste or write your notes…"
                  rows={8}
                />
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote} disabled={!text.trim()}>
                Add note
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
