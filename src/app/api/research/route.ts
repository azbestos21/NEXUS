import { z } from "zod";
import { getAIProvider } from "@/lib/ai/get-provider";
import { runResearch } from "@/lib/research/run-research";
import type { ResearchStreamEvent } from "@/types";

const passageSchema = z.object({
  chunkId: z.string().max(200),
  sourceId: z.string().max(200),
  sourceName: z.string().max(300),
  page: z.number().int().positive().optional(),
  text: z.string().min(1).max(4000),
});

const requestSchema = z.object({
  query: z.string().trim().min(1).max(2000),
  passages: z.array(passageSchema).max(12).default([]),
});

function encodeEvent(event: ResearchStreamEvent): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const events = runResearch(getAIProvider(), parsed.data);
  // Set when the client disconnects; the controller must not be used after that.
  let cancelled = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of events) {
          if (cancelled) return;
          controller.enqueue(encodeEvent(event));
        }
      } catch (error) {
        if (cancelled) return;
        console.error("[api/research] stream failed", error);
        controller.enqueue(
          encodeEvent({ type: "error", message: "Research failed unexpectedly." }),
        );
      }
      if (!cancelled) controller.close();
    },
    cancel() {
      cancelled = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
