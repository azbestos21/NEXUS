import type { ResearchPassage, ResearchStreamEvent } from "@/types";

/** POSTs a query to /api/research and yields each streamed event. */
export async function* streamResearch(
  query: string,
  passages: ResearchPassage[],
  signal?: AbortSignal,
): AsyncGenerator<ResearchStreamEvent, void, unknown> {
  const response = await fetch("/api/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, passages }),
    signal,
  });

  if (!response.ok || !response.body) {
    yield { type: "error", message: `Request failed (${response.status})` };
    return;
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.trim()) yield JSON.parse(line) as ResearchStreamEvent;
    }
  }
}
