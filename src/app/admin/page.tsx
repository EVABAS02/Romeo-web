"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      router.push("/admin/dashboard");
    } catch (err) {
      setError("Identifiants incorrects. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-slate-950 overflow-hidden select-none">
      
      {/* 1. Arrière-plan Mathématiques (Équations & Formules en filigrane) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1920&auto=format&fit=crop')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/85 to-emerald-950/60" />

      {/* Motifs géométriques mathématiques décoratifs en SVG */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <pattern id="math-pattern" width="120" height="120" patternUnits="userSpaceOnUse">
          <text x="10" y="30" fill="white" fontSize="16" fontFamily="serif" italic="true">f(x) = ∫ e^x dx</text>
          <text x="10" y="70" fill="white" fontSize="14" fontFamily="serif">lim (x→∞)</text>
          <text x="10" y="105" fill="white" fontSize="15" fontFamily="serif">E = mc²</text>
          <text x="70" y="50" fill="white" fontSize="18" fontFamily="serif">∑</text>
          <text x="80" y="90" fill="white" fontSize="16" fontFamily="serif">√x</text>
        </pattern>
        <rect width="100%" height="100%" fill="url(#math-pattern)" />
      </svg>

      {/* 2. Bouton Retour au site */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-xs font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl backdrop-blur-md border border-white/15 transition-all cursor-pointer group shadow-lg"
      >
        <span className="transition-transform group-hover:-translate-x-1">←</span>
        <span>Retour au site</span>
      </Link>

      {/* 3. Formulaire de connexion */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl border border-white/30 shadow-2xl">
        
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-emerald-100/80 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3.5 text-2xl font-black shadow-inner">
            ∑
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Espace Enseignant
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Connexion au tableau de bord d'administration
          </p>
        </div>

        {/* Alerte d'erreur */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border-l-4 border-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Champ Email avec vraie icône Personne/Profil */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Adresse Email
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@era-maths.bj"
                className="w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all font-medium"
              />
            </div>
          </div>

          {/* Champ Mot de passe avec Icône de Bascule (Afficher / Masquer) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all font-medium"
              />

              {/* Bouton Oeil (Show/Hide) */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer outline-none"
                title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  /* Icône œil barré (Masquer) */
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                  </svg>
                ) : (
                  /* Icône œil ouvert (Afficher) */
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Bouton de Soumission avec beau border-radius */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition-all duration-200 shadow-lg shadow-emerald-700/25 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Connexion en cours...</span>
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

      </div>
    </div>
  );
}