import { Article } from '../types';
import { generateSlug } from './slug';

const BASE_URL = 'https://theintellectualbrief.online';

/**
 * Generates an RSS feed XML string from articles
 * @param articles - Array of articles to include in RSS feed
 * @returns XML string for RSS feed
 */
export function generateRSSFeed(articles: Article[]): string {
  const buildDate = new Date().toUTCString();
  
  const items = articles.slice(0, 50).map((article) => {
    const articleSlug = generateSlug(article.title, article.id);
    const articleUrl = `${BASE_URL}/article/${articleSlug}`;
    const pubDate = article.timestamp 
      ? new Date(article.timestamp).toUTCString()
      : new Date().toUTCString();
    
    // Escape XML special characters
    const escapeXml = (unsafe: string): string => {
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const title = escapeXml(article.title);
    const description = escapeXml(article.summary || '');
    const category = article.category ? escapeXml(article.category) : '';
    const source = escapeXml(article.source || '');
    
    return `    <item>
      <title>${title}</title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <description><![CDATA[${article.summary || ''}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>The Intellectual Brief</author>
      ${category ? `<category>${category}</category>` : ''}
      ${source ? `<dc:creator>${source}</dc:creator>` : ''}
      ${article.imageUrl ? `<enclosure url="${article.imageUrl}" type="image/jpeg" />` : ''}
      <content:encoded><![CDATA[${article.summary || ''}]]></content:encoded>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:sy="http://purl.org/rss/1.0/modules/syndication/">
  <channel>
    <title>The Intellectual Brief</title>
    <link>${BASE_URL}</link>
    <description>Essential reading for the modern visionary. Curated tech, AI, markets, and policy news, plus AI-generated briefings.</description>
    <language>en-US</language>
    <copyright>Copyright ${new Date().getFullYear()} The Intellectual Brief</copyright>
    <managingEditor>The Intellectual Brief</managingEditor>
    <webMaster>The Intellectual Brief</webMaster>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <pubDate>${buildDate}</pubDate>
    <ttl>60</ttl>
    <image>
      <url>${BASE_URL}/assets/logo.png</url>
      <title>The Intellectual Brief</title>
      <link>${BASE_URL}</link>
      <width>144</width>
      <height>144</height>
    </image>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <sy:updatePeriod>hourly</sy:updatePeriod>
    <sy:updateFrequency>1</sy:updateFrequency>
${items}
  </channel>
</rss>`;
}

