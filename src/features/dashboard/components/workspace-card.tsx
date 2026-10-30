import Link from "next/link";
import type { Workspace } from "@/types";

type WorkspaceCardProps = {
  workspace: Workspace;
};

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const updated = new Date(workspace.updatedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/workspace/${workspace.id}`}
      className="group block rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-foreground group-hover:text-foreground">
          {workspace.name}
        </h3>
        <span className="shrink-0 text-[11px] text-muted-foreground">
          {updated}
        </span>
      </div>
      {workspace.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {workspace.description}
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">No description</p>
      )}
    </Link>
  );
}
