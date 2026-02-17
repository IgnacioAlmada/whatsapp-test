export class MemoryDedupeStore {
  constructor({ ttlSeconds }) {
    this.ttlMs = ttlSeconds * 1000;
    this.map = new Map();
  }

  async has(messageId) {
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

  async set(messageId) {
    this.map.set(messageId, Date.now() + this.ttlMs);
  }

  async ping() {
    return true;
  }
}
