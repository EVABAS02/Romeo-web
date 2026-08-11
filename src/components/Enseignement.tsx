"use client";

import React, { useEffect, useRef, useState } from 'react';

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
      id="enseignement"
      className="py-28 bg-slate-50 relative overflow-hidden"
    >
      <div
        className={`transition-all duration-700 ease-out transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          
          {/* En-tête de section avec le trait vert */}
          <div className="text-center max-w-2xl mx-auto mb-20 flex flex-col items-center">
            <h2 className="text-3xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Expérience d&apos;enseignement
            </h2>
            {/* Trait vert sous le titre */}
            <div className="w-12 h-1 bg-emerald-600 rounded-full mt-4"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-slate-900 shadow-xs flex flex-col justify-between hover:border-emerald-600 transition-all duration-300">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                  <span className="text-xs font-bold text-white bg-emerald-600 px-4 py-1.5 rounded-full shadow-xs">
                    Établissement Principal
                  </span>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-md">
                    3ème en Terminale
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Collège Martin Luther King &amp; CEG ZOGBO 
                </h3>
                <p className="text-emerald-700 font-semibold text-base mt-1">
                  Mènontin &amp; ZOGBO
                </p>
                
               
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-4">
                  Dispensation des cours de mathématiques, suivi approfondi des classes d&apos;examen et préparation rigoureuse aux épreuves nationales.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs font-semibold text-slate-500 gap-2">
                <span>Niveaux clés : Secondaire &amp; Classes d&apos;examen</span>
                <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Activité principale</span>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
              
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-900 shadow-xs flex flex-col justify-between hover:border-emerald-600 transition-all duration-300 flex-1">
                <div>
                  <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full mb-3 border border-emerald-100">
                    Secondaire
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Collège La Perspicacité
                  </h3>
                  <p className="text-emerald-700 font-semibold text-sm mt-0.5">
                    Porto-Novo
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-900 shadow-xs flex flex-col justify-between hover:border-emerald-600 transition-all duration-300 flex-1">
                <div>
                  <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full mb-3 border border-emerald-100">
                    Secondaire
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Collège Notre Dame des Apôtres de Dowa
                  </h3>
                  <p className="text-emerald-700 font-semibold text-sm mt-0.5">
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