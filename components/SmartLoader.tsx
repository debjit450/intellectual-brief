import React, { useState, useEffect } from 'react';
import { TBLogo } from '../constants.tsx';

const LOADING_MESSAGES = [
  "Curating Dispatch...",
  "Verifying Sources...",
  "Compiling Brief...",
  "Finalizing Report..."
];

const SmartLoader: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-32 min-h-[400px]">
      <div className="relative mb-8">
        <TBLogo className="w-16 h-16 text-neutral-300 dark:text-neutral-700 animate-pulse" />
      </div>

      <div className="flex flex-col items-center space-y-2">
        <span className="text-xs font-serif italic text-neutral-500 animate-fade-in">
          {LOADING_MESSAGES[messageIndex]}
        </span>
      </div>
    </div>
  );
};

export default SmartLoader;