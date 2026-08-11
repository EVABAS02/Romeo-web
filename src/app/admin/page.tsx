"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // .trim() retire les espaces inutiles au début ou à la fin
      await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      
      // Redirection vers le dashboard après connexion réussie
      router.push("/admin/dashboard");
    } catch (err) {
      // Pas de console.error pour éviter l'overlay d'erreur rouge de Next.js en dev
      setError("Identifiants incorrects. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6 border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 text-center">Connexion Admin</h1>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border-l-4 border-red-500">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none text-slate-800"
            placeholder="admin@era-maths.bj"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none text-slate-800"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? "Connexion en cours..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}