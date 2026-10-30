import { z } from "zod";

export const citationSchema = z.object({
  sourceId: z.string(),
  chunkId: z.string().optional(),
  text: z.string(),
});

export const researchAnswerSchema = z.object({
  answer: z.string(),
  citations: z.array(citationSchema).default([]),
});

export const graphRelationshipSchema = z.object({
  summary: z.string(),
  relationship: z.string(),
  confidence: z.number().min(0).max(1),
  citationSourceIds: z.array(z.string()).default([]),
});

export type ResearchAnswer = z.infer<typeof researchAnswerSchema>;
export type GraphRelationship = z.infer<typeof graphRelationshipSchema>;

export const knowledgeNodeTypeSchema = z.enum([
  "concept",
  "person",
  "organization",
  "technology",
  "event",
  "document",
  "claim",
]);

/** Shape the LLM is asked to return; ids and integrity are fixed up after parsing. */
export const extractedGraphSchema = z.object({
  nodes: z
    .array(
      z.object({
        id: z.string().min(1).describe("Unique snake_case id, e.g. webgpu"),
        label: z.string().min(1),
        type: knowledgeNodeTypeSchema,
        description: z.string().describe("One sentence"),
        confidence: z.number().min(0).max(1),
        passages: z
          .array(z.number().int())
          .optional()
          .describe("Numbers of the passages that mention this entity, if any"),
      }),
    )
    .max(16),
  edges: z.array(
    z.object({
      source: z.string().describe("id of an existing node"),
      target: z.string().describe("id of an existing node"),
      relationship: z.string().min(1).describe("Short verb phrase, e.g. accelerates"),
      confidence: z.number().min(0).max(1),
    }),
  ),
});

export type ExtractedGraph = z.infer<typeof extractedGraphSchema>;
