import { Article } from '../types';
import { generateSlug } from './slug';

const BASE_URL = 'https://theintellectualbrief.online';

/**
 * Generates a Google News sitemap XML string from articles
 * @param articles - Array of articles to include in news sitemap
 * @returns XML string for news sitemap
 */
export function generateNewsSitemap(articles: Article[]): string {
  // Filter articles from the last 2 days for news sitemap
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  const recentArticles = articles
    .filter(article => {
      if (!article.timestamp) return false;
      const articleDate = new Date(article.timestamp);
      return articleDate >= twoDaysAgo;
    })
    .slice(0, 1000); // Google News sitemap limit is 1000 articles

  const urlEntries = recentArticles
    .map((article) => {
      const articleUrl = `${BASE_URL}/article/${generateSlug(article.title, article.id)}`;
      const publishedDate = article.timestamp 
        ? new Date(article.timestamp).toISOString()
        : new Date().toISOString();
      
      const title = escapeXml(article.title);
      const publication = escapeXml(article.source || 'The Intellectual Brief');
      const keywords = [
        article.category || 'Technology',
        article.source,
        'technology news',
        'AI news',
        'business intelligence'
      ].filter(Boolean).join(', ');

      return `  <url>
    <loc>${escapeXml(articleUrl)}</loc>
    <news:news>
      <news:publication>
        <news:name>${publication}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${publishedDate}</news:publication_date>
      <news:title>${title}</news:title>
      ${keywords ? `<news:keywords>${escapeXml(keywords)}</news:keywords>` : ''}
      ${article.imageUrl ? `<news:image><news:loc>${escapeXml(article.imageUrl)}</news:loc></news:image>` : ''}
    </news:news>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Escapes XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

