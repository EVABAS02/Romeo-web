"use client";

import React, { useEffect, useRef, useState } from "react";

export default function Enseignement() {
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
      id="enseignement"
      className="relative overflow-hidden bg-slate-50 py-20 sm:py-24 lg:py-28"
    >
      <div
        className={`transition-all duration-700 ease-out ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-12 opacity-0"
        }`}
      >
        <div className="relative z-10 mx-auto max-w-6xl px-6">

          {/* En-tête de section */}
          <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center text-center sm:mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Expérience d&apos;enseignement
            </h2>

            <div className="mt-4 h-1 w-14 rounded-full bg-emerald-600" />
          </div>

          {/* Grille principale */}
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12 lg:gap-8">

            {/* Grande carte : établissements principaux */}
            <div className="flex flex-col justify-between rounded-[2rem] border border-slate-200/80 bg-white p-7 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_22px_50px_-34px_rgba(16,185,129,0.30)] sm:p-9 lg:col-span-7">

              <div>
                {/* Badges */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm">
                    Établissements Principaux
                  </span>

                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700">
                    3ème en Terminale
                  </span>
                </div>

                {/* Titre */}
                <h3 className="max-w-xl text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl">
                  Collège Martin Luther King{" "}
                  <br className="hidden sm:inline" />
                  &amp; CEG Zogbo
                </h3>

                {/* Localisation */}
                <p className="mt-2 text-base font-semibold text-emerald-700">
                  Mènontin &amp; Zogbo
                </p>

                {/* Description */}
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                  Dispensation des cours de mathématiques, suivi approfondi
                  des classes d&apos;examen et préparation rigoureuse aux
                  épreuves nationales.
                </p>
              </div>

              {/* Pied de carte */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <span className="text-xs font-semibold text-slate-500">
                  Niveaux clés : Secondaire &amp; Classes d&apos;examen
                </span>

                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  Activité principale
                </span>
              </div>
            </div>

            {/* Colonne droite : établissements complémentaires */}
            <div className="flex flex-col gap-6 lg:col-span-5">

              {/* CSP La Perspicacité */}
              <div className="flex flex-1 flex-col justify-between rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.40)] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_22px_45px_-32px_rgba(16,185,129,0.28)] sm:p-7">

                <div>
                  <span className="mb-3 inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700">
                    Secondaire
                  </span>

                  <h3 className="text-xl font-black leading-tight tracking-tight text-slate-900">
                    CSP La Perspicacité
                  </h3>

                  <p className="mt-1 text-sm font-semibold text-emerald-700">
                    Porto-Novo
                  </p>
                </div>

                
              </div>

              {/* Collège Notre Dame des Apôtres de Dowa */}
              <div className="flex flex-1 flex-col justify-between rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.40)] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_22px_45px_-32px_rgba(16,185,129,0.28)] sm:p-7">

                <div>
                  <span className="mb-3 inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700">
                    Secondaire
                  </span>

                  <h3 className="max-w-md text-xl font-black leading-tight tracking-tight text-slate-900">
                    Collège Notre Dame des Apôtres de Dowa
                  </h3>

                  <p className="mt-1 text-sm font-semibold text-emerald-700">
                    Porto-Novo
                  </p>
                </div>

               
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}