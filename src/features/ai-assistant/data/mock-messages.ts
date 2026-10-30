import type { AIMessage, ResearchEvent } from "@/types";

export const MOCK_MESSAGES: AIMessage[] = [
  {
    id: "msg_1",
    role: "user",
    content: "How is WebGPU changing browser-based AI?",
  },
  {
    id: "msg_2",
    role: "assistant",
    content:
      "WebGPU gives browsers direct, modern access to the GPU. That unlocks faster local inference for libraries like Transformers.js and ONNX Runtime Web, which previously relied on slower CPU or WebGL paths. The result is more practical on-device AI—lower latency and stronger privacy—without shipping every request to a remote model API.",
    citations: [
      {
        sourceId: "src_webgpu_spec",
        text: "WebGPU provides a modern API for GPU access in the browser.",
      },
      {
        sourceId: "src_transformers_js",
        text: "Transformers.js can use WebGPU backends for browser inference.",
      },
      {
        sourceId: "src_privacy_paper",
        text: "On-device inference reduces the need to transmit sensitive inputs.",
      },
    ],
  },
  {
    id: "msg_3",
    role: "user",
    content: "How are WebGPU and browser AI connected?",
  },
  {
    id: "msg_4",
    role: "assistant",
    content:
      "WebGPU is the acceleration layer: model runtimes map tensor ops onto GPU shaders through WebGPU. Browser AI frameworks then run inference in-page, turning GPU access into edge AI capabilities such as private summarization, embeddings, and classification without a server round-trip.",
    citations: [
      {
        sourceId: "src_onnx_runtime",
        chunkId: "chunk_12",
        text: "ONNX Runtime Web can target WebGPU for accelerated execution.",
      },
      {
        sourceId: "src_edge_ai_notes",
        text: "Browser-side models benefit from GPU backends for interactive latency.",
      },
    ],
  },
];

export const MOCK_RESEARCH_EVENTS: ResearchEvent[] = [
  {
    id: "evt_1",
    type: "query_analysis",
    status: "completed",
    message: "Understanding query",
  },
  {
    id: "evt_2",
    type: "search",
    status: "completed",
    message: "Generating search queries",
  },
  {
    id: "evt_3",
    type: "retrieval",
    status: "completed",
    message: "Found 12 relevant sources",
  },
  {
    id: "evt_4",
    type: "claim_extraction",
    status: "completed",
    message: "Extracting claims",
  },
  {
    id: "evt_5",
    type: "verification",
    status: "completed",
    message: "Cross-checking evidence",
  },
  {
    id: "evt_6",
    type: "graph_generation",
    status: "completed",
    message: "Building knowledge graph",
  },
  {
    id: "evt_7",
    type: "answer_generation",
    status: "completed",
    message: "Generating response",
  },
];
