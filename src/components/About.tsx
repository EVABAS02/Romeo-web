"use client";

import React, { useEffect, useRef, useState } from 'react';

export default function About() {
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
      id="a-propos"
      className="py-24 bg-white overflow-hidden"
    >
      <div
        className={`transition-all duration-700 ease-out transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Citation d'accroche */}
          <div className="max-w-4xl mx-auto text-center mb-20 space-y-4">
            <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug italic">
              &ldquo;Les mathématiques ne sont pas une punition. <br className="hidden sm:inline" />
              Ce sont des outils pour comprendre le monde.&rdquo;
            </blockquote>
            <div className="w-20 h-1 bg-emerald-600 mx-auto rounded-full"></div>
          </div>

          {/* Grille principale */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Colonne Gauche */}
            <div className="lg:col-span-7 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <p className="text-lg sm:text-xl text-slate-700 leading-relaxed font-normal">
                Enseignant certifié de mathématiques, <strong className="text-black font-semibold">Édouard Roméo AZON</strong>  consacre sa carrière à rendre les mathématiques accessibles, concrètes et passionnantes pour tous les apprenants.
              </p>
              <p className="text-lg sm:text-xl text-slate-700 leading-relaxed font-normal">
                Vivant à <strong className="text-black font-semibold">Porto-Novo, au Bénin</strong>, il intervient en  classe de 3ème et dans les classes de Second cycles de l'Enseignement secondaire, en intégrant une pédagogie fondée sur la rigueur, l&apos;engagement et la créativité.
              </p>
            </div>

            {/* Colonne Droite */}
            <div className="lg:col-span-5 space-y-8 lg:pl-6">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Parcours & Titre académique
                </div>
                <h4 className="text-xl font-bold text-slate-900">
                  CAPES & BAPES Mathématiques
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Double certification officielle attestant d'une maîtrise approfondie des sciences formelles, de l'ingénierie pédagogique et de l'intégration des outils informatiques au service de la logique.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Champ d'intervention
                </div>
                <h4 className="text-xl font-bold text-slate-900">
                  Classes du Secondaire & Cycles Scientifiques
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Expertise avérée dans la préparation rigoureuse aux examens officiels et aux épreuves à forts coefficients pour les classes de la 3ème à la Terminale C.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Approche & Philosophie
                </div>
                <h4 className="text-xl font-bold text-slate-900">
                  Pédagogie Active & Ludique
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Méthodes d'apprentissage interactives axées sur la déconstruction de la complexité, stimulant l'esprit critique et l'autonomie intellectuelle de l'élève.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}