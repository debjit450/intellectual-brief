import { Article } from "../types";
import { moderateArticle, shouldBlockContent, type ModerationResult } from "../services/contentModeration";

// Legacy keyword check for quick client-side filtering (before full moderation)
export const SENSITIVE_KEYWORDS = [
  "abuse", "assault", "minor", "child", "suicide", "self-harm", "self harm",
  "sexual", "exploitation", "trafficking", "kidnap", "kidnapping", "abduction",
  "rape", "crime", "violent", "violence", "homicide", "murder", "shooting",
  "gunfire", "attack", "massacre", "terror", "explosion", "bomb", "graphic",
  "gore", "blood", "beheading", "decapitation", "hate", "extremist",
  "mass casualty", "war crime", "domestic violence", "copyright", "infringement",
  "lawsuit", "legal dispute", "piracy", "counterfeit",
];

/**
 * Quick keyword check for client-side filtering
 * For comprehensive moderation, use moderateContent() from contentModeration service
 */
export const containsSensitiveKeywords = (text: string): boolean => {
  const normalized = (text || "").toLowerCase();
  return SENSITIVE_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

/**
 * Filter unsafe articles using comprehensive moderation
 * Non-blocking: Shows articles immediately, filters progressively
 * Falls back to keyword filtering if moderation times out or fails
 */
export const filterUnsafeArticles = async (articles: Article[]): Promise<Article[]> => {
  // First, do quick keyword filtering to show articles immediately
  const keywordFiltered = articles.filter(
    (article) =>
      !containsSensitiveKeywords(
        `${article.title} ${article.summary} ${article.category || ""}`
      )
  );

  // If no articles after keyword filter, return empty (safety first)
  if (keywordFiltered.length === 0) {
    return [];
  }

  // Try moderation with timeout - don't block article loading
  try {
    // Set a timeout for moderation (5 seconds max)
    const moderationPromise = Promise.all(
      keywordFiltered.map((article) =>
        Promise.race([
          moderateArticle(article.title, article.summary || "", article.source || "", {
            checkCopyright: false, // Skip copyright check for speed
            strictMode: false, // Less strict for faster processing
          }),
          // Timeout after 3 seconds per article
          new Promise<ModerationResult>((resolve) =>
            setTimeout(() => {
              resolve({
                isSafe: true,
                isBlocked: false,
                riskLevel: "low",
                categories: [],
                reasons: [],
                copyrightRisk: false,
                confidence: 0.5,
              });
            }, 3000)
          ),
        ])
      )
    );

    // Overall timeout of 5 seconds for all moderation
    const moderationResults = await Promise.race([
      moderationPromise,
      new Promise<ModerationResult[]>((resolve) =>
        setTimeout(() => {
          // Return safe results on timeout
          resolve(
            keywordFiltered.map(() => ({
              isSafe: true,
              isBlocked: false,
              riskLevel: "low" as const,
              categories: [],
              reasons: [],
              copyrightRisk: false,
              confidence: 0.5,
            }))
          );
        }, 5000)
      ),
    ]);

    // Filter based on moderation results
    return keywordFiltered.filter((_, index) => {
      const result = moderationResults[index];
      return !shouldBlockContent(result);
    });
  } catch (error) {
    console.warn("Moderation service error, using keyword-filtered articles:", error);
    // Return keyword-filtered articles (better than nothing)
    return keywordFiltered;
  }
};

/**
 * Synchronous version for client-side use (uses keyword filtering only)
 * For full moderation, use the async version above
 */
export const filterUnsafeArticlesSync = (articles: Article[]): Article[] => {
  return articles.filter(
    (article) =>
      !containsSensitiveKeywords(
        `${article.title} ${article.summary} ${article.category || ""}`
      )
  );
};

/**
 * Check if an article should be blocked
 */
export const isArticleBlocked = async (
  article: Article
): Promise<{ blocked: boolean; reason?: string; result?: ModerationResult }> => {
  try {
    const result = await moderateArticle(
      article.title,
      article.summary || "",
      article.source || "",
      {
        checkCopyright: true,
        strictMode: true,
      }
    );

    return {
      blocked: shouldBlockContent(result),
      reason: result.reasons.join("; "),
      result,
    };
  } catch (error) {
    console.error("Moderation check failed:", error);
    // Fallback to keyword check
    const hasKeywords = containsSensitiveKeywords(
      `${article.title} ${article.summary} ${article.category || ""}`
    );
    return {
      blocked: hasKeywords,
      reason: hasKeywords ? "Contains sensitive keywords" : undefined,
    };
  }
};

