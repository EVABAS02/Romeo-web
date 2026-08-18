"use client";

import React, { useEffect, useRef, useState } from "react";
import { db } from "../lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

type Status = {
  type: "success" | "error" | null;
  text: string;
};

export default function Contact() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [sujet, setSujet] = useState("");
  const [autreSujet, setAutreSujet] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState<Status>({
    type: null,
    text: "",
  });

  /**
   * ============================================================
   * ANIMATION À L'APPARITION
   * ============================================================
   */
  useEffect(() => {
    const currentRef = sectionRef.current;

    if (!currentRef) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, []);

  /**
   * ============================================================
   * ENVOI DU FORMULAIRE
   * ============================================================
   */
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // Évite les doubles clics / doubles soumissions
    if (loading) {
      return;
    }

    setStatus({
      type: null,
      text: "",
    });

    // Nettoyage des données avant envoi
    const nomFinal = nom.trim();
    const emailFinal = email.trim().toLowerCase();
    const autreSujetFinal = autreSujet.trim();
    const messageFinal = message.trim();

    const sujetFinal =
      sujet === "autre"
        ? autreSujetFinal
        : sujet.trim();

    /**
     * ==========================================================
     * VALIDATION CLIENT
     * ==========================================================
     */

    if (!nomFinal || !emailFinal || !sujetFinal || !messageFinal) {
      setStatus({
        type: "error",
        text: "Veuillez remplir tous les champs obligatoires.",
      });
      return;
    }

    if (nomFinal.length > 100) {
      setStatus({
        type: "error",
        text: "Le nom ne peut pas dépasser 100 caractères.",
      });
      return;
    }

    if (emailFinal.length > 100) {
      setStatus({
        type: "error",
        text: "L'adresse email ne peut pas dépasser 100 caractères.",
      });
      return;
    }

    if (messageFinal.length > 2000) {
      setStatus({
        type: "error",
        text: "Le message ne peut pas dépasser 2000 caractères.",
      });
      return;
    }

    if (sujetFinal.length > 100) {
      setStatus({
        type: "error",
        text: "L'objet ne peut pas dépasser 100 caractères.",
      });
      return;
    }

    // Validation supplémentaire de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailFinal)) {
      setStatus({
        type: "error",
        text: "Veuillez saisir une adresse email valide.",
      });
      return;
    }

    setLoading(true);

    try {
      /**
       * ========================================================
       * 1. CRÉATION DE LA CONVERSATION
       * ========================================================
       */
      const conversationRef = await addDoc(
        collection(db, "conversations"),
        {
          nom: nomFinal,
          email: emailFinal,
          sujet: sujetFinal,
          lastMessage: messageFinal,
          updatedAt: serverTimestamp(),
          read: false,
        }
      );

      /**
       * ========================================================
       * 2. CRÉATION DU PREMIER MESSAGE
       * ========================================================
       */
      await addDoc(
        collection(
          db,
          "conversations",
          conversationRef.id,
          "messages"
        ),
        {
          text: messageFinal,
          sender: "client",
          createdAt: serverTimestamp(),
        }
      );

      /**
       * ========================================================
       * 3. SUCCÈS
       * ========================================================
       */
      setStatus({
        type: "success",
        text: "Votre message a bien été envoyé ! Merci.",
      });

      // Réinitialisation du formulaire
      setNom("");
      setEmail("");
      setSujet("");
      setAutreSujet("");
      setMessage("");
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi du message :",
        error
      );

      /**
       * Message utilisateur volontairement générique.
       * Les détails restent dans la console.
       */
      setStatus({
        type: "error",
        text: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative overflow-hidden bg-emerald-800 py-28"
    >
      <div
        className={`relative z-10 mx-auto max-w-7xl px-6 transition-all duration-700 ease-out transform ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-12 opacity-0"
        }`}
      >
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
          {/* ====================================================
              COLONNE GAUCHE
          ==================================================== */}
          <div className="space-y-12 pt-2 lg:pr-4">
            <div className="space-y-6">
              <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                Travaillons ensemble
              </h2>

              <p className="text-lg leading-relaxed text-emerald-50">
                Vous cherchez un professeur de mathématiques
                passionné pour vos élèves ? Je suis disponible
                pour des cours particuliers, des collaborations
                pédagogiques, ou des échanges professionnels.
              </p>
            </div>

            <div className="space-y-6">
              {/* Localisation */}
              <div className="group flex items-center gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-emerald-600/60 bg-emerald-700/80 shadow-md transition-colors group-hover:bg-emerald-700">
                  <svg
                    className="h-6 w-6 text-emerald-100"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>

                <div>
                  <h4 className="mb-0.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Localisation
                  </h4>
                  <p className="text-base font-semibold text-white">
                    Porto-Novo, Bénin
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="group flex items-center gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-emerald-600/60 bg-emerald-700/80 shadow-md transition-colors group-hover:bg-emerald-700">
                  <svg
                    className="h-6 w-6 text-emerald-100"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                <div>
                  <h4 className="mb-0.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Email
                  </h4>

                  <a
                    href="mailto:romeoazon12@gmail.com"
                    className="text-base font-semibold text-white transition-colors hover:text-emerald-200 focus:outline-none focus-visible:underline"
                  >
                    romeoazon12@gmail.com
                  </a>
                </div>
              </div>

              {/* Téléphone */}
              <div className="group flex items-center gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-emerald-600/60 bg-emerald-700/80 shadow-md transition-colors group-hover:bg-emerald-700">
                  <svg
                    className="h-6 w-6 text-emerald-100"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>

                <div>
                  <h4 className="mb-0.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Téléphone
                  </h4>

                  <a
                    href="tel:+2290152999532"
                    className="text-base font-semibold text-white transition-colors hover:text-emerald-200 focus:outline-none focus-visible:underline"
                  >
                    +229 0152999532
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="group flex items-center gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-emerald-600/60 bg-emerald-700/80 shadow-md transition-colors group-hover:bg-emerald-700">
                  <svg
                    className="h-7 w-7 text-emerald-100"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>

                <div>
                  <h4 className="mb-0.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                    WhatsApp
                  </h4>

                  <a
                    href="https://wa.me/22952999532"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-semibold text-white transition-colors hover:text-emerald-200 focus:outline-none focus-visible:underline"
                  >
                    Discuter en direct
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ====================================================
              FORMULAIRE
          ==================================================== */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-8 rounded-none border border-slate-100 bg-white p-8 shadow-2xl sm:p-12"
          >
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {/* Nom */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-bold text-slate-900"
                >
                  Nom complet
                </label>

                <input
                  type="text"
                  id="name"
                  required
                  maxLength={100}
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Votre nom"
                  autoComplete="name"
                  className="w-full rounded-none border-b-2 border-slate-200 bg-transparent py-3 text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-600"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-slate-900"
                >
                  Email
                </label>

                <input
                  type="email"
                  id="email"
                  required
                  maxLength={100}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  autoComplete="email"
                  className="w-full rounded-none border-b-2 border-slate-200 bg-transparent py-3 text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Objet */}
            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-bold text-slate-900"
              >
                Objet
              </label>

              <select
                id="subject"
                required
                value={sujet}
                onChange={(e) => setSujet(e.target.value)}
                className="w-full cursor-pointer rounded-none border-b-2 border-slate-200 bg-transparent py-3 text-slate-700 outline-none transition-colors focus:border-emerald-600"
              >
                <option value="" disabled>
                  Choisir un objet
                </option>

                <option value="cours">
                  Cours particuliers
                </option>

                <option value="collaboration">
                  Collaboration pédagogique
                </option>

                <option value="echange">
                  Échange professionnel
                </option>

                <option value="autre">
                  Autre
                </option>
              </select>

              {sujet === "autre" && (
                <div className="mt-4 pt-1">
                  <input
                    type="text"
                    id="custom-subject"
                    required
                    maxLength={100}
                    value={autreSujet}
                    onChange={(e) =>
                      setAutreSujet(e.target.value)
                    }
                    placeholder="Veuillez préciser votre objet..."
                    autoFocus
                    className="w-full rounded-none border-b-2 border-emerald-600 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              )}
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-bold text-slate-900"
              >
                Message
              </label>

              <textarea
                id="message"
                required
                rows={4}
                maxLength={2000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Votre message..."
                className="w-full resize-none rounded-none border-b-2 border-slate-200 bg-transparent py-3 text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-600"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {message.length}/2000
              </p>
            </div>

            {/* Statut */}
            {status.text && (
              <div
                role="alert"
                aria-live="polite"
                className={`border-l-4 p-4 text-sm font-semibold ${
                  status.type === "success"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-red-600 bg-red-50 text-red-800"
                }`}
              >
                {status.text}
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full cursor-pointer rounded-full bg-emerald-600 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              {loading
                ? "Envoi en cours..."
                : "Envoyer le message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}