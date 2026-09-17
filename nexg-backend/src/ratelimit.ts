// In-memory sliding-window rate limiter (single process; gateway enforces in prod).
// Fast-fail 429 beats slow-queue: the spike test showed 3.3s p99 from unbounded queueing.
export function rateLimit({ windowMs, max }: { windowMs: number; max: number }) {
  const hits = new Map<string, number[]>();
  setInterval(() => {
    const cutoff = Date.now() - windowMs;
    for (const [k, v] of hits) {
      const fresh = v.filter((t) => t > cutoff);
      if (fresh.length) hits.set(k, fresh);
      else hits.delete(k);
    }
  }, windowMs).unref?.();
  return (req: any, res: any, next: any) => {
    const key = req.ip ?? req.socket?.remoteAddress ?? "unknown";
    const now = Date.now();
    const arr = (hits.get(key) ?? []).filter((t) => t > now - windowMs);
    if (arr.length >= max) {
      res.setHeader("Retry-After", Math.ceil(windowMs / 1000));
      return res.status(429).json({ error: "rate_limited" });
    }
    arr.push(now);
    hits.set(key, arr);
    next();
  };
}

// Dev-generous (perf suite runs ~1100 req/min from one IP); tighten in production.
export const authLimiter = rateLimit({ windowMs: 60_000, max: 300 });
export const apiLimiter = rateLimit({ windowMs: 60_000, max: 2000 });
