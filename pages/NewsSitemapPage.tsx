import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Article } from '../types';
import { generateNewsSitemap } from '../utils/newsSitemap';
import { getAllCachedArticles } from '../utils/articleStorage';
import { fetchNews } from '../services/newsService';

/**
 * News Sitemap Page Component
 * This component generates and serves Google News sitemap XML dynamically
 * Note: For production, this should ideally be server-side rendered or a static file
 */
const NewsSitemapPage: React.FC = () => {
  const [sitemapContent, setSitemapContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateSitemapContent = async () => {
      try {
        // Try to get articles from cache first
        let articles: Article[] = getAllCachedArticles();
        
        // If cache is empty or too small, fetch latest articles from all categories
        if (articles.length < 50) {
          const categories: Array<'Technology' | 'Business' | 'Artificial Intelligence' | 'Venture Capital' | 'Markets' | 'Policy'> = [
            'Technology',
            'Business',
            'Artificial Intelligence',
            'Venture Capital',
            'Markets',
            'Policy'
          ];

          const allArticles: Article[] = [];
          const articleMap = new Map<string, Article>();

          // Fetch from all categories and deduplicate by ID
          for (const category of categories) {
            try {
              const response = await fetchNews(category);
              response.articles.forEach(article => {
                if (!articleMap.has(article.id)) {
                  articleMap.set(article.id, article);
                  allArticles.push(article);
                }
              });
            } catch (err) {
              console.warn(`Failed to fetch articles for ${category}:`, err);
            }
          }

          // Merge with cached articles
          articles.forEach(article => {
            if (!articleMap.has(article.id)) {
              articleMap.set(article.id, article);
              allArticles.push(article);
            }
          });

          articles = allArticles;
        }
        
        // Generate news sitemap
        const sitemap = generateNewsSitemap(articles);
        setSitemapContent(sitemap);
      } catch (err) {
        console.error('Failed to generate news sitemap:', err);
        // Fallback to empty news sitemap
        setSitemapContent(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
</urlset>`);
      } finally {
        setLoading(false);
      }
    };

    generateSitemapContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper dark:bg-paper-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600 dark:text-neutral-400">Generating news sitemap...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <meta httpEquiv="Content-Type" content="application/xml; charset=utf-8" />
      </Helmet>
      <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
        {sitemapContent}
      </pre>
    </>
  );
};

export default NewsSitemapPage;

