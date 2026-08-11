"use client";

import React, { useEffect, useRef, useState } from 'react';

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
      { threshold: 0.1, rootMargin: '50px' }
    );
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  // 1. Diplômes officiels
  const diplomes = [
    {
      titre: "CAPES",
      intitule: "Certificat d'Aptitude au Professorat",
      specialite: "Mathématiques-Informatique",
      annee: "2025"
    },
    {
      titre: "BAPES",
      intitule: "Brevet d'Aptitude au Professorat",
      specialite: "Enseignement Secondaire",
      annee: "2022"
    }
  ];

  // 2. Compétences académiques (10 matières)
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
    "Pédagogie"
  ];

  // 3. Formations complémentaires
  const formationsComplementaires = [
    { titre: "Maintenance Informatique & GSM", lieu: "AGEMA-Bénin" },
    { titre: "Cordonnerie", lieu: "Autodidacte" },
    { titre: "Fabrication de savon", detail: "solide, liquide, poudre", lieu: "Autodidacte" },
    { titre: "Production BIOCHAR", lieu: "Autodidacte" }
  ];

  return (
    <section
      ref={sectionRef}
      id="competences"
      className="py-28 bg-slate-50 relative overflow-hidden"
    >
      <div
        className={`transition-all duration-700 ease-out transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* En-tête de section avec le trait vert */}
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center">
            <h2 className="text-3xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Compétences &amp; Formations
            </h2>
            {/* Trait vert sous le titre */}
            <div className="w-12 h-1 bg-emerald-600 rounded-full mt-4"></div>
          </div>

          {/* Grille 3 Colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* CARTE 1 : Diplômes */}
            <div className="bg-white p-8 rounded-3xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    Diplômes
                  </h3>
                </div>

                <div className="space-y-4">
                  {diplomes.map((diplome, index) => (
                    <div
                      key={index}
                      className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/80 relative"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-emerald-900 text-lg">
                          {diplome.titre}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-white px-2.5 py-0.5 rounded-md border border-emerald-200/60 shadow-2xs">
                          {diplome.annee}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800">
                        {diplome.intitule}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {diplome.specialite}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 text-xs font-medium text-slate-500">
                Titres officiels délivrés par l'État
              </div>
            </div>

            {/* CARTE 2 : Compétences Académiques */}
            <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">
                    Compétences Académiques
                  </h3>
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-800/80 px-3 py-1 rounded-full border border-emerald-700/60">
                    Savoirs
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {competencesAcademiques.map((item, index) => (
                    <span
                      key={index}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-800/70 border border-emerald-700/60 text-emerald-100 hover:bg-emerald-700 transition-colors cursor-default"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-emerald-800/80 text-xs font-medium text-emerald-300 relative z-10">
                Mathématiques, Pédagogie &amp; Sciences
              </div>
            </div>

            {/* CARTE 3 : Formations Complémentaires */}
            <div className="bg-white p-8 rounded-3xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    Formations Complémentaires
                  </h3>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                    Pratique
                  </span>
                </div>

                <div className="space-y-4">
                  {formationsComplementaires.map((form, index) => (
                    <div key={index} className="flex items-start space-x-3 group">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors leading-tight">
                          {form.titre}
                          {form.detail && (
                            <span className="font-normal text-slate-500 text-xs block mt-0.5">
                              ({form.detail})
                            </span>
                          )}
                        </h4>
                        <p className="text-slate-500 text-xs font-medium mt-1">
                          {form.lieu}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 text-xs font-medium text-slate-500">
                Savoir-faire techniques &amp; autonomie
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}