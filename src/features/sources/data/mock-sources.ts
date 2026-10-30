import type { Source } from "@/types";

export const MOCK_SOURCES: Source[] = [
  {
    id: "src_webgpu_spec",
    workspaceId: "ws_webgpu",
    name: "WebGPU Specification",
    type: "website",
    status: "ready",
    createdAt: "2026-10-20T09:10:00.000Z",
  },
  {
    id: "src_transformers_js",
    workspaceId: "ws_webgpu",
    name: "Transformers.js Documentation",
    type: "website",
    status: "ready",
    createdAt: "2026-10-20T09:12:00.000Z",
  },
  {
    id: "src_onnx_runtime",
    workspaceId: "ws_webgpu",
    name: "ONNX Runtime Web Guide",
    type: "pdf",
    status: "ready",
    createdAt: "2026-10-21T11:00:00.000Z",
  },
  {
    id: "src_edge_ai_notes",
    workspaceId: "ws_webgpu",
    name: "Edge AI research notes",
    type: "note",
    status: "ready",
    createdAt: "2026-10-22T15:45:00.000Z",
  },
  {
    id: "src_privacy_paper",
    workspaceId: "ws_webgpu",
    name: "Privacy-preserving browser ML",
    type: "pdf",
    status: "ready",
    createdAt: "2026-10-23T10:20:00.000Z",
  },
  {
    id: "src_gpu_acceleration",
    workspaceId: "ws_webgpu",
    name: "GPU acceleration overview",
    type: "text",
    status: "processing",
    createdAt: "2026-10-28T17:00:00.000Z",
  },
  {
    id: "src_gibbon",
    workspaceId: "ws_roman_empire",
    name: "Gibbon — The Decline and Fall of the Roman Empire",
    type: "pdf",
    status: "ready",
    createdAt: "2026-10-24T10:05:00.000Z",
  },
  {
    id: "src_heather",
    workspaceId: "ws_roman_empire",
    name: "Heather — The Fall of the Roman Empire",
    type: "pdf",
    status: "ready",
    createdAt: "2026-10-24T10:20:00.000Z",
  },
  {
    id: "src_harper",
    workspaceId: "ws_roman_empire",
    name: "Harper — The Fate of Rome",
    type: "pdf",
    status: "ready",
    createdAt: "2026-10-25T09:40:00.000Z",
  },
  {
    id: "src_britannica_rome",
    workspaceId: "ws_roman_empire",
    name: "Encyclopaedia Britannica — Ancient Rome",
    type: "website",
    status: "ready",
    createdAt: "2026-10-26T14:00:00.000Z",
  },
  {
    id: "src_rome_notes",
    workspaceId: "ws_roman_empire",
    name: "My reading notes",
    type: "note",
    status: "ready",
    createdAt: "2026-10-29T20:10:00.000Z",
  },
  {
    id: "src_rome_coins",
    workspaceId: "ws_roman_empire",
    name: "Coin debasement timeline",
    type: "text",
    status: "processing",
    createdAt: "2026-10-29T20:14:00.000Z",
  },
];

export function getSourcesByWorkspace(workspaceId: string): Source[] {
  return MOCK_SOURCES.filter((source) => source.workspaceId === workspaceId);
}

export function getSourceById(id: string): Source | undefined {
  return MOCK_SOURCES.find((source) => source.id === id);
}

/** Demo sources have no stored text and cannot be deleted. */
export function isDemoSource(id: string): boolean {
  return MOCK_SOURCES.some((source) => source.id === id);
}
