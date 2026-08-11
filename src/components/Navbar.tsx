'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { name: 'Accueil', href: '#accueil' },
  { name: 'À propos', href: '#a-propos' },
  { name: 'Parcours', href: '#parcours' },
  { name: 'Enseignement', href: '#enseignement' },
  { name: 'Compétences', href: '#competences' },
  { name: 'Cours & Épreuves', href: '#cours-epreuves' },
  { name: 'Témoignages', href: '#temoignages' },
  { name: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('#accueil');

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
        
        {/* Logo / Nom */}
        <Link 
          href="#accueil" 
          className="text-xl font-bold tracking-tight text-slate-900 z-10 shrink-0"
          onClick={() => setActiveLink('#accueil')}
        >
          Edouard <span className="text-emerald-600">Roméo</span>
        </Link>

        {/* Navigation Desktop (Centrée de façon absolue) */}
        <nav className="hidden lg:flex items-center space-x-5 xl:space-x-7 absolute left-1/2 transform -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setActiveLink(link.href)}
              className={`relative text-xs xl:text-sm font-medium py-2 transition-colors duration-200 whitespace-nowrap group ${
                activeLink === link.href ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              {link.name}
              {/* Soulignement animé */}
              <span
                className={`absolute left-0 bottom-0 h-0.5 bg-emerald-600 transition-all duration-300 ${
                  activeLink === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </Link>
          ))}
        </nav>

        {/* Bouton Hamburger Mobile & Tablette */}
        <div className="lg:hidden flex justify-end z-10">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-700 hover:text-slate-900 focus:outline-none"
            aria-label="Afficher ou masquer le menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menu déroulant Mobile & Tablette */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-slate-100 px-6 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => {
                setIsOpen(false);
                setActiveLink(link.href);
              }}
              className={`block py-2 font-medium transition-colors ${
                activeLink === link.href ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}