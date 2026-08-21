import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

/**
 * Protection contre les envois rapides.
 * 10 requêtes maximum par minute et par IP.
 */
export const contactIpRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
});

/**
 * Protection contre les abus répartis dans le temps.
 * 20 messages maximum par 24 heures et par email.
 */
export const contactEmailRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "24 h"),
  analytics: true,
});