import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "../../../lib/firebaseAdmin";
import { contactRateLimit } from "../../../lib/rateLimit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LIMITS = {
  nom: 100,
  email: 100,
  sujet: 100,
  message: 2000,
} as const;

/**
 * Récupère l'adresse IP du visiteur.
 *
 * Vercel utilise généralement x-forwarded-for.
 * La première IP de cette valeur correspond au client.
 */
function getClientIp(request: Request): string {
  const forwardedFor =
    request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const firstIp = forwardedFor
      .split(",")[0]
      ?.trim();

    if (firstIp) {
      return firstIp;
    }
  }

  const realIp =
    request.headers.get("x-real-ip");

  if (realIp) {
    return realIp.trim();
  }

  // Fallback uniquement si aucune IP
  // n'est fournie par l'infrastructure.
  return "unknown";
}

export async function POST(request: Request) {
  try {
    // ============================================================
    // 1. RATE LIMITING
    // ============================================================

    const clientIp = getClientIp(request);

    const rateLimit =
      await contactRateLimit.limit(
        `contact:${clientIp}`
      );

    const rateLimitHeaders = {
      "X-RateLimit-Limit":
        rateLimit.limit.toString(),

      "X-RateLimit-Remaining":
        Math.max(
          0,
          rateLimit.remaining
        ).toString(),

      "X-RateLimit-Reset":
        rateLimit.reset.toString(),
    };

    /**
     * Limite dépassée.
     *
     * La requête est bloquée AVANT toute écriture
     * dans Firestore.
     */
    if (!rateLimit.success) {
      const retryAfter = Math.max(
        1,
        Math.ceil(
          (rateLimit.reset - Date.now()) /
            1000
        )
      );

      return NextResponse.json(
        {
          error:
            "Trop de tentatives. Veuillez patienter avant de réessayer.",
        },
        {
          status: 429,
          headers: {
            ...rateLimitHeaders,
            "Retry-After":
              retryAfter.toString(),
          },
        }
      );
    }

    // ============================================================
    // 2. VÉRIFIER FIREBASE ADMIN
    // ============================================================

    if (!adminDb) {
      console.error(
        "Firebase Admin Firestore n'est pas disponible."
      );

      return NextResponse.json(
        {
          error:
            "Configuration serveur indisponible.",
        },
        {
          status: 500,
          headers: rateLimitHeaders,
        }
      );
    }

    // ============================================================
    // 3. LIRE LE CORPS DE LA REQUÊTE
    // ============================================================

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Requête invalide.",
        },
        {
          status: 400,
          headers: rateLimitHeaders,
        }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          error: "Données invalides.",
        },
        {
          status: 400,
          headers: rateLimitHeaders,
        }
      );
    }

    const data =
      body as Record<string, unknown>;

    const nom =
      typeof data.nom === "string"
        ? data.nom.trim()
        : "";

    const email =
      typeof data.email === "string"
        ? data.email.trim().toLowerCase()
        : "";

    const sujet =
      typeof data.sujet === "string"
        ? data.sujet.trim()
        : "";

    const message =
      typeof data.message === "string"
        ? data.message.trim()
        : "";

    // ============================================================
    // 4. VALIDATION SERVEUR
    // ============================================================

    if (
      !nom ||
      !email ||
      !sujet ||
      !message
    ) {
      return NextResponse.json(
        {
          error:
            "Tous les champs sont obligatoires.",
        },
        {
          status: 400,
          headers: rateLimitHeaders,
        }
      );
    }

    if (
      nom.length < 2 ||
      nom.length > LIMITS.nom
    ) {
      return NextResponse.json(
        {
          error:
            "Le nom doit contenir entre 2 et 100 caractères.",
        },
        {
          status: 400,
          headers: rateLimitHeaders,
        }
      );
    }

    if (
      email.length < 5 ||
      email.length > LIMITS.email ||
      !EMAIL_REGEX.test(email)
    ) {
      return NextResponse.json(
        {
          error: "Adresse email invalide.",
        },
        {
          status: 400,
          headers: rateLimitHeaders,
        }
      );
    }

    if (
      sujet.length < 1 ||
      sujet.length > LIMITS.sujet
    ) {
      return NextResponse.json(
        {
          error: "L'objet est invalide.",
        },
        {
          status: 400,
          headers: rateLimitHeaders,
        }
      );
    }

    if (
      message.length < 1 ||
      message.length > LIMITS.message
    ) {
      return NextResponse.json(
        {
          error:
            "Le message doit contenir entre 1 et 2000 caractères.",
        },
        {
          status: 400,
          headers: rateLimitHeaders,
        }
      );
    }

    // ============================================================
    // 5. CRÉER LA CONVERSATION
    // ============================================================

    const conversationRef =
      await adminDb
        .collection("conversations")
        .add({
          nom,
          email,
          sujet,
          lastMessage: message,

          createdAt:
            FieldValue.serverTimestamp(),

          updatedAt:
            FieldValue.serverTimestamp(),

          read: false,
        });

    // ============================================================
    // 6. CRÉER LE PREMIER MESSAGE
    // ============================================================

    await conversationRef
      .collection("messages")
      .add({
        text: message,
        sender: "client",
        createdAt:
          FieldValue.serverTimestamp(),
      });

    // ============================================================
    // 7. RÉPONSE
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        conversationId:
          conversationRef.id,
      },
      {
        status: 201,
        headers: rateLimitHeaders,
      }
    );
  } catch (error) {
    console.error(
      "Erreur API /api/contact :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de l'envoi du message.",
      },
      {
        status: 500,
      }
    );
  }
}