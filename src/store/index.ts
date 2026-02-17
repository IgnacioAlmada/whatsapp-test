import type { Redis } from "ioredis";
import { env } from "../config/env.js";
import { getRedisClient } from "../lib/redisClient.js";
import { logger } from "../lib/logger.js";
import { MemoryDedupeStore } from "./dedupe/memoryDedupeStore.js";
import { RedisDedupeStore } from "./dedupe/redisDedupeStore.js";
import type { DedupeStore } from "./dedupe/types.js";
import { MemorySessionStore } from "./session/memorySessionStore.js";
import { RedisSessionStore } from "./session/redisSessionStore.js";
import type { SessionStore } from "./session/types.js";

const redisClient: Redis | null = getRedisClient();

if (redisClient) {
  redisClient.connect().catch((error) => {
    logger.error({ err: error }, "Failed to connect to Redis, memory stores will still be available");
  });
}

export const dedupeStore: DedupeStore = redisClient
  ? new RedisDedupeStore({ redis: redisClient, ttlSeconds: env.dedupeTtlSeconds })
  : new MemoryDedupeStore({ ttlSeconds: env.dedupeTtlSeconds });

export const sessionStore: SessionStore = redisClient
  ? new RedisSessionStore({
      redis: redisClient,
      ttlSeconds: env.sessionTtlSeconds,
      maxMessages: env.sessionMaxMessages,
      maxChars: env.sessionMaxChars
    })
  : new MemorySessionStore({
      maxMessages: env.sessionMaxMessages,
      maxChars: env.sessionMaxChars
    });

export { redisClient as redis };
