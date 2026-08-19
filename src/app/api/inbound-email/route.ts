import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    // ============================================================
    // 1. FIREBASE ADMIN
    // ============================================================

    if (!adminDb) {
      console.error("Firebase Admin Firestore indisponible.");

      return NextResponse.json(
        {
          error: "Configuration Firestore serveur indisponible.",
        },
        { status: 500 }
      );
    }

    // ============================================================
    // 2. RÉCUPÉRER LE PAYLOAD BREVO
    // ============================================================

    const body = await req.json();

    console.log(
      "📩 EMAIL ENTRANT REÇU DE BREVO :",
      JSON.stringify(body, null, 2)
    );

    /*
     * Brevo peut envoyer :
     *
     * {
     *   items: [...]
     * }
     *
     * ou directement un objet email.
     */

    const items = Array.isArray(body?.items)
      ? body.items
      : [body];

    if (items.length === 0) {
      return NextResponse.json(
        {
          error: "Aucun email entrant reçu.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 3. TRAITER LES EMAILS
    // ============================================================

    for (const email of items) {
      // ----------------------------------------------------------
      // EXPÉDITEUR
      // ----------------------------------------------------------

      const senderEmail =
        typeof email?.From?.Address === "string"
          ? email.From.Address.trim().toLowerCase()
          : typeof email?.from === "string"
            ? email.from.trim().toLowerCase()
            : "";

      const senderName =
        typeof email?.From?.Name === "string"
          ? email.From.Name.trim()
          : typeof email?.fromName === "string"
            ? email.fromName.trim()
            : "Client";

      // ----------------------------------------------------------
      // SUJET
      // ----------------------------------------------------------

      const subject =
        typeof email?.Subject === "string"
          ? email.Subject.trim()
          : typeof email?.subject === "string"
            ? email.subject.trim()
            : "Réponse à votre message";

      // ----------------------------------------------------------
      // MESSAGE
      // ----------------------------------------------------------

      let messageText = "";

      if (
        typeof email?.ExtractedMarkdownMessage === "string"
      ) {
        messageText =
          email.ExtractedMarkdownMessage.trim();
      } else if (
        typeof email?.TextBody === "string"
      ) {
        messageText = email.TextBody.trim();
      } else if (
        typeof email?.text === "string"
      ) {
        messageText = email.text.trim();
      } else if (
        typeof email?.HtmlBody === "string"
      ) {
        messageText = email.HtmlBody
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<\/p>/gi, "\n")
          .replace(/<[^>]*>/g, "")
          .trim();
      } else if (
        typeof email?.html === "string"
      ) {
        messageText = email.html
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<\/p>/gi, "\n")
          .replace(/<[^>]*>/g, "")
          .trim();
      }

      // ----------------------------------------------------------
      // VÉRIFICATIONS
      // ----------------------------------------------------------

      if (!senderEmail) {
        console.warn(
          "⚠️ Email entrant ignoré : adresse expéditeur absente."
        );

        continue;
      }

      if (!messageText) {
        console.warn(
          `⚠️ Email entrant ignoré : message vide (${senderEmail}).`
        );

        continue;
      }

      console.log(
        `📨 Réponse reçue de ${senderEmail}`
      );

      // ==========================================================
      // 4. CHERCHER LA CONVERSATION EXISTANTE
      // ==========================================================

      const conversationsSnapshot = await adminDb
        .collection("conversations")
        .where("email", "==", senderEmail)
        .limit(1)
        .get();

      // ==========================================================
      // 5. AUCUNE CONVERSATION
      // ==========================================================

      if (conversationsSnapshot.empty) {
        console.log(
          `🆕 Aucune conversation trouvée pour ${senderEmail}.`
        );

        const conversationRef = adminDb
          .collection("conversations")
          .doc();

        await conversationRef.set({
          nom: senderName || "Client",
          email: senderEmail,
          sujet:
            subject || "Réponse à votre message",
          lastMessage: messageText,
          updatedAt: new Date(),
          read: false,
        });

        await conversationRef
          .collection("messages")
          .add({
            text: messageText,
            sender: "client",
            createdAt: new Date(),
          });

        console.log(
          `✅ Nouvelle conversation créée : ${conversationRef.id}`
        );

        continue;
      }

      // ==========================================================
      // 6. CONVERSATION EXISTANTE
      // ==========================================================

      const conversationDoc =
        conversationsSnapshot.docs[0];

      const conversationRef =
        conversationDoc.ref;

      // ----------------------------------------------------------
      // AJOUTER LE MESSAGE DU CLIENT
      // ----------------------------------------------------------

      const messageRef =
        await conversationRef
          .collection("messages")
          .add({
            text: messageText,
            sender: "client",
            createdAt: new Date(),
          });

      console.log(
        `✅ Message client ajouté : ${messageRef.id}`
      );

      // ----------------------------------------------------------
      // METTRE À JOUR LA CONVERSATION
      // ----------------------------------------------------------

      await conversationRef.update({
        lastMessage: messageText,
        updatedAt: new Date(),
        read: false,
      });

      console.log(
        `🔄 Conversation ${conversationRef.id} mise à jour.`
      );
    }

    // ============================================================
    // 7. RÉPONSE À BREVO
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        message: "Email entrant traité avec succès.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "❌ ERREUR API INBOUND EMAIL :",
      error
    );

    return NextResponse.json(
      {
        error: "Impossible de traiter l'email entrant.",
      },
      { status: 500 }
    );
  }
}