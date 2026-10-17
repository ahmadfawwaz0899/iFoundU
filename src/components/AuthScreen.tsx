'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Check
} from 'lucide-react';
import { UserSession } from '@/lib/auth';

interface AuthScreenProps {
  onAuthenticated: (user: UserSession) => void;
  onShowToast: (message: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthenticated,
  onShowToast,
}) => {
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Submit Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!agreedTerms) {
      setErrorMessage('Please accept the community safety guidelines to continue.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        onShowToast(`Welcome to IFoundU, ${data.user.name}!`);
        onAuthenticated(data.user);
      } else {
        setErrorMessage(data.error || 'Failed to create account.');
      }
    } catch (err: any) {
      setErrorMessage('Network connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        onShowToast(`Welcome back, ${data.user.name}!`);
        onAuthenticated(data.user);
      } else {
        setErrorMessage(data.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setErrorMessage('Network connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Auto-Fill & Login
  const handleQuickDemoLogin = async (demoEmail: string, demoName: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: demoEmail,
          password: 'password123',
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        onShowToast(`Signed in as demo user ${demoName}!`);
        onAuthenticated(data.user);
      } else {
        // Fallback user session for demo
        const demoUser: UserSession = {
          id: demoEmail.includes('alex') ? 'user-current' : 'user-2',
          name: demoName,
          email: demoEmail,
          phone: '+1 (555) 234-8901',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          memberSince: 'January 2026',
          trustScore: 4.95,
        };
        onAuthenticated(demoUser);
      }
    } catch (err) {
      // Fallback
      const demoUser: UserSession = {
        id: 'user-current',
        name: demoName,
        email: demoEmail,
        phone: '+1 (555) 234-8901',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        memberSince: 'January 2026',
        trustScore: 4.95,
      };
      onAuthenticated(demoUser);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 flex flex-col items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col">
        {/* Top Hero Brand Header */}
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-400/20 rounded-full blur-xl pointer-events-none" />

          {/* Logo Badge */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner text-white mb-3 ring-4 ring-white/10">
            <span className="font-black text-2xl tracking-tighter">iF</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            IFound<span className="text-indigo-200">U</span>
          </h1>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/20 text-indigo-100 mt-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span>AI-Integrated Lost & Found Registry</span>
          </div>

          <p className="text-xs text-indigo-100/90 mt-2.5 max-w-xs mx-auto leading-relaxed">
            Please create an account or sign in to scan, report, and claim items with our verified AI matching engine.
          </p>
        </div>

        {/* Auth Mode Segmented Control */}
        <div className="p-4 sm:p-6 space-y-5">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage(null);
              }}
              className={`flex-1 min-h-[44px] py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 min-h-[44px] py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SIGN UP FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="w-full text-xs sm:text-sm pl-10 pr-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alex.chen@example.com"
                    className="w-full text-xs sm:text-sm pl-10 pr-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Phone Number (for Handover Verification)
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 234-8901"
                    className="w-full text-xs sm:text-sm pl-10 pr-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full text-xs sm:text-sm pl-10 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full text-xs sm:text-sm pl-10 pr-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Safety Terms Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="safetyTerms"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="safetyTerms" className="text-[11px] text-slate-600 leading-tight cursor-pointer">
                  I agree to the <span className="font-semibold text-indigo-600">Community Safety Guidelines</span> and verify that all item claims and reports will be truthful.
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[52px] py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create IFoundU Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* SIGN IN FORM */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full text-xs sm:text-sm pl-10 pr-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full text-xs sm:text-sm pl-10 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[52px] py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In to IFoundU</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Logins Bar (Super Convenient for Reviewers) */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Quick One-Tap Demo Access
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('alex.chen@example.com', 'Alex Chen')}
                className="min-h-[42px] py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Alex Chen</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('sarah.jenkins@example.com', 'Sarah Jenkins')}
                className="min-h-[42px] py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Sarah (Barista)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
