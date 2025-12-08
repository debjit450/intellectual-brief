import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import NewsFeed from './components/NewsFeed';
import ArticleDetail from './components/ArticleDetail';
import AuthModal from './components/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Category, Article } from './types';
import { TBLogo } from './constants.tsx';
import { Analytics } from "@vercel/analytics/react"

const AppContent: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('Technology');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const { user } = useAuth();

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
  };

  const handleCategorySelect = (category: Category) => {
    setActiveCategory(category);
    setSearchQuery('');
    setIsSidebarOpen(false);
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

  return (
    <div className="min-h-screen bg-paper dark:bg-paper-dark font-sans text-ink dark:text-ink-dark transition-colors duration-500">

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
          />
        </div>

        <main className="flex-1 min-w-0">
          <NewsFeed
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            onSelectArticle={setSelectedArticle}
            bookmarks={bookmarks}
            toggleBookmark={toggleBookmark}
          />

          <footer className="border-t border-neutral-200 dark:border-neutral-800 py-20 text-center mt-20 bg-neutral-100 dark:bg-neutral-900/50">
            <div className="max-w-lg mx-auto px-6">
              <div className="mb-6 flex justify-center text-neutral-400">
                <TBLogo className="w-10 h-10" />
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

      {selectedArticle && (
        <ArticleDetail
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      )}
      <Analytics />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </HashRouter>
  );
};

export default App;