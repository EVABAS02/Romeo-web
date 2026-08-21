import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

/**
 * ============================================================
 * RATE LIMIT PAR IP
 * ============================================================
 *
 * 10 requêtes maximum par minute pour une même IP.
 *
 * Objectif :
 * empêcher un visiteur ou un script de bombarder
 * /api/contact avec des centaines de requêtes très rapidement.
 */
export const contactIpRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
});

/**
 * ============================================================
 * RATE LIMIT PAR EMAIL
 * ============================================================
 *
 * 20 messages maximum sur une fenêtre glissante de 24 heures
 * pour une même adresse email.
 *
 * Objectif :
 * empêcher un même utilisateur de contourner
 * la limitation IP en espaçant ses envois.
 */
export const contactEmailRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "24 h"),
  analytics: true,
});