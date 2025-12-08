import React, { useEffect, useState } from 'react';
import { Article } from '../types';
import { generateFullArticle } from '../services/geminiService';
import { Icons, TBLogo } from '../constants.tsx';
import ReactMarkdown from 'react-markdown';

interface ArticleDetailProps {
  article: Article;
  onClose: () => void;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, onClose }) => {
  const [fullContent, setFullContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    // Lock body scroll
    document.body.style.overflow = 'hidden';

    generateFullArticle(article.title, article.summary, article.source)
      .then(text => {
        if (isMounted) {
          setFullContent(text);
          setLoading(false);
        }
      });

    return () => { 
      isMounted = false; 
      document.body.style.overflow = 'auto';
    };
  }, [article]);

  return (
    <div className="fixed inset-0 z-[100] bg-paper dark:bg-paper-dark overflow-y-auto animate-fade-in">
      
      {/* Top Navigation */}
      <div className="sticky top-0 z-10 w-full bg-paper/95 dark:bg-paper-dark/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center px-4 md:px-6 py-4 transition-all duration-300">
         <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-2 -ml-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors group"
            >
               <Icons.X className="w-6 h-6 text-neutral-800 dark:text-neutral-200 group-hover:scale-110 transition-transform" />
            </button>
            <span className="hidden md:inline-block font-serif italic text-neutral-500 dark:text-neutral-400">
              Return to Dispatch
            </span>
         </div>
         
         <div className="flex items-center gap-3 md:gap-6">
            <button className="p-2 text-neutral-400 hover:text-primary transition-colors" title="Save to Bookmarks">
               <Icons.Bookmark className="w-5 h-5" />
            </button>
            <button className="p-2 text-neutral-400 hover:text-primary transition-colors" title="Share Article">
               <Icons.Share className="w-5 h-5" />
            </button>
            <a 
               href={article.url} 
               target="_blank" 
               rel="noreferrer"
               className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-[10px] uppercase tracking-[0.15em] font-medium hover:opacity-80 transition-opacity"
            >
               <span className="hidden md:inline">Original</span> Source <Icons.ExternalLink className="w-3 h-3" />
            </a>
         </div>
      </div>

      <div className="max-w-[720px] mx-auto px-4 md:px-6 py-12 md:py-20 pb-40">
        {/* Article Header */}
        <header className="mb-12 text-center animate-slide-up">
           <div className="inline-block mb-8">
             <span className="px-3 py-1 border-b border-primary text-primary text-[10px] font-bold uppercase tracking-[0.25em]">
               {article.source}
             </span>
           </div>
           
           <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-medium text-neutral-900 dark:text-neutral-100 leading-[1.1] mb-8">
             {article.title}
           </h1>
           
           <div className="flex items-center justify-center gap-4 text-xs text-neutral-400 font-mono uppercase tracking-widest">
              <span className="flex items-center gap-2"><Icons.Clock className="w-3 h-3" /> {article.timestamp}</span>
           </div>
        </header>

        {/* Hero Image */}
        {(article.imageUrl && !imageError) ? (
          <div className="w-full aspect-[21/9] mb-12 overflow-hidden bg-neutral-100 dark:bg-neutral-900 shadow-sm animate-fade-in">
             <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
             />
          </div>
        ) : (
          <div className="w-full aspect-[21/9] mb-12 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
             <TBLogo className="w-12 h-12 text-neutral-200 dark:text-neutral-800" />
          </div>
        )}

        {/* Article Body */}
        <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none font-serif leading-loose">
          {/* Executive Summary/Intro */}
          <p className="lead text-xl md:text-2xl text-neutral-800 dark:text-neutral-200 italic font-medium mb-12 leading-relaxed">
            {article.summary}
          </p>
          
          <div className="flex items-center justify-center my-12 opacity-30">
             <div className="w-16 h-px bg-neutral-400"></div>
             <div className="px-4"><TBLogo className="w-4 h-4"/></div>
             <div className="w-16 h-px bg-neutral-400"></div>
          </div>

          {/* Generated Content */}
          {loading ? (
             <div className="space-y-8 py-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <TBLogo className="w-8 h-8 text-neutral-300 dark:text-neutral-700 animate-pulse" />
                  <span className="text-xs font-serif italic text-neutral-400">Curating your brief...</span>
                </div>
             </div>
          ) : (
            <div className="markdown-body text-neutral-900 dark:text-neutral-300 animate-fade-in">
              <ReactMarkdown 
                components={{
                  h1: ({node, ...props}) => <h2 className="text-2xl md:text-3xl font-medium mt-16 mb-6 font-serif text-ink dark:text-ink-dark" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl md:text-2xl font-medium mt-16 mb-6 font-serif border-b border-neutral-200 dark:border-neutral-800 pb-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg md:text-xl font-medium mt-10 mb-4 font-serif text-primary" {...props} />,
                  p: ({node, ...props}) => <p className="mb-6 font-serif text-lg md:text-xl leading-[1.8] text-neutral-700 dark:text-neutral-300" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-none pl-0 mb-8 space-y-4" {...props} />,
                  li: ({node, ...props}) => (
                    <li className="flex gap-4 text-lg md:text-xl font-serif text-neutral-700 dark:text-neutral-300" {...props}>
                      <span className="text-primary mt-1.5 text-xs">◆</span>
                      <span>{props.children}</span>
                    </li>
                  ),
                  strong: ({node, ...props}) => <strong className="font-bold text-neutral-900 dark:text-white" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-primary pl-6 my-8 italic text-neutral-600 dark:text-neutral-400 text-xl" {...props} />
                }}
              >
                {fullContent || "## Service Temporarily Unavailable\n\nThe dispatch for this topic cannot be retrieved at this moment. Please verify the connection or consult the original source directly."}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-24 pt-12 border-t border-neutral-200 dark:border-neutral-800 flex flex-col items-center text-center">
            <TBLogo className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mb-6" />
            <p className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-medium">
              The Intellectual Brief • Exclusive Report
            </p>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;