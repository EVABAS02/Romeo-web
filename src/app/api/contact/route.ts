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

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();

    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = request.headers.get("x-real-ip");

  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

export async function POST(request: Request) {
  // ============================================================
  // 1. RATE LIMITING
  // ============================================================

  const clientIp = getClientIp(request);

  let rateLimit: Awaited<
    ReturnType<typeof contactRateLimit.limit>
  >;

  try {
    rateLimit = await contactRateLimit.limit(
      `contact:${clientIp}`
    );
  } catch (error) {
    console.error(
      "[RATE_LIMIT_ERROR] Impossible de contacter Upstash :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Le service de protection est temporairement indisponible.",
      },
      {
        status: 503,
      }
    );
  }

  const rateLimitHeaders = {
    "X-RateLimit-Limit":
      rateLimit.limit.toString(),

    "X-RateLimit-Remaining":
      Math.max(0, rateLimit.remaining).toString(),

    "X-RateLimit-Reset":
      rateLimit.reset.toString(),
  };

  if (!rateLimit.success) {
    const retryAfter = Math.max(
      1,
      Math.ceil(
        (rateLimit.reset - Date.now()) / 1000
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
          "Retry-After": retryAfter.toString(),
        },
      }
    );
  }

  // ============================================================
  // 2. VÉRIFIER FIREBASE ADMIN
  // ============================================================

  if (!adminDb) {
    console.error(
      "[FIREBASE_ADMIN_ERROR] Firebase Admin Firestore indisponible."
    );

    return NextResponse.json(
      {
        error: "Configuration serveur indisponible.",
      },
      {
        status: 500,
        headers: rateLimitHeaders,
      }
    );
  }

  // ============================================================
  // 3. LIRE LE CORPS
  // ============================================================

  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    console.error(
      "[REQUEST_JSON_ERROR] Corps JSON invalide :",
      error
    );

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

  const data = body as Record<string, unknown>;

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

  if (!nom || !email || !sujet || !message) {
    return NextResponse.json(
      {
        error: "Tous les champs sont obligatoires.",
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
  // 5. FIRESTORE — CONVERSATION
  // ============================================================

  let conversationRef;

  try {
    conversationRef = await adminDb
      .collection("conversations")
      .add({
        nom,
        email,
        sujet,
        lastMessage: message,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        read: false,
      });
  } catch (error) {
    console.error(
      "[FIRESTORE_CONVERSATION_ERROR] :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de créer la conversation.",
      },
      {
        status: 500,
        headers: rateLimitHeaders,
      }
    );
  }

  // ============================================================
  // 6. FIRESTORE — PREMIER MESSAGE
  // ============================================================

  try {
    await conversationRef
      .collection("messages")
      .add({
        text: message,
        sender: "client",
        createdAt: FieldValue.serverTimestamp(),
      });
  } catch (error) {
    console.error(
      "[FIRESTORE_MESSAGE_ERROR] :",
      error
    );

    return NextResponse.json(
      {
        error:
          "La conversation a été créée, mais le message n'a pas pu être enregistré.",
      },
      {
        status: 500,
        headers: rateLimitHeaders,
      }
    );
  }

  // ============================================================
  // 7. SUCCÈS
  // ============================================================

  return NextResponse.json(
    {
      success: true,
      conversationId: conversationRef.id,
    },
    {
      status: 201,
      headers: rateLimitHeaders,
    }
  );
}