"use client";

import React, { useEffect, useRef, useState } from "react";

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
      id="a-propos"
      className="overflow-hidden bg-white py-20 sm:py-24"
    >
      <div
        className={`transform transition-all duration-700 ease-out ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-12 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6">

          {/* Citation d'accroche */}
          <div className="mx-auto mb-14 max-w-4xl text-center sm:mb-16">
            <blockquote className="text-2xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              &ldquo;Les mathématiques ne sont pas une punition.{" "}
              <br className="hidden sm:inline" />
              Ce sont des outils pour comprendre le monde.&rdquo;
            </blockquote>

            <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-emerald-600" />
          </div>

          {/* Grille principale */}
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">

            {/* Colonne gauche : présentation principale */}
            <div className="lg:col-span-7">
              <div className="space-y-6 rounded-[2rem] border border-slate-200/80 bg-white p-7 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] sm:p-10 lg:p-12">

                <p className="max-w-2xl text-lg font-normal leading-relaxed text-slate-700 sm:text-xl">
                  Enseignant certifié de mathématiques,{" "}
                  <strong className="font-semibold text-slate-950">
                    Édouard Roméo AZON
                  </strong>{" "}
                  consacre sa carrière à rendre les mathématiques accessibles,
                  concrètes et passionnantes pour tous les apprenants.
                </p>

                <p className="max-w-2xl text-lg font-normal leading-relaxed text-slate-700 sm:text-xl">
                  Vivant à{" "}
                  <strong className="font-semibold text-slate-950">
                    Porto-Novo, au Bénin
                  </strong>
                  , il intervient en classe de 3ème et dans les classes de
                  Second cycles de l&apos;Enseignement secondaire, en intégrant
                  une pédagogie fondée sur la rigueur, l&apos;engagement et la
                  créativité.
                </p>
              </div>
            </div>

            {/* Colonne droite : informations complémentaires */}
            <div className="space-y-8 lg:col-span-5 lg:pl-4">

              {/* Parcours & titre académique */}
              <div className="border-b border-slate-200 pb-8">
                <div className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-600">
                  Parcours &amp; Titre académique
                </div>

                <h4 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
                  CAPES &amp; BAPES Mathématiques
                </h4>

                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Double certification officielle attestant d&apos;une
                  maîtrise approfondie des sciences formelles, de
                  l&apos;ingénierie pédagogique et de l&apos;intégration des
                  outils informatiques au service de la logique.
                </p>
              </div>

              {/* Champ d'intervention */}
              <div className="border-b border-slate-200 pb-8">
                <div className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-600">
                  Champ d&apos;intervention
                </div>

                <h4 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
                  Classes du Secondaire &amp; Cycles Scientifiques
                </h4>

                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Expertise avérée dans la préparation rigoureuse aux examens
                  officiels et aux épreuves à forts coefficients pour les
                  classes de la 3ème à la Terminale C.
                </p>
              </div>

              {/* Approche & philosophie */}
              <div>
                <div className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-600">
                  Approche &amp; Philosophie
                </div>

                <h4 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
                  Pédagogie Active &amp; Ludique
                </h4>

                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Méthodes d&apos;apprentissage interactives axées sur la
                  déconstruction de la complexité, stimulant l&apos;esprit
                  critique et l&apos;autonomie intellectuelle de l&apos;élève.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}