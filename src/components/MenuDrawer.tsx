'use client';

import React from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Camera, 
  HelpCircle, 
  Heart, 
  ExternalLink, 
  Info, 
  FileText, 
  MapPin, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { TabType } from '@/types';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: TabType) => void;
  onShowToast: (message: string) => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onShowToast,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Drawer content sliding in from right */}
      <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
              iF
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900 block leading-tight">
                IFound<span className="text-indigo-600">U</span> App
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Version 2.4.0 • AI Active
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-4 space-y-5 flex-1 text-slate-700 text-xs">
          {/* Quick Navigation Items */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1">
              Navigation
            </span>

            <button
              onClick={() => {
                onSelectTab('home');
                onClose();
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 font-bold flex items-center justify-between text-slate-800 transition-colors"
            >
              <span>Home Feed</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => {
                onSelectTab('scan');
                onClose();
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-indigo-50 font-bold flex items-center justify-between text-indigo-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-600" />
                <span>AI Camera Scanner</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-100 text-indigo-700 font-bold">
                NEW
              </span>
            </button>

            <button
              onClick={() => {
                onSelectTab('profile');
                onClose();
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 font-bold flex items-center justify-between text-slate-800 transition-colors"
            >
              <span>User Profile & History</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* How AI Works Card */}
          <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 space-y-2">
            <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              How IFoundU AI Works
            </div>
            <p className="text-[11px] text-indigo-900/80 leading-relaxed">
              When an item is scanned, our computer vision model extracts color histograms, geometric bounding contours, and manufacturer marks to calculate cosine match similarity scores with lost items.
            </p>
          </div>

          {/* Safe & Verified Reconnection */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2">
              Community Safety
            </span>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Safe Exchange Protocol
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                <li>Always meet at public spots (e.g. library desk, station info booth).</li>
                <li>Verify secret identifying marks before handover.</li>
                <li>No financial reward exchanges required.</li>
              </ul>
            </div>
          </div>

          {/* Stats Callout */}
          <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-indigo-300">
              Community Impact
            </span>
            <div className="text-xl font-black text-white">
              8,420+
            </div>
            <p className="text-[11px] text-slate-300">
              Lost items safely reunited across 14 campus and city districts this year.
            </p>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
          <p className="text-[11px] text-slate-400">
            IFoundU Mobile Web © 2026. Made with ❤️ for community recovery.
          </p>
        </div>
      </div>
    </div>
  );
};
