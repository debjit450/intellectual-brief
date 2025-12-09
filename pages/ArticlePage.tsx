import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Article } from '../types';
import { generateSlug } from '../utils/slug';
import { fetchNews } from '../services/newsService';
import ArticleDetail from '../components/ArticleDetail';
import SmartLoader from '../components/SmartLoader';
import { TBLogo } from '../constants.tsx';

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
        // Extract ID from slug if present (last 8+ characters after final hyphen)
        const idMatch = slug.match(/-([a-z0-9]{8,})$/);
        const articleId = idMatch ? idMatch[1] : null;

        // Try to fetch articles from categories, starting with Technology (most common)
        const categories: Array<'Technology' | 'Business' | 'Artificial Intelligence' | 'Venture Capital' | 'Markets' | 'Policy'> = [
          'Technology',
          'Business',
          'Artificial Intelligence',
          'Venture Capital',
          'Markets',
          'Policy'
        ];

        let foundArticle: Article | null = null;

        // Search through categories
        for (const category of categories) {
          try {
            const response = await fetchNews(category);
            
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

  if (loading) {
    return (
      <div className="min-h-screen bg-paper dark:bg-paper-dark flex items-center justify-center">
        <SmartLoader />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-paper dark:bg-paper-dark flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <TBLogo className="w-20 h-20 mx-auto mb-6 text-neutral-300 dark:text-neutral-700" />
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
    );
  }

  return <ArticleDetail article={article} onClose={() => navigate('/')} />;
};

export default ArticlePage;

