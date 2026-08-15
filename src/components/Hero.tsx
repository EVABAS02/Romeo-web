import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="accueil"
      className="relative overflow-hidden scroll-mt-20 pb-16 pt-8 md:pb-24 md:pt-16"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Colonne gauche */}
          <div className="space-y-6 animate-entrance lg:col-span-7">
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-black sm:text-3xl lg:text-4xl">
              Professeur certifié de Mathématiques
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              J&apos;accompagne les élèves vers l&apos;excellence grâce à une
              pédagogie rigoureuse, vivante et accessible.
              <br />
              Faire des mathématiques une force, pas un obstacle.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="#parcours"
                className="rounded-full bg-emerald-700 px-8 py-3.5 font-medium text-white shadow-sm transition-all duration-200 hover:bg-emerald-800 hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                Découvrir mon parcours
              </Link>

              <Link
                href="#contact"
                className="rounded-full border-2 border-black bg-black px-8 py-3.5 font-medium text-white shadow-sm transition-all duration-200 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                Me contacter
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <span className="rounded-full border border-emerald-200/60 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-xs">
                BAPES 2022
              </span>

              <span className="rounded-full border border-emerald-200/60 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-xs">
                CAPES 2025
              </span>

              <span className="rounded-full border border-emerald-200/60 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-xs">
                5+ années d&apos;enseignement
              </span>
            </div>
          </div>

          {/* Colonne droite : Photo & Formules mathématiques discrètes */}
          <div
            className="flex justify-center animate-entrance lg:col-span-5 lg:justify-end"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative w-full max-w-md">
              {/* Formule de Moivre */}
              <div
                aria-hidden="true"
                className="absolute -top-3 left-2 z-20 rounded-lg border border-emerald-200/60 bg-emerald-50/90 px-2.5 py-1 font-mono text-[10px] sm:text-xs font-semibold text-emerald-900 shadow-xs backdrop-blur-xs"
              >
                (cos x + i sin x)ⁿ = cos(nx) + i sin(nx)
              </div>

              {/* Intégration par parties */}
              <div
                aria-hidden="true"
                className="absolute -bottom-3 right-2 z-20 rounded-lg bg-emerald-800 px-2.5 py-1 font-mono text-[10px] sm:text-xs font-semibold text-white shadow-sm"
              >
                ∫ u dv = uv − ∫ v du
              </div>

              {/* Théorème de Bayes */}
              <div
                aria-hidden="true"
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 rounded-lg border border-emerald-100 bg-white/95 px-2.5 py-1 font-mono text-[10px] sm:text-xs font-semibold text-emerald-900 shadow-sm backdrop-blur-xs"
              >
                P(A|B) = P(B|A) · P(A) / P(B)
              </div>

              {/* Théorème Fondamental de l'Analyse */}
              <div
                aria-hidden="true"
                className="absolute -left-3 bottom-6 z-20 rounded-lg border border-emerald-200/60 bg-emerald-50/95 px-2.5 py-1 font-mono text-[10px] sm:text-xs font-semibold text-emerald-900 shadow-xs backdrop-blur-xs"
              >
                ∫ₐᵇ f(x) dx = F(b) − F(a)
              </div>

              {/* Carte principale de la photo */}
              <div className="relative z-10 w-full rounded-2xl border border-emerald-100 bg-white p-3 shadow-[0_20px_50px_-15px_rgba(16,185,129,0.25)] sm:p-4">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-emerald-50">
                  <Image
                    src="/images/romeo.webp"
                    alt="Professeur de mathématiques"
                    fill
                    priority
                    quality={90}
                    sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 500px"
                    className="object-cover object-top transition-transform duration-700 hover:scale-[1.02]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}