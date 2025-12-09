import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Article } from '../types';
import { generateRSSFeed } from '../utils/rss';
import { getAllCachedArticles } from '../utils/articleStorage';
import { fetchNews } from '../services/newsService';

/**
 * RSS Feed Page Component
 * This component generates and serves RSS XML feed
 * Note: For production, this should ideally be server-side rendered or a static file
 */
const RSSPage: React.FC = () => {
  const [rssContent, setRssContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateFeed = async () => {
      try {
        // Try to get articles from cache first
        let articles: Article[] = getAllCachedArticles();
        
        // If cache is empty or too small, fetch latest articles
        if (articles.length < 10) {
          try {
            const response = await fetchNews('Technology');
            articles = response.articles;
          } catch (err) {
            console.warn('Failed to fetch articles for RSS:', err);
          }
        }
        
        // Generate RSS feed
        const rss = generateRSSFeed(articles);
        setRssContent(rss);
      } catch (err) {
        console.error('Failed to generate RSS feed:', err);
        setRssContent('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>The Intellectual Brief</title><description>RSS feed generation error</description></channel></rss>');
      } finally {
        setLoading(false);
      }
    };

    generateFeed();
  }, []);

  // Note: For proper RSS feed serving, this should be server-side rendered
  // with Content-Type: application/rss+xml header
  // This client-side version is a fallback

  if (loading) {
    return (
      <div className="min-h-screen bg-paper dark:bg-paper-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600 dark:text-neutral-400">Generating RSS feed...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>RSS Feed • The Intellectual Brief</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <pre className="whitespace-pre-wrap font-mono text-xs p-4 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
        {rssContent}
      </pre>
    </>
  );
};

export default RSSPage;

