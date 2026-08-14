"use client";

import React, { useEffect, useRef, useState } from "react";

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

  return (
    <section
      ref={sectionRef}
      id="parcours"
      className="relative overflow-hidden bg-white py-20 text-slate-950 sm:py-24 lg:py-28"
    >
      <div
        className={`mx-auto max-w-5xl px-6 transition-all duration-700 ease-out ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-12 opacity-0"
        }`}
      >
        {/* Titre */}
        <div className="mx-auto mb-16 flex max-w-xl flex-col items-center text-center sm:mb-20">
          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Parcours Académique
          </h2>

          <div className="mt-4 h-1 w-14 rounded-full bg-emerald-600" />
        </div>

        {/* Timeline */}
        <div className="relative ml-2 border-l-2 border-slate-200 pl-7 sm:ml-6 sm:pl-10">

          {/* ÉTAPE 1 : BAPES */}
          <div className="relative pb-14 sm:pb-16">
            {/* Point timeline */}
            <div className="absolute -left-[42px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-4 border-white bg-emerald-700 shadow-[0_0_0_4px_rgba(16,185,129,0.10)] sm:-left-[52px]">
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>

            {/* Date */}
            <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-slate-900">
              2019 – 2022
            </div>

            {/* Carte */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 shadow-[0_15px_35px_-28px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_20px_40px_-28px_rgba(16,185,129,0.35)] sm:p-8">
              <h3 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                BAPES{" "}
                <span className="text-sm font-bold text-slate-500 sm:text-base">
                  (Brevet d&apos;Aptitude au Professorat)
                </span>
              </h3>

              <p className="mt-1 text-xs font-black uppercase tracking-wider text-emerald-700">
                EFFES-SAPIENTIA, Porto-Novo
              </p>

              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                Admis à l&apos;examen national 2022. Acquisition rigoureuse des
                fondamentaux de la pédagogie et de la didactique des sciences.
              </p>
            </div>
          </div>

          {/* ÉTAPE 2 : CAPES */}
          <div className="relative pb-14 sm:pb-16">
            {/* Point timeline */}
            <div className="absolute -left-[42px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-4 border-white bg-emerald-700 shadow-[0_0_0_4px_rgba(16,185,129,0.10)] sm:-left-[52px]">
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>

            {/* Date */}
            <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-slate-900">
              2023 – 2025
            </div>

            {/* Carte */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 shadow-[0_15px_35px_-28px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_20px_40px_-28px_rgba(16,185,129,0.35)] sm:p-8">
              <span className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-800">
                Spécialité : Mathématiques-Informatique
              </span>

              <h3 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                CAPES{" "}
                <span className="text-sm font-bold text-slate-500 sm:text-base">
                  (Certificat d&apos;Aptitude au Professorat)
                </span>
              </h3>

              <p className="mt-1 text-xs font-black uppercase tracking-wider text-emerald-700">
                EFFES-SAPIENTIA, Porto-Novo
              </p>

              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                Admis à l&apos;examen national 2025. Maîtrise avancée des
                sciences formelles, de l&apos;ingénierie pédagogique et de la
                logique mathématique.
              </p>
            </div>
          </div>

          {/* ÉTAPE 3 : MÉMOIRE */}
          <div className="relative">
            {/* Point timeline */}
            <div className="absolute -left-[42px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-4 border-white bg-emerald-700 shadow-[0_0_0_4px_rgba(16,185,129,0.10)] sm:-left-[52px]">
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>

            {/* Date */}
            <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-slate-900">
              2022 &amp; 2025
            </div>

            {/* Carte */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 shadow-[0_15px_35px_-28px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_20px_40px_-28px_rgba(16,185,129,0.35)] sm:p-8">
              <span className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-800">
                Recherche &amp; Terrain
              </span>

              <h3 className="mb-5 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                Mémoires de Fin d&apos;Études
              </h3>

              {/* Mémoires */}
              <div className="space-y-5 border-l-2 border-emerald-600/30 pl-5">

                {/* Mémoire 1 */}
                <div>
                  <p className="text-sm font-bold leading-relaxed text-slate-900 sm:text-base">
                    « Remédiation aux difficultés des apprenants sur la
                    propriété de THALÈS et sa réciproque en classe de 3ème »
                  </p>

                  <p className="mt-1.5 text-xs font-semibold text-slate-500">
                    Direction : CP{" "}
                    <strong className="text-slate-800">
                      HOUETO Victor
                    </strong>
                  </p>
                </div>

                {/* Mémoire 2 */}
                <div>
                  <p className="text-sm font-bold leading-relaxed text-slate-900 sm:text-base">
                    « Optimisation de l&apos;Enseignement des Coniques en
                    classe de Tle C »
                  </p>

                  <p className="mt-1.5 text-xs font-semibold text-slate-500">
                    Direction : Dr{" "}
                    <strong className="text-slate-800">
                      Bernardin AHOUNOU
                    </strong>
                  </p>
                </div>
              </div>

              {/* Établissements */}
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-800 shadow-sm">
                  CEG Zogbo
                </span>

                <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-800 shadow-sm">
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