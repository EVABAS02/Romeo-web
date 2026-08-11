import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section id="accueil" className="pt-8 pb-16 md:pt-16 md:pb-24 relative overflow-hidden">
      
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }
        @keyframes floatFast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(-5deg); }
        }
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float-1 { animation: floatSlow 6s ease-in-out infinite; }
        .animate-float-2 { animation: floatFast 4s ease-in-out infinite; }
        .animate-entrance {
          animation: fadeInSlide 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Colonne Gauche */}
          <div className="lg:col-span-7 space-y-6 animate-entrance">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black tracking-tight leading-tight">
              Professeur certifié de Mathématiques
            </h2>

            <p className="text-base sm:text-lg text-slate-500 max-w-xl leading-relaxed">
              J&apos;accompagne les élèves vers l&apos;excellence grâce à une pédagogie rigoureuse, vivante et accessible.<br />
              Faire des mathématiques une force, pas un obstacle.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8 py-3.5 rounded-full transition-all duration-200 shadow-sm hover:shadow"
                href="#parcours"
              >
                Découvrir mon parcours
              </Link>
              <Link
                className="bg-black hover:bg-slate-800 text-white font-medium px-8 py-3.5 rounded-full border-2 border-black transition-all duration-200 shadow-sm"
                href="#contact"
              >
                Me contacter
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <span className="bg-emerald-50 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full border border-emerald-100/60 shadow-xs">
                BAPES 2022
              </span>
              <span className="bg-emerald-50 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full border border-emerald-100/60 shadow-xs">
                CAPES 2025
              </span>
              <span className="bg-emerald-50 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full border border-emerald-100/60 shadow-xs">
                5+ années d&apos;enseignement
              </span>
            </div>
          </div>

          {/* Colonne Droite : Photo & Formules mathématiques */}
          <div
            className="lg:col-span-5 flex justify-center lg:justify-end animate-entrance"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="relative w-full max-w-md">

              {/*
                FORMULES MATHÉMATIQUES — Programme 3ème → Terminale C (Bénin)
                Toutes exactes et au programme officiel
              */}

              {/* Théorème de Pythagore — 3ème */}
              <div className="absolute -top-6 -left-6 bg-emerald-600/10 text-emerald-700 font-mono text-sm font-bold px-3 py-1.5 rounded-xl backdrop-blur-xs border border-emerald-200/50 animate-float-1 z-20 shadow-sm">
                a² + b² = c²
              </div>

              {/* Somme d'une suite arithmétique — Terminale */}
              <div className="absolute -bottom-4 -right-4 bg-emerald-700 text-white font-mono text-xs font-bold px-3 py-1.5 rounded-xl shadow-md animate-float-2 z-20">
                Sn = n(a₁ + aₙ) / 2
              </div>

              {/* Identité d'Euler — Terminale C */}
              <div
                className="absolute top-1/2 -right-8 bg-white text-emerald-800 font-mono text-sm font-bold px-3 py-1 rounded-lg shadow-md border border-emerald-100 animate-float-1 z-20"
                style={{ animationDelay: '1s' }}
              >
                eⁱᵖ + 1 = 0
              </div>

              {/* Dérivée — Terminale C */}
              <div
                className="absolute bottom-10 -left-8 bg-emerald-50 text-emerald-700 font-mono text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-200/60 shadow-sm animate-float-2 z-20"
                style={{ animationDelay: '1.5s' }}
              >
                f&apos;(x) = lim (f(x+h)−f(x)) / h
              </div>

              {/* Carte principale de la photo */}
              <div className="relative bg-emerald-50/60 p-6 sm:p-8 rounded-3xl border border-emerald-100/50 w-full z-10 shadow-sm">
                <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden shadow-sm">
                  <Image
                    alt="Professeur de Mathématiques"
                    className="object-cover object-top"
                    fill
                    priority
                    src="/images/romeo.webp"
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