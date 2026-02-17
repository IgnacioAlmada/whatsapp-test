import { env } from "../config/env.js";
import { getRedisClient } from "../lib/redisClient.js";
import { logger } from "../lib/logger.js";
import { MemoryDedupeStore } from "./dedupe/memoryDedupeStore.js";
import { RedisDedupeStore } from "./dedupe/redisDedupeStore.js";
import { MemorySessionStore } from "./session/memorySessionStore.js";
import { RedisSessionStore } from "./session/redisSessionStore.js";

const redis = getRedisClient();

if (redis) {
  redis.connect().catch((error) => {
    logger.error({ err: error }, "Failed to connect to Redis, memory stores will still be available");
  });
}

export const dedupeStore = redis
  ? new RedisDedupeStore({ redis, ttlSeconds: env.dedupeTtlSeconds })
  : new MemoryDedupeStore({ ttlSeconds: env.dedupeTtlSeconds });

export const sessionStore = redis
  ? new RedisSessionStore({
      redis,
      ttlSeconds: env.sessionTtlSeconds,
      maxMessages: env.sessionMaxMessages,
      maxChars: env.sessionMaxChars
    })
  : new MemorySessionStore({
      maxMessages: env.sessionMaxMessages,
      maxChars: env.sessionMaxChars
    });

export { redis };
