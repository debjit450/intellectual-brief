import { Article, Category, NewsResponse } from "../types";

const NEWS_API_KEY = "pub_6b4fe71437b14a8fa1a14eaa600e3f8a";
const BASE_URL = "https://newsdata.io/api/1/latest";

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
  // base params – keep reasonably broad
  const baseParams: Record<string, string> = {
    apikey: NEWS_API_KEY,
    language: "en",
    // don't send size > 10 on free tier -> will error
    // omit size entirely and default to 10
  };

  // category / query logic
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

  // paginate using nextPage token (NOT page=1,2,…)
  // tweak maxLoops to control how many pages you pull
  const maxLoops = 5;

  for (let i = 0; i < maxLoops; i++) {
    const params: Record<string, string> = { ...baseParams };

    if (nextPage) {
      params.page = nextPage; // docs: page=nextPageString
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

      // Prepare for next page
      nextPage = data.nextPage;
      if (!nextPage) {
        break; // no more pages
      }
    } catch (err) {
      console.error("NewsData.io fetch failed:", err);
      break;
    }
  }

  return { articles };
};
