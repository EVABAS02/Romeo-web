import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

const ADMIN_UID = "Xp9PJehVALcSvDZCuWA0YTUJd672";

export async function POST(req: Request) {
  try {
    if (!adminAuth) {
      return NextResponse.json(
        { error: "Configuration serveur d'authentification indisponible." },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentification requise." },
        { status: 401 }
      );
    }

    const idToken = authHeader.substring(7);

    const decodedToken = await adminAuth.verifyIdToken(idToken, true);

    if (decodedToken.uid !== ADMIN_UID) {
      return NextResponse.json(
        { error: "Accès administrateur refusé." },
        { status: 403 }
      );
    }

    const { to, subject, replyText, recipientName } = await req.json();

    if (
      typeof to !== "string" ||
      typeof replyText !== "string" ||
      !to.trim() ||
      !replyText.trim()
    ) {
      return NextResponse.json(
        { error: "Destinataire et message requis." },
        { status: 400 }
      );
    }

    const safeReplyText = replyText
      .trim()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\n/g, "<br/>");

    const safeRecipientName = String(recipientName || "Client")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY || "",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Édouard R. Azon",
          email: "romeoazon12@gmail.com",
        },
        to: [
          {
            email: to.trim(),
            name: safeRecipientName,
          },
        ],
        subject: subject ? `Re: ${subject}` : "Réponse à votre message",
        htmlContent: `
          <div style="font-family:sans-serif;padding:20px;color:#333;">
            <p>
              Bonjour <strong>${safeRecipientName}</strong>,
            </p>

            <p
              style="
                font-size:15px;
                line-height:1.6;
                background:#f4f5f9;
                padding:15px;
                border-radius:10px;
              "
            >
              ${safeReplyText}
            </p>

            <hr
              style="
                border:none;
                border-top:1px solid #eee;
                margin:20px 0;
              "
            />

            <p
              style="
                font-size:12px;
                color:#888;
              "
            >
              Cordialement,<br/>
              <strong>Édouard R. Azon</strong>
            </p>
          </div>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erreur Brevo API :", data);

      return NextResponse.json(
        {
          error: data?.message || "Échec de l'envoi de l'email.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Erreur critique send-reply :", error);

    return NextResponse.json(
      {
        error: "Impossible d'envoyer la réponse.",
      },
      { status: 500 }
    );
  }
}