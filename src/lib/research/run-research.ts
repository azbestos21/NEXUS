import "server-only";

import { extractedGraphSchema, type ExtractedGraph } from "@/lib/ai/schemas";
import { AIProviderError, type AIProvider } from "@/lib/ai/types";
import type {
  Citation,
  KnowledgeGraph,
  ResearchEvent,
  ResearchEventStatus,
  ResearchEventType,
  ResearchPassage,
  ResearchStreamEvent,
} from "@/types";

const GENERAL_SYSTEM_PROMPT =
  "You are NEXUS, a research assistant. Answer clearly and concisely. If you are unsure, say so rather than guessing.";

const GROUNDED_SYSTEM_PROMPT = [
  "You are NEXUS, a research assistant. Answer the question using ONLY the numbered passages provided.",
  "After each claim, cite the passage it came from as [1], or [1][3] for several.",
  "Only cite passage numbers that exist. Do not use outside knowledge.",
  "If the passages do not contain the answer, say so plainly and briefly explain what they do cover.",
].join(" ");

const GRAPH_SYSTEM_PROMPT = [
  "You extract a knowledge graph from a research answer.",
  "Return 4 to 12 of the most important entities as nodes and the relationships between them as edges.",
  "Only include entities and relationships that are stated or clearly implied in the answer.",
  "Every edge source and target must be the id of a node you returned.",
  "Confidence reflects how directly the answer supports the node or relationship.",
  "If numbered passages are given, list for each node the passage numbers that mention it.",
].join(" ");

export type ResearchRequest = {
  query: string;
  passages: ResearchPassage[];
};

function activity(
  type: ResearchEventType,
  status: ResearchEventStatus,
  message: string,
): ResearchStreamEvent {
  const event: ResearchEvent = { id: `evt_${type}`, type, status, message };
  return { type: "activity", event };
}

/** Formats passages as the numbered context the model cites from. */
function formatPassages(passages: ResearchPassage[]): string {
  return passages
    .map((p, i) => {
      const where = p.page ? `${p.sourceName}, p. ${p.page}` : p.sourceName;
      return `[${i + 1}] (${where})\n${p.text}`;
    })
    .join("\n\n");
}

/** Keeps only [n] markers that point at a real passage, in order of first use. */
function verifyCitations(
  answer: string,
  passages: ResearchPassage[],
): { citations: Citation[]; invalid: number } {
  const seen = new Set<number>();
  let invalid = 0;
  for (const match of answer.matchAll(/\[(\d+)\]/g)) {
    const marker = Number(match[1]);
    if (marker >= 1 && marker <= passages.length) seen.add(marker);
    else invalid++;
  }

  const citations = [...seen].map((marker) => {
    const passage = passages[marker - 1];
    return {
      marker,
      sourceId: passage.sourceId,
      chunkId: passage.chunkId,
      page: passage.page,
      text: passage.text.length > 280 ? `${passage.text.slice(0, 280)}…` : passage.text,
    };
  });
  return { citations, invalid };
}

/** Drops duplicate nodes, dangling or self-referencing edges, and maps passages to sources. */
function normalizeGraph(
  extracted: ExtractedGraph,
  passages: ResearchPassage[],
): KnowledgeGraph {
  const nodes = extracted.nodes
    .filter((node, index, all) => all.findIndex((n) => n.id === node.id) === index)
    .map(({ passages: markers, ...node }) => {
      const sourceIds = [
        ...new Set(
          (markers ?? [])
            .map((marker) => passages[marker - 1]?.sourceId)
            .filter((id): id is string => Boolean(id)),
        ),
      ];
      return sourceIds.length > 0 ? { ...node, sourceIds } : node;
    });
  const nodeIds = new Set(nodes.map((node) => node.id));

  const edges = extracted.edges
    .filter(
      (edge) =>
        edge.source !== edge.target &&
        nodeIds.has(edge.source) &&
        nodeIds.has(edge.target),
    )
    .map((edge, index) => ({ id: `edge_${index}`, ...edge }));

  return { nodes, edges };
}

/** Runs one research request, yielding stream events as each step progresses. */
export async function* runResearch(
  provider: AIProvider,
  { query, passages }: ResearchRequest,
): AsyncGenerator<ResearchStreamEvent, void, unknown> {
  const grounded = passages.length > 0;
  const context = grounded ? formatPassages(passages) : undefined;

  yield activity("answer_generation", "running", "Generating answer");
  if (grounded) yield activity("verification", "pending", "Checking citations");
  yield activity("graph_generation", "pending", "Extracting concepts & relationships");

  let answer = "";
  try {
    for await (const chunk of provider.streamText({
      prompt: query,
      context,
      system: grounded ? GROUNDED_SYSTEM_PROMPT : GENERAL_SYSTEM_PROMPT,
    })) {
      if (chunk.type === "token") {
        answer += chunk.text;
        yield { type: "token", text: chunk.text };
      }
    }
  } catch (error) {
    console.error("[research] answer generation failed", error);
    yield activity("answer_generation", "failed", "Generating answer");
    yield {
      type: "error",
      message:
        error instanceof AIProviderError
          ? error.message
          : "The AI provider failed to respond.",
    };
    return;
  }
  yield activity("answer_generation", "completed", "Generated answer");

  if (grounded) {
    const { citations, invalid } = verifyCitations(answer, passages);
    yield { type: "citations", citations };
    const sources = new Set(citations.map((c) => c.sourceId)).size;
    const summary = `Cited ${citations.length} passage${citations.length === 1 ? "" : "s"} from ${sources} source${sources === 1 ? "" : "s"}`;
    yield activity(
      "verification",
      invalid > 0 ? "failed" : "completed",
      invalid > 0 ? `${summary}; ${invalid} citation(s) pointed to nothing` : summary,
    );
  }

  yield activity("graph_generation", "running", "Extracting concepts & relationships");
  try {
    const extracted = await provider.generateStructuredOutput(
      {
        prompt: query,
        context: grounded ? `${context}\n\nAnswer:\n${answer}` : answer,
        system: GRAPH_SYSTEM_PROMPT,
      },
      extractedGraphSchema,
    );
    const graph = normalizeGraph(extracted, passages);
    yield { type: "graph", graph };
    yield activity(
      "graph_generation",
      "completed",
      `Mapped ${graph.nodes.length} concepts & ${graph.edges.length} relationships`,
    );
  } catch (error) {
    console.error("[research] graph extraction failed", error);
    yield activity(
      "graph_generation",
      "failed",
      error instanceof AIProviderError && error.kind !== "unknown"
        ? `Could not build knowledge graph: ${error.message}`
        : "Could not build knowledge graph",
    );
  }

  yield { type: "done" };
}
