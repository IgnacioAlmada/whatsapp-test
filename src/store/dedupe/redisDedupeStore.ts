import type { Redis } from "ioredis";
import type { DedupeStore } from "./types.js";

export class RedisDedupeStore implements DedupeStore {
  private readonly redis: Redis;
  private readonly ttlSeconds: number;
  private readonly keyPrefix: string;

  constructor({ redis, ttlSeconds, keyPrefix = "dedupe" }: { redis: Redis; ttlSeconds: number; keyPrefix?: string }) {
    this.redis = redis;
    this.ttlSeconds = ttlSeconds;
    this.keyPrefix = keyPrefix;
  }

  private key(messageId: string): string {
    return `${this.keyPrefix}:${messageId}`;
  }

  async has(messageId: string): Promise<boolean> {
    const exists = await this.redis.exists(this.key(messageId));
    return exists === 1;
  }

  async set(messageId: string): Promise<void> {
    await this.redis.set(this.key(messageId), "1", "EX", this.ttlSeconds);
  }

  async ping(): Promise<boolean> {
    await this.redis.ping();
    return true;
  }
}
