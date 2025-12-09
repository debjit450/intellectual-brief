import { Article, Category, NewsResponse } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://tib-backend-bqvr.onrender.com";

export const fetchNews = async (
  category: Category,
  query?: string,
  countryParam?: string
): Promise<NewsResponse> => {
  const params = new URLSearchParams();

  params.set("category", category);

  if (query && query.trim().length > 0) {
    params.set("query", query.trim());
  }

  if (countryParam && countryParam.trim().length > 0) {
    params.set("countryParam", countryParam.trim());
  }

  const url = `${API_BASE_URL}/api/news?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Backend error: ${res.status} ${res.statusText}`);
  }

  const data: { articles: Article[] } = await res.json();
  // Articles are already in correct shape from backend
  return { articles: data.articles };
};
