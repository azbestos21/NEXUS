"use client";

import { useState, type FormEvent } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ResearchInputProps = {
  onSubmit: (query: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function ResearchInput({
  onSubmit,
  disabled,
  placeholder = "Ask a research question…",
}: ResearchInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex shrink-0 items-center gap-2 border-t border-border bg-background px-3 py-2.5"
    >
      <label className="sr-only" htmlFor="nexus-research-input">
        Ask Nexus
      </label>
      <span className="hidden text-xs text-muted-foreground sm:inline">
        Ask Nexus
      </span>
      <Input
        id="nexus-research-input"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-9 flex-1"
      />
      <Button
        type="submit"
        size="icon"
        disabled={disabled || !value.trim()}
        aria-label="Submit research question"
      >
        <ArrowUp />
      </Button>
    </form>
  );
}
