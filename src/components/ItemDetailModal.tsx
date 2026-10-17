'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Share2, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  Tag,
  Send,
  User,
  ThumbsUp,
  ThumbsDown,
  Lock
} from 'lucide-react';
import { LostFoundItem } from '@/types';

interface ItemDetailModalProps {
  item: LostFoundItem | null;
  onClose: () => void;
  onShowToast: (message: string) => void;
  onItemUpdated?: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onShowToast,
  onItemUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'chat' | 'claims'>('details');
  const [claimStep, setClaimStep] = useState<'initial' | 'claiming' | 'claimed'>('initial');
  const [claimProof, setClaimProof] = useState('');
  const [claimMessage, setClaimMessage] = useState('');
  const [claimName, setClaimName] = useState('Alex Chen');
  const [claimContact, setClaimContact] = useState('alex.chen@example.com');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  // Live Chat and Claims state from backend API
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [itemClaims, setItemClaims] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch real details, claims, and chat messages for this item
  useEffect(() => {
    if (!item?.id) return;
    setIsLoadingData(true);
    setClaimStep('initial');
    setActiveTab('details');

    fetch(`/api/items/${item.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setItemClaims(data.claims || []);
          setChatMessages(data.chatMessages || []);
        }
      })
      .catch((err) => console.warn('Could not load item live details:', err))
      .finally(() => setIsLoadingData(false));
  }, [item?.id]);

  if (!item) return null;

  const isFound = item.type === 'found';

  // Handle Share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `IFoundU: ${item.title}`,
        text: `Check out this ${item.type} item on IFoundU: ${item.title} at ${item.location}`,
        url: window.location.href,
      }).catch(() => {
        onShowToast('Link copied to clipboard!');
      });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      onShowToast('Share link copied to clipboard!');
    }
  };

  // Submit Claim to Real Backend
  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingClaim(true);

    try {
      const res = await fetch(`/api/items/${item.id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimantName: claimName,
          claimantContact: claimContact,
          secretProof: claimProof,
          message: claimMessage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setClaimStep('claimed');
        onShowToast(isFound ? 'Claim submitted to finder for verification!' : 'Sighting report sent to owner!');
        if (onItemUpdated) onItemUpdated();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      onShowToast(`Claim error: ${err.message}`);
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  // Approve or Reject Claim
  const handleReviewClaim = async (claimId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/items/${item.id}/claim`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, action }),
      });
      const data = await res.json();
      if (data.success) {
        setItemClaims((prev) =>
          prev.map((c) => (c.id === claimId ? { ...c, status: action === 'approve' ? 'approved' : 'rejected' } : c))
        );
        onShowToast(`Claim ${action === 'approve' ? 'approved' : 'rejected'}`);
        if (onItemUpdated) onItemUpdated();
      }
    } catch (err: any) {
      onShowToast('Failed to update claim');
    }
  };

  // Send message in Chat Thread
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;

    setIsSendingMessage(true);
    const msgText = newChatMessage.trim();
    setNewChatMessage('');

    try {
      const res = await fetch(`/api/items/${item.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: 'Alex Chen',
          senderRole: 'finder',
          message: msgText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setChatMessages((prev) => [...prev, data.message]);
      }
    } catch (err) {
      onShowToast('Could not deliver message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden z-10 border border-slate-100 animate-in slide-in-from-bottom duration-300">
        {/* Close Button */}
        <div className="absolute top-3 right-3 z-30">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:text-slate-900 shadow-md hover:bg-white active:scale-95 transition-all"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Header: Details vs Secure Chat vs Claims */}
        <div className="flex border-b border-slate-100 bg-slate-50 px-4 pt-3 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Item Details
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Verification Chat</span>
            {chatMessages.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] flex items-center justify-center">
                {chatMessages.length}
              </span>
            )}
          </button>

          {itemClaims.length > 0 && (
            <button
              onClick={() => setActiveTab('claims')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'claims'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Claims ({itemClaims.length})</span>
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto flex-1 pb-6">
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div>
              {/* Item Image with Badges */}
              <div className="relative w-full h-60 bg-slate-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                {/* Status & Type Badge */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm ${
                      isFound ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {isFound ? 'Found Item' : 'Lost Item'}
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-slate-800 shadow-sm">
                    <Tag className="w-3 h-3 text-indigo-500" />
                    {item.category}
                  </span>
                </div>

                {/* AI Confidence Pill */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 backdrop-blur-md border border-indigo-400/30 text-indigo-200">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                    <span>AI Confidence: {item.aiDetectedFeatures?.confidence || 96}%</span>
                  </div>
                  <span className="text-white/80 text-[11px] font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.timeAgo}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Title & Metadata */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h2>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1.5">
                    <span>Reported by {item.reporterName}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Community Verified
                    </span>
                  </div>
                </div>

                {/* AI Feature Breakdown Card */}
                <div className="bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-slate-50 rounded-2xl p-4 border border-indigo-100/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      AI Vision Attribute Extraction
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      Active Model
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    {item.aiDetectedFeatures?.brand && (
                      <div className="bg-white/80 rounded-xl p-2.5 border border-indigo-100/50">
                        <span className="text-slate-600 block text-[10px] uppercase font-bold">Brand</span>
                        <span className="font-semibold text-slate-900">{item.aiDetectedFeatures.brand}</span>
                      </div>
                    )}
                    <div className="bg-white/80 rounded-xl p-2.5 border border-indigo-100/50">
                      <span className="text-slate-600 block text-[10px] uppercase font-bold">Color</span>
                      <span className="font-semibold text-slate-900">{item.aiDetectedFeatures?.color}</span>
                    </div>
                    {item.aiDetectedFeatures?.model && (
                      <div className="bg-white/80 rounded-xl p-2.5 border border-indigo-100/50 col-span-2">
                        <span className="text-slate-600 block text-[10px] uppercase font-bold">Identified Model</span>
                        <span className="font-semibold text-slate-900">{item.aiDetectedFeatures.model}</span>
                      </div>
                    )}
                    {item.aiDetectedFeatures?.distinctMarks && (
                      <div className="bg-white/80 rounded-xl p-2.5 border border-indigo-100/50 col-span-2">
                        <span className="text-slate-600 block text-[10px] uppercase font-bold">Distinguishing Traits</span>
                        <span className="font-semibold text-slate-900">{item.aiDetectedFeatures.distinctMarks}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location Section */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wide">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    Spotted Location
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 text-rose-600 mt-0.5">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.location}
                      </p>
                      {item.specificLocation && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Spot note: {item.specificLocation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide block">
                    Description & Notes
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                    {item.description}
                  </p>
                </div>

                {/* Claim / Contact Action Flow */}
                {claimStep === 'initial' && (
                  <div className="pt-2 space-y-2.5">
                    <button
                      onClick={() => setClaimStep('claiming')}
                      className="w-full min-h-[50px] py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {isFound ? 'I Think This Is Mine (Submit Claim)' : 'I Have Info / Sighted This!'}
                    </button>

                    <button
                      onClick={handleShare}
                      className="w-full min-h-[46px] py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      Share with Community
                    </button>
                  </div>
                )}

                {claimStep === 'claiming' && (
                  <form onSubmit={handleClaimSubmit} className="pt-2 space-y-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                    <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      {isFound ? 'Verify Ownership Details' : 'Send Sighting Location'}
                    </div>

                    <p className="text-xs text-slate-600">
                      {isFound
                        ? 'To protect against fraudulent claims, specify a secret detail (e.g. wallpaper, serial digit, contents).'
                        : 'Let the owner know where and when you retrieved or handed in this item.'}
                    </p>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={claimName}
                        onChange={(e) => setClaimName(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        {isFound ? 'Secret Identifying Mark / Proof' : 'Sighting Details'}
                      </label>
                      <input
                        type="text"
                        required
                        value={claimProof}
                        onChange={(e) => setClaimProof(e.target.value)}
                        placeholder={isFound ? 'e.g. Has stickers on back, transit card inside' : 'e.g. Handed to security guard John'}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Message to Finder / Owner
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={claimMessage}
                        onChange={(e) => setClaimMessage(e.target.value)}
                        placeholder="Hello, I lost this on Tuesday..."
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setClaimStep('initial')}
                        className="flex-1 py-2.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingClaim}
                        className="flex-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20"
                      >
                        {isSubmittingClaim ? 'Submitting...' : 'Send Claim Request'}
                      </button>
                    </div>
                  </form>
                )}

                {claimStep === 'claimed' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h4 className="font-bold text-sm text-emerald-900">
                      Claim Successfully Logged!
                    </h4>
                    <p className="text-xs text-emerald-700">
                      The finder can now review your proof and coordinate return in the Verification Chat tab.
                    </p>
                    <button
                      onClick={() => setActiveTab('chat')}
                      className="mt-2 py-2 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                    >
                      Open Chat Thread
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SECURE CHAT */}
          {activeTab === 'chat' && (
            <div className="p-4 flex flex-col h-[400px]">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs text-slate-500">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                <span>End-to-End Handover Thread for {item.title}</span>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
                {chatMessages.length > 0 ? (
                  chatMessages.map((msg, i) => {
                    const isMe = msg.senderName === 'Alex Chen' || msg.sender_name === 'Alex Chen';
                    return (
                      <div
                        key={msg.id || i}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-slate-400 font-medium px-1">
                          {msg.senderName || msg.sender_name}
                        </span>
                        <div
                          className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs shadow-xs ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-tr-xs'
                              : 'bg-slate-100 text-slate-800 rounded-tl-xs'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-xs text-slate-400">
                    No messages yet. Send a note to discuss handover!
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="pt-2 flex gap-2 border-t border-slate-100">
                <input
                  type="text"
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isSendingMessage || !newChatMessage.trim()}
                  className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: CLAIMS REVIEW (For Finder) */}
          {activeTab === 'claims' && (
            <div className="p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Submitted Ownership Claims ({itemClaims.length})
              </h3>

              {itemClaims.map((claim) => (
                <div key={claim.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{claim.claimant_name}</h4>
                      <p className="text-[10px] text-slate-500">{claim.claimant_contact}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        claim.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : claim.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </div>

                  <div className="text-xs bg-white p-2.5 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Provided Verification Proof
                    </span>
                    <p className="text-slate-800 font-medium mt-0.5">{claim.secret_proof}</p>
                  </div>

                  {claim.status === 'pending' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleReviewClaim(claim.id, 'approve')}
                        className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        Approve & Confirm
                      </button>
                      <button
                        onClick={() => handleReviewClaim(claim.id, 'reject')}
                        className="py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
