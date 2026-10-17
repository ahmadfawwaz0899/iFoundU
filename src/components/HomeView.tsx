'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  SlidersHorizontal, 
  Camera, 
  Filter, 
  CheckCircle,
  AlertCircle,
  Tag,
  ArrowRight
} from 'lucide-react';
import { LostFoundItem, ItemType, ItemCategory, TabType } from '@/types';
import { CATEGORIES } from '@/data/mockData';

interface HomeViewProps {
  items: LostFoundItem[];
  onSelectItem: (item: LostFoundItem) => void;
  onNavigateToScan: (intent?: 'found' | 'lost') => void;
  onOpenSearchModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  items,
  onSelectItem,
  onNavigateToScan,
  onOpenSearchModal,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'found' | 'lost'>('all');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items based on active tabs, category, and search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Type filter
      if (filterType !== 'all' && item.type !== filterType) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesLoc = item.location.toLowerCase().includes(query);
        const matchesBrand = item.aiDetectedFeatures.brand?.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        return matchesTitle || matchesLoc || matchesBrand || matchesDesc;
      }
      return true;
    });
  }, [items, filterType, selectedCategory, searchQuery]);

  const foundCount = useMemo(() => items.filter((i) => i.type === 'found').length, [items]);
  const lostCount = useMemo(() => items.filter((i) => i.type === 'lost').length, [items]);

  return (
    <div className="space-y-6 pb-24">
      {/* Welcoming Hero Section */}
      <section className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 text-white rounded-3xl p-6 shadow-xl shadow-indigo-600/20 relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-violet-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/20 text-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            AI-Powered Smart Recovery
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
              Reuniting What Matters <br />
              <span className="text-indigo-200">In Real-Time.</span>
            </h1>
            <p className="text-xs text-indigo-100/90 mt-1.5 leading-relaxed font-normal">
              Snap a photo with our AI camera. We instantly match lost and found items across the entire city.
            </p>
          </div>

          {/* Quick Search Bar within Hero */}
          <div className="pt-1">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by item, brand, or location..."
                className="w-full h-12 pl-11 pr-10 rounded-2xl bg-white text-slate-900 text-xs sm:text-sm font-medium shadow-inner placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600"
                  aria-label="Clear search text"
                >
                  ✕
                </button>
              ) : (
                <button
                  onClick={onOpenSearchModal}
                  className="absolute right-2 p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors"
                  title="Advanced search"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Dual Action CTA */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => onNavigateToScan('found')}
              className="min-h-[46px] py-2.5 px-3 rounded-2xl bg-white/15 hover:bg-white/25 active:bg-white/30 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Camera className="w-4 h-4 text-emerald-300" />
              <span>I Found an Item</span>
            </button>
            <button
              onClick={() => onNavigateToScan('lost')}
              className="min-h-[46px] py-2.5 px-3 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 active:bg-indigo-100 text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Search className="w-4 h-4 text-indigo-600" />
              <span>I Lost an Item</span>
            </button>
          </div>
        </div>
      </section>

      {/* Category Pills (Horizontal Scroll) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Explore Categories
          </span>
          <span className="text-xs text-indigo-600 font-semibold cursor-pointer" onClick={() => setSelectedCategory('All')}>
            Reset
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-0.5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as ItemCategory)}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 active:scale-95 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Segmented Tab Switcher (Recently Found vs Recently Lost) */}
      <section className="space-y-3">
        <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center gap-1 shadow-inner">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 min-h-[42px] py-2 px-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Items
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600 font-bold">
              {items.length}
            </span>
          </button>

          <button
            onClick={() => setFilterType('found')}
            className={`flex-1 min-h-[42px] py-2 px-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
              filterType === 'found'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Recently Found
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              {foundCount}
            </span>
          </button>

          <button
            onClick={() => setFilterType('lost')}
            className={`flex-1 min-h-[42px] py-2 px-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
              filterType === 'lost'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            Recently Lost
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-800 font-bold">
              {lostCount}
            </span>
          </button>
        </div>

        {/* Feed Header */}
        <div className="flex items-center justify-between px-1 pt-1">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <span>
              {filterType === 'all' && 'Recent Discoveries & Reports'}
              {filterType === 'found' && 'Recently Found Items Feed'}
              {filterType === 'lost' && 'Recently Lost Items Feed'}
            </span>
            <span className="text-xs font-normal text-slate-600">
              ({filteredItems.length})
            </span>
          </h2>
          <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Live Sync
          </span>
        </div>

        {/* Item Cards Feed */}
        {filteredItems.length > 0 ? (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const isFound = item.type === 'found';
              return (
                <article
                  key={item.id}
                  className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col gap-3.5 relative overflow-hidden"
                >
                  {/* Card Header: Image & Badges */}
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Status Pill Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide text-white shadow-sm ${
                          isFound ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}
                      >
                        {isFound ? 'Found' : 'Lost'}
                      </span>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-md shadow-xs">
                        {item.category}
                      </span>
                    </div>

                    {/* AI Confidence Metric Pill */}
                    <div className="absolute top-3 right-3">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[11px] font-bold text-indigo-300 border border-indigo-400/30">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span>{item.aiDetectedFeatures.confidence}% AI Match</span>
                      </div>
                    </div>

                    {/* Bottom Metadata in Image */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white/90 text-[11px] font-medium">
                      <span className="flex items-center gap-1 drop-shadow-sm">
                        <Clock className="w-3 h-3 text-white/80" />
                        {item.timeAgo}
                      </span>
                      {item.aiDetectedFeatures.brand && (
                        <span className="px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-[10px] font-semibold text-white/90">
                          {item.aiDetectedFeatures.brand}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body: Title, Location & AI Snippet */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-base text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h3>

                    {/* Location Badge */}
                    <div className="flex items-start gap-1.5 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{item.location}</span>
                    </div>

                    {/* AI Feature Pill Snippet */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        Color: {item.aiDetectedFeatures.color}
                      </span>
                      {item.aiDetectedFeatures.distinctMarks && (
                        <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 max-w-[200px] truncate">
                          Note: {item.aiDetectedFeatures.distinctMarks}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Action: View Details Button with large touch target */}
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-600 font-medium">
                      Ref #{item.id.toUpperCase()}
                    </span>

                    <button
                      onClick={() => onSelectItem(item)}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all duration-200 active:scale-95 shadow-xs"
                      aria-label={`View details for ${item.title}`}
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No matching items found
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              We couldn't find any items matching "{searchQuery}" in this category. Try resetting filters or report it using our AI Scanner!
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setFilterType('all');
                }}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => onNavigateToScan()}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                Scan Item
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
