'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TabType, LostFoundItem } from '@/types';
import { INITIAL_ITEMS } from '@/data/mockData';
import { Header } from '@/components/Header';
import { FooterNav } from '@/components/FooterNav';
import { HomeView } from '@/components/HomeView';
import { ScanView } from '@/components/ScanView';
import { ProfileView } from '@/components/ProfileView';
import { ItemDetailModal } from '@/components/ItemDetailModal';
import { SearchModal } from '@/components/SearchModal';
import { MenuDrawer } from '@/components/MenuDrawer';
import { Toast } from '@/components/Toast';
import { AuthScreen } from '@/components/AuthScreen';
import { UserSession } from '@/lib/auth';
import { Smartphone, Monitor, LogOut, Sparkles } from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Navigation State: 'home' | 'scan' | 'profile'
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [scanIntent, setScanIntent] = useState<'found' | 'lost'>('found');

  // Live Database Items State
  const [items, setItems] = useState<LostFoundItem[]>(INITIAL_ITEMS);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // Modals & Overlays State
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Optional Viewport Frame Mode on Desktop (Phone Frame vs Wide Responsive)
  const [isPhoneFrameMode, setIsPhoneFrameMode] = useState(true);

  // Trigger toast alert
  const showToast = (message: string) => {
    setToastMessage(message);
  };

  // Check active session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success && data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        setCurrentUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch live items from SQLite Database API
  const refreshItems = useCallback(async () => {
    setIsLoadingItems(true);
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch (err) {
      console.warn('Could not fetch items from /api/items:', err);
    } finally {
      setIsLoadingItems(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      refreshItems();
    }
  }, [currentUser, refreshItems]);

  // Navigate to Scan view with specific intent
  const handleNavigateToScan = (intent: 'found' | 'lost' = 'found') => {
    setScanIntent(intent);
    setActiveTab('scan');
  };

  // Register new item from Scan view
  const handleItemRegistered = (newItem: LostFoundItem) => {
    setItems((prev) => [newItem, ...prev]);
    setActiveTab('home');
    showToast('Your item was registered to the live feed and database!');
    refreshItems();
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setCurrentUser(null);
    showToast('You have signed out.');
  };

  // 1. Loading splash while checking session
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-black text-2xl shadow-xl shadow-indigo-500/30 animate-pulse">
          iF
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-indigo-300 font-semibold">
          <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Initializing IFoundU Security Layer...</span>
        </div>
      </div>
    );
  }

  // 2. Authentication Gate: If not signed up or signed in, show Auth Screen!
  if (!currentUser) {
    return (
      <>
        <AuthScreen
          onAuthenticated={(user) => {
            setCurrentUser(user);
            refreshItems();
          }}
          onShowToast={showToast}
        />
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      </>
    );
  }

  // 3. Authenticated App Experience
  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col items-center">
      {/* Desktop Responsive / Phone Mode Toggle Bar (Visible on desktop screens for reviewer convenience) */}
      <div className="hidden lg:flex items-center justify-between w-full max-w-4xl px-4 py-2 text-xs text-slate-600 bg-white/70 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">IFoundU Verified App:</span>
          <span className="text-slate-600">Logged in as <strong className="text-indigo-600">{currentUser.name}</strong></span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            ● Authenticated
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setIsPhoneFrameMode(true)}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                isPhoneFrameMode
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile (390px)</span>
            </button>
            <button
              onClick={() => setIsPhoneFrameMode(false)}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                !isPhoneFrameMode
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Expanded</span>
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
            title="Log out of session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Application Container */}
      <div
        className={`w-full min-h-screen flex flex-col bg-slate-50 relative transition-all duration-300 ${
          isPhoneFrameMode
            ? 'max-w-md my-0 lg:my-6 shadow-2xl lg:rounded-[40px] border-x lg:border border-slate-200/90 overflow-hidden'
            : 'max-w-3xl my-0 lg:my-6 shadow-xl lg:rounded-3xl border border-slate-200/90'
        }`}
      >
        {/* Fixed Top Header */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenMenu={() => setIsMenuOpen(true)}
          onLogoClick={() => setActiveTab('home')}
        />

        {/* Dynamic Central Container Switching Content Smoothly */}
        <main className="flex-1 w-full px-4 pt-4 overflow-y-auto">
          {activeTab === 'home' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
              <HomeView
                items={items}
                onSelectItem={(item) => setSelectedItem(item)}
                onNavigateToScan={handleNavigateToScan}
                onOpenSearchModal={() => setIsSearchOpen(true)}
              />
            </div>
          )}

          {activeTab === 'scan' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
              <ScanView
                initialIntent={scanIntent}
                onItemRegistered={handleItemRegistered}
                onSelectItem={(item) => setSelectedItem(item)}
                existingItems={items}
                onShowToast={showToast}
              />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
              <ProfileView
                currentUser={currentUser}
                onSelectItem={(item) => setSelectedItem(item)}
                onShowToast={showToast}
                onLogout={handleLogout}
                onNavigateToHomeWithQuery={(query) => {
                  setActiveTab('home');
                  showToast(`Searching for "${query}"`);
                }}
              />
            </div>
          )}
        </main>

        {/* Fixed Bottom Navigation Tab Bar */}
        <FooterNav
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
        />
      </div>

      {/* Global Overlays and Modals */}
      {/* 1. Item Detail Modal with Real Claims & Verification Chat */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onShowToast={showToast}
        onItemUpdated={refreshItems}
      />

      {/* 2. Quick Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        items={items}
        onSelectItem={(item) => setSelectedItem(item)}
      />

      {/* 3. Hamburger Menu Drawer */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onShowToast={showToast}
      />

      {/* 4. Feedback Notification Toast */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
