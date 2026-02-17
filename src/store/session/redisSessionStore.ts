import type { Redis } from "ioredis";
import type { ChatMessage, SessionStore } from "./types.js";

function truncateHistory(history: ChatMessage[], maxMessages: number, maxChars: number): ChatMessage[] {
  const trimmedByCount = history.slice(-maxMessages);
  const output: ChatMessage[] = [];
  let totalChars = 0;

  for (let index = trimmedByCount.length - 1; index >= 0; index -= 1) {
    const item = trimmedByCount[index];
    const size = item.content.length;
    if (totalChars + size > maxChars) {
      break;
    }

    output.unshift(item);
    totalChars += size;
  }

  return output;
}

export class RedisSessionStore implements SessionStore {
  private readonly redis: Redis;
  private readonly ttlSeconds: number;
  private readonly maxMessages: number;
  private readonly maxChars: number;
  private readonly keyPrefix: string;

  constructor({ redis, ttlSeconds, maxMessages, maxChars, keyPrefix = "session" }: { redis: Redis; ttlSeconds: number; maxMessages: number; maxChars: number; keyPrefix?: string }) {
    this.redis = redis;
    this.ttlSeconds = ttlSeconds;
    this.maxMessages = maxMessages;
    this.maxChars = maxChars;
    this.keyPrefix = keyPrefix;
  }

  private key(userPhone: string): string {
    return `${this.keyPrefix}:${userPhone}`;
  }

  async getHistory(userPhone: string): Promise<ChatMessage[]> {
    const raw = await this.redis.get(this.key(userPhone));
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as ChatMessage[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async append(userPhone: string, message: ChatMessage): Promise<void> {
    const history = await this.getHistory(userPhone);
    history.push(message);
    const truncated = truncateHistory(history, this.maxMessages, this.maxChars);
    await this.redis.set(this.key(userPhone), JSON.stringify(truncated), "EX", this.ttlSeconds);
  }

  async ping(): Promise<boolean> {
    await this.redis.ping();
    return true;
  }
}
