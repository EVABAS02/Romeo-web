import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl =
  process.env.UPSTASH_REDIS_REST_URL;

const redisToken =
  process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  throw new Error(
    "Variables Upstash Redis manquantes."
  );
}

const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});

/**
 * ============================================================
 * RATE LIMIT PAR IP
 * ============================================================
 *
 * 10 requêtes maximum par minute pour
 * une même adresse IP.
 */
export const contactIpRateLimit =
  new Ratelimit({
    redis,
    limiter:
      Ratelimit.slidingWindow(
        10,
        "1 m"
      ),
    analytics: true,
  });

/**
 * ============================================================
 * RATE LIMIT PAR EMAIL
 * ============================================================
 *
 * 20 messages maximum sur une fenêtre
 * glissante de 24 heures pour une même
 * adresse email.
 */
export const contactEmailRateLimit =
  new Ratelimit({
    redis,
    limiter:
      Ratelimit.slidingWindow(
        20,
        "24 h"
      ),
    analytics: true,
  });