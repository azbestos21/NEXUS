"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AppHeaderProps = {
  /** Shows the workspace search box when provided. */
  search?: {
    value: string;
    onChange: (value: string) => void;
  };
  trailing?: ReactNode;
};

export function AppHeader({ search, trailing }: AppHeaderProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" focuses search, as in most developer tools.
  useEffect(() => {
    if (!search) return;
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (event.key !== "/" || target.closest("input, textarea, [contenteditable]")) {
        return;
      }
      event.preventDefault();
      searchRef.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [search]);

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-4">
      <Link
        href="/"
        className="font-heading text-sm font-semibold tracking-[0.18em] text-foreground"
      >
        NEXUS
      </Link>

      <div className="ml-auto flex items-center gap-2">
        {search ? (
          <div className="relative hidden w-56 md:block">
            <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              type="search"
              value={search.value}
              onChange={(event) => search.onChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") search.onChange("");
              }}
              className="h-7 pr-7 pl-7 text-xs"
              placeholder="Search workspaces…"
              aria-label="Search workspaces"
            />
            <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border border-border px-1 text-[10px] text-muted-foreground">
              /
            </kbd>
          </div>
        ) : null}

        {trailing}

        <ThemeToggle />

        <Button variant="outline" size="sm" className="hidden sm:inline-flex">
          Profile
        </Button>
      </div>
    </header>
  );
}
