import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

let contactIpRateLimit: Ratelimit | null = null;
let contactEmailRateLimit: Ratelimit | null = null;

/**
 * Vérifie si Upstash Redis est configuré.
 */
function isUpstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

/**
 * Initialise Redis uniquement lorsqu'il est nécessaire.
 */
function getRedis(): Redis | null {
  if (!isUpstashConfigured()) {
    return null;
  }

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  return redis;
}

/**
 * ============================================================
 * RATE LIMIT PAR IP
 * ============================================================
 *
 * 10 requêtes maximum par minute pour une même IP.
 *
 * Retourne null si Upstash n'est pas configuré.
 */
export function getContactIpRateLimit(): Ratelimit | null {
  const redisClient = getRedis();

  if (!redisClient) {
    console.warn(
      "[RATE_LIMIT] Upstash Redis non configuré. Rate limit IP désactivé."
    );

    return null;
  }

  if (!contactIpRateLimit) {
    contactIpRateLimit = new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: true,
    });
  }

  return contactIpRateLimit;
}

/**
 * ============================================================
 * RATE LIMIT PAR EMAIL
 * ============================================================
 *
 * 20 messages maximum sur une fenêtre glissante de 24 heures
 * pour une même adresse email.
 *
 * Retourne null si Upstash n'est pas configuré.
 */
export function getContactEmailRateLimit(): Ratelimit | null {
  const redisClient = getRedis();

  if (!redisClient) {
    console.warn(
      "[RATE_LIMIT] Upstash Redis non configuré. Rate limit email désactivé."
    );

    return null;
  }

  if (!contactEmailRateLimit) {
    contactEmailRateLimit = new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(20, "24 h"),
      analytics: true,
    });
  }

  return contactEmailRateLimit;
}