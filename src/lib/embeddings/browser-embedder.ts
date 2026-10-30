import type { EmbedRequest, EmbedResponse } from "./embedding.worker";
import type { Embedder } from "./types";

const BATCH_SIZE = 16;

type Pending = {
  resolve: (vectors: Float32Array[]) => void;
  reject: (error: Error) => void;
};

/**
 * Runs the embedding model in a Web Worker so the UI stays responsive.
 * Nothing leaves the device; the model itself is downloaded once and cached.
 */
class BrowserEmbedder implements Embedder {
  private worker: Worker | undefined;
  private nextId = 0;
  private readonly pending = new Map<number, Pending>();

  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL("./embedding.worker.ts", import.meta.url), {
        type: "module",
      });
      this.worker.onmessage = (event: MessageEvent<EmbedResponse>) => {
        const request = this.pending.get(event.data.id);
        if (!request) return;
        this.pending.delete(event.data.id);
        if ("error" in event.data) {
          request.reject(new Error(event.data.error));
        } else {
          request.resolve(event.data.vectors);
        }
      };
    }
    return this.worker;
  }

  private embedBatch(texts: string[]): Promise<Float32Array[]> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      const request: EmbedRequest = { id, texts };
      this.getWorker().postMessage(request);
    });
  }

  async embed(texts: string[]): Promise<Float32Array[]> {
    const vectors: Float32Array[] = [];
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      vectors.push(...(await this.embedBatch(texts.slice(i, i + BATCH_SIZE))));
    }
    return vectors;
  }
}

let embedder: BrowserEmbedder | undefined;

export function getBrowserEmbedder(): Embedder {
  embedder ??= new BrowserEmbedder();
  return embedder;
}
