function truncateHistory(history, maxMessages, maxChars) {
  const trimmedByCount = history.slice(-maxMessages);
  const output = [];
  let totalChars = 0;

  for (let index = trimmedByCount.length - 1; index >= 0; index -= 1) {
    const item = trimmedByCount[index];
    const size = (item.content ?? "").length;
    if (totalChars + size > maxChars) {
      break;
    }

    output.unshift(item);
    totalChars += size;
  }

  return output;
}

export class RedisSessionStore {
  constructor({ redis, ttlSeconds, maxMessages, maxChars, keyPrefix = "session" }) {
    this.redis = redis;
    this.ttlSeconds = ttlSeconds;
    this.maxMessages = maxMessages;
    this.maxChars = maxChars;
    this.keyPrefix = keyPrefix;
  }

  key(userPhone) {
    return `${this.keyPrefix}:${userPhone}`;
  }

  async getHistory(userPhone) {
    const raw = await this.redis.get(this.key(userPhone));
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async append(userPhone, message) {
    const history = await this.getHistory(userPhone);
    history.push(message);
    const truncated = truncateHistory(history, this.maxMessages, this.maxChars);
    await this.redis.set(this.key(userPhone), JSON.stringify(truncated), "EX", this.ttlSeconds);
  }

  async ping() {
    await this.redis.ping();
    return true;
  }
}
