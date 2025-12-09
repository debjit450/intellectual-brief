import { Article, Category, NewsResponse } from "../types";

const NEWS_API_KEY = "pub_6b4fe71437b14a8fa1a14eaa600e3f8a";
const BASE_URL = "https://newsdata.io/api/1/latest";

const NEWS_CACHE_PREFIX = "tib_news_cache_v1";
const NEWS_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

type CachedNews = {
  timestamp: number;
  articles: Article[];
};

const getNewsCacheKey = (category: Category, query?: string) => {
  const normalizedQuery = (query || "").trim().toLowerCase() || "___no_query___";
  return `${NEWS_CACHE_PREFIX}::${category}::${normalizedQuery}`;
};

const mapApiToArticle = (item: any): Article => ({
  id: item.article_id || item.link || Math.random().toString(36),
  title: item.title,
  source: item.source_id || item.source || "Unknown",
  summary: item.description || item.content || "No summary available.",
  timestamp: item.pubDate
    ? new Date(item.pubDate).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
      })
    : "",
  url: item.link,
  imageUrl: item.image_url,
  content: item.content || item.description,
});

export const fetchNews = async (
  category: Category,
  query?: string
): Promise<NewsResponse> => {
  const cacheKey = getNewsCacheKey(category, query);

  // --- Try cache first (6 hour TTL) ---
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(cacheKey);
      if (raw) {
        const parsed: CachedNews = JSON.parse(raw);
        const isFresh = Date.now() - parsed.timestamp < NEWS_CACHE_TTL_MS;
        if (isFresh && Array.isArray(parsed.articles)) {
          // console.log("Serving news from cache:", cacheKey);
          return { articles: parsed.articles };
        }
      }
    } catch (err) {
      console.error("Failed to read news cache:", err);
    }
  }

  // --- No fresh cache, hit API ---
  const baseParams: Record<string, string> = {
    apikey: NEWS_API_KEY,
    language: "en",
    // free tier: let size default
  };

  if (query) {
    baseParams.q = query;
  } else {
    switch (category) {
      case "Technology":
        baseParams.category = "technology";
        break;
      case "Business":
        baseParams.category = "business";
        break;
      case "Artificial Intelligence":
        baseParams.category = "technology";
        baseParams.q = "artificial intelligence AI OpenAI DeepMind";
        break;
      case "Venture Capital":
        baseParams.category = "business";
        baseParams.q = "venture capital startup funding series A";
        break;
      case "Markets":
        baseParams.category = "business";
        baseParams.q = "stock market equities economy finance";
        break;
      case "Policy":
        baseParams.category = "politics";
        baseParams.q = "tech policy regulation antitrust privacy";
        break;
      default:
        baseParams.category = "top";
        break;
    }
  }

  const articles: Article[] = [];
  let nextPage: string | undefined = undefined;

  const maxLoops = 5;

  for (let i = 0; i < maxLoops; i++) {
    const params: Record<string, string> = { ...baseParams };

    if (nextPage) {
      params.page = nextPage;
    }

    const url = `${BASE_URL}?${new URLSearchParams(params).toString()}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error("NewsData.io error:", res.status, res.statusText);
        break;
      }

      const data = await res.json();

      if (!data.results || !Array.isArray(data.results)) {
        break;
      }

      const mapped = data.results
        .filter((a: any) => a.title && a.link)
        .map(mapApiToArticle);

      articles.push(...mapped);

      nextPage = data.nextPage;
      if (!nextPage) {
        break;
      }
    } catch (err) {
      console.error("NewsData.io fetch failed:", err);
      break;
    }
  }

  // --- Store in cache ---
  if (typeof window !== "undefined") {
    try {
      const payload: CachedNews = {
        timestamp: Date.now(),
        articles,
      };
      window.localStorage.setItem(cacheKey, JSON.stringify(payload));
    } catch (err) {
      console.error("Failed to write news cache:", err);
    }
  }

  return { articles };
};
