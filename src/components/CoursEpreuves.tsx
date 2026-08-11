"use client";

import React, { useEffect, useState } from "react";
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
  const [selectedNiveau, setSelectedNiveau] = useState<string>("3eme");
  const [ressourcesMap, setRessourcesMap] = useState<Record<string, RessourceDoc[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRessources = async () => {
      try {
        const q = query(collection(db, "ressources"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const map: Record<string, RessourceDoc[]> = {};

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();

          const fichiersList: FichierItem[] = data.fichiers || (data.urlPdf ? [{
            url: data.urlPdf,
            name: data.titre || "Document",
            isPdf: data.urlPdf.toLowerCase().includes(".pdf")
          }] : []);

          const resssourceFormatted: RessourceDoc = {
            id: docSnap.id,
            titre: data.titre,
            niveau: data.niveau,
            type: data.type,
            fichiers: fichiersList,
            urlPdf: data.urlPdf,
          };

          if (resssourceFormatted.niveau) {
            if (!map[resssourceFormatted.niveau]) map[resssourceFormatted.niveau] = [];
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
      if (!response.ok) throw new Error("Erreur de réponse réseau");

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("text/html") || contentType.includes("application/json")) {
        throw new Error("Réponse non binaire détectée");
      }

      const blob = await response.blob();

      // Vérification de la signature du fichier (%PDF)
      const buffer = await blob.slice(0, 4).arrayBuffer();
      const header = new TextDecoder().decode(buffer);

      if (header !== "%PDF") {
        throw new Error("Le fichier reçu n'est pas un document PDF valide");
      }

      // Si le fichier est valide, on le télécharge
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName.toLowerCase().endsWith(".pdf") ? fileName : `${fileName}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Si la récupération directe échoue ou si le fichier n'est pas valide en Blob,
      // on ouvre directement l'URL dans un nouvel onglet pour que le navigateur le lise proprement.
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  const currentConfig = NIVEAUX_CONFIG.find((n) => n.id === selectedNiveau) || NIVEAUX_CONFIG[0];
  const currentDocs = ressourcesMap[selectedNiveau] || [];
  const coursDocs = currentDocs.filter((d) => d.type === "cours");
  const epreuveDocs = currentDocs.filter((d) => d.type !== "cours");

  return (
    <section id="cours-epreuves" className="py-16 sm:py-24 bg-white text-slate-950 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Titre Général & Trait Vert */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Cours &amp; Épreuves
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm font-semibold tracking-tight mt-2">
            Sélectionnez votre classe pour accéder aux ressources
          </p>
          {/* Trait vert sous le titre */}
          <div className="w-12 h-1 bg-emerald-600 rounded-full mt-4"></div>
        </div>

        {/* Onglets de sélection du niveau (Mobile-Friendly Sans Scrollbar) */}
        <div className="flex justify-start sm:justify-center items-center gap-2 mb-8 sm:mb-10 overflow-x-auto [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory py-1 px-1 -mx-4 sm:mx-0 px-4">
          {NIVEAUX_CONFIG.map((item) => {
            const isActive = selectedNiveau === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedNiveau(item.id)}
                className={`snap-center shrink-0 px-5 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-black tracking-tight transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-950/20 scale-[1.02]"
                    : "bg-slate-100/90 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                }`}
              >
                <span className="sm:hidden">{item.shortLabel}</span>
                <span className="hidden sm:inline">{item.niveau}</span>
              </button>
            );
          })}
        </div>

        {/* Conteneur principal */}
        <div className="bg-slate-50/80 border border-slate-200/90 rounded-3xl p-5 sm:p-8 md:p-10 shadow-sm">

          {/* En-tête Niveau & Chapitres */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-200/80">
            <div>
              <span className="text-[11px] sm:text-xs font-black tracking-wide px-3.5 py-1.5 bg-emerald-100 text-emerald-900 rounded-full inline-block">
                {currentConfig.badge}
              </span>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 mt-2.5">
                {currentConfig.niveau}
              </h3>
            </div>

            <div className="bg-white/60 sm:bg-transparent p-4 sm:p-0 rounded-2xl border border-slate-200/60 sm:border-none">
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                PROGRAMME :
              </p>
              <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-slate-800 tracking-tight">
                {currentConfig.chapitres.map((c, i) => (
                  <span key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                    <span>{c}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Grille Cours vs Épreuves */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* COLONNE COURS */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
                      Cours &amp; Fiches Récapitulatives
                    </h4>
                    <p className="text-xs font-semibold text-slate-500">
                      {coursDocs.length} ressource(s) disponible(s)
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="py-8 text-center text-xs font-bold text-slate-400">Chargement des cours...</div>
                ) : coursDocs.length > 0 ? (
                  <div className="space-y-3">
                    {coursDocs.map((doc) => {
                      const files = doc.fichiers && doc.fichiers.length > 0
                        ? doc.fichiers
                        : [{ url: doc.urlPdf || "#", name: doc.titre, isPdf: true }];

                      return files.map((file, idx) => (
                        <button
                          key={`${doc.id}-${idx}`}
                          onClick={() => handleDownload(file.url, doc.titre)}
                          className="group w-full flex items-center justify-between gap-3 bg-slate-50 hover:bg-emerald-50/80 active:scale-[0.99] border border-slate-200/80 text-slate-950 text-xs font-black tracking-tight py-3.5 px-4 rounded-xl transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <svg className="w-4 h-4 text-slate-400 group-hover:text-emerald-800 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V7.5L14.5 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="truncate text-left text-slate-800 font-bold group-hover:text-emerald-950">
                              {doc.titre} {files.length > 1 ? `(Partie ${idx + 1})` : ""}
                            </span>
                          </div>
                          <span className="text-[10px] uppercase font-black tracking-wider bg-emerald-100 text-emerald-900 px-2.5 py-1.5 rounded-lg shrink-0">
                            TÉLÉCHARGER
                          </span>
                        </button>
                      ));
                    })}
                  </div>
                ) : (
                  <div className="py-8 border-2 border-dashed border-slate-200/80 rounded-xl text-center">
                    <p className="text-xs font-bold text-slate-400">Aucun cours disponible pour le moment.</p>
                  </div>
                )}
              </div>
            </div>

            {/* COLONNE ÉPREUVES */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
                      Sujets &amp; Épreuves Corrigées
                    </h4>
                    <p className="text-xs font-semibold text-slate-500">
                      {epreuveDocs.length} sujet(s) disponible(s)
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="py-8 text-center text-xs font-bold text-slate-400">Chargement des épreuves...</div>
                ) : epreuveDocs.length > 0 ? (
                  <div className="space-y-3">
                    {epreuveDocs.map((doc) => {
                      const files = doc.fichiers && doc.fichiers.length > 0
                        ? doc.fichiers
                        : [{ url: doc.urlPdf || "#", name: doc.titre, isPdf: true }];

                      return files.map((file, idx) => (
                        <button
                          key={`${doc.id}-${idx}`}
                          onClick={() => handleDownload(file.url, doc.titre)}
                          className="group w-full flex items-center justify-between gap-3 bg-[#046a4e] hover:bg-[#03523d] active:scale-[0.99] text-white text-xs font-black tracking-tight py-3.5 px-4 rounded-xl transition-all shadow-sm cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <svg className="w-4 h-4 text-emerald-200 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="truncate text-left text-emerald-50 font-bold">
                              {doc.titre} {files.length > 1 ? `(#${idx + 1})` : ""}
                            </span>
                          </div>
                          <span className="text-[10px] uppercase font-black tracking-wider bg-emerald-950/40 border border-emerald-600/30 text-emerald-100 px-2.5 py-1.5 rounded-lg shrink-0">
                            TÉLÉCHARGER
                          </span>
                        </button>
                      ));
                    })}
                  </div>
                ) : (
                  <div className="py-8 border-2 border-dashed border-slate-200/80 rounded-xl text-center">
                    <p className="text-xs font-bold text-slate-400">Aucune épreuve disponible pour le moment.</p>
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