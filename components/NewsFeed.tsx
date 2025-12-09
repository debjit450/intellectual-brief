import React, { useEffect, useState, useCallback } from 'react';
import { Article, Category } from '../types';
import { fetchNews } from '../services/newsService';
import ArticleCard from './ArticleCard';
import { Icons, AD_CONFIG, TBLogo } from '../constants.tsx';
import SmartLoader from './SmartLoader';
import AdUnit from './AdUnit';

interface NewsFeedProps {
  activeCategory: Category;
  searchQuery: string;
  onSelectArticle?: (article: Article) => void;
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
  countryParam?: string;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ activeCategory, searchQuery, onSelectArticle, bookmarks, toggleBookmark, countryParam }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadNews = useCallback(async () => {
    setLoading(true);
    setError(false);
    setArticles([]);

    try {
      const response = await fetchNews(activeCategory, searchQuery, countryParam);
      setArticles(response.articles);
    } catch (e) {
      setError(true);
    }
    setLoading(false);
  }, [activeCategory, searchQuery, countryParam]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const heroArticle = articles.length > 0 ? articles[0] : null;
  const gridArticles = articles.length > 0 ? articles.slice(1) : [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16">

      {/* Manifesto / Header */}
      {!searchQuery && (
        <div className="mb-16 md:mb-24 text-center md:text-left animate-fade-in">
          <div className="inline-block border-b border-primary mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary pb-1">
              The Daily Dispatch
            </p>
          </div>
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-serif font-medium text-ink dark:text-ink-dark leading-[0.95] tracking-tight mb-8">
            Clarity in a <span className="italic text-neutral-400 font-light">noisy</span> world.
          </h1>
          <p className="max-w-xl text-neutral-500 dark:text-neutral-400 font-serif text-lg leading-relaxed">
            Essential reading for the modern visionary. Distilled facts, strategic insights, and curated perspectives from around the globe.
          </p>
        </div>
      )}

      {/* Category Header */}
      <div className="flex items-end justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-12 md:mb-16">
        <div>
          <h2 className="text-xl md:text-3xl font-serif font-medium text-ink dark:text-ink-dark italic">
            {searchQuery ? `Searching for "${searchQuery}"` : activeCategory}
          </h2>
        </div>
        <div className="hidden md:block text-right">
          <span className="block text-xs font-mono text-neutral-400 uppercase tracking-widest">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {loading ? (
        <SmartLoader />
      ) : articles.length > 0 ? (
        <div className="space-y-16 md:space-y-24">

          {/* Hero Section */}
          {heroArticle && (
            <div className="animate-fade-in">
              <ArticleCard
                article={heroArticle}
                variant="hero"
                onSelect={onSelectArticle}
                isBookmarked={bookmarks.includes(heroArticle.id)}
                onToggleBookmark={toggleBookmark}
              />
            </div>
          )}

          <div className="w-full h-px bg-neutral-200 dark:bg-neutral-800" />

          {/* Ad Unit */}
          <AdUnit slot={AD_CONFIG.slots.feed} className="w-full border-none bg-transparent my-0" />

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 md:gap-y-20">
            {gridArticles.map((article, idx) => (
              <div key={article.id} className="animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                <ArticleCard
                  article={article}
                  onSelect={onSelectArticle}
                  isBookmarked={bookmarks.includes(article.id)}
                  onToggleBookmark={toggleBookmark}
                />
              </div>
            ))}
          </div>

        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-32 md:py-48 text-center bg-neutral-50 dark:bg-neutral-900/20 border border-neutral-100 dark:border-neutral-800">
          <div className="mb-8 text-neutral-200 dark:text-neutral-800">
            <TBLogo className="w-20 h-20 md:w-32 md:h-32" />
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-medium text-neutral-900 dark:text-white mb-4">
            The Wire is Silent
          </h3>
          <p className="text-neutral-500 font-serif italic max-w-md text-base md:text-lg mb-10 px-6">
            We are unable to retrieve the latest dispatch at this moment. The connection to the archives may be temporarily interrupted.
          </p>
          <button
            onClick={loadNews}
            className="px-8 py-3 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-primary dark:hover:bg-primary transition-colors"
          >
            Reconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsFeed;