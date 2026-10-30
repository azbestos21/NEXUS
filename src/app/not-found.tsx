import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4">
      <h1 className="font-heading text-lg font-semibold">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        That route does not exist in NEXUS.
      </p>
      <Button render={<Link href="/dashboard" />}>Back to dashboard</Button>
    </div>
  );
}
