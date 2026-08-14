"use client";

import React, { useEffect, useRef, useState } from "react";

export default function Competences() {
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

  // 1. Diplômes officiels
  const diplomes = [
    {
      titre: "CAPES",
      intitule: "Certificat d'Aptitude au Professorat",
      specialite: "Mathématiques-Informatique",
      annee: "2025",
    },
    {
      titre: "BAPES",
      intitule: "Brevet d'Aptitude au Professorat",
      specialite: "Enseignement Secondaire",
      annee: "2022",
    },
  ];

  // 2. Compétences académiques
  const competencesAcademiques = [
    "Analyse mathématique",
    "Algèbre",
    "Géométrie analytique",
    "Probabilités & Statistiques",
    "Calcul différentiel & intégral",
    "Arithmétique",
    "Algorithmique",
    "Mathématiques-Informatique",
    "Didactique des mathématiques",
    "Pédagogie",
  ];

  // 3. Formations complémentaires
  const formationsComplementaires = [
    {
      titre: "Maintenance Informatique & GSM",
      lieu: "AGEMA-Bénin",
    },
    {
      titre: "Cordonnerie",
      lieu: "Autodidacte",
    },
    {
      titre: "Fabrication de savon",
      detail: "solide, liquide, poudre",
      lieu: "Autodidacte",
    },
    {
      titre: "Production BIOCHAR",
      lieu: "Autodidacte",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="competences"
      className="relative overflow-hidden bg-slate-50 py-20 sm:py-24 lg:py-28"
    >
      <div
        className={`transition-all duration-700 ease-out ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-12 opacity-0"
        }`}
      >
        <div className="relative z-10 mx-auto max-w-7xl px-6">

          {/* En-tête */}
          <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center text-center sm:mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Compétences &amp; Formations
            </h2>

            <div className="mt-4 h-1 w-14 rounded-full bg-emerald-600" />
          </div>

          {/* Grille principale */}
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3 lg:gap-7">

            {/* CARTE 1 : Diplômes */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_22px_45px_-32px_rgba(16,185,129,0.25)] sm:p-8">

              <div>
                <div className="mb-6 flex items-center justify-between gap-4">
                  <h3 className="text-xl font-black tracking-tight text-slate-900">
                    Diplômes
                  </h3>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                    Officiels
                  </span>
                </div>

                <div className="space-y-4">
                  {diplomes.map((diplome, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-emerald-100/80 bg-emerald-50/60 p-4 transition-colors duration-200 hover:bg-emerald-50"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-lg font-extrabold text-emerald-900">
                          {diplome.titre}
                        </span>

                        <span className="shrink-0 rounded-md border border-emerald-200/60 bg-white px-2.5 py-1 text-xs font-bold text-emerald-700">
                          {diplome.annee}
                        </span>
                      </div>

                      <p className="text-xs font-semibold leading-relaxed text-slate-800">
                        {diplome.intitule}
                      </p>

                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        {diplome.specialite}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
                Titres officiels délivrés par l&apos;État
              </div>
            </div>

            {/* CARTE 2 : Compétences Académiques */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-emerald-900 p-7 text-white shadow-[0_20px_45px_-30px_rgba(6,78,59,0.55)] sm:p-8">

              <div className="relative z-10">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <h3 className="text-xl font-black tracking-tight text-white">
                    Compétences Académiques
                  </h3>

                  <span className="rounded-full border border-emerald-700/60 bg-emerald-800/80 px-3 py-1 text-[11px] font-bold text-emerald-300">
                    Savoirs
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {competencesAcademiques.map((item, index) => (
                    <span
                      key={index}
                      className="rounded-lg border border-emerald-700/60 bg-emerald-800/70 px-3 py-1.5 text-xs font-medium text-emerald-100 transition-colors duration-200 hover:bg-emerald-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative z-10 mt-8 border-t border-emerald-800/80 pt-4 text-xs font-medium text-emerald-300">
                Mathématiques, Pédagogie &amp; Sciences
              </div>
            </div>

            {/* CARTE 3 : Formations Complémentaires */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_22px_45px_-32px_rgba(16,185,129,0.25)] sm:p-8">

              <div>
                <div className="mb-6 flex items-center justify-between gap-4">
                  <h3 className="text-xl font-black tracking-tight text-slate-900">
                    Formations Complémentaires
                  </h3>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700">
                    Pratique
                  </span>
                </div>

                <div className="space-y-5">
                  {formationsComplementaires.map((form, index) => (
                    <div key={index} className="group flex items-start gap-3">
                      <div className="mt-1.5 flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-full bg-emerald-500 transition-transform duration-200 group-hover:scale-125" />

                      <div>
                        <h4 className="text-sm font-bold leading-tight text-slate-900 transition-colors duration-200 group-hover:text-emerald-700">
                          {form.titre}

                          {form.detail && (
                            <span className="mt-0.5 block text-xs font-normal text-slate-500">
                              ({form.detail})
                            </span>
                          )}
                        </h4>

                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {form.lieu}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
                Savoir-faire techniques &amp; autonomie
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}