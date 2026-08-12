"use client";

import React, { useEffect, useRef, useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Contact() {
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

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [sujet, setSujet] = useState("");
  const [autreSujet, setAutreSujet] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, text: "" });

    const sujetFinal = sujet === "autre" ? autreSujet : sujet;

    try {
      const convRef = await addDoc(collection(db, "conversations"), {
        nom,
        email,
        sujet: sujetFinal,
        lastMessage: message,
        updatedAt: serverTimestamp(),
        read: false,
      });

      await addDoc(collection(db, "conversations", convRef.id, "messages"), {
        text: message,
        sender: "client",
        createdAt: serverTimestamp(),
      });

      setStatus({
        type: "success",
        text: "Votre message a bien été envoyé ! Merci.",
      });

      setNom("");
      setEmail("");
      setSujet("");
      setAutreSujet("");
      setMessage("");
    } catch (error) {
      console.error("Erreur d'envoi Firestore :", error);
      setStatus({
        type: "error",
        text: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" ref={sectionRef} className="py-28 bg-emerald-800 relative overflow-hidden">
      <div className={`max-w-7xl mx-auto px-6 relative z-10 transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-16 items-start">
          
          <div className="space-y-12 lg:pr-4 pt-2">
            
            <div className="space-y-6">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                Travaillons ensemble
              </h2>
              <p className="text-emerald-50 text-lg leading-relaxed">
                Vous cherchez un professeur de mathématiques passionné pour vos élèves ? Je suis disponible pour des cours particuliers, des collaborations pédagogiques, ou des échanges professionnels.
              </p>
            </div>

            <div className="space-y-6">
              
              <div className="flex items-center gap-5 group">
                <div className="w-14 h-14 rounded-xl bg-emerald-700/80 flex items-center justify-center shrink-0 border border-emerald-600/60 shadow-md group-hover:bg-emerald-700 transition-colors">
                  <svg className="w-6 h-6 text-emerald-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-0.5">Localisation</h4>
                  <p className="text-white font-semibold text-base">Porto-Novo, Bénin</p>
                </div>
              </div>

              <div className="flex items-center gap-5 group">
                <div className="w-14 h-14 rounded-xl bg-emerald-700/80 flex items-center justify-center shrink-0 border border-emerald-600/60 shadow-md group-hover:bg-emerald-700 transition-colors">
                  <svg className="w-6 h-6 text-emerald-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-0.5">Email</h4>
                  <a href="mailto:contact@era-maths.bj" className="text-white font-semibold hover:text-emerald-200 transition-colors text-base">
                    romeoazon12@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-5 group">
                <div className="w-14 h-14 rounded-xl bg-emerald-700/80 flex items-center justify-center shrink-0 border border-emerald-600/60 shadow-md group-hover:bg-emerald-700 transition-colors">
                  <svg className="w-6 h-6 text-emerald-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-0.5">Téléphone</h4>
                  <p className="text-white font-semibold text-base">+229 0152999532</p>
                </div>
              </div>

              <div className="flex items-center gap-5 group">
                <div className="w-14 h-14 rounded-xl bg-emerald-700/80 flex items-center justify-center shrink-0 border border-emerald-600/60 shadow-md group-hover:bg-emerald-700 transition-colors">
                  <svg className="w-7 h-7 text-emerald-100" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-0.5">WhatsApp</h4>
                  <a href="https://wa.me/22952999532" target="_blank" rel="noopener noreferrer" className="text-white font-semibold hover:text-emerald-200 transition-colors text-base">
                    Discuter en direct
                  </a>
                </div>
              </div>

            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-12 rounded-none shadow-2xl border border-slate-100 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-slate-900 mb-2">Nom complet</label>
                <input 
                  type="text" 
                  id="name" 
                  required
                  maxLength={100}
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Votre nom" 
                  className="w-full bg-transparent border-b-2 border-slate-200 focus:border-emerald-600 py-3 text-slate-800 placeholder-slate-400 outline-none transition-colors rounded-none"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-900 mb-2">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  required
                  maxLength={100}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com" 
                  className="w-full bg-transparent border-b-2 border-slate-200 focus:border-emerald-600 py-3 text-slate-800 placeholder-slate-400 outline-none transition-colors rounded-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-bold text-slate-900 mb-2">Objet</label>
              <select 
                id="subject" 
                required
                value={sujet}
                onChange={(e) => setSujet(e.target.value)}
                className="w-full bg-transparent border-b-2 border-slate-200 focus:border-emerald-600 py-3 text-slate-700 outline-none transition-colors cursor-pointer rounded-none"
              >
                <option value="" disabled>Choisir un objet</option>
                <option value="cours">Cours particuliers</option>
                <option value="collaboration">Collaboration pédagogique</option>
                <option value="echange">Échange professionnel</option>
                <option value="autre">Autre</option>
              </select>

              {sujet === "autre" && (
                <div className="mt-4 pt-1">
                  <input 
                    type="text" 
                    id="custom-subject" 
                    required
                    maxLength={100}
                    value={autreSujet}
                    onChange={(e) => setAutreSujet(e.target.value)}
                    placeholder="Veuillez préciser votre objet..." 
                    className="w-full bg-slate-50 border-b-2 border-emerald-600 px-3 py-2.5 text-slate-800 placeholder-slate-400 outline-none transition-all text-sm rounded-none"
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-bold text-slate-900 mb-2">Message</label>
              <textarea 
                id="message" 
                required
                rows={4} 
                maxLength={2000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Votre message..." 
                className="w-full bg-transparent border-b-2 border-slate-200 focus:border-emerald-600 py-3 text-slate-800 placeholder-slate-400 outline-none transition-colors resize-none rounded-none"
              ></textarea>
            </div>

            {status.text && (
              <div
                className={`p-4 text-sm font-semibold ${
                  status.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600"
                    : "bg-red-50 text-red-800 border-l-4 border-red-600"
                }`}
              >
                {status.text}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base py-4 rounded-full transition-all shadow-lg hover:shadow-xl mt-6 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Envoi en cours..." : "Envoyer le message"}
            </button>
          </form>

        </div>
      </div>
    </section>
  );
}