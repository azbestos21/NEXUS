import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="relative flex min-h-[calc(100vh-3rem)] flex-col justify-center overflow-hidden px-6 py-16 md:px-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.35_0.02_260_/_0.35),_transparent_55%),linear-gradient(to_bottom,_transparent,_var(--background))]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,oklch(0.5_0_0_/_0.08)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.5_0_0_/_0.08)_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <div className="relative mx-auto w-full max-w-3xl">
        <p className="font-heading text-xs font-semibold tracking-[0.28em] text-muted-foreground">
          VISUAL RESEARCH WORKSPACE
        </p>
        <h1 className="mt-4 font-heading text-5xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl">
          NEXUS
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Research, retrieve, and connect ideas through a source-grounded
          knowledge graph—not another chatbot clone.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button render={<Link href="/dashboard" />} size="lg">
            Open workspace
            <ArrowRight data-icon="inline-end" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            render={<Link href="/workspace/ws_webgpu" />}
          >
            View demo research
          </Button>
        </div>
      </div>
    </section>
  );
}
