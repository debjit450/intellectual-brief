export interface Article {
  id: string;
  title: string;
  source: string;
  summary: string;
  timestamp: string;
  url?: string;
  category?: string;
  imageUrl?: string;
  content?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  bookmarks: string[]; // Array of Article IDs
}

export type Category = 'Technology' | 'Business' | 'Artificial Intelligence' | 'Venture Capital' | 'Markets' | 'Policy';

export interface GroundingMetadata {
  groundingChunks?: Array<{
    web?: {
      uri?: string;
      title?: string;
    };
  }>;
}

export interface NewsResponse {
  articles: Article[];
}