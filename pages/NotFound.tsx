import React from 'react';
import { Link } from 'react-router-dom';
import { TBLogo } from '../constants.tsx';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-paper dark:bg-paper-dark flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <TBLogo className="w-20 h-20 mx-auto mb-6 text-neutral-300 dark:text-neutral-700" />
        <h1 className="text-4xl md:text-5xl font-serif font-medium text-ink dark:text-ink-dark mb-4">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-serif font-medium text-ink dark:text-ink-dark mb-4">
          Page Not Found
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 font-serif mb-8 leading-relaxed">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-primary dark:hover:bg-primary transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

