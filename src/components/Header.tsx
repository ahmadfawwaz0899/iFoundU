'use client';

import React from 'react';
import { Search, Menu, Sparkles, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenMenu: () => void;
  onLogoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenMenu,
  onLogoClick,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1 -ml-1 transition-transform active:scale-95"
          aria-label="IFoundU Home"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 text-white shadow-md shadow-indigo-500/25">
            <span className="font-black text-lg tracking-tighter">iF</span>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-400"></span>
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                IFound<span className="text-indigo-600">U</span>
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/80">
                <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                AI
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-600 -mt-0.5 tracking-wide">
              Smart Lost & Found
            </span>
          </div>
        </button>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-1.5">
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 active:bg-slate-200/80 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Search lost and found items"
            title="Search items"
          >
            <Search className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Hamburger Menu Button */}
          <button
            onClick={onOpenMenu}
            className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 active:bg-slate-200/80 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Open main menu"
            title="Main menu"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </header>
  );
};
