import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Identité & Accroche */}
        <div className="text-center md:text-left space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Édouard Roméo AZON
          </h2>
          <p className="text-slate-300 text-sm font-medium italic">
            Penseur rigoureux, créateur passionné et éternel apprenant.
          </p>
        </div>

        {/* Droits & Signature EVABAS */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-xs font-medium text-slate-300 text-center md:text-right">
          <div>
            © {currentYear} — Tous droits réservés
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <div className="tracking-wide">
            Réalisé par <span className="text-emerald-400 font-bold tracking-wider">EVABAS</span>
          </div>
        </div>

      </div>
    </footer>
  );
}