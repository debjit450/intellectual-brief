import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import NewsFeed from '../components/NewsFeed';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';
import { Category, Article } from '../types';
import logo from '/assets/logo.png';

type EditionKey = "us_world" | "us" | "in" | "uk" | "global";

const EDITIONS: Record<
  EditionKey,
  { label: string; countryParam?: string }
> = {
  us_world: {
    label: "US & World",
    countryParam: "us,gb,ca,au,in",
  },
  us: {
    label: "US only",
    countryParam: "us",
  },
  in: {
    label: "India",
    countryParam: "in",
  },
  uk: {
    label: "UK",
    countryParam: "gb",
  },
  global: {
    label: "Global",
    countryParam: undefined,
  },
};

const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') as Category | null;
  const searchQueryParam = searchParams.get('q') || '';
  
  const [activeCategory, setActiveCategory] = useState<Category>(
    categoryParam || 'Technology'
  );
  const [searchQuery, setSearchQuery] = useState(searchQueryParam);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [edition, setEdition] = useState<EditionKey>("us_world");

  const { user } = useAuth();

  // Sync URL params with state
  React.useEffect(() => {
    if (categoryParam && categoryParam !== activeCategory) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  React.useEffect(() => {
    if (searchQueryParam !== searchQuery) {
      setSearchQuery(searchQueryParam);
    }
  }, [searchQueryParam]);

  // Update URL when category or search changes
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory !== 'Technology') {
      params.set('category', activeCategory);
    }
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    const newUrl = params.toString() 
      ? `/?${params.toString()}`
      : '/';
    window.history.replaceState({}, '', newUrl);
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const params = new URLSearchParams();
    if (activeCategory !== 'Technology') {
      params.set('category', activeCategory);
    }
    if (query) {
      params.set('q', query);
    }
    const newUrl = params.toString() 
      ? `/?${params.toString()}`
      : '/';
    window.history.pushState({}, '', newUrl);
  };

  const handleCategorySelect = (category: Category) => {
    setActiveCategory(category);
    setSearchQuery('');
    setIsSidebarOpen(false);
    const params = new URLSearchParams();
    if (category !== 'Technology') {
      params.set('category', category);
    }
    const newUrl = params.toString() 
      ? `/?${params.toString()}`
      : '/';
    window.history.pushState({}, '', newUrl);
  };

  const toggleBookmark = (id: string) => {
    if (!user) {
      setAuthMode('signup');
      setShowAuthModal(true);
      return;
    }
    setBookmarks(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  // Generate dynamic meta based on category and search
  const pageTitle = searchQuery 
    ? `Search: ${searchQuery} • The Intellectual Brief`
    : activeCategory !== 'Technology'
    ? `${activeCategory} • The Intellectual Brief`
    : 'The Intellectual Brief – Clarity in a noisy world.';
  
  const pageDescription = searchQuery
    ? `Search results for "${searchQuery}" on The Intellectual Brief. Find curated tech, AI, markets, and policy news.`
    : activeCategory !== 'Technology'
    ? `Latest ${activeCategory} news and analysis from The Intellectual Brief. Executive-ready briefings for decision-makers.`
    : 'Essential reading for the modern visionary. Curated tech, AI, markets, and policy news, plus AI-generated briefings.';
  
  const canonicalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}${window.location.search}`
    : `https://theintellectualbrief.online/${searchQuery || activeCategory !== 'Technology' ? '?' : ''}${searchQuery ? `q=${encodeURIComponent(searchQuery)}` : ''}${activeCategory !== 'Technology' ? `category=${encodeURIComponent(activeCategory)}` : ''}`;

  return (
    <div className="min-h-screen bg-paper dark:bg-paper-dark font-sans text-ink dark:text-ink-dark transition-colors duration-500">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        {activeCategory && <meta property="article:section" content={activeCategory} />}
        {searchQuery && <meta name="robots" content="noindex, follow" />}
      </Helmet>
      
      <Navbar
        onSearch={handleSearch}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenAuth={() => { setAuthMode('login'); setShowAuthModal(true); }}
      />

      <div className="max-w-[1600px] mx-auto relative flex">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed lg:sticky top-0 h-screen z-50 lg:z-auto bg-paper dark:bg-paper-dark transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl lg:shadow-none w-64`}>
          <Sidebar
            activeCategory={activeCategory}
            onSelectCategory={handleCategorySelect}
            bookmarksCount={bookmarks.length}
            className="pt-8"
            edition={edition}
            onChangeEdition={setEdition}
          />
        </div>

        <main className="flex-1 min-w-0">
          <NewsFeed
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            onSelectArticle={(article: Article) => {
              // Navigation will be handled by Link in ArticleCard
            }}
            bookmarks={bookmarks}
            toggleBookmark={toggleBookmark}
            countryParam={EDITIONS[edition].countryParam}
          />

          <footer className="border-t border-neutral-200 dark:border-neutral-800 py-20 text-center mt-20 bg-neutral-100 dark:bg-neutral-900/50">
            <div className="max-w-lg mx-auto px-6">
              <div className="mb-6 flex justify-center text-neutral-400">
                <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
              </div>
              <p className="text-xl font-serif italic text-neutral-600 dark:text-neutral-400 mb-6">
                "Knowledge is the new currency."
              </p>
              <div className="flex justify-center gap-6 text-xs text-neutral-400 font-mono uppercase tracking-widest mb-8">
                <a href="#" className="hover:text-primary">About</a>
                <a href="#" className="hover:text-primary">Masthead</a>
                <a href="#" className="hover:text-primary">Privacy</a>
              </div>
              <p className="text-[10px] text-neutral-400 font-sans">
                © 2024 The Intellectual Brief. All Rights Reserved.
              </p>
            </div>
          </footer>
        </main>
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      )}
    </div>
  );
};

export default HomePage;

