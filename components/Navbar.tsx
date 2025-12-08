import React, { useState } from 'react';
import { Icons, TBLogo } from '../constants.tsx';
import { useAuth } from '../context/AuthContext';
import logo from '/assets/logo.png';
interface NavbarProps {
  onSearch: (query: string) => void;
  onMenuClick: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenAuth: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearch, onMenuClick, theme, onToggleTheme, onOpenAuth }) => {
  const [inputValue, setInputValue] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { user, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue);
    setShowMobileSearch(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-paper/95 dark:bg-paper-dark/95 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20 md:h-24">

          {/* Logo & Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 -ml-2 text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors"
              onClick={onMenuClick}
            >
              <Icons.Menu className="w-6 h-6" />
            </button>
            <div
              className="flex items-center gap-3 sm:gap-4 group cursor-pointer"
              onClick={() => window.location.reload()}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 text-neutral-900 dark:text-white group-hover:text-primary transition-colors duration-500">
                <img src={logo} alt="The Intellectual Brief Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-base sm:text-lg md:text-2xl font-serif font-bold text-neutral-900 dark:text-white leading-none tracking-tight">
                  The Intellectual Brief
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="flex-1 max-w-lg mx-4 sm:mx-8 md:mx-12 hidden md:block">
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                className="block w-full pl-0 pr-10 py-2 bg-transparent border-b border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-primary transition-colors font-serif italic text-lg"
                placeholder="Search the archives..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
                <Icons.Search className="h-4 w-4 text-neutral-400" />
              </div>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            {/* Mobile Search Toggle */}
            <button
              className="md:hidden p-2 text-neutral-500 dark:text-neutral-400"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <Icons.Search className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 text-neutral-400 hover:text-primary transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Icons.Sun className="w-5 h-5" /> : <Icons.Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 sm:gap-3 pl-2 pr-1 py-1 hover:opacity-70 transition-opacity">
                  <span className="hidden sm:block text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-white">
                    {user.name}
                  </span>
                  <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-serif font-bold text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700">
                    {user.name.charAt(0)}
                  </div>
                </button>
                <div className="absolute right-0 mt-4 w-48 bg-paper dark:bg-paper-dark rounded-none shadow-2xl border border-neutral-200 dark:border-neutral-800 hidden group-hover:block animate-fade-in z-50">
                  <button
                    onClick={logout}
                    className="w-full text-left px-6 py-4 text-sm font-serif italic text-neutral-600 dark:text-neutral-400 hover:text-primary hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Subscribe */}
                <button
                  onClick={onOpenAuth}
                  className="hidden sm:block px-6 py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-colors"
                >
                  Subscribe
                </button>

                {/* Mobile Subscribe */}
                <button
                  onClick={onOpenAuth}
                  className="sm:hidden px-3 py-1.5 border border-neutral-900 dark:border-neutral-100 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-900 dark:text-neutral-100 bg-transparent hover:bg-neutral-900 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-black transition-colors"
                >
                  Subscribe
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden px-4 pb-4 pt-2 animate-slide-up bg-paper dark:bg-paper-dark border-t border-neutral-200 dark:border-neutral-800">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              autoFocus
              className="block w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-200 placeholder-neutral-500 focus:border-primary outline-none font-serif italic"
              placeholder="Search intelligence..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </form>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
