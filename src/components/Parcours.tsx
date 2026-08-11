"use client";

import React, { useEffect, useRef, useState } from 'react';

export default function Parcours() {
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

  return (
    <section
      ref={sectionRef}
      id="parcours"
      className="py-28 bg-white relative overflow-hidden text-slate-950 scroll-mt-20"
    >
      <div
        className={`max-w-4xl mx-auto px-6 relative z-10 transition-all duration-800 ease-out transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        {/* Titre & Trait Vert */}
        <div className="text-center max-w-xl mx-auto mb-20 flex flex-col items-center">
          <h2 className="text-3xl sm:text-3xl font-black text-slate-950 tracking-tighter">
            Parcours Académique
          </h2>
          {/* Trait vert sous le titre */}
          <div className="w-12 h-1 bg-emerald-600 rounded-full mt-4"></div>
        </div>

        {/* Timeline globale */}
        <div className="relative pl-6 sm:pl-10 border-l-2 border-slate-200 space-y-16 ml-4 sm:ml-8">

          {/* ÉTAPE 1 : BAPES */}
          <div className="relative group">
            {/* Badge style Pill + Ring */}
            <div className="inline-flex items-center bg-slate-100 rounded-full pl-2 pr-6 py-1.5 shadow-sm border border-slate-200/80 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#046a4e] border-2 border-white flex items-center justify-center -ml-4 shadow-md shrink-0">
                <div className="w-3 h-3 rounded-full border-2 border-emerald-300 bg-[#046a4e]" />
              </div>
              <span className="ml-3 text-xs font-black uppercase tracking-wider text-slate-800">
                2019 – 2022
              </span>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/90 rounded-3xl p-6 sm:p-8 hover:border-emerald-600/30 transition-all shadow-sm">
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                BAPES <span className="text-sm font-bold text-slate-500">(Brevet d'Aptitude au Professorat)</span>
              </h3>
              <p className="text-[#046a4e] font-black text-xs uppercase tracking-wider mt-1">
                EFFES-SAPIENTIA, Porto-Novo
              </p>
              <p className="text-slate-600 text-sm leading-relaxed font-bold tracking-tight mt-3">
                Admis à l'examen national 2022. Acquisition rigoureuse des fondamentaux de la pédagogie et de la didactique des sciences.
              </p>
            </div>
          </div>

          {/* ÉTAPE 2 : CAPES */}
          <div className="relative group">
            {/* Badge style Pill + Ring */}
            <div className="inline-flex items-center bg-slate-100 rounded-full pl-2 pr-6 py-1.5 shadow-sm border border-slate-200/80 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#046a4e] border-2 border-white flex items-center justify-center -ml-4 shadow-md shrink-0">
                <div className="w-3 h-3 rounded-full border-2 border-emerald-300 bg-[#046a4e]" />
              </div>
              <span className="ml-3 text-xs font-black uppercase tracking-wider text-slate-800">
                2023 – 2025
              </span>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/90 rounded-3xl p-6 sm:p-8 hover:border-emerald-600/30 transition-all shadow-sm">
              <span className="inline-block text-[11px] font-black uppercase tracking-wider text-[#046a4e] bg-emerald-100/80 px-3 py-1 rounded-full mb-2">
                Spécialité : Mathématiques-Informatique
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                CAPES <span className="text-sm font-bold text-slate-500">(Certificat d'Aptitude au Professorat)</span>
              </h3>
              <p className="text-[#046a4e] font-black text-xs uppercase tracking-wider mt-1">
                EFFES-SAPIENTIA, Porto-Novo
              </p>
              <p className="text-slate-600 text-sm leading-relaxed font-bold tracking-tight mt-3">
                Admis à l'examen national 2025. Maîtrise avancée des sciences formelles, de l'ingénierie pédagogique et de la logique mathématique.
              </p>
            </div>
          </div>

          {/* ÉTAPE 3 : MÉMOIRE */}
          <div className="relative group">
            {/* Badge style Pill + Ring */}
            <div className="inline-flex items-center bg-slate-100 rounded-full pl-2 pr-6 py-1.5 shadow-sm border border-slate-200/80 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#046a4e] border-2 border-white flex items-center justify-center -ml-4 shadow-md shrink-0">
                <div className="w-3 h-3 rounded-full border-2 border-emerald-300 bg-[#046a4e]" />
              </div>
              <span className="ml-3 text-xs font-black uppercase tracking-wider text-slate-800">
                2022 - 2025
              </span>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/90 rounded-3xl p-6 sm:p-8 hover:border-emerald-600/30 transition-all shadow-sm">
              <span className="inline-block text-[11px] font-black uppercase tracking-wider text-[#046a4e] bg-emerald-100/80 px-3 py-1 rounded-full mb-3">
                Recherche &amp; Terrain
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight mb-4">
                Mémoires de Fin d'Études
              </h3>

              <div className="space-y-4 border-l-2 border-emerald-600/30 pl-4 py-1">
                <div>
                  <p className="text-slate-800 font-bold text-sm italic">
                    « Remédiation aux difficultés des apprenants sur la propriété de THALÈS et sa réciproque en classe de 3ème »
                  </p>
                  <p className="text-xs font-black text-slate-500 mt-1">
                    Direction : CP <strong className="text-slate-900">HOUETO Victor</strong>
                  </p>
                </div>

                <div>
                  <p className="text-slate-800 font-bold text-sm italic">
                    « Optimisation de l'Enseignement des Coniques en classe de Tle C »
                  </p>
                  <p className="text-xs font-black text-slate-500 mt-1">
                    Direction : Dr <strong className="text-slate-900">Bernardin AHOUNOU</strong>
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-xs font-black">
                <span className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl shadow-xs">
                  CEG Zogbo
                </span>
                <span className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl shadow-xs">
                  Collège Martin Luther King (Mènontin)
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}