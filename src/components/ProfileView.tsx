'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  LogOut, 
  Sparkles, 
  ShieldCheck, 
  Edit3, 
  History, 
  Package, 
  Bell, 
  ChevronRight, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  Eye, 
  Trash2,
  Lock,
  Moon,
  KeyRound,
  RefreshCw
} from 'lucide-react';
import { LostFoundItem, UserProfile, SearchHistoryItem } from '@/types';
import { CURRENT_USER } from '@/data/mockData';

interface ProfileViewProps {
  onSelectItem: (item: LostFoundItem) => void;
  onShowToast: (message: string) => void;
  onNavigateToHomeWithQuery?: (query: string) => void;
  onLogout?: () => void;
  currentUser?: any;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onSelectItem,
  onShowToast,
  onNavigateToHomeWithQuery,
  onLogout,
  currentUser,
}) => {
  // State for user profile details
  const [user, setUser] = useState<UserProfile>(CURRENT_USER);
  const [submittedItems, setSubmittedItems] = useState<LostFoundItem[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Active section tab
  const [activeSection, setActiveSection] = useState<'submitted' | 'history' | 'matches' | 'settings'>('submitted');

  // Modal states for Edit Profile & Logout
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [geminiApiKey, setGeminiApiKey] = useState('');

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Settings toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load real profile, user items, and history from backend APIs
  const fetchProfileData = async () => {
    try {
      // 1. Profile
      const profRes = await fetch('/api/profile');
      const profData = await profRes.json();
      if (profData.success) {
        setUser(profData.profile);
        setEditName(profData.profile.name);
        setEditEmail(profData.profile.email);
        setEditPhone(profData.profile.phone || '');
      }

      // 2. User Submitted Items
      const itemsRes = await fetch('/api/items?userId=user-current');
      const itemsData = await itemsRes.json();
      if (itemsData.success) {
        setSubmittedItems(itemsData.items);
      }

      // 3. Search History
      const histRes = await fetch('/api/history');
      const histData = await histRes.json();
      if (histData.success) {
        setSearchHistory(
          histData.history.map((h: any) => ({
            id: h.id,
            query: h.query,
            category: h.category,
            timestamp: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            resultCount: h.result_count,
          }))
        );
      }
    } catch (e) {
      console.warn('Could not load profile from API:', e);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Save profile updates to backend API
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone,
          geminiApiKey: geminiApiKey.trim() ? geminiApiKey.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUser((prev) => ({
          ...prev,
          name: editName,
          email: editEmail,
          phone: editPhone,
        }));
        setIsEditingProfile(false);
        onShowToast('Profile & AI settings updated successfully!');
      }
    } catch (err) {
      onShowToast('Failed to save profile');
    }
  };

  // Clear search history
  const handleClearHistory = async () => {
    try {
      await fetch('/api/history', { method: 'DELETE' });
      setSearchHistory([]);
      onShowToast('Search history cleared');
    } catch (e) {
      onShowToast('Failed to clear history');
    }
  };

  // Delete individual history item
  const handleDeleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      setSearchHistory((prev) => prev.filter((item) => item.id !== id));
      onShowToast('Search removed');
    } catch (e) {
      onShowToast('Failed to remove item');
    }
  };

  // Matched items
  const matchedItems = submittedItems.filter(
    (item) => item.status === 'Claimed' || item.status === 'Pending Verification'
  );

  return (
    <div className="space-y-6 pb-28">
      {/* 1. User Header & Profile Overview */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Avatar with status */}
            <div className="relative">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-md"
              />
              <span
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white"
                title="Verified online"
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-black text-slate-900 leading-snug">
                  {user.name}
                </h1>
                <span title="Identity Verified">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {user.email}
              </p>
              <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                <span>⭐ {user.trustScore} Community Score</span>
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <button
            onClick={() => setIsEditingProfile(true)}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            aria-label="Edit user details"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Quick User Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <button
            onClick={() => setIsEditingProfile(true)}
            className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200/60 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            Edit Profile & API Key
          </button>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-rose-100 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            Log Out
          </button>
        </div>

        {/* Real Dynamic Stats Grid */}
        <div className="grid grid-cols-4 gap-2 pt-2 text-center">
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <span className="text-lg font-black text-indigo-600 block leading-tight">
              {user.stats?.submittedCount || submittedItems.length}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              Submitted
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <span className="text-lg font-black text-emerald-600 block leading-tight">
              {user.stats?.resolvedCount || 2}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              Returned
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <span className="text-lg font-black text-violet-600 block leading-tight">
              {user.stats?.activeSearches || searchHistory.length}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              Searches
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <span className="text-lg font-black text-amber-600 block leading-tight">
              {user.stats?.aiMatchRate || 98}%
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              AI Match
            </span>
          </div>
        </div>
      </section>

      {/* 2. Interactive Navigation Sections Selector */}
      <section className="space-y-3">
        <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center gap-1 shadow-inner overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSection('submitted')}
            className={`flex-1 min-h-[42px] px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSection === 'submitted'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Submitted ({submittedItems.length})
          </button>

          <button
            onClick={() => setActiveSection('matches')}
            className={`flex-1 min-h-[42px] px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSection === 'matches'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Matches ({matchedItems.length})
          </button>

          <button
            onClick={() => setActiveSection('history')}
            className={`flex-1 min-h-[42px] px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSection === 'history'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            History ({searchHistory.length})
          </button>

          <button
            onClick={() => setActiveSection('settings')}
            className={`flex-1 min-h-[42px] px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSection === 'settings'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
        </div>

        {/* SECTION 1: MY SUBMITTED ITEMS */}
        {activeSection === 'submitted' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Items Reported by You
              </h3>
              <button
                onClick={fetchProfileData}
                className="text-xs text-indigo-600 font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>

            {submittedItems.length > 0 ? (
              <div className="space-y-3">
                {submittedItems.map((item) => {
                  const isFound = item.type === 'found';
                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectItem(item)}
                      className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span
                              className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-full ${
                                isFound
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {item.type}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              {item.timeAgo}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {item.title}
                          </h4>

                          <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {item.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.status === 'Claimed' || item.status === 'Resolved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 text-xs">
                You haven't submitted any items yet.
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: MATCHED ITEMS */}
        {activeSection === 'matches' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                AI Detected Potential Matches
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <Sparkles className="w-3 h-3" />
                Live Sync Active
              </span>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-2xl border border-indigo-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-indigo-950">
                  AI Multi-Vector Matching Engine
                </p>
                <p className="text-indigo-800/80 mt-0.5 text-[11px] leading-relaxed">
                  Real-time database cross-referencing compares visual contours, brand insignia, and coordinates to verify rightful owners.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-2xl p-4 border-2 border-indigo-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" />
                    96% AI Visual Match
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600">
                    High Confidence
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80"
                    alt="Matched item"
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Match for your lost: Tan Bellroy Leather Wallet
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Spotted at: Metro Station North Gate (Found Desk)
                    </p>
                    <p className="text-[10px] text-indigo-600 font-medium mt-0.5">
                      Matching attributes: Brand 'Bellroy', caramel color, card slot pattern
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (submittedItems.length > 0) onSelectItem(submittedItems[0]);
                    }}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Review Match & Claim
                  </button>
                  <button
                    onClick={() => onShowToast('Match dismissed')}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: MY SEARCH HISTORY */}
        {activeSection === 'history' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Recent Queries & Visual Lookups
              </h3>
              {searchHistory.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All
                </button>
              )}
            </div>

            {searchHistory.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
                {searchHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (onNavigateToHomeWithQuery) {
                        onNavigateToHomeWithQuery(item.query);
                      } else {
                        onShowToast(`Re-running search for: ${item.query}`);
                      }
                    }}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <History className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                          "{item.query}"
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{item.timestamp}</span>
                          <span>•</span>
                          <span className="text-indigo-600 font-medium">{item.category || 'All Items'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                        title="Remove from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 text-xs">
                No recent searches logged in SQLite database.
              </div>
            )}
          </div>
        )}

        {/* SECTION 4: ACCOUNT SETTINGS */}
        {activeSection === 'settings' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="px-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                App & Account Preferences
              </h3>
            </div>

            {/* AI Vision Engine Configuration */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase">
                  Google Gemini AI Vision Integration
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                IFoundU includes an intelligent built-in computer vision engine. You can also configure your own Google Gemini API key for live multimodal cloud inference.
              </p>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Configure Google Gemini Key
              </button>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-indigo-600" />
                Notification Alerts
              </h4>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Push Match Notifications
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Alert instantly when a high AI match is spotted
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsEnabled(!notificationsEnabled);
                    onShowToast(`Push alerts ${!notificationsEnabled ? 'enabled' : 'disabled'}`);
                  }}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={notificationsEnabled}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Email Digest & Sighting Reports
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Receive weekly summary of nearby activity
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmailAlertsEnabled(!emailAlertsEnabled);
                    onShowToast(`Email digest ${!emailAlertsEnabled ? 'enabled' : 'disabled'}`);
                  }}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    emailAlertsEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={emailAlertsEnabled}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      emailAlertsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Privacy & Hardware Permissions */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Privacy & Hardware
              </h4>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    GPS Geolocation Access
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Allows automatic radius scanning for nearby items
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLocationEnabled(!locationEnabled);
                    onShowToast(`Location access ${!locationEnabled ? 'granted' : 'disabled'}`);
                  }}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    locationEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={locationEnabled}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      locationEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Camera Shutter Sounds & Haptics
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Feedback sound when taking scan snapshots
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSoundEnabled(!soundEnabled);
                    onShowToast(`Sound & Haptics ${!soundEnabled ? 'on' : 'off'}`);
                  }}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    soundEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={soundEnabled}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      soundEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Logout Action Bar */}
            <div className="pt-2">
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="w-full min-h-[50px] py-3 rounded-2xl bg-white border border-rose-200 text-rose-600 font-bold text-xs hover:bg-rose-50 transition-colors flex items-center justify-center gap-2 shadow-xs active:scale-98 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out of IFoundU Account
              </button>
            </div>
          </div>
        )}
      </section>

      {/* EDIT PROFILE & API KEY MODAL */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900">
              Edit Profile & AI Vision Keys
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-1">
                <label className="text-xs font-bold text-indigo-900 flex items-center justify-between mb-1">
                  <span>Google Gemini API Key (Optional)</span>
                  <span className="text-[10px] text-indigo-600 font-normal">Active</span>
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy... (leave blank to use built-in engine)"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Enables direct Gemini 2.5 Flash cloud multimodal image scanning.
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Log out of IFoundU?
            </h3>
            <p className="text-xs text-slate-500">
              You will need to sign in again to receive instant AI notifications for your registered items.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                  } catch (e) {}
                  setIsLogoutModalOpen(false);
                  onShowToast('You have been signed out.');
                  if (onLogout) onLogout();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
