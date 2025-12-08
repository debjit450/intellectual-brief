import { Article, Category, NewsResponse } from "../types";

const NEWS_API_KEY = "f52c23315e6542cda7d0c0b604ac0cad";
const BASE_URL = "https://newsapi.org/v2/everything";

// --- Mock Data Fallback ---
const FALLBACK_DATA: Record<string, any[]> = {
  "business": [
    {
      "source": { "id": "bloomberg", "name": "Bloomberg" },
      "author": "Mark Gurman",
      "title": "Apple Plans Major Overhaul of Watch Design for Tenth Anniversary",
      "description": "Apple Inc. is planning a major redesign for its smartwatch, dubbed Apple Watch X, to mark the device's 10-year anniversary.",
      "url": "https://www.bloomberg.com/news/articles/2025-08-13/apple-watch-x-design-overhaul-planned-for-device-s-10th-anniversary",
      "urlToImage": "https://assets.bwbx.io/images/users/iqjWHBFdfxIU/i.v6.pX.j.m4/v1/1200x800.jpg",
      "publishedAt": "2025-08-13T12:00:00Z",
      "content": "Apple Inc. is preparing a significant overhaul..."
    },
    {
      "source": { "id": "wsj", "name": "The Wall Street Journal" },
      "author": "Chip Cutter",
      "title": "The New rules of Corporate Retreats",
      "description": "Companies are rethinking off-sites, mixing strategy sessions with wellness breaks.",
      "url": "https://www.wsj.com",
      "urlToImage": "https://images.wsj.net/im-999999?width=860&height=573",
      "publishedAt": "2025-08-14T09:00:00Z"
    }
  ],
  "ai": [
    {
      "source": { "id": "wired", "name": "Wired" },
      "author": "Will Knight",
      "title": "The Race to Build an AI That Can Reason Like a Human",
      "description": "DeepMind and OpenAI are pushing the boundaries of what large language models can do, targeting reasoning capabilities.",
      "url": "https://www.wired.com",
      "urlToImage": "https://media.wired.com/photos/65c536a00504764436573752/master/w_1600,c_limit/Business_OpenAI_Sora_Model.jpg",
      "publishedAt": "2025-09-01T14:30:00Z"
    }
  ]
};

const mapNewsApiToArticle = (item: any): Article => ({
  id: item.url || Math.random().toString(36),
  title: item.title,
  source: item.source.name,
  summary: item.description || item.content || "No summary available.",
  timestamp: new Date(item.publishedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' }),
  url: item.url,
  imageUrl: item.urlToImage,
  content: item.content
});

export const fetchNews = async (category: Category, query?: string): Promise<NewsResponse> => {
  let params: Record<string, string> = {
    apiKey: NEWS_API_KEY,
    language: 'en',
    sortBy: 'publishedAt',
  };

  if (query) {
    params.q = query;
  } else {
    switch (category) {
      case 'Technology':
        params.domains = 'techcrunch.com,wired.com,theverge.com';
        break;
      case 'Business':
        params.domains = 'bloomberg.com,wsj.com,cnbc.com,reuters.com';
        break;
      case 'Artificial Intelligence':
        params.q = '"artificial intelligence" OR "OpenAI" OR "DeepMind"';
        break;
      case 'Venture Capital':
        params.q = 'venture capital OR startup funding';
        break;
      case 'Markets':
        params.q = 'stock market OR economy';
        break;
      case 'Policy':
        params.q = 'tech policy OR regulation';
        break;
      default:
        params.domains = 'techcrunch.com';
    }
  }

  const queryString = new URLSearchParams(params).toString();
  
  try {
    const response = await fetch(`${BASE_URL}?${queryString}`);
    if (!response.ok) {
      throw new Error(`NewsAPI Error: ${response.status}`);
    }
    const data = await response.json();
    
    if (data.articles) {
      return {
        articles: data.articles.filter((a: any) => a.title && a.description).map(mapNewsApiToArticle)
      };
    }
    return { articles: [] };

  } catch (error) {
    console.warn("API Fetch failed, using fallback data for demonstration.", error);
    
    // Select fallback data based on category mapping
    let fallbackKey = 'business';
    if (category === 'Artificial Intelligence') fallbackKey = 'ai';
    
    const fallbackArticles = (FALLBACK_DATA[fallbackKey] || FALLBACK_DATA['business'])
      .map(mapNewsApiToArticle);

    // Shuffle slightly
    return { articles: fallbackArticles.sort(() => 0.5 - Math.random()) };
  }
};