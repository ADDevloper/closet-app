
export type Category = 'shirt' | 'pants' | 'dress' | 'shoes' | 'jacket' | 'accessories' | 'skirt' | 'outerwear' | 'other';
export type Occasion = 'casual' | 'formal' | 'athletic' | 'business' | 'party' | 'wedding' | 'date' | 'gym';
export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all-season';

export interface ClothingItem {
  id: string;
  photo: string; // base64
  category: Category;
  colors: string[];
  occasions: Occasion[];
  seasons: Season[];
  brand?: string;
  size?: string;
  purchaseDate?: string;
  createdAt: number;
}

export interface OutfitSuggestion {
  name: string;
  description: string;
  itemIds: string[]; // IDs of clothing items in this outfit
  stylingTips: string;
}

export interface ScheduledOutfit {
  id: string;
  outfit: OutfitSuggestion;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  outfits?: OutfitSuggestion[];
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdatedAt: number;
}

export const CATEGORIES: Category[] = ['shirt', 'pants', 'dress', 'shoes', 'jacket', 'skirt', 'accessories', 'outerwear', 'other'];
export const OCCASIONS: Occasion[] = ['casual', 'formal', 'athletic', 'business', 'party', 'wedding', 'date', 'gym'];
export const SEASONS: Season[] = ['spring', 'summer', 'fall', 'winter', 'all-season'];

export type TabType = 'home' | 'closet' | 'calendar';
