import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const { to, subject, replyText, recipientName } = await req.json();

    // Vérification des champs obligatoires
    if (!to || !replyText) {
      return NextResponse.json(
        { error: "Destinataire et message requis." },
        { status: 400 }
      );
    }

    // Appel direct à l'API REST de Brevo
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
          email: "romeoazon12@gmail.com", // ⚠️ Laisse bien l'email avec lequel tu as créé ton compte Brevo
        },
        to: [
          {
            email: to,
            name: recipientName || "Client",
          },
        ],
        subject: subject ? `Re: ${subject}` : "Réponse à votre message",
        htmlContent: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <p>Bonjour <strong>${recipientName || ""}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.6; background-color: #f4f5f9; padding: 15px; border-radius: 10px;">
              ${replyText.replace(/\n/g, "<br/>")}
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888;">
              Cordialement,<br/>
              <strong>Édouard R. Azon</strong>
            </p>
          </div>
        `,
      }),
    });

    const data = await response.json();

    // Gestion des erreurs renvoyées par Brevo
    if (!response.ok) {
      console.error("Erreur Brevo API :", data);
      return NextResponse.json(
        { error: data.message || "Échec de l'envoi de l'email via Brevo." },
        { status: response.status }
      );
    }

    // Succès
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Erreur critique lors de l'envoi de l'email :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}