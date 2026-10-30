import type { AIMessage } from "@/types";
import type { ZodType } from "zod";

export type GenerateTextInput = {
  prompt: string;
  system?: string;
  context?: string;
};

export type GenerateTextResult = {
  text: string;
  message: AIMessage;
};

export type StreamTextInput = GenerateTextInput;

export type StreamTextChunk =
  | { type: "token"; text: string }
  | { type: "done"; text: string };

export interface AIProvider {
  generateText(input: GenerateTextInput): Promise<GenerateTextResult>;
  streamText(input: StreamTextInput): AsyncGenerator<StreamTextChunk, void, unknown>;
  generateStructuredOutput<T>(
    input: GenerateTextInput,
    schema: ZodType<T>,
  ): Promise<T>;
}

export type AIProviderErrorKind = "rate_limited" | "unavailable" | "unknown";

/** A provider failure with a message that is safe to show to the user. */
export class AIProviderError extends Error {
  constructor(
    readonly kind: AIProviderErrorKind,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "AIProviderError";
  }
}
