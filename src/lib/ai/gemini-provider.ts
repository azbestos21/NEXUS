import "server-only";

import { ApiError, GoogleGenAI, ThinkingLevel } from "@google/genai";
import { z, type ZodType } from "zod";
import type { AIMessage } from "@/types";
import {
  AIProviderError,
  type AIProvider,
  type GenerateTextInput,
  type GenerateTextResult,
  type StreamTextChunk,
  type StreamTextInput,
} from "./types";

// Flash-Lite: its free tier allows far more requests per day than Flash (20),
// and it is fast. Pinned rather than "-latest" so behaviour doesn't shift silently.
const DEFAULT_MODEL = "gemini-3.5-flash-lite";
const STRUCTURED_OUTPUT_TIMEOUT_MS = 60_000;

/** Turns "retry in 1h52m38.1s" from a quota error into "about 2 hours". */
function describeRetry(message: string): string {
  const match = message.match(/retry in (?:(\d+)h)?(?:(\d+)m)?(?:([\d.]+)s)?/);
  if (!match) return "later";
  const seconds =
    Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
  if (seconds >= 5400) return `in about ${Math.round(seconds / 3600)} hours`;
  if (seconds >= 90) return `in about ${Math.round(seconds / 60)} minutes`;
  return "in a minute";
}

/** Maps Gemini API failures to provider-neutral errors with readable messages. */
function toProviderError(error: unknown): unknown {
  if (!(error instanceof ApiError)) return error;
  if (error.status === 429) {
    const daily = /per day|PerDay/i.test(error.message);
    return new AIProviderError(
      "rate_limited",
      daily
        ? `Daily free Gemini quota used up. Try again ${describeRetry(error.message)}.`
        : `Gemini rate limit reached. Try again ${describeRetry(error.message)}.`,
      { cause: error },
    );
  }
  if (error.status === 503) {
    return new AIProviderError(
      "unavailable",
      "Gemini is overloaded right now. Try again in a minute.",
      { cause: error },
    );
  }
  return new AIProviderError("unknown", "The AI provider failed to respond.", {
    cause: error,
  });
}

function buildContents(input: GenerateTextInput): string {
  if (!input.context) return input.prompt;
  return `Context:\n${input.context}\n\nQuestion:\n${input.prompt}`;
}

export class GeminiProvider implements AIProvider {
  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor(apiKey: string, model: string = DEFAULT_MODEL) {
    this.client = new GoogleGenAI({
      apiKey,
      // The SDK default (5 attempts, up to 60s apart) turns a 503 "high demand"
      // into a multi-minute hang. Fail fast and let the UI report it instead.
      httpOptions: { retryOptions: { attempts: 2, maxDelay: 3 } },
    });
    this.model = model;
  }

  async generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
    const response = await this.client.models
      .generateContent({
        model: this.model,
        contents: buildContents(input),
        config: { systemInstruction: input.system },
      })
      .catch((error: unknown) => {
        throw toProviderError(error);
      });

    const text = response.text ?? "";
    const message: AIMessage = {
      id: `msg_${Date.now()}`,
      role: "assistant",
      content: text,
    };

    return { text, message };
  }

  async *streamText(
    input: StreamTextInput,
  ): AsyncGenerator<StreamTextChunk, void, unknown> {
    let text = "";
    try {
      const stream = await this.client.models.generateContentStream({
        model: this.model,
        contents: buildContents(input),
        config: { systemInstruction: input.system },
      });

      for await (const chunk of stream) {
        const token = chunk.text;
        if (!token) continue;
        text += token;
        yield { type: "token", text: token };
      }
    } catch (error) {
      throw toProviderError(error);
    }

    yield { type: "done", text };
  }

  async generateStructuredOutput<T>(
    input: GenerateTextInput,
    schema: ZodType<T>,
  ): Promise<T> {
    const response = await this.client.models
      .generateContent({
        model: this.model,
        contents: buildContents(input),
        config: {
          systemInstruction: input.system,
          responseMimeType: "application/json",
          responseJsonSchema: z.toJSONSchema(schema),
          // Extraction is mechanical; deep thinking made it take minutes.
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          abortSignal: AbortSignal.timeout(STRUCTURED_OUTPUT_TIMEOUT_MS),
        },
      })
      .catch((error: unknown) => {
        throw toProviderError(error);
      });

    const raw: unknown = JSON.parse(response.text ?? "null");
    return schema.parse(raw);
  }
}
