type ConsumeResult = { allowed: true; remaining: number; resetAt?: number } | { allowed: false; remaining: 0; resetAt: number };

export class FixedWindowRateLimiter {
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly windows = new Map<string, { count: number; expiresAt: number }>();

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  consume(key: string): ConsumeResult {
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
