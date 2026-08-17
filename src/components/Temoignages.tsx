"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

interface Temoignage {
  id: string;
  nom: string;
  role: "Parent" | "Élève" | "Collègue";
  message: string;
  date: string;
  note?: number;
  statut: "pending" | "approuve";
  createdAt?: Timestamp;
}

function StarIcon({
  filled,
  className = "w-4 h-4",
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      className={`${className} transition-colors duration-150 ${
        filled
          ? "text-amber-400 fill-amber-400"
          : "text-slate-600 fill-slate-600/40"
      }`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

export default function Temoignages() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [temoignages, setTemoignages] = useState<Temoignage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [nom, setNom] = useState("");
  const [role, setRole] =
    useState<"Parent" | "Élève" | "Collègue">("Élève");
  const [message, setMessage] = useState("");
  const [note, setNote] = useState<number>(5);
  const [hoverNote, setHoverNote] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const alreadySubmitted = localStorage.getItem(
        "temoignage_submitted"
      );

      if (alreadySubmitted) {
        setHasSubmitted(true);
      }
    }

    const currentRef = sectionRef.current;

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

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  async function loadTemoignages() {
    try {
      setLoading(true);

      const q = query(
        collection(db, "temoignages"),
        where("statut", "==", "approuve")
      );

      const snapshot = await getDocs(q);

      const list: Temoignage[] = snapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Temoignage, "id">),
        }))
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis() ?? 0;
          const bTime = b.createdAt?.toMillis() ?? 0;

          return bTime - aTime;
        });

      setTemoignages(list);

      setCurrentIndex((current) =>
        list.length === 0
          ? 0
          : Math.min(current, list.length - 1)
      );
    } catch (error) {
      console.error(
        "Erreur lors du chargement des témoignages :",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTemoignages();
  }, []);

  const prevSlide = () => {
    if (temoignages.length <= 1) return;

    setCurrentIndex((prev) =>
      prev === 0 ? temoignages.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    if (temoignages.length <= 1) return;

    setCurrentIndex((prev) =>
      prev === temoignages.length - 1 ? 0 : prev + 1
    );
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const trimmedName = nom.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedMessage) {
      setErrorMessage(
        "Veuillez renseigner votre nom et votre message."
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const today = new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      await addDoc(collection(db, "temoignages"), {
        nom: trimmedName,
        role,
        message: trimmedMessage,
        note,
        date: today,
        statut: "pending",
        createdAt: serverTimestamp(),
      });

      localStorage.setItem(
        "temoignage_submitted",
        "true"
      );

      setHasSubmitted(true);
      setNom("");
      setMessage("");
      setNote(5);
      setHoverNote(null);
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi du témoignage :",
        error
      );

      setErrorMessage(
        "Une erreur est survenue lors de l'envoi. Veuillez réessayer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);

    setTimeout(() => {
      setErrorMessage("");
      setHoverNote(null);
    }, 300);
  };

  const currentItem = temoignages[currentIndex];

  const initials = currentItem?.nom
    ? currentItem.nom
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "A";

  return (
    <section
      id="temoignages"
      ref={sectionRef}
      className="relative bg-slate-50/50 py-20 text-slate-900"
    >
      <div
        className={`mx-auto max-w-7xl transform px-6 transition-all duration-700 ease-out ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-12 opacity-0"
        }`}
      >
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-2xl">
              Témoignages & Avis
            </h2>

            <p className="text-sm text-slate-600 sm:text-base">
              Découvrez les retours d'expérience des élèves et
              parents accompagnés par M. Azon.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="group flex cursor-pointer items-center gap-2 self-start rounded-2xl bg-emerald-700 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-700/20 transition-all hover:bg-emerald-800 sm:text-sm md:self-auto"
          >
            <svg
              className="h-4 w-4 transition-transform group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 4v16m8-8H4"
              />
            </svg>

            Laisser un témoignage
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-xs font-bold text-slate-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            Chargement des témoignages...
          </div>
        ) : temoignages.length === 0 ? (
          <div className="mx-auto max-w-xl space-y-4 rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-600">
              💬
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Aucun témoignage publié pour le moment
            </h3>

            <p className="text-xs leading-relaxed text-slate-500">
              Vous avez suivi des cours avec M. Azon ? Soyez le
              tout premier à donner votre avis et partager votre
              progression !
            </p>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
            >
              Rédiger le premier avis
            </button>
          </div>
        ) : (
          <div className="relative mx-auto max-w-3xl">
            <div className="relative rounded-3xl border border-slate-200/80 bg-white p-8 shadow-lg shadow-slate-100 sm:p-10">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {Array.from({
                    length: currentItem?.note || 5,
                  }).map((_, i) => (
                    <StarIcon
                      key={i}
                      filled
                      className="h-4 w-4"
                    />
                  ))}
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Avis approuvé
                </span>
              </div>

              <blockquote className="mb-8 border-l-2 border-emerald-600 pl-4 text-base font-medium italic leading-relaxed text-slate-800 sm:pl-5 sm:text-lg">
                “{currentItem?.message}”
              </blockquote>

              <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-black tracking-wider text-emerald-400 shadow-sm">
                    {initials}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold leading-tight text-slate-900">
                      {currentItem?.nom}
                    </h3>

                    <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                      {currentItem?.role}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-medium text-slate-400">
                  {currentItem?.date}
                </span>
              </div>
            </div>

            {temoignages.length > 1 && (
              <div className="mt-6 flex items-center justify-between px-2">
                <div className="flex items-center gap-1">
                  {temoignages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className="group cursor-pointer p-2 outline-none"
                      aria-label={`Témoignage ${idx + 1}`}
                    >
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          idx === currentIndex
                            ? "w-8 bg-emerald-700"
                            : "w-2.5 bg-slate-300 group-hover:bg-slate-400"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={prevSlide}
                    className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-emerald-700 hover:shadow-md active:scale-95 sm:h-14 sm:w-14"
                    aria-label="Précédent"
                  >
                    ←
                  </button>

                  <button
                    type="button"
                    onClick={nextSlide}
                    className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-emerald-700 hover:shadow-md active:scale-95 sm:h-14 sm:w-14"
                    aria-label="Suivant"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Formulaire de témoignage"
        >
          <div
            onClick={closeModal}
            className="absolute inset-0 cursor-pointer bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1920&auto=format&fit=crop')",
            }}
          >
            <div className="absolute inset-0 bg-slate-950/50" />
          </div>

          <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto border border-white/20 bg-white/10 p-7 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-xl sm:p-9">
            <button
              type="button"
              onClick={closeModal}
              aria-label="Fermer la fenêtre"
              className="absolute right-6 top-6 flex h-8 w-8 cursor-pointer items-center justify-center border border-white/20 bg-white/10 text-xs font-bold text-white transition-all hover:bg-white/20"
            >
              ✕
            </button>

            <h3 className="mb-1 text-center text-2xl font-black tracking-tight text-white">
              Laissez votre témoignage
            </h3>

            {hasSubmitted ? (
              <div className="space-y-4 py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center border border-emerald-400/30 bg-emerald-400/20 text-2xl font-bold text-emerald-300 backdrop-blur-sm">
                  ✓
                </div>

                <h4 className="text-base font-bold text-white">
                  Merci pour votre témoignage !
                </h4>

                <p className="mx-auto max-w-xs text-xs leading-relaxed text-slate-200">
                  Votre témoignage a bien été envoyé. Il est en
                  cours de modération avant publication.
                </p>

                <button
                  type="button"
                  onClick={closeModal}
                  className="cursor-pointer rounded-full bg-white px-6 py-3 text-xs font-bold text-slate-950 shadow-lg transition-all hover:bg-slate-100"
                >
                  Fermer la fenêtre
                </button>
              </div>
            ) : (
              <>
                <p className="mb-6 text-center text-xs leading-relaxed text-slate-200/80">
                  Votre message sera vérifié et validé par M.
                  Azon avant sa publication.
                </p>

                {errorMessage && (
                  <div className="mb-4 border border-red-400/30 bg-red-500/30 p-3 text-xs font-medium text-red-100 backdrop-blur-sm">
                    {errorMessage}
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div>
                    <label
                      htmlFor="testimonial-name"
                      className="mb-1 block text-xs font-bold text-slate-100"
                    >
                      Votre Nom complet
                    </label>

                    <input
                      id="testimonial-name"
                      type="text"
                      required
                      maxLength={100}
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      placeholder="Votre nom"
                      className="w-full rounded-none border-b border-white/30 bg-transparent px-1 py-2.5 text-xs text-white outline-none transition-all placeholder:text-slate-300/50 focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="testimonial-role"
                      className="mb-1 block text-xs font-bold text-slate-100"
                    >
                      Vous êtes
                    </label>

                    <div className="relative">
                      <select
                        id="testimonial-role"
                        value={role}
                        onChange={(e) =>
                          setRole(
                            e.target.value as
                              | "Parent"
                              | "Élève"
                              | "Collègue"
                          )
                        }
                        className="w-full cursor-pointer appearance-none rounded-none border-b border-white/30 bg-transparent px-1 py-2.5 text-xs text-white outline-none transition-all focus:border-emerald-400"
                      >
                        <option
                          value="Élève"
                          className="bg-slate-900 text-white"
                        >
                          Élève
                        </option>

                        <option
                          value="Parent"
                          className="bg-slate-900 text-white"
                        >
                          Parent d'élève
                        </option>

                        <option
                          value="Collègue"
                          className="bg-slate-900 text-white"
                        >
                          Collègue enseignant
                        </option>
                      </select>

                      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-300">
                        ▼
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-100">
                      Note globale
                    </label>

                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNote(star)}
                          onMouseEnter={() =>
                            setHoverNote(star)
                          }
                          onMouseLeave={() =>
                            setHoverNote(null)
                          }
                          className="cursor-pointer p-0.5 outline-none transition-transform hover:scale-110"
                          aria-label={`Donner ${star} étoile${
                            star > 1 ? "s" : ""
                          }`}
                        >
                          <StarIcon
                            filled={
                              star <=
                              (hoverNote ?? note)
                            }
                            className="h-6 w-6"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="testimonial-message"
                      className="mb-1 block text-xs font-bold text-slate-100"
                    >
                      Votre Message
                    </label>

                    <textarea
                      id="testimonial-message"
                      required
                      rows={3}
                      maxLength={2000}
                      value={message}
                      onChange={(e) =>
                        setMessage(e.target.value)
                      }
                      placeholder="Votre message..."
                      className="w-full resize-none rounded-none border-b border-white/30 bg-transparent px-1 py-2.5 text-xs text-white outline-none transition-all placeholder:text-slate-300/50 focus:border-emerald-400"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                    >
                      {submitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Envoi en cours...
                        </>
                      ) : (
                        "Envoyer mon témoignage"
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}