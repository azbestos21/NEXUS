export type Citation = {
  sourceId: string;
  chunkId?: string;
  text: string;
  /** PDF page the passage came from. */
  page?: number;
  /** The [n] marker used for this citation in the answer text. */
  marker?: number;
};

export type AIMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
};
