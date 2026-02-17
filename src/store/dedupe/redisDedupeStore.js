export class RedisDedupeStore {
  constructor({ redis, ttlSeconds, keyPrefix = "dedupe" }) {
    this.redis = redis;
    this.ttlSeconds = ttlSeconds;
    this.keyPrefix = keyPrefix;
  }

  key(messageId) {
    return `${this.keyPrefix}:${messageId}`;
  }

  async has(messageId) {
    const exists = await this.redis.exists(this.key(messageId));
    return exists === 1;
  }

  async set(messageId) {
    await this.redis.set(this.key(messageId), "1", "EX", this.ttlSeconds);
  }

  async ping() {
    await this.redis.ping();
    return true;
  }
}
