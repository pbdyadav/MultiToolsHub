import React from 'react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex items-center justify-center">
              <img
                src="/images/logo.png"
                alt="MultiToolWeb logo"
                className="h-full w-full object-contain p-1"
              />
            </div>
            <div className="leading-tight">
              <div className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                Practical tools
              </div>
              <span className="block text-xl sm:text-2xl font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                MultiToolWeb
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/" className="text-slate-700 hover:text-slate-950 transition-colors">
              Home
            </Link>
            <Link to="/tools" className="text-slate-700 hover:text-slate-950 transition-colors">
              All Tools
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
