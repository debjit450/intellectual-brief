import { Article } from "../types";
import { moderateArticleWithAI, shouldBlockContent, type ModerationResult } from "../services/contentModeration";

// Only block truly harmful content - not news reporting
// These are extreme cases that should never appear regardless of context
export const TRULY_HARMFUL_PATTERNS = [
  /child\s+(porn|sexual|exploitation)/i,
  /how\s+to\s+(make|build)\s+(bomb|weapon|explosive)/i,
  /instructions?\s+(for|to)\s+(kill|harm|attack)/i,
];

/**
 * Check for truly harmful content patterns only
 * News reporting about events is NOT blocked - only instructional harmful content
 */
export const containsTrulyHarmfulContent = (text: string): boolean => {
  const normalized = (text || "").toLowerCase();
  return TRULY_HARMFUL_PATTERNS.some((pattern) => pattern.test(normalized));
};

// Keep legacy export for backwards compatibility but make it permissive
export const containsSensitiveKeywords = (_text: string): boolean => {
  return false; // Disabled - use AI moderation instead
};

/**
 * Filter unsafe articles using AI-powered moderation
 * Fast, non-blocking, context-aware filtering
 */
export const filterUnsafeArticles = async (articles: Article[]): Promise<Article[]> => {
  if (articles.length === 0) return [];

  // Quick pattern check for truly harmful content (instant)
  const patternFiltered = articles.filter(
    (article) => !containsTrulyHarmfulContent(
      `${article.title} ${article.summary || ""}`
    )
  );

  // Run AI moderation in parallel with aggressive timeout
  try {
    const moderationPromises = patternFiltered.map((article) =>
      Promise.race([
        moderateArticleWithAI(article.title, article.summary || "", article.source || ""),
        // 2 second timeout per article - if slow, assume safe
        new Promise<ModerationResult>((resolve) =>
          setTimeout(() => {
            resolve({
              isSafe: true,
              isBlocked: false,
              riskLevel: "low",
              categories: [],
              reasons: ["Timeout - assumed safe"],
              copyrightRisk: false,
              confidence: 0.5,
            });
          }, 2000)
        ),
      ])
    );

    // Overall 3 second timeout for batch
    const moderationResults = await Promise.race([
      Promise.all(moderationPromises),
      new Promise<ModerationResult[]>((resolve) =>
        setTimeout(() => {
          resolve(patternFiltered.map(() => ({
            isSafe: true,
            isBlocked: false,
            riskLevel: "low" as const,
            categories: [],
            reasons: ["Batch timeout"],
            copyrightRisk: false,
            confidence: 0.5,
          })));
        }, 3000)
      ),
    ]);

    // Only filter out articles that AI explicitly blocked
    return patternFiltered.filter((_, index) => {
      const result = moderationResults[index];
      return !result.isBlocked;
    });
  } catch (error) {
    console.warn("AI moderation error, showing all articles:", error);
    return patternFiltered;
  }
};

/**
 * Synchronous version - only checks truly harmful patterns
 */
export const filterUnsafeArticlesSync = (articles: Article[]): Article[] => {
  return articles.filter(
    (article) => !containsTrulyHarmfulContent(
      `${article.title} ${article.summary || ""}`
    )
  );
};

/**
 * Check if an article should be blocked using AI moderation
 */
export const isArticleBlocked = async (
  article: Article
): Promise<{ blocked: boolean; reason?: string; result?: ModerationResult }> => {
  // Quick pattern check first
  if (containsTrulyHarmfulContent(`${article.title} ${article.summary || ""}`)) {
    return {
      blocked: true,
      reason: "Contains harmful content patterns",
    };
  }

  try {
    const result = await moderateArticleWithAI(
      article.title,
      article.summary || "",
      article.source || ""
    );

    return {
      blocked: result.isBlocked,
      reason: result.reasons.join("; "),
      result,
    };
  } catch (error) {
    console.error("AI moderation check failed:", error);
    return { blocked: false };
  }
};
