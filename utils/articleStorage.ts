import { Article } from '../types';

const STORAGE_KEY = 'tib_articles_cache';
const MAX_CACHED_ARTICLES = 500; // Limit cache size

/**
 * Stores an article in localStorage for later retrieval
 * @param article - The article to store
 */
export function storeArticle(article: Article): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const cache: Record<string, Article> = stored ? JSON.parse(stored) : {};

    // Store article by ID
    cache[article.id] = {
      ...article,
      // Add timestamp for potential future cleanup
      _cachedAt: Date.now(),
    } as Article & { _cachedAt?: number };

    // Limit cache size by removing oldest entries if needed
    const entries = Object.entries(cache);
    if (entries.length > MAX_CACHED_ARTICLES) {
      // Sort by cache timestamp and remove oldest
      const sorted = entries.sort((a, b) => {
        const aTime = (a[1] as Article & { _cachedAt?: number })._cachedAt || 0;
        const bTime = (b[1] as Article & { _cachedAt?: number })._cachedAt || 0;
        return aTime - bTime;
      });

      // Keep only the most recent MAX_CACHED_ARTICLES
      const toKeep = sorted.slice(-MAX_CACHED_ARTICLES);
      const newCache: Record<string, Article> = {};
      toKeep.forEach(([id, article]) => {
        newCache[id] = article;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCache));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    }
  } catch (err) {
    console.warn('Failed to store article in cache:', err);
  }
}

/**
 * Retrieves an article from localStorage by ID
 * @param id - The article ID
 * @returns The article if found, null otherwise
 */
export function getArticleById(id: string): Article | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const cache: Record<string, Article> = JSON.parse(stored);
    const article = cache[id];

    if (article) {
      // Remove the internal cache timestamp before returning
      const { _cachedAt, ...cleanArticle } = article as Article & { _cachedAt?: number };
      return cleanArticle;
    }

    return null;
  } catch (err) {
    console.warn('Failed to retrieve article from cache:', err);
    return null;
  }
}

/**
 * Retrieves all cached articles
 * @returns Array of all cached articles
 */
export function getAllCachedArticles(): Article[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const cache: Record<string, Article> = JSON.parse(stored);
    return Object.values(cache).map(article => {
      const { _cachedAt, ...cleanArticle } = article as Article & { _cachedAt?: number };
      return cleanArticle;
    });
  } catch (err) {
    console.warn('Failed to retrieve cached articles:', err);
    return [];
  }
}

