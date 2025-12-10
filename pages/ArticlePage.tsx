import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Article, Category } from '../types';
import { generateSlug, extractIdFromSlug } from '../utils/slug';
import { fetchNews } from '../services/newsService';
import ArticleDetail from '../components/ArticleDetail';
import SmartLoader from '../components/SmartLoader';
import logo from '/assets/logo.png';
import { getArticleById, getAllCachedArticles, storeArticle } from '../utils/articleStorage';

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Scroll to top when article changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const loadArticle = async () => {
      if (!slug) {
        setError(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(false);

      try {
        // Extract ID from slug if present
        const articleId = extractIdFromSlug(slug);

        let foundArticle: Article | null = null;

        // First, try to get from localStorage cache
        if (articleId) {
          foundArticle = getArticleById(articleId);
        }

        // If not in cache, try to match by slug in all cached articles
        if (!foundArticle) {
          const cachedArticles = getAllCachedArticles();
          foundArticle = cachedArticles.find(
            (a) => generateSlug(a.title, a.id) === slug
          ) || null;
        }

        // If still not found, try fetching from API
        if (!foundArticle) {
          const categories: Array<'Technology' | 'Business' | 'Artificial Intelligence' | 'Venture Capital' | 'Markets' | 'Policy'> = [
            'Technology',
            'Business',
            'Artificial Intelligence',
            'Venture Capital',
            'Markets',
            'Policy'
          ];

          // First, try to find the article in cached articles to get its category
          const cachedArticles = getAllCachedArticles();
          const cachedMatch = cachedArticles.find(
            (a) => {
              if (articleId && a.id === articleId) return true;
              return generateSlug(a.title, a.id) === slug;
            }
          );

          // If we found a cached match with a category, try that category first
          const categoryToTryFirst = cachedMatch?.category as Category | undefined;
          const categoryList = categoryToTryFirst && categories.includes(categoryToTryFirst)
            ? [categoryToTryFirst, ...categories.filter(c => c !== categoryToTryFirst)]
            : categories;

          // Search through categories
          for (const category of categoryList) {
            try {
              const response = await fetchNews(category);
              
              // Store fetched articles in cache for future use
              response.articles.forEach(article => {
                storeArticle(article);
              });
              
              // First try to match by ID if we have it
              if (articleId) {
                const idMatch = response.articles.find((a) => a.id === articleId);
                if (idMatch) {
                  foundArticle = idMatch;
                  break;
                }
              }
              
              // Then try to match by slug
              const slugMatch = response.articles.find(
                (a) => generateSlug(a.title, a.id) === slug
              );
              if (slugMatch) {
                foundArticle = slugMatch;
                break;
              }
            } catch (e) {
              // Continue to next category
              console.warn(`Failed to fetch ${category}:`, e);
            }
          }
        }

        if (foundArticle) {
          setArticle(foundArticle);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to load article:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  // Generate SEO metadata even while loading (for initial render)
  // Always use canonical domain (non-www) for SEO consistency
  const canonicalDomain = 'https://theintellectualbrief.online';
  const articleSlug = slug || '';
  const articleUrl = `${canonicalDomain}/article/${articleSlug}`;
  
  // Basic SEO meta tags that are always present
  const defaultTitle = 'Article • The Intellectual Brief';
  const defaultDescription = 'Executive-ready brief from The Intellectual Brief on a key technology or business story.';
  
  // Enhanced SEO meta when article is loaded
  const seoTitle = article ? `${article.title} • The Intellectual Brief` : defaultTitle;
  const seoDescription = article 
    ? (article.summary || defaultDescription)
    : defaultDescription;
  const seoImage = article?.imageUrl || 'https://theintellectualbrief.online/assets/logo.png';
  const publishedDate = article?.timestamp 
    ? new Date(article.timestamp).toISOString()
    : new Date().toISOString();
  const keywords = article 
    ? [
        article.title,
        article.category || '',
        article.source,
        'technology news',
        'AI news',
        'business intelligence',
        'executive brief',
        'The Intellectual Brief'
      ].filter(Boolean).join(', ')
    : 'technology news, AI news, business intelligence, executive brief';

  if (loading) {
    return (
      <>
        <Helmet>
          <title>{defaultTitle}</title>
          <meta name="description" content={defaultDescription} />
          <link rel="canonical" href={articleUrl} />
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          <meta property="og:type" content="article" />
          <meta property="og:title" content={defaultTitle} />
          <meta property="og:description" content={defaultDescription} />
          <meta property="og:url" content={articleUrl} />
          <meta property="og:site_name" content="The Intellectual Brief" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={defaultTitle} />
          <meta name="twitter:description" content={defaultDescription} />
        </Helmet>
        <div className="min-h-screen bg-paper dark:bg-paper-dark flex items-center justify-center">
          <SmartLoader />
        </div>
      </>
    );
  }

  if (error || !article) {
    return (
      <>
        <Helmet>
          <title>Article Not Found • The Intellectual Brief</title>
          <meta name="description" content="The article you're looking for doesn't exist or may have been removed." />
          <meta name="robots" content="noindex, follow" />
          <link rel="canonical" href={articleUrl} />
        </Helmet>
        <div className="min-h-screen bg-paper dark:bg-paper-dark flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <img src={logo} alt="Logo" className="w-20 h-20 mx-auto mb-6 opacity-30" />
            <h1 className="text-3xl font-serif font-medium text-ink dark:text-ink-dark mb-4">
              Article Not Found
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 font-serif mb-8">
              The article you're looking for doesn't exist or may have been removed.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-primary dark:hover:bg-primary transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        {/* Enhanced SEO Meta Tags for Article Page */}
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content="The Intellectual Brief" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="slurp" content="index, follow" />
        <meta name="duckduckbot" content="index, follow" />
        <link rel="canonical" href={articleUrl} />
        <meta httpEquiv="content-language" content="en-US" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="1 days" />
        <meta name="rating" content="general" />

        {/* Open Graph - Enhanced for all social platforms */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:site_name" content="The Intellectual Brief" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:locale:alternate" content="en_GB" />
        {seoImage && <meta property="og:image" content={seoImage} />}
        {seoImage && <meta property="og:image:secure_url" content={seoImage} />}
        {seoImage && <meta property="og:image:width" content="1200" />}
        {seoImage && <meta property="og:image:height" content="630" />}
        {seoImage && <meta property="og:image:alt" content={article.title} />}
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="article:published_time" content={publishedDate} />
        <meta property="article:modified_time" content={publishedDate} />
        {article.category && <meta property="article:section" content={article.category} />}
        {article.category && <meta property="article:tag" content={article.category} />}
        {article.source && <meta property="article:author" content={article.source} />}
        <meta property="article:publisher" content="https://theintellectualbrief.online" />

        {/* Twitter Card - Enhanced */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        {seoImage && <meta name="twitter:image" content={seoImage} />}
        {seoImage && <meta name="twitter:image:alt" content={article.title} />}
        <meta name="twitter:site" content="@TIBReports" />
        <meta name="twitter:creator" content="@TIBReports" />

        {/* Additional Meta Tags for News Search */}
        <meta name="news_keywords" content={keywords} />
        <meta name="article:opinion" content="false" />
        <meta name="article:content_tier" content="free" />
        
        {/* Additional search engine meta tags for cross-platform visibility */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        
        {/* Microsoft/Bing specific */}
        <meta name="msapplication-TileColor" content="#141414" />
        
        {/* Apple specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* DC (Dublin Core) metadata for better indexing across all search engines */}
        <meta name="DC.title" content={article.title} />
        <meta name="DC.creator" content="The Intellectual Brief" />
        <meta name="DC.subject" content={article.category || "Technology"} />
        <meta name="DC.description" content={seoDescription} />
        <meta name="DC.publisher" content="The Intellectual Brief" />
        <meta name="DC.date" content={publishedDate} />
        <meta name="DC.type" content="Text" />
        <meta name="DC.format" content="text/html" />
        <meta name="DC.identifier" content={articleUrl} />
        <meta name="DC.language" content="en-US" />
        <meta name="DC.rights" content="Copyright The Intellectual Brief" />

        {/* Structured Data - NewsArticle Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": article.title,
            "description": seoDescription,
            "image": seoImage ? [
              {
                "@type": "ImageObject",
                "url": seoImage,
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
          })}
        </script>

        {/* BreadcrumbList Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
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
          })}
        </script>
      </Helmet>
      <ArticleDetail article={article} onClose={() => navigate('/')} />
    </>
  );
};

export default ArticlePage;

