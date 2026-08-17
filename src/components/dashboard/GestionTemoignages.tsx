"use client";

import React, { useCallback, useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

interface Temoignage {
  id: string;
  nom: string;
  role: "Parent" | "Élève" | "Collègue";
  message: string;
  note?: number;
  date?: string;
  statut: "pending" | "approuve";
  createdAt?: Timestamp;
}

export default function GestionTemoignages() {
  const [temoignages, setTemoignages] = useState<Temoignage[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  /**
   * Charger uniquement les témoignages en attente.
   */
  const loadTemoignages = useCallback(async () => {
    try {
      setLoading(true);

      const temoignagesQuery = query(
        collection(db, "temoignages"),
        where("statut", "==", "pending")
      );

      const snapshot = await getDocs(temoignagesQuery);

      const data: Temoignage[] = snapshot.docs
        .map((document) => ({
          id: document.id,
          ...(document.data() as Omit<Temoignage, "id">),
        }))
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis() ?? 0;
          const bTime = b.createdAt?.toMillis() ?? 0;

          return bTime - aTime;
        });

      setTemoignages(data);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des témoignages :",
        error
      );

      setTemoignages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Chargement initial.
   * L'authentification est déjà contrôlée
   * par le Dashboard parent.
   */
  useEffect(() => {
    loadTemoignages();
  }, [loadTemoignages]);

  /**
   * Approuver un témoignage.
   * pending -> approuve
   */
  const handleApprove = async (id: string) => {
    if (!id || processingId) return;

    try {
      setProcessingId(id);

      await updateDoc(doc(db, "temoignages", id), {
        statut: "approuve",
      });

      setTemoignages((prev) =>
        prev.filter((temoignage) => temoignage.id !== id)
      );
    } catch (error) {
      console.error(
        "Erreur lors de l'approbation du témoignage :",
        error
      );

      window.alert(
        "Impossible d'approuver ce témoignage."
      );
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Supprimer définitivement un témoignage.
   */
  const handleDelete = async (id: string) => {
    if (!id || processingId) return;

    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer ce témoignage ?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(id);

      await deleteDoc(doc(db, "temoignages", id));

      setTemoignages((prev) =>
        prev.filter((temoignage) => temoignage.id !== id)
      );
    } catch (error) {
      console.error(
        "Erreur lors de la suppression du témoignage :",
        error
      );

      window.alert(
        "Impossible de supprimer ce témoignage."
      );
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * État de chargement.
   */
  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-400">
          Chargement des témoignages en attente...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-3xl bg-white p-6 shadow-sm">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Modération des témoignages
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Vérifiez les témoignages avant leur publication sur le site.
          </p>
        </div>

        <span className="w-fit rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
          {temoignages.length} en attente
        </span>
      </div>

      {/* ================= VIDE ================= */}
      {temoignages.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
            ✓
          </div>

          <h4 className="text-sm font-bold text-slate-800">
            Aucun témoignage à modérer
          </h4>

          <p className="mt-1 text-xs text-slate-400">
            Tous les témoignages ont été traités.
          </p>
        </div>
      ) : (
        /* ================= LISTE ================= */
        <div className="space-y-4">
          {temoignages.map((temoignage) => {
            const isProcessing =
              processingId === temoignage.id;

            const note = Math.min(
              5,
              Math.max(1, temoignage.note ?? 5)
            );

            return (
              <article
                key={temoignage.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5"
              >
                <div className="flex flex-col gap-4">
                  {/* ===== IDENTITÉ + NOTE ===== */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {temoignage.nom}
                        </h4>

                        <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          {temoignage.role}
                        </span>
                      </div>

                      {temoignage.date && (
                        <p className="mt-1 text-[11px] text-slate-400">
                          {temoignage.date}
                        </p>
                      )}
                    </div>

                    <div
                      className="flex items-center gap-1 text-amber-400"
                      aria-label={`Note ${note} sur 5`}
                    >
                      {Array.from({ length: note }).map(
                        (_, index) => (
                          <span key={index}>★</span>
                        )
                      )}
                    </div>
                  </div>

                  {/* ===== MESSAGE ===== */}
                  <blockquote className="border-l-2 border-emerald-600 pl-4 text-sm leading-relaxed text-slate-700">
                    “{temoignage.message}”
                  </blockquote>

                  {/* ===== ACTIONS ===== */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(temoignage.id)
                      }
                      disabled={isProcessing}
                      className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Supprimer
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleApprove(temoignage.id)
                      }
                      disabled={isProcessing}
                      className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isProcessing
                        ? "Traitement..."
                        : "✓ Approuver et publier"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}