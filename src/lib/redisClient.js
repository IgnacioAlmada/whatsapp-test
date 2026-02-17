import Redis from "ioredis";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

let redis;

export function getRedisClient() {
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

export async function closeRedisClient() {
  if (redis) {
    await redis.quit();
  }
}
