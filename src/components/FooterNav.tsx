'use client';

import React from 'react';
import { Home, Camera, User, Scan } from 'lucide-react';
import { TabType } from '@/types';

interface FooterNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const FooterNav: React.FC<FooterNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe"
      role="navigation"
      aria-label="Bottom Navigation"
    >
      <div className="max-w-md mx-auto px-4 h-18 flex items-center justify-between relative">
        {/* Left: Home Tab */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[52px] py-1 px-2 rounded-2xl transition-all duration-200 active:scale-95 ${
            activeTab === 'home'
              ? 'text-indigo-600 font-semibold'
              : 'text-slate-600 hover:text-slate-800 font-medium'
          }`}
          aria-label="Home Dashboard"
          aria-current={activeTab === 'home' ? 'page' : undefined}
        >
          <div className="relative">
            <Home
              className={`w-6 h-6 transition-transform duration-200 ${
                activeTab === 'home' ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
              }`}
            />
            {activeTab === 'home' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            )}
          </div>
          <span className="text-[11px] tracking-tight mt-1">Home</span>
        </button>

        {/* Center: Prominent "Scan Item" Action Button */}
        <div className="flex-1 flex flex-col items-center justify-center relative -top-4">
          <button
            onClick={() => onTabChange('scan')}
            className={`group relative flex items-center justify-center w-15 h-15 rounded-full shadow-lg transition-all duration-300 transform active:scale-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 ${
              activeTab === 'scan'
                ? 'bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-600 text-white shadow-indigo-500/50 scale-105 ring-4 ring-white'
                : 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-indigo-500/35 hover:shadow-indigo-500/50 hover:scale-105 ring-4 ring-white'
            }`}
            aria-label="Scan or Search Item with AI Camera"
            aria-current={activeTab === 'scan' ? 'page' : undefined}
          >
            {/* Subtle glow / ripple background */}
            <span className="absolute inset-0 rounded-full bg-indigo-400 opacity-20 blur-md group-hover:opacity-40 transition-opacity" />

            <div className="relative flex flex-col items-center justify-center">
              <Scan className="w-7 h-7 stroke-[2.2] transition-transform duration-200 group-hover:rotate-6" />
            </div>
          </button>
          
          <button
            onClick={() => onTabChange('scan')}
            className={`text-[11px] tracking-tight font-semibold mt-1 transition-colors ${
              activeTab === 'scan' ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Scan Item
          </button>
        </div>

        {/* Right: Profile Tab */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[52px] py-1 px-2 rounded-2xl transition-all duration-200 active:scale-95 ${
            activeTab === 'profile'
              ? 'text-indigo-600 font-semibold'
              : 'text-slate-600 hover:text-slate-800 font-medium'
          }`}
          aria-label="User Profile and Settings"
          aria-current={activeTab === 'profile' ? 'page' : undefined}
        >
          <div className="relative">
            <User
              className={`w-6 h-6 transition-transform duration-200 ${
                activeTab === 'profile' ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
              }`}
            />
            {activeTab === 'profile' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            )}
          </div>
          <span className="text-[11px] tracking-tight mt-1">Profile</span>
        </button>
      </div>
    </nav>
  );
};
