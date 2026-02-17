import Redis from "ioredis";
import type { Redis as RedisClient } from "ioredis";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

let redis: RedisClient | undefined;

export function getRedisClient(): RedisClient | null {
  if (!env.redisUrl) {
    return null;
  }

  if (!redis) {
    redis = new Redis(env.redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableReadyCheck: true
    });

    redis.on("error", (error) => {
      logger.error({ err: error }, "Redis connection error");
    });
  }

  return redis;
}

export async function closeRedisClient(): Promise<void> {
  if (redis) {
    await redis.quit();
  }
}
