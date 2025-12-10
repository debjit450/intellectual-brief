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
  countryCode?: string;
  countryName?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  bookmarks: string[]; // Array of Article IDs
}

export type Category =
  | "Top"
  | "World"
  | "Business"
  | "Markets"
  | "Technology"
  | "Artificial Intelligence"
  | "Venture Capital"
  | "Politics"
  | "Policy"
  | "Science"
  | "Sports"
  | "Health"
  | "Entertainment"
  | "Environment"
  | "Education"
  | "Lifestyle"
  | "Food"
  | "Tourism"
  | "Other";

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