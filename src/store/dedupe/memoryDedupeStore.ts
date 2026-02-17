import type { DedupeStore } from "./types.js";

export class MemoryDedupeStore implements DedupeStore {
  private readonly ttlMs: number;
  private readonly map = new Map<string, number>();

  constructor({ ttlSeconds }: { ttlSeconds: number }) {
    this.ttlMs = ttlSeconds * 1000;
  }

  async has(messageId: string): Promise<boolean> {
    const expiresAt = this.map.get(messageId);
    if (!expiresAt) {
      return false;
    }

    if (Date.now() > expiresAt) {
      this.map.delete(messageId);
      return false;
    }

    return true;
  }

  async set(messageId: string): Promise<void> {
    this.map.set(messageId, Date.now() + this.ttlMs);
  }

  async ping(): Promise<boolean> {
    return true;
  }
}
