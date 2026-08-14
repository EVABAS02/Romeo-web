"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Accueil", href: "#accueil" },
  { name: "À propos", href: "#a-propos" },
  { name: "Parcours", href: "#parcours" },
  { name: "Enseignement", href: "#enseignement" },
  { name: "Compétences", href: "#competences" },
  { name: "Cours & Épreuves", href: "#cours-epreuves" },
  { name: "Témoignages", href: "#temoignages" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("#accueil");

  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = navLinks.map((link) =>
        link.href.replace("#", "")
      );

      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);

      if (sections.length === 0) return;

      // Position de référence juste sous la Navbar
      const offset = 120;

      let currentSection = sections[0];

      for (const section of sections) {
        const rect = section.getBoundingClientRect();

        if (rect.top <= offset) {
          currentSection = section;
        } else {
          break;
        }
      }

      setActiveLink(`#${currentSection.id}`);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    // Déterminer immédiatement la section active
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 shadow-[0_4px_20px_-12px_rgba(15,23,42,0.18)] backdrop-blur-md">
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo / Nom */}
        <Link
          href="#accueil"
          className="z-10 shrink-0 text-xl font-extrabold tracking-tight text-slate-900 sm:text-[22px]"
          onClick={() => {
            setActiveLink("#accueil");
            setIsOpen(false);
          }}
        >
          Edouard <span className="text-emerald-600">Roméo</span>
        </Link>

        {/* Navigation Desktop */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 transform items-center space-x-2.5 lg:flex xl:space-x-5">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setActiveLink(link.href)}
              className={`group relative whitespace-nowrap py-2 text-xs font-medium transition-colors duration-200 xl:text-sm ${
                activeLink === link.href
                  ? "text-emerald-600"
                  : "text-slate-600 hover:text-emerald-600"
              }`}
            >
              {link.name}

              <span
                className={`absolute bottom-0 left-0 h-[2px] rounded-full bg-emerald-600 transition-all duration-300 ${
                  activeLink === link.href
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
          ))}
        </nav>

        {/* Bouton Hamburger Mobile & Tablette */}
        <div className="z-10 flex justify-end lg:hidden">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            aria-label={
              isOpen
                ? "Fermer le menu de navigation"
                : "Ouvrir le menu de navigation"
            }
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Menu déroulant Mobile & Tablette */}
      {isOpen && (
        <div
          id="mobile-navigation"
          className="border-b border-slate-100 bg-white/95 px-6 pb-6 pt-3 shadow-[0_10px_25px_-20px_rgba(15,23,42,0.3)] backdrop-blur-md lg:hidden"
        >
          <nav className="space-y-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => {
                  setIsOpen(false);
                  setActiveLink(link.href);
                }}
                className={`block rounded-xl px-3 py-2.5 font-medium transition-colors duration-200 ${
                  activeLink === link.href
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}