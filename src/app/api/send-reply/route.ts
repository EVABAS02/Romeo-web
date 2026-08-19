import { NextResponse } from "next/server";
import { adminAuth } from "../../../lib/firebaseAdmin";

const ADMIN_UID = "Xp9PJehVALcSvDZCuWA0YTUJd672";

const INBOUND_REPLY_DOMAIN =
  process.env.BREVO_INBOUND_REPLY_DOMAIN || "";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export async function POST(req: Request) {
  try {
    // ============================================================
    // 1. VÉRIFICATION DE LA CONFIGURATION SERVEUR
    // ============================================================

    if (!adminAuth) {
      return NextResponse.json(
        {
          error:
            "Configuration serveur d'authentification indisponible.",
        },
        { status: 500 }
      );
    }

    if (!process.env.BREVO_API_KEY) {
      return NextResponse.json(
        {
          error: "BREVO_API_KEY n'est pas configurée.",
        },
        { status: 500 }
      );
    }

    // ============================================================
    // 2. VÉRIFICATION DE L'ADMINISTRATEUR
    // ============================================================

    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Authentification requise.",
        },
        { status: 401 }
      );
    }

    const idToken = authHeader.substring(7);

    const decodedToken = await adminAuth.verifyIdToken(
      idToken,
      true
    );

    if (decodedToken.uid !== ADMIN_UID) {
      return NextResponse.json(
        {
          error: "Accès administrateur refusé.",
        },
        { status: 403 }
      );
    }

    // ============================================================
    // 3. RÉCUPÉRATION DES DONNÉES
    // ============================================================

    const {
      conversationId,
      to,
      subject,
      replyText,
      recipientName,
    } = await req.json();

    if (
      typeof conversationId !== "string" ||
      !conversationId.trim()
    ) {
      return NextResponse.json(
        {
          error: "Identifiant de conversation requis.",
        },
        { status: 400 }
      );
    }

    if (
      typeof to !== "string" ||
      !to.trim()
    ) {
      return NextResponse.json(
        {
          error: "Destinataire requis.",
        },
        { status: 400 }
      );
    }

    if (
      typeof replyText !== "string" ||
      !replyText.trim()
    ) {
      return NextResponse.json(
        {
          error: "Message requis.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 4. NETTOYAGE DES DONNÉES (Sécurisé)
    // ============================================================

    const cleanConversationId =
      conversationId.trim();

    const cleanEmail = to.trim();

    // SÉCURITÉ : Limite stricte à 5000 caractères pour protéger l'API
    const cleanReplyText =
      replyText.trim().substring(0, 5000);

    const cleanRecipientName = String(
      recipientName || "Client"
    ).trim();

    // SÉCURITÉ : Suppression des sauts de ligne (\r\n) pour éviter les attaques CRLF Injection
    const rawSubject = typeof subject === "string" && subject.trim()
      ? subject.trim()
      : "Réponse à votre message";
    const cleanSubject = rawSubject.replace(/[\r\n]+/g, " ");

    const safeReplyText =
      escapeHtml(cleanReplyText).replace(
        /\n/g,
        "<br/>"
      );

    const safeRecipientName =
      escapeHtml(cleanRecipientName);

    // ============================================================
    // 5. ADRESSE DE RÉPONSE
    // ============================================================

    let replyToEmail =
      "romeoazon12@gmail.com";

    if (INBOUND_REPLY_DOMAIN) {
      replyToEmail =
        `${cleanConversationId}@${INBOUND_REPLY_DOMAIN}`;
    }

    // ============================================================
    // 6. ENVOI DE L'EMAIL VIA BREVO
    // ============================================================

    const response = await fetch(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",

        headers: {
          accept: "application/json",
          "api-key":
            process.env.BREVO_API_KEY,
          "content-type":
            "application/json",
        },

        body: JSON.stringify({
          sender: {
            name: "Édouard R. Azon",
            email: "romeoazon12@gmail.com",
          },

          to: [
            {
              email: cleanEmail,
              name: cleanRecipientName,
            },
          ],

          replyTo: {
            email: replyToEmail,
            name: "Édouard R. Azon",
          },

          subject: cleanSubject.startsWith("Re:")
            ? cleanSubject
            : `Re: ${cleanSubject}`,

          htmlContent: `
            <div
              style="
                font-family:Arial,sans-serif;
                max-width:600px;
                margin:0 auto;
                padding:24px;
                color:#333;
              "
            >

              <p>
                Bonjour
                <strong>${safeRecipientName}</strong>,
              </p>

              <p
                style="
                  font-size:15px;
                  line-height:1.7;
                  background:#f4f5f9;
                  padding:18px;
                  border-radius:12px;
                  margin:20px 0;
                "
              >
                ${safeReplyText}
              </p>

              <hr
                style="
                  border:none;
                  border-top:1px solid #eee;
                  margin:24px 0;
                "
              />

              <p
                style="
                  font-size:12px;
                  color:#888;
                  line-height:1.6;
                "
              >
                Cordialement,<br/>
                <strong>Édouard R. Azon</strong>
              </p>

            </div>
          `,

          tags: [
            "chat_dashboard",
            `conversation_${cleanConversationId}`,
          ],
        }),
      }
    );

    // ============================================================
    // 7. LECTURE DE LA RÉPONSE BREVO
    // ============================================================

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Erreur Brevo API :",
        data
      );

      return NextResponse.json(
        {
          error:
            data?.message ||
            "Échec de l'envoi de l'email.",
        },
        {
          status:
            response.status || 500,
        }
      );
    }

    // ============================================================
    // 8. SUCCÈS
    // ============================================================

    return NextResponse.json({
      success: true,
      messageId:
        data?.messageId || null,
      replyTo: replyToEmail,
      conversationId:
        cleanConversationId,
    });
  } catch (error) {
    console.error(
      "Erreur critique send-reply :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible d'envoyer la réponse.",
      },
      { status: 500 }
    );
  }
}