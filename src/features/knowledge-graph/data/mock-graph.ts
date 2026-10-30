import type { KnowledgeGraph } from "@/types";

export const MOCK_GRAPH: KnowledgeGraph = {
  nodes: [
    {
      id: "node_webgpu",
      label: "WebGPU",
      type: "technology",
      description:
        "Browser API providing GPU access for high-performance computation and rendering.",
      confidence: 0.96,
      sourceIds: ["src_webgpu_spec", "src_transformers_js"],
      position: { x: 320, y: 80 },
    },
    {
      id: "node_transformers",
      label: "Transformers.js",
      type: "technology",
      description:
        "JavaScript library for running transformer models in the browser.",
      confidence: 0.93,
      sourceIds: ["src_transformers_js"],
      position: { x: 80, y: 220 },
    },
    {
      id: "node_onnx",
      label: "ONNX",
      type: "technology",
      description:
        "Open format and runtime ecosystem for portable machine learning models.",
      confidence: 0.9,
      sourceIds: ["src_onnx_runtime"],
      position: { x: 560, y: 220 },
    },
    {
      id: "node_browser_inference",
      label: "Browser inference",
      type: "concept",
      description:
        "Running ML inference locally in the browser instead of on remote servers.",
      confidence: 0.94,
      sourceIds: ["src_transformers_js", "src_onnx_runtime", "src_edge_ai_notes"],
      position: { x: 320, y: 280 },
    },
    {
      id: "node_gpu",
      label: "GPU acceleration",
      type: "concept",
      description:
        "Using the GPU to speed up compute-heavy workloads such as neural network ops.",
      confidence: 0.95,
      sourceIds: ["src_webgpu_spec", "src_gpu_acceleration"],
      position: { x: 560, y: 80 },
    },
    {
      id: "node_privacy",
      label: "Privacy",
      type: "concept",
      description:
        "Keeping user data on-device during inference reduces exposure to remote services.",
      confidence: 0.88,
      sourceIds: ["src_privacy_paper", "src_edge_ai_notes"],
      position: { x: 80, y: 380 },
    },
    {
      id: "node_edge_ai",
      label: "Edge AI",
      type: "concept",
      description:
        "Deploying AI close to the user—on devices and browsers—for latency and privacy.",
      confidence: 0.91,
      sourceIds: ["src_edge_ai_notes", "src_privacy_paper"],
      position: { x: 320, y: 420 },
    },
  ],
  edges: [
    {
      id: "edge_webgpu_gpu",
      source: "node_webgpu",
      target: "node_gpu",
      relationship: "enables",
      confidence: 0.97,
    },
    {
      id: "edge_webgpu_inference",
      source: "node_webgpu",
      target: "node_browser_inference",
      relationship: "accelerates",
      confidence: 0.94,
    },
    {
      id: "edge_transformers_inference",
      source: "node_transformers",
      target: "node_browser_inference",
      relationship: "implements",
      confidence: 0.92,
    },
    {
      id: "edge_onnx_inference",
      source: "node_onnx",
      target: "node_browser_inference",
      relationship: "supports",
      confidence: 0.9,
    },
    {
      id: "edge_transformers_webgpu",
      source: "node_transformers",
      target: "node_webgpu",
      relationship: "uses",
      confidence: 0.89,
    },
    {
      id: "edge_inference_privacy",
      source: "node_browser_inference",
      target: "node_privacy",
      relationship: "improves",
      confidence: 0.86,
    },
    {
      id: "edge_inference_edge",
      source: "node_browser_inference",
      target: "node_edge_ai",
      relationship: "is a form of",
      confidence: 0.93,
    },
    {
      id: "edge_privacy_edge",
      source: "node_privacy",
      target: "node_edge_ai",
      relationship: "motivates",
      confidence: 0.85,
    },
  ],
};
