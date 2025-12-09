import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TBLogo, Icons } from '../constants.tsx';
import logo from '/assets/logo.png';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-paper dark:bg-paper-dark flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="text-center max-w-lg w-full">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <TBLogo className="w-24 h-24 mx-auto text-neutral-200 dark:text-neutral-800 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl md:text-7xl font-serif font-medium text-neutral-300 dark:text-neutral-700">
                404
              </span>
            </div>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-ink dark:text-ink-dark mb-4 animate-slide-up">
          Dispatch Not Found
        </h1>

        {/* Subheading */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 font-serif mb-4 leading-relaxed">
            The article you're looking for has been archived or may no longer be available.
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-500 font-serif italic">
            Our dispatches are curated daily, and older briefs may have been removed from circulation.
          </p>
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center my-12 opacity-30">
          <div className="w-16 h-px bg-neutral-400"></div>
          <div className="px-4">
            <TBLogo className="w-4 h-4" />
          </div>
          <div className="w-16 h-px bg-neutral-400"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Link
            to="/"
            className="flex items-center gap-2 px-8 py-3 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-primary dark:hover:bg-primary transition-colors group"
          >
            <Icons.Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Return to Dispatch
          </Link>
          
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-8 py-3 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
          >
            <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
        </div>

        {/* Footer Branding */}
        <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <img src={logo} alt="The Intellectual Brief" className="w-10 h-10 mx-auto mb-4 opacity-60" />
          <p className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-medium">
            The Intellectual Brief
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

