"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
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
        filled ? "text-amber-400 fill-amber-400" : "text-slate-600 fill-slate-600/40"
      }`}
      viewBox="0 0 24 24"
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

export default function Temoignages() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const currentRef = sectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  const [temoignages, setTemoignages] = useState<Temoignage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [role, setRole] = useState<"Parent" | "Élève" | "Collègue">("Élève");
  const [message, setMessage] = useState("");
  const [note, setNote] = useState<number>(5);
  const [hoverNote, setHoverNote] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadTemoignages() {
    try {
      setLoading(true);
      const q = query(
        collection(db, "temoignages"),
        where("statut", "==", "approuve"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const list: Temoignage[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Temoignage, "id">),
      }));
      setTemoignages(list);
    } catch (error) {
      console.error("Erreur lors du chargement des témoignages :", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTemoignages();
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? temoignages.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === temoignages.length - 1 ? 0 : prev + 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !message.trim()) return;
    setSubmitting(true);
    setErrorMessage("");

    try {
      const today = new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      // ⚠️ statut à "pending" pour correspondre à la règle de sécurité Firestore
      await addDoc(collection(db, "temoignages"), {
        nom: nom.trim(),
        role,
        message: message.trim(),
        note,
        date: today,
        statut: "pending",
        createdAt: serverTimestamp(),
      });

      setSubmittedSuccess(true);
      setNom("");
      setMessage("");
      setNote(5);
    } catch (error) {
      console.error("Erreur lors de l'envoi du témoignage :", error);
      setErrorMessage("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSubmittedSuccess(false);
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
    <section id="temoignages" ref={sectionRef} className="py-20 bg-slate-50/50 text-slate-900 relative">
      <div className={`max-w-7xl mx-auto px-6 transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-3xl sm:text-2xl font-black tracking-tight text-slate-900">
              Témoignages & Avis
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Découvrez les retours d'expérience des élèves et parents accompagnés par M. Azon.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start md:self-auto bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-700/20 transition-all flex items-center gap-2 group cursor-pointer"
          >
            <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Laisser un témoignage
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-xs font-bold gap-2">
            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            Chargement des témoignages...
          </div>
        ) : temoignages.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-sm text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-xl">
              💬
            </div>
            <h3 className="font-bold text-slate-900 text-base">Aucun témoignage publié pour le moment</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Vous avez suivi des cours avec M. Azon ? Soyez le tout premier à donner votre avis et partager votre progression !
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Rédiger le premier avis
            </button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto relative">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-lg shadow-slate-100 relative">
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-1">
                  {Array.from({ length: currentItem?.note || 5 }).map((_, i) => (
                    <StarIcon key={i} filled={true} className="w-4 h-4" />
                  ))}
                </div>

                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Avis vérifié
                </span>
              </div>

              <blockquote className="text-slate-800 text-base sm:text-lg font-medium leading-relaxed mb-8 border-l-2 border-emerald-600 pl-4 sm:pl-5 italic">
                “{currentItem?.message}”
              </blockquote>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 font-black text-xs flex items-center justify-center tracking-wider shadow-sm shrink-0">
                    {initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight">
                      {currentItem?.nom}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {currentItem?.role}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 font-medium">
                  {currentItem?.date}
                </span>
              </div>
            </div>

            {temoignages.length > 1 && (
              <div className="flex items-center justify-between mt-6 px-2">
                <div className="flex items-center gap-1">
                  {temoignages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className="p-2 cursor-pointer group outline-none"
                      aria-label={`Témoignage ${idx + 1}`}
                    >
                      <div className={`h-2.5 rounded-full transition-all ${
                        idx === currentIndex
                          ? "w-8 bg-emerald-700"
                          : "w-2.5 bg-slate-300 group-hover:bg-slate-400"
                      }`} />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={prevSlide}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer text-lg font-bold"
                    aria-label="Précédent"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextSlide}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer text-lg font-bold"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500 scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1920&auto=format&fit=crop')`,
            }}
          >
            <div className="absolute inset-0 bg-slate-950/50" />
          </div>

          <div className="relative w-full max-w-md rounded-none p-7 sm:p-9 bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-none flex items-center justify-center text-xs font-bold transition-all cursor-pointer border border-white/20"
            >
              ✕
            </button>

            <h3 className="text-2xl font-black text-white mb-1 tracking-tight text-center">
              Laissez votre témoignage
            </h3>
            <p className="text-xs text-slate-200/80 mb-6 text-center leading-relaxed">
              Votre message sera vérifié et validé par M. Azon avant sa publication.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-none bg-red-500/30 text-red-100 text-xs font-medium border border-red-400/30 backdrop-blur-sm">
                {errorMessage}
              </div>
            )}

            {submittedSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 rounded-none flex items-center justify-center mx-auto text-2xl font-bold backdrop-blur-sm">
                  ✓
                </div>
                <h4 className="font-bold text-white text-base">Témoignage envoyé !</h4>
                <p className="text-xs text-slate-200 max-w-xs mx-auto leading-relaxed">
                  Merci pour votre retour, votre témoignage est désormais enregistré et en attente de validation.
                </p>
                <button
                  onClick={closeModal}
                  className="bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs px-6 py-3 rounded-full transition-all shadow-lg cursor-pointer"
                >
                  Fermer la fenêtre
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-100 mb-1">
                    Votre Nom complet 
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full px-1 py-2.5 bg-transparent border-b border-white/30 text-xs text-white placeholder-slate-300/50 outline-none focus:border-emerald-400 transition-all rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-100 mb-1">
                    Vous êtes 
                  </label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) =>
                        setRole(e.target.value as "Parent" | "Élève" | "Collègue")
                      }
                      className="w-full px-1 py-2.5 bg-transparent border-b border-white/30 text-xs text-white outline-none focus:border-emerald-400 transition-all appearance-none cursor-pointer rounded-none"
                    >
                      <option value="Élève" className="bg-slate-900 text-white">Élève</option>
                      <option value="Parent" className="bg-slate-900 text-white">Parent d'élève</option>
                      <option value="Collègue" className="bg-slate-900 text-white">Collègue enseignant</option>
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 text-xs">
                      ▼
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-100 mb-2">
                    Note globale
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNote(star)}
                        onMouseEnter={() => setHoverNote(star)}
                        onMouseLeave={() => setHoverNote(null)}
                        className="p-0.5 transition-transform hover:scale-110 cursor-pointer outline-none"
                      >
                        <StarIcon
                          filled={star <= (hoverNote ?? note)}
                          className="w-6 h-6"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-100 mb-1">
                    Votre Message 
                  </label>
                  <textarea
                    required
                    rows={3}
                    maxLength={2000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Votre message..."
                    className="w-full px-1 py-2.5 bg-transparent border-b border-white/30 text-xs text-white placeholder-slate-300/50 outline-none focus:border-emerald-400 transition-all resize-none rounded-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-full text-xs sm:text-sm transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      "Envoyer mon témoignage"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}