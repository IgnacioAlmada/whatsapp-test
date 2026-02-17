class FixedWindowRateLimiter {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.windows = new Map();
  }

  consume(key) {
    const now = Date.now();
    const current = this.windows.get(key);

    if (!current || now > current.expiresAt) {
      this.windows.set(key, { count: 1, expiresAt: now + this.windowMs });
      return { allowed: true, remaining: this.limit - 1 };
    }

    if (current.count >= this.limit) {
      return { allowed: false, remaining: 0, resetAt: current.expiresAt };
    }

    current.count += 1;
    return { allowed: true, remaining: this.limit - current.count };
  }
}

export { FixedWindowRateLimiter };
