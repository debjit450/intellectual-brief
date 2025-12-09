import { Article, Category, NewsResponse } from "../types";

const NEWS_API_KEY = "pub_a8b20df5d4784922a5c0ec3d23578d6f";
const BASE_URL = "https://newsdata.io/api/1/latest";

const NEWS_CACHE_PREFIX = "tib_news_cache_v1";
const NEWS_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

type CachedNews = {
  timestamp: number;
  articles: Article[];
};

// Minimal country code -> label map for the main ones you’ll see
const COUNTRY_NAMES: Record<string, string> = {
  us: "United States",
  gb: "United Kingdom",
  in: "India",
  ca: "Canada",
  au: "Australia",
  de: "Germany",
  fr: "France",
  jp: "Japan",
  cn: "China",
};

const getNewsCacheKey = (category: Category, query?: string, countryParam?: string) => {
  const normalizedQuery = (query || "").trim().toLowerCase() || "___no_query___";
  const normalizedCountry = (countryParam || "").trim().toLowerCase() || "___no_country___";
  return `${NEWS_CACHE_PREFIX}::${category}::${normalizedQuery}::${normalizedCountry}`;
};

const mapApiToArticle = (item: any): Article => {
  // country in response is typically a 2-letter code, sometimes array
  const rawCountry = Array.isArray(item.country) ? item.country[0] : item.country;
  const countryCode =
    typeof rawCountry === "string" && rawCountry.length <= 3
      ? rawCountry.toLowerCase()
      : undefined;

  const countryName = countryCode
    ? COUNTRY_NAMES[countryCode] || countryCode.toUpperCase()
    : undefined;

  const rawCategory = item.category;
  const categories: string[] =
    Array.isArray(rawCategory)
      ? rawCategory
      : typeof rawCategory === "string"
      ? [rawCategory]
      : [];

  return {
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

    // NEW
    countryCode,
    countryName,
    categories,
  };
};

export const fetchNews = async (
  category: Category,
  query?: string,
  countryParam?: string // e.g. "us", "us,gb,ca,au,in" or undefined for global
): Promise<NewsResponse> => {
  const cacheKey = getNewsCacheKey(category, query, countryParam);

  // --- Try cache first (6 hour TTL) ---
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(cacheKey);
      if (raw) {
        const parsed: CachedNews = JSON.parse(raw);
        const isFresh = Date.now() - parsed.timestamp < NEWS_CACHE_TTL_MS;
        if (isFresh && Array.isArray(parsed.articles)) {
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
  };

  // Country filter: “US & World mainly” will map to a multi-country value
  if (countryParam && countryParam.trim().length > 0) {
    baseParams.country = countryParam;
  }

  if (query) {
    baseParams.q = query;
  } else {
    // Map UI Category -> NewsData category + optional query
    switch (category) {
      case "Technology":
        baseParams.category = "technology";
        break;
      case "Business":
        baseParams.category = "business";
        break;
      case "World":
        baseParams.category = "world";
        break;
      case "Top":
        baseParams.category = "top";
        break;
      case "Politics":
      case "Policy":
        baseParams.category = "politics";
        if (category === "Policy") {
          baseParams.q = "tech policy regulation antitrust privacy";
        }
        break;
      case "Science":
        baseParams.category = "science";
        break;
      case "Sports":
        baseParams.category = "sports";
        break;
      case "Health":
        baseParams.category = "health";
        break;
      case "Entertainment":
        baseParams.category = "entertainment";
        break;
      case "Environment":
        baseParams.category = "environment";
        break;
      case "Food":
        baseParams.category = "food";
        break;
      case "Education":
        baseParams.category = "education";
        break;
      case "Crime":
        baseParams.category = "crime";
        break;
      case "Domestic":
        baseParams.category = "domestic";
        break;
      case "Lifestyle":
        baseParams.category = "lifestyle";
        break;
      case "Tourism":
        baseParams.category = "tourism";
        break;
      case "Other":
        baseParams.category = "other";
        break;

      // Thematic sections built on top of NewsData categories:
      case "Artificial Intelligence":
        baseParams.category = "technology";
        baseParams.q = "artificial intelligence AI OpenAI DeepMind Anthropic";
        break;
      case "Venture Capital":
        baseParams.category = "business";
        baseParams.q = "venture capital startup funding series A series B IPO";
        break;
      case "Markets":
        baseParams.category = "business";
        baseParams.q =
          "stock market equities bonds economy inflation interest rates fed ECB";
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
    if (nextPage) params.page = nextPage;

    const url = `${BASE_URL}?${new URLSearchParams(params).toString()}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error("NewsData.io error:", res.status, res.statusText);
        break;
      }

      const data = await res.json();
      if (!data.results || !Array.isArray(data.results)) break;

      const mapped = data.results
        .filter((a: any) => a.title && a.link)
        .map(mapApiToArticle);

      articles.push(...mapped);

      nextPage = data.nextPage;
      if (!nextPage) break;
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
