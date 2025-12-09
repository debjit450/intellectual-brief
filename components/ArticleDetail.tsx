import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Article } from '../types';
import { generateFullArticle } from '../services/geminiService';
import { Icons, TBLogo, AD_CONFIG } from '../constants.tsx';
import ReactMarkdown from 'react-markdown';
import logo from '/assets/logo.png';
import { generateSlug } from '../utils/slug';
import { storeArticle } from '../utils/articleStorage';
import AdUnit from './AdUnit';

interface ArticleDetailProps {
  article: Article;
  onClose: () => void;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, onClose }) => {
  const [fullContent, setFullContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // --- NEW: share feedback state ---
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const articleSlug = generateSlug(article.title, article.id);
  const articleUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/article/${articleSlug}`
    : `https://theintellectualbrief.online/article/${articleSlug}`;
  const title = `${article.title} • The Intellectual Brief`;
  const description =
    article.summary ||
    'Executive-ready brief from The Intellectual Brief on a key technology or business story.';

  // Generate keywords from article content
  const keywords = [
    article.title,
    article.category || '',
    article.source,
    'technology news',
    'AI news',
    'business intelligence',
    'executive brief',
    'The Intellectual Brief'
  ].filter(Boolean).join(', ');

  // Parse timestamp to ISO date if possible
  const publishedDate = article.timestamp
    ? new Date(article.timestamp).toISOString()
    : new Date().toISOString();

  // Estimate word count from content (will update when fullContent loads)
  const currentContent = fullContent || article.summary || '';
  const wordCount = currentContent.split(/\s+/).length;

  useEffect(() => {
    let isMounted = true;

    // Store article in localStorage for later retrieval by shared links
    storeArticle(article);

    // Don't lock body scroll when used as a route component
    // Only lock if it's being used as a modal (check if onClose navigates)
    // For now, we'll allow scrolling since it's a full page

    const loadFullArticle = async () => {
      setLoading(true);
      try {
        const text = await generateFullArticle(
          article.title,
          article.summary,
          article.source
        );
        if (isMounted) {
          setFullContent(text);
        }
      } catch (err) {
        console.error("Failed to load full article:", err);
        if (isMounted) {
          setFullContent(
            "## Service Temporarily Unavailable\n\nThe dispatch for this topic cannot be retrieved at this moment. Please verify the connection or consult the original source directly."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFullArticle();

    return () => {
      isMounted = false;
    };
  }, [article]);

  // --- NEW: Share handler (Web Share + clipboard fallback) ---
  const handleShare = async () => {
    if (typeof window === 'undefined') return;

    const shareUrl = articleUrl;
    const shareTitle = article.title;
    const shareText =
      article.summary ||
      'Executive-ready brief from The Intellectual Brief.';

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        setShareFeedback('Shared');
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        setShareFeedback('Link copied');
      } else {
        // Last-resort fallback
        window.prompt('Copy this link', shareUrl);
        setShareFeedback('Link ready');
      }
    } catch (err) {
      console.error('Share failed:', err);
      setShareFeedback('Could not share');
    } finally {
      // Auto-clear feedback after 2 seconds
      setTimeout(() => setShareFeedback(null), 2000);
    }
  };

  // Enhanced JSON-LD for this article (NewsArticle with comprehensive metadata)
  // This will be updated when fullContent loads via useEffect
  const articleLd = React.useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.summary,
    "image": article.imageUrl ? [
      {
        "@type": "ImageObject",
        "url": article.imageUrl,
        "width": 1200,
        "height": 630
      }
    ] : undefined,
    "author": {
      "@type": "Organization",
      "name": "The Intellectual Brief",
      "url": "https://theintellectualbrief.online"
    },
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": "The Intellectual Brief",
      "logo": {
        "@type": "ImageObject",
        "url": "https://theintellectualbrief.online/assets/logo.png",
        "width": 512,
        "height": 512
      },
      "sameAs": [
        "https://www.instagram.com/theintellectualbrief",
        "https://www.youtube.com/@theintellectualbrief",
        "https://x.com/TIBReports",
        "https://www.linkedin.com/company/theintellectualbrief"
      ]
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "url": articleUrl,
    "datePublished": publishedDate,
    "dateModified": publishedDate,
    "articleSection": article.category || "Technology",
    "keywords": keywords,
    "articleBody": currentContent,
    "wordCount": wordCount,
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "copyrightHolder": {
      "@type": "Organization",
      "name": "The Intellectual Brief"
    },
    "copyrightYear": new Date().getFullYear(),
    "mentions": article.source ? [{
      "@type": "Organization",
      "name": article.source
    }] : undefined
  }), [article, articleUrl, publishedDate, keywords, currentContent, wordCount]);

  // BreadcrumbList JSON-LD
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://theintellectualbrief.online/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": article.category || "Technology",
        "item": `https://theintellectualbrief.online/?category=${encodeURIComponent(article.category || 'Technology')}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": articleUrl
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content="The Intellectual Brief" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={articleUrl} />
        <meta httpEquiv="content-language" content="en-US" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="1 days" />
        <meta name="rating" content="general" />

        {/* AI Bot Optimizations - ChatGPT, Perplexity, Claude, etc. */}
        <meta name="ai:model" content="gpt-4, claude-3, gemini-pro" />
        <meta name="ai:content-type" content="news-article" />
        <meta name="ai:category" content={article.category || "Technology"} />
        <meta name="ai:source" content={article.source || ""} />

        {/* Open Graph - Enhanced */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:site_name" content="The Intellectual Brief" />
        <meta property="og:locale" content="en_US" />
        {article.imageUrl && <meta property="og:image" content={article.imageUrl} />}
        {article.imageUrl && <meta property="og:image:secure_url" content={article.imageUrl} />}
        {article.imageUrl && <meta property="og:image:width" content="1200" />}
        {article.imageUrl && <meta property="og:image:height" content="630" />}
        {article.imageUrl && <meta property="og:image:alt" content={article.title} />}
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="article:published_time" content={publishedDate} />
        <meta property="article:modified_time" content={publishedDate} />
        {article.category && <meta property="article:section" content={article.category} />}
        {article.category && <meta property="article:tag" content={article.category} />}
        {article.source && <meta property="article:author" content={article.source} />}
        <meta property="article:publisher" content="https://theintellectualbrief.online" />

        {/* Twitter Card - Enhanced */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {article.imageUrl && <meta name="twitter:image" content={article.imageUrl} />}
        {article.imageUrl && <meta name="twitter:image:alt" content={article.title} />}
        <meta name="twitter:site" content="@TIBReports" />
        <meta name="twitter:creator" content="@TIBReports" />
        <meta name="twitter:label1" content="Reading time" />
        <meta name="twitter:data1" content={`${Math.ceil(wordCount / 200)} min read`} />
        {article.category && <meta name="twitter:label2" content="Category" />}
        {article.category && <meta name="twitter:data2" content={article.category} />}

        {/* Additional Meta Tags */}
        <meta name="news_keywords" content={keywords} />
        <meta name="article:opinion" content="false" />
        <meta name="article:content_tier" content="free" />

        {/* Structured Data - Updated when content loads */}
        <script type="application/ld+json">
          {JSON.stringify(articleLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbLd)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-paper dark:bg-paper-dark overflow-y-auto animate-fade-in">

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

            {/* NEW: Share button wired up */}
            <button
              onClick={handleShare}
              className="relative p-2 text-neutral-400 hover:text-primary transition-colors"
              title="Share Article"
            >
              <Icons.Share className="w-5 h-5" />
              {shareFeedback && (
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase tracking-[0.16em] text-neutral-400">
                  {shareFeedback}
                </span>
              )}
            </button>

            <a
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-[10px] uppercase tracking-[0.15em] font-medium hover:opacity-80 transition-opacity"
            >
              <span className="hidden md:inline">Original</span> Source{" "}
              <Icons.ExternalLink className="w-3 h-3" />
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

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-medium text-neutral-900 dark:text-neutral-100 leading-[1.1] mb-8" itemProp="headline">
              {article.title}
            </h1>

            <div className="flex items-center justify-center gap-4 text-xs text-neutral-400 font-mono uppercase tracking-widest flex-wrap">
              <span className="flex items-center gap-2">
                <Icons.Clock className="w-3 h-3" /> {article.timestamp}
              </span>

              {(article.countryCode || article.countryName) && (
                <span className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-neutral-400" />
                  <span className="px-2 py-0.5 bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 rounded text-[10px] font-medium">
                    {article.countryCode === "us"
                      ? "US"
                      : article.countryCode === "gb"
                        ? "UK"
                        : article.countryCode === "in"
                          ? "IN"
                          : article.countryName || article.countryCode?.toUpperCase()}
                  </span>
                </span>
              )}
            </div>
          </header>

          {/* Hero Image */}
          {article.imageUrl && !imageError ? (
            <div className="w-full aspect-[21/9] mb-12 overflow-hidden bg-neutral-100 dark:bg-neutral-900 shadow-sm animate-fade-in">
              <img
                src={article.imageUrl}
                alt={`${article.title} - Featured image from ${article.source}`}
                title={article.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
                loading="eager"
                fetchPriority="high"
                itemProp="image"
              />
            </div>
          ) : (
            <div className="w-full aspect-[21/9] mb-12 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
              <TBLogo className="w-12 h-12 text-neutral-200 dark:text-neutral-800" />
            </div>
          )}

          {/* Article Body */}
          <article className="prose prose-lg prose-neutral dark:prose-invert max-w-none font-serif leading-loose" itemScope itemType="https://schema.org/NewsArticle">
            <p className="lead text-xl md:text-2xl text-neutral-800 dark:text-neutral-200 italic font-medium mb-12 leading-relaxed" itemProp="description">
              {article.summary}
            </p>

            {/* First In-Content Ad - After Summary */}
            <AdUnit
              slot={AD_CONFIG.slots.articleTop}
              format="horizontal"
              className="my-12"
              lazy={true}
              minHeight="250px"
            />

            <div className="flex items-center justify-center my-12 opacity-30">
              <div className="w-16 h-px bg-neutral-400"></div>
              <div className="px-4">
                <TBLogo className="w-4 h-4" />
              </div>
              <div className="w-16 h-px bg-neutral-400"></div>
            </div>

            {loading ? (
              <div className="space-y-8 py-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <TBLogo className="w-8 h-8 text-neutral-300 dark:text-neutral-700 animate-pulse" />
                  <span className="text-xs font-serif italic text-neutral-400">
                    Curating your brief...
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="markdown-body text-neutral-900 dark:text-neutral-300 animate-fade-in" itemProp="articleBody">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => (
                        <h2
                          className="text-2xl md:text-3xl font-medium mt-16 mb-6 font-serif text-ink dark:text-ink-dark"
                          {...props}
                        />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2
                          className="text-xl md:text-2xl font-medium mt-16 mb-6 font-serif border-b border-neutral-200 dark:border-neutral-800 pb-3"
                          {...props}
                        />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3
                          className="text-lg md:text-xl font-medium mt-10 mb-4 font-serif text-primary"
                          {...props}
                        />
                      ),
                      p: ({ node, ...props }) => (
                        <p
                          className="mb-6 font-serif text-lg md:text-xl leading-[1.8] text-neutral-700 dark:text-neutral-300"
                          {...props}
                        />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-none pl-0 mb-8 space-y-4" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li
                          className="flex gap-4 text-lg md:text-xl font-serif text-neutral-700 dark:text-neutral-300"
                          {...props}
                        >
                          <span className="text-primary mt-1.5 text-xs">◆</span>
                          <span>{props.children}</span>
                        </li>
                      ),
                      strong: ({ node, ...props }) => (
                        <strong
                          className="font-bold text-neutral-900 dark:text-white"
                          {...props}
                        />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote
                          className="border-l-2 border-primary pl-6 my-8 italic text-neutral-600 dark:text-neutral-400 text-xl"
                          {...props}
                        />
                      )
                    }}
                  >
                    {fullContent ||
                      "## Service Temporarily Unavailable\n\nThe dispatch for this topic cannot be retrieved at this moment. Please verify the connection or consult the original source directly."}
                  </ReactMarkdown>
                </div>

                {/* Middle In-Content Ad - Only show if content is substantial */}
                {fullContent && fullContent.length > 1500 && (
                  <AdUnit
                    slot={AD_CONFIG.slots.articleMiddle}
                    format="rectangle"
                    className="my-16"
                    lazy={true}
                    minHeight="250px"
                  />
                )}
              </>
            )}

            {/* Bottom Ad - Before Footer */}
            <AdUnit
              slot={AD_CONFIG.slots.articleBottom}
              format="horizontal"
              className="my-16"
              lazy={true}
              minHeight="250px"
            />
          </article>

          <div className="mt-24 pt-12 border-t border-neutral-200 dark:border-neutral-800 flex flex-col items-center text-center">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain mb-10" />
            <p className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-medium">
              The Intellectual Brief • Exclusive Report
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArticleDetail;
