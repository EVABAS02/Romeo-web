"use client";

import React, { useEffect, useRef, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface FichierItem {
  url: string;
  name: string;
  isPdf: boolean;
}

export interface RessourceDoc {
  id: string;
  titre: string;
  niveau: string;
  type?: "cours" | "epreuve";
  fichiers?: FichierItem[];
  urlPdf?: string;
}

const NIVEAUX_CONFIG = [
  {
    id: "3eme",
    niveau: "Classe de 3ème",
    shortLabel: "3ème",
    badge: "Brevet / BEPC",
    chapitres: [
      "Calcul numérique & Thales",
      "Pythagore & Trigonométrie",
      "Équations & Inéquations",
      "Statistiques & Probabilités",
    ],
  },
  {
    id: "2nde",
    niveau: "Classe de Seconde",
    shortLabel: "2nde",
    badge: "Secondaire",
    chapitres: [
      "Fonctions usuelles & Variations",
      "Vecteurs & Repérage",
      "Équations de droites",
      "Arithmétique",
    ],
  },
  {
    id: "1ere",
    niveau: "Classe de Première",
    shortLabel: "1ère",
    badge: "Secondaire",
    chapitres: [
      "Dérivation & Applications",
      "Suites numériques",
      "Trigonométrie circulaire",
      "Produit scalaire",
    ],
  },
  {
    id: "Terminale C",
    niveau: "Terminale C",
    shortLabel: "Tle C",
    badge: "Baccalauréat C",
    chapitres: [
      "Limites & Intégration",
      "Nombres Complexes",
      "Étude des Coniques",
      "Arithmétique & Probabilités",
    ],
  },
];

export default function CoursEpreuvesOnglets() {
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

  const [selectedNiveau, setSelectedNiveau] = useState<string>("3eme");
  const [ressourcesMap, setRessourcesMap] = useState<
    Record<string, RessourceDoc[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRessources = async () => {
      try {
        const q = query(
          collection(db, "ressources"),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const map: Record<string, RessourceDoc[]> = {};

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();

          const fichiersList: FichierItem[] =
            data.fichiers ||
            (data.urlPdf
              ? [
                  {
                    url: data.urlPdf,
                    name: data.titre || "Document",
                    isPdf: data.urlPdf.toLowerCase().includes(".pdf"),
                  },
                ]
              : []);

          const resssourceFormatted: RessourceDoc = {
            id: docSnap.id,
            titre: data.titre,
            niveau: data.niveau,
            type: data.type,
            fichiers: fichiersList,
            urlPdf: data.urlPdf,
          };

          if (resssourceFormatted.niveau) {
            if (!map[resssourceFormatted.niveau]) {
              map[resssourceFormatted.niveau] = [];
            }

            map[resssourceFormatted.niveau].push(resssourceFormatted);
          }
        });

        setRessourcesMap(map);
      } catch (error) {
        console.error("Erreur chargement des ressources :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRessources();
  }, []);

  // Gestion du téléchargement / ouverture 100% sécurisée
  const handleDownload = async (fileUrl: string, fileName: string) => {
    if (!fileUrl) return;

    try {
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error("Erreur de réponse réseau");
      }

      const contentType = response.headers.get("content-type") || "";

      if (
        contentType.includes("text/html") ||
        contentType.includes("application/json")
      ) {
        throw new Error("Réponse non binaire détectée");
      }

      const blob = await response.blob();

      // Vérification de la signature du fichier (%PDF)
      const buffer = await blob.slice(0, 4).arrayBuffer();
      const header = new TextDecoder().decode(buffer);

      if (header !== "%PDF") {
        throw new Error(
          "Le fichier reçu n'est pas un document PDF valide"
        );
      }

      // Si le fichier est valide, on le télécharge
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = fileName.toLowerCase().endsWith(".pdf")
        ? fileName
        : `${fileName}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Si la récupération directe échoue ou si le fichier n'est pas valide
      // en Blob, on ouvre directement l'URL dans un nouvel onglet.
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  const currentConfig =
    NIVEAUX_CONFIG.find((n) => n.id === selectedNiveau) ||
    NIVEAUX_CONFIG[0];

  const currentDocs = ressourcesMap[selectedNiveau] || [];

  const coursDocs = currentDocs.filter((d) => d.type === "cours");
  const epreuveDocs = currentDocs.filter((d) => d.type !== "cours");

  return (
    <section
      id="cours-epreuves"
      ref={sectionRef}
      className="scroll-mt-20 bg-white py-16 text-slate-950 sm:py-24"
    >
      <div
        className={`mx-auto max-w-7xl px-4 transition-all duration-700 ease-out sm:px-6 ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-12 opacity-0"
        }`}
      >
        {/* Titre Général & Trait Vert */}
        <div className="mx-auto mb-8 flex max-w-2xl flex-col items-center text-center sm:mb-10">
          <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Cours &amp; Épreuves
          </h2>

          <p className="mt-2 text-xs font-semibold tracking-tight text-slate-600 sm:text-sm">
            Sélectionnez votre classe pour accéder aux ressources
          </p>

          <div className="mt-4 h-1 w-14 rounded-full bg-emerald-600" />
        </div>

        {/* Onglets de sélection du niveau */}
        <div className="mb-8 flex snap-x snap-mandatory items-center justify-start gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mb-10 sm:justify-center sm:px-0">
          {NIVEAUX_CONFIG.map((item) => {
            const isActive = selectedNiveau === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedNiveau(item.id)}
                className={`shrink-0 snap-center rounded-xl px-5 py-3 text-xs font-black tracking-tight transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 sm:py-3.5 sm:text-sm ${
                  isActive
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-950/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                <span className="sm:hidden">{item.shortLabel}</span>
                <span className="hidden sm:inline">{item.niveau}</span>
              </button>
            );
          })}
        </div>

        {/* Conteneur principal */}
        <div className="rounded-3xl border border-slate-200/90 bg-slate-50/80 p-5 shadow-sm sm:p-8 md:p-10">
          {/* En-tête Niveau & Chapitres */}
          <div className="mb-8 flex flex-col gap-6 border-b border-slate-200/80 pb-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Niveau */}
            <div>
              <span className="inline-flex rounded-full bg-emerald-100 px-3.5 py-1.5 text-[11px] font-black tracking-wide text-emerald-900 sm:text-xs">
                {currentConfig.badge}
              </span>

              <h3 className="mt-2.5 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">
                {currentConfig.niveau}
              </h3>
            </div>

            {/* Programme */}
            <div className="border-t border-slate-200/80 pt-5 lg:max-w-2xl lg:border-t-0 lg:pt-0">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 sm:text-xs">
                Programme :
              </p>

              <div className="grid grid-cols-1 gap-x-5 gap-y-2 text-xs font-bold tracking-tight text-slate-800 sm:flex sm:flex-wrap">
                {currentConfig.chapitres.map((chapitre, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-2"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
                    <span>{chapitre}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Grille Cours vs Épreuves */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* COLONNE COURS */}
            <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_15px_35px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_20px_40px_-28px_rgba(16,185,129,0.18)] sm:p-6">
              <div>
                {/* En-tête */}
                <div className="mb-6 flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-900 shadow-sm">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-base font-black tracking-tight text-slate-950 sm:text-lg">
                      Cours &amp; Fiches Récapitulatives
                    </h4>

                    <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500 sm:text-xs">
                      {coursDocs.length} ressource(s) disponible(s)
                    </span>
                  </div>
                </div>

                {/* Contenu */}
                {loading ? (
                  <div className="flex min-h-32 items-center justify-center text-xs font-bold text-slate-400">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                    Chargement des cours...
                  </div>
                ) : coursDocs.length > 0 ? (
                  <div className="space-y-3">
                    {coursDocs.map((doc) => {
                      const files =
                        doc.fichiers && doc.fichiers.length > 0
                          ? doc.fichiers
                          : [
                              {
                                url: doc.urlPdf || "#",
                                name: doc.titre,
                                isPdf: true,
                              },
                            ];

                      return files.map((file, index) => (
                        <button
                          key={`${doc.id}-${index}`}
                          type="button"
                          onClick={() =>
                            handleDownload(file.url, doc.titre)
                          }
                          className="group flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3.5 text-left transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2.5">
                            <svg
                              className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-emerald-700"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M7 21h10a2 2 0 002-2V7.5L14.5 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>

                            <span className="truncate text-xs font-bold tracking-tight text-slate-800 transition-colors group-hover:text-emerald-950">
                              {doc.titre}{" "}
                              {files.length > 1
                                ? `(Partie ${index + 1})`
                                : ""}
                            </span>
                          </div>

                          <span className="shrink-0 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-900 transition-colors group-hover:bg-emerald-200">
                            Télécharger
                          </span>
                        </button>
                      ));
                    })}
                  </div>
                ) : (
                  <div className="flex min-h-32 items-center justify-center rounded-xl border-2 border-dashed border-slate-200/80 px-5 text-center">
                    <p className="text-xs font-bold leading-relaxed text-slate-400">
                      Aucun cours disponible pour le moment.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* COLONNE ÉPREUVES */}
            <div className="flex flex-col rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5 shadow-[0_15px_35px_-28px_rgba(16,185,129,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-[0_20px_40px_-28px_rgba(16,185,129,0.22)] sm:p-6">
              <div>
                {/* En-tête */}
                <div className="mb-6 flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-base font-black tracking-tight text-slate-950 sm:text-lg">
                      Sujets &amp; Épreuves Corrigées
                    </h4>

                    <span className="mt-1 inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500 shadow-sm sm:text-xs">
                      {epreuveDocs.length} sujet(s) disponible(s)
                    </span>
                  </div>
                </div>

                {/* Contenu */}
                {loading ? (
                  <div className="flex min-h-32 items-center justify-center text-xs font-bold text-slate-400">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                    Chargement des épreuves...
                  </div>
                ) : epreuveDocs.length > 0 ? (
                  <div className="space-y-3">
                    {epreuveDocs.map((doc) => {
                      const files =
                        doc.fichiers && doc.fichiers.length > 0
                          ? doc.fichiers
                          : [
                              {
                                url: doc.urlPdf || "#",
                                name: doc.titre,
                                isPdf: true,
                              },
                            ];

                      return files.map((file, index) => (
                        <button
                          key={`${doc.id}-${index}`}
                          type="button"
                          onClick={() =>
                            handleDownload(file.url, doc.titre)
                          }
                          className="group flex w-full items-center justify-between gap-3 rounded-xl bg-emerald-800 px-4 py-3.5 text-left text-white shadow-sm transition-all duration-200 hover:bg-emerald-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2.5">
                            <svg
                              className="h-4 w-4 shrink-0 text-emerald-200 transition-colors group-hover:text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>

                            <span className="truncate text-xs font-bold tracking-tight text-emerald-50">
                              {doc.titre}{" "}
                              {files.length > 1
                                ? `(#${index + 1})`
                                : ""}
                            </span>
                          </div>

                          <span className="shrink-0 rounded-lg border border-emerald-600/30 bg-emerald-950/40 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-100 transition-colors group-hover:bg-emerald-950/60">
                            Télécharger
                          </span>
                        </button>
                      ));
                    })}
                  </div>
                ) : (
                  <div className="flex min-h-32 items-center justify-center rounded-xl border-2 border-dashed border-emerald-200/80 bg-white/40 px-5 text-center">
                    <p className="text-xs font-bold leading-relaxed text-slate-400">
                      Aucune épreuve disponible pour le moment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}