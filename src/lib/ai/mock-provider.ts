import type { ZodType } from "zod";
import { MOCK_GRAPH } from "@/features/knowledge-graph/data/mock-graph";
import type { AIMessage } from "@/types";
import type {
  AIProvider,
  GenerateTextInput,
  GenerateTextResult,
  StreamTextChunk,
  StreamTextInput,
} from "./types";

const MOCK_REPLY =
  "WebGPU exposes GPU compute and rendering to the browser, which lets runtimes like Transformers.js and ONNX Runtime Web accelerate on-device inference without sending data to a remote server. That combination strengthens privacy-preserving edge AI in the browser.";

export class MockAIProvider implements AIProvider {
  async generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
    const message: AIMessage = {
      id: `msg_${Date.now()}`,
      role: "assistant",
      content: MOCK_REPLY,
      citations: [
        {
          sourceId: "src_webgpu_spec",
          text: "WebGPU provides a modern API for GPU access in the browser.",
        },
        {
          sourceId: "src_transformers_js",
          text: "Transformers.js can use WebGPU backends for browser inference.",
        },
      ],
    };

    void input;

    return { text: message.content, message };
  }

  async *streamText(
    input: StreamTextInput,
  ): AsyncGenerator<StreamTextChunk, void, unknown> {
    void input;

    let text = "";
    for (const word of MOCK_REPLY.split(" ")) {
      const token = text ? ` ${word}` : word;
      text += token;
      await new Promise((resolve) => setTimeout(resolve, 30));
      yield { type: "token", text: token };
    }

    yield { type: "done", text };
  }

  /** Always parses the mock knowledge graph, so it only suits graph-shaped schemas. */
  async generateStructuredOutput<T>(
    input: GenerateTextInput,
    schema: ZodType<T>,
  ): Promise<T> {
    void input;
    await new Promise((resolve) => setTimeout(resolve, 600));
    return schema.parse(MOCK_GRAPH);
  }
}

export const mockAIProvider = new MockAIProvider();
