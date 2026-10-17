export type TabType = 'home' | 'scan' | 'profile';

export type ItemType = 'lost' | 'found';

export type ItemCategory = 
  | 'All'
  | 'Electronics'
  | 'Wallets & Bags'
  | 'Keys'
  | 'Accessories'
  | 'Documents'
  | 'Pets'
  | 'Other';

export interface LostFoundItem {
  id: string;
  type: ItemType;
  title: string;
  category: ItemCategory;
  location: string;
  specificLocation?: string;
  date: string;
  timeAgo: string;
  imageUrl: string;
  description: string;
  aiDetectedFeatures: {
    brand?: string;
    color: string;
    model?: string;
    distinctMarks?: string;
    confidence: number;
  };
  status: 'Open' | 'Pending Verification' | 'Claimed' | 'Resolved';
  reporterName: string;
  reporterContact?: string;
  matchedItemId?: string;
  matchScore?: number;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  memberSince: string;
  trustScore: number;
  stats: {
    submittedCount: number;
    resolvedCount: number;
    activeSearches: number;
    aiMatchRate: number;
  };
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  category?: string;
  timestamp: string;
  resultCount: number;
}
