import "server-only";

import { GeminiProvider } from "./gemini-provider";
import { mockAIProvider } from "./mock-provider";
import type { AIProvider } from "./types";

let provider: AIProvider | undefined;

/** Uses Gemini when GEMINI_API_KEY is set, otherwise falls back to the mock. */
export function getAIProvider(): AIProvider {
  if (provider) return provider;

  const apiKey = process.env.GEMINI_API_KEY;
  provider = apiKey
    ? new GeminiProvider(apiKey, process.env.GEMINI_MODEL || undefined)
    : mockAIProvider;

  return provider;
}
