import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../../../lib/firebaseAdmin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LIMITS = {
  nom: 100,
  email: 100,
  sujet: 100,
  message: 2000,
} as const;

/**
 * Récupère l'adresse IP du visiteur.
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

  return "unknown";
}

export async function POST(request: Request) {
  try {
    // ============================================================
    // 1. CHARGER LE RATE LIMITER
    // ============================================================

    let contactIpRateLimit:
      | Awaited<
          ReturnType<
            typeof import("../../../lib/rateLimit")
          >
        >["contactIpRateLimit"]
      ;

    let contactEmailRateLimit:
      | Awaited<
          ReturnType<
            typeof import("../../../lib/rateLimit")
          >
        >["contactEmailRateLimit"]
      ;

    try {
      const rateLimitModule =
        await import("../../../lib/rateLimit");

      contactIpRateLimit =
        rateLimitModule.contactIpRateLimit;

      contactEmailRateLimit =
        rateLimitModule.contactEmailRateLimit;
    } catch (error) {
      console.error(
        "[RATE_LIMIT_INIT_ERROR] Impossible d'initialiser Upstash :",
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

    // ============================================================
    // 2. RATE LIMIT PAR IP
    // ============================================================

    const clientIp = getClientIp(request);

    let ipRateLimit;

    try {
      ipRateLimit =
        await contactIpRateLimit.limit(
          `contact-ip:${clientIp}`
        );
    } catch (error) {
      console.error(
        "[RATE_LIMIT_IP_ERROR] Erreur Upstash :",
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

    const ipRateLimitHeaders = {
      "X-RateLimit-IP-Limit":
        ipRateLimit.limit.toString(),

      "X-RateLimit-IP-Remaining":
        Math.max(
          0,
          ipRateLimit.remaining
        ).toString(),

      "X-RateLimit-IP-Reset":
        ipRateLimit.reset.toString(),
    };

    if (!ipRateLimit.success) {
      const retryAfter = Math.max(
        1,
        Math.ceil(
          (ipRateLimit.reset - Date.now()) /
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
            ...ipRateLimitHeaders,
            "Retry-After":
              retryAfter.toString(),
          },
        }
      );
    }

    // ============================================================
    // 3. FIREBASE ADMIN
    // ============================================================

    if (!adminDb) {
      console.error(
        "[FIREBASE_ADMIN_ERROR] Firebase Admin Firestore indisponible."
      );

      return NextResponse.json(
        {
          error:
            "Configuration serveur indisponible.",
        },
        {
          status: 500,
          headers: ipRateLimitHeaders,
        }
      );
    }

    // ============================================================
    // 4. LIRE LE CORPS DE LA REQUÊTE
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
          headers: ipRateLimitHeaders,
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
          headers: ipRateLimitHeaders,
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
    // 5. VALIDATION SERVEUR
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
          headers: ipRateLimitHeaders,
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
          headers: ipRateLimitHeaders,
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
          headers: ipRateLimitHeaders,
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
          headers: ipRateLimitHeaders,
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
          headers: ipRateLimitHeaders,
        }
      );
    }

    // ============================================================
    // 6. RATE LIMIT PAR EMAIL
    // ============================================================

    let emailRateLimit;

    try {
      emailRateLimit =
        await contactEmailRateLimit.limit(
          `contact-email:${email}`
        );
    } catch (error) {
      console.error(
        "[RATE_LIMIT_EMAIL_ERROR] Erreur Upstash :",
        error
      );

      return NextResponse.json(
        {
          error:
            "Le service de protection est temporairement indisponible.",
        },
        {
          status: 503,
          headers: ipRateLimitHeaders,
        }
      );
    }

    const emailRateLimitHeaders = {
      ...ipRateLimitHeaders,

      "X-RateLimit-Email-Limit":
        emailRateLimit.limit.toString(),

      "X-RateLimit-Email-Remaining":
        Math.max(
          0,
          emailRateLimit.remaining
        ).toString(),

      "X-RateLimit-Email-Reset":
        emailRateLimit.reset.toString(),
    };

    if (!emailRateLimit.success) {
      const retryAfter = Math.max(
        1,
        Math.ceil(
          (emailRateLimit.reset - Date.now()) /
            1000
        )
      );

      return NextResponse.json(
        {
          error:
            "Cette adresse email a atteint la limite quotidienne de messages. Veuillez réessayer plus tard.",
        },
        {
          status: 429,
          headers: {
            ...emailRateLimitHeaders,
            "Retry-After":
              retryAfter.toString(),
          },
        }
      );
    }

    // ============================================================
    // 7. CRÉER LA CONVERSATION
    // ============================================================

    let conversationRef;

    try {
      conversationRef =
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
          headers: emailRateLimitHeaders,
        }
      );
    }

    // ============================================================
    // 8. CRÉER LE PREMIER MESSAGE
    // ============================================================

    try {
      await conversationRef
        .collection("messages")
        .add({
          text: message,
          sender: "client",
          createdAt:
            FieldValue.serverTimestamp(),
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
          headers: emailRateLimitHeaders,
        }
      );
    }

    // ============================================================
    // 9. SUCCÈS
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        conversationId:
          conversationRef.id,
      },
      {
        status: 201,
        headers: emailRateLimitHeaders,
      }
    );
  } catch (error) {
    console.error(
      "[CONTACT_UNEXPECTED_ERROR]",
      error
    );

    return NextResponse.json(
      {
        error:
          "Une erreur serveur inattendue est survenue.",
      },
      {
        status: 500,
      }
    );
  }
}