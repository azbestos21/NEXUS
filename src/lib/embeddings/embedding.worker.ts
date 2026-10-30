/// <reference lib="webworker" />

import { pipeline } from "@huggingface/transformers";

/** Small (~23 MB quantised), fast English sentence-embedding model; 384 dimensions. */
const MODEL_ID = "Xenova/all-MiniLM-L6-v2";

export type EmbedRequest = { id: number; texts: string[] };
export type EmbedResponse =
  | { id: number; vectors: Float32Array[] }
  | { id: number; error: string };

type Extractor = (
  texts: string[],
  options: { pooling: "mean"; normalize: boolean },
) => Promise<{ data: ArrayLike<number>; dims: number[] }>;

let extractor: Promise<Extractor> | undefined;

function getExtractor(): Promise<Extractor> {
  // Downloaded once, then served from the browser cache.
  extractor ??= pipeline("feature-extraction", MODEL_ID, {
    dtype: "q8",
  }) as unknown as Promise<Extractor>;
  return extractor;
}

self.onmessage = async (event: MessageEvent<EmbedRequest>) => {
  const { id, texts } = event.data;
  try {
    const output = await (await getExtractor())(texts, {
      pooling: "mean",
      normalize: true,
    });
    const dimensions = output.dims[1];
    const data = Float32Array.from(output.data);
    const vectors = texts.map((_, i) =>
      data.slice(i * dimensions, (i + 1) * dimensions),
    );
    const response: EmbedResponse = { id, vectors };
    self.postMessage(response, vectors.map((v) => v.buffer));
  } catch (error) {
    extractor = undefined;
    const response: EmbedResponse = {
      id,
      error: error instanceof Error ? error.message : String(error),
    };
    self.postMessage(response);
  }
};
