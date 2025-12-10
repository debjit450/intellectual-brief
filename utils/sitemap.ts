import { Article } from '../types';
import { generateSlug } from './slug';

const BASE_URL = 'https://theintellectualbrief.online';

/**
 * Generates a sitemap XML string from articles
 * @param articles - Array of articles to include in sitemap
 * @returns XML string for sitemap
 */
export function generateSitemap(articles: Article[]): string {
  const urls = [
    // Homepage
    {
      loc: BASE_URL,
      priority: '1.0',
      changefreq: 'hourly',
    },
    // Category pages
    {
      loc: `${BASE_URL}/?category=Technology`,
      priority: '0.9',
      changefreq: 'hourly',
    },
    {
      loc: `${BASE_URL}/?category=Business`,
      priority: '0.9',
      changefreq: 'hourly',
    },
    {
      loc: `${BASE_URL}/?category=Artificial Intelligence`,
      priority: '0.9',
      changefreq: 'hourly',
    },
    {
      loc: `${BASE_URL}/?category=Venture Capital`,
      priority: '0.9',
      changefreq: 'hourly',
    },
    {
      loc: `${BASE_URL}/?category=Markets`,
      priority: '0.9',
      changefreq: 'hourly',
    },
    {
      loc: `${BASE_URL}/?category=Policy`,
      priority: '0.9',
      changefreq: 'hourly',
    },
    // Article pages
    ...articles.map((article) => {
      // Use article timestamp if available, otherwise use current date
      const lastmod = article.timestamp 
        ? new Date(article.timestamp).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      return {
        loc: `${BASE_URL}/article/${generateSlug(article.title, article.id)}`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod,
      };
    }),
  ];

  const urlEntries = urls
    .map(
      (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <priority>${url.priority}</priority>
    <changefreq>${url.changefreq}</changefreq>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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

/**
 * Generates robots.txt content
 */
export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml`;
}

