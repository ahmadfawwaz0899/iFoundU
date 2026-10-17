'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, MapPin, Clock, Sparkles, Tag, ChevronRight } from 'lucide-react';
import { LostFoundItem, ItemType } from '@/types';
import { CATEGORIES } from '@/data/mockData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: LostFoundItem[];
  onSelectItem: (item: LostFoundItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  items,
  onSelectItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'found' | 'lost'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filtered = useMemo(() => {
    if (!searchTerm.trim() && selectedCategory === 'All' && selectedType === 'all') {
      return items.slice(0, 4); // show recently added as suggestions
    }

    return items.filter((item) => {
      if (selectedType !== 'all' && item.type !== selectedType) return false;
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.aiDetectedFeatures.brand?.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, searchTerm, selectedType, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-start p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md mx-auto bg-white rounded-b-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden z-10 border border-slate-100">
        {/* Search Input Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1 flex items-center">
            <Search className="w-5 h-5 text-indigo-600 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search lost or found items..."
              className="w-full text-xs sm:text-sm pl-11 pr-8 py-3 rounded-2xl bg-slate-100 focus:bg-white border border-transparent focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors shrink-0"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 space-y-2">
          {/* Found vs Lost toggle */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                selectedType === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedType('found')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                selectedType === 'found'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Found Items
            </button>
            <button
              onClick={() => setSelectedType('lost')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                selectedType === 'lost'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Lost Items
            </button>
          </div>

          {/* Category quick chips */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-2.5 flex-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider px-1 mb-1">
            <span>{searchTerm ? 'Search Results' : 'Suggested Recent Items'}</span>
            <span>{filtered.length} items</span>
          </div>

          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectItem(item);
                  onClose();
                }}
                className="p-3 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200/80 transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full ${
                          item.type === 'found'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.timeAgo}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 mt-0.5">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-slate-400" />
                      {item.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 text-indigo-600 text-xs font-semibold">
                  <span className="hidden sm:inline">Details</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-slate-500">
              No matching items found. Try different keywords.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
