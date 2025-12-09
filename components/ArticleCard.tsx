import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';
import { Icons, TBLogo } from '../constants.tsx';
import { generateSlug } from '../utils/slug';

// Helper function to format country display
const formatCountry = (countryCode?: string, countryName?: string): string | null => {
  if (!countryCode && !countryName) return null;
  if (countryCode === 'us') return 'US';
  if (countryCode === 'gb') return 'UK';
  if (countryCode === 'in') return 'IN';
  return countryName || countryCode?.toUpperCase() || null;
};

interface ArticleCardProps {
  article: Article;
  onSelect?: (article: Article) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  variant?: 'hero' | 'standard' | 'compact';
}

const ArticleCard: React.FC<ArticleCardProps> = ({ 
  article, 
  onSelect, 
  isBookmarked, 
  onToggleBookmark,
  variant = 'standard' 
}) => {
  
  const [imageError, setImageError] = useState(false);
  const hasImage = !!article.imageUrl && !imageError;
  const articleSlug = generateSlug(article.title, article.id);
  const articleUrl = `/article/${articleSlug}`;

  if (variant === 'hero') {
    return (
      <Link 
        to={articleUrl}
        className="group relative w-full cursor-pointer block"
      >
        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden mb-8 bg-neutral-100 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
           {hasImage ? (
             <img 
               src={article.imageUrl} 
               alt={article.title}
               className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 saturate-[.9] group-hover:saturate-100"
               onError={() => setImageError(true)}
             />
           ) : (
             <div className="w-full h-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
                <TBLogo className="w-16 h-16 text-neutral-200 dark:text-neutral-800" />
             </div>
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"/>
        </div>

        <div className="flex flex-col gap-4 max-w-4xl mx-auto md:mx-0">
           <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] font-medium text-primary flex-wrap">
              <span>{article.source}</span>
              {formatCountry(article.countryCode, article.countryName) && (
                <>
                  <span className="w-px h-3 bg-neutral-300 dark:bg-neutral-700"></span>
                  <span className="px-2 py-0.5 bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 rounded">
                    {formatCountry(article.countryCode, article.countryName)}
                  </span>
                </>
              )}
              <span className="w-px h-3 bg-neutral-300 dark:bg-neutral-700"></span>
              <span className="text-neutral-500 dark:text-neutral-400">{article.timestamp}</span>
           </div>
           
           <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-medium text-ink dark:text-ink-dark leading-[1.05] group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors duration-300">
             {article.title}
           </h2>
           
           <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 font-serif leading-relaxed max-w-2xl line-clamp-3">
             {article.summary}
           </p>

           <div className="flex items-center gap-6 mt-4">
             <button 
                onClick={(e) => { e.stopPropagation(); onToggleBookmark(article.id); }}
                className="text-neutral-400 hover:text-primary transition-colors"
                title="Save Article"
             >
               <Icons.Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
             </button>
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-primary text-primary pb-1 group-hover:border-transparent transition-all">
               Read Brief
             </span>
           </div>
        </div>
      </Link>
    );
  }

  // Standard Editorial Card
  return (
    <Link 
      to={articleUrl}
      className="group flex flex-col h-full cursor-pointer pb-10 border-b border-neutral-200 dark:border-neutral-800 last:border-0 md:border-none block"
    >
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-between gap-2">
           <div className="flex items-center gap-2 flex-wrap">
             <span className="text-[9px] uppercase tracking-[0.2em] font-medium text-primary">
               {article.source}
             </span>
             {formatCountry(article.countryCode, article.countryName) && (
               <span className="px-1.5 py-0.5 bg-primary/10 dark:bg-primary/20 text-primary text-[8px] uppercase tracking-[0.15em] border border-primary/20 rounded">
                 {formatCountry(article.countryCode, article.countryName)}
               </span>
             )}
           </div>
           <button 
              onClick={(e) => { e.stopPropagation(); onToggleBookmark(article.id); }}
              className="text-neutral-300 hover:text-primary transition-colors flex-shrink-0"
           >
              <Icons.Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
           </button>
        </div>

        <h3 className="font-serif font-medium text-ink dark:text-ink-dark leading-[1.2] group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors text-xl md:text-2xl lg:text-3xl">
          {article.title}
        </h3>
      </div>

      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-3 font-serif mb-6 flex-1">
        {article.summary}
      </p>

      {hasImage ? (
        <div className="mt-auto">
          <div className="relative w-full aspect-[3/2] overflow-hidden bg-neutral-100 dark:bg-neutral-900 grayscale group-hover:grayscale-0 transition-all duration-700">
            <img 
               src={article.imageUrl} 
               alt={article.title}
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
               onError={() => setImageError(true)}
            />
          </div>
        </div>
      ) : (
         <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800"></div>
      )}
      
      <div className="mt-4 text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
        {article.timestamp}
      </div>
    </Link>
  );
};

export default ArticleCard;