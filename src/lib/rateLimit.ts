import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const contactRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
});