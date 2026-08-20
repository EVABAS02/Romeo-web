import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

/**
 * Limite basée sur l'adresse IP.
 * Protège contre les envois massifs et rapides.
 */
export const contactIpRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
});

/**
 * Limite basée sur l'adresse email.
 * Autorise au maximum 20 messages sur 24 heures
 * pour une même adresse.
 */
export const contactEmailRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "24 h"),
  analytics: true,
});