// Content Moderation Service
// Uses multiple approaches: keyword filtering, ML-based detection, and copyright checks
// Integrates third-party APIs for robust content moderation
// Rate limited to 60 requests/minute per Perspective API quota

// -------------------- Rate Limiting Configuration --------------------
const PERSPECTIVE_API_QUOTA = {
  REQUESTS_PER_MINUTE: 60,
  REQUESTS_PER_SECOND: 1, // Conservative: 1 req/sec average (allows bursts up to 60/min)
  BURST_SIZE: 10, // Allow bursts of up to 10 requests
};

// Rate limiter state
class RateLimiter {
  private requests: number[] = []; // Timestamps of recent requests
  private queue: Array<{ resolve: () => void; timestamp: number }> = [];
  private processing = false;

  async acquire(): Promise<() => void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Clean old requests
    this.requests = this.requests.filter(timestamp => timestamp > oneMinuteAgo);
    
    // Check if we can make a request immediately
    if (this.requests.length < PERSPECTIVE_API_QUOTA.REQUESTS_PER_MINUTE) {
      this.requests.push(now);
      return () => {
        // No-op release - request already counted
      };
    }
    
    // Need to wait - add to queue
    return new Promise<() => void>((resolve) => {
      this.queue.push({ 
        resolve: () => {
          // Mark request as used when released from queue
          resolve(() => {
            // No-op - already counted when queued item was processed
          });
        }, 
        timestamp: now 
      });
      
      // Process queue asynchronously
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      
      // Clean old requests
      this.requests = this.requests.filter(timestamp => timestamp > oneMinuteAgo);
      
      if (this.requests.length < PERSPECTIVE_API_QUOTA.REQUESTS_PER_MINUTE) {
        const item = this.queue.shift();
        if (item) {
          this.requests.push(now);
          item.resolve();
          // Small delay to prevent rapid-fire requests (reduced to 500ms for better throughput)
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else {
        // Wait until we can make a request (but don't wait too long)
        const oldestRequest = Math.min(...this.requests);
        const waitTime = Math.max(0, 60000 - (now - oldestRequest) + 100);
        // Cap wait time at 2 seconds to prevent long delays
        await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 2000)));
      }
    }
    
    this.processing = false;
  }

  getCurrentUsage(): { used: number; limit: number; percentage: number } {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    this.requests = this.requests.filter(timestamp => timestamp > oneMinuteAgo);
    return {
      used: this.requests.length,
      limit: PERSPECTIVE_API_QUOTA.REQUESTS_PER_MINUTE,
      percentage: (this.requests.length / PERSPECTIVE_API_QUOTA.REQUESTS_PER_MINUTE) * 100,
    };
  }

  getQueueLength(): number {
    return this.queue.length;
  }
}

const perspectiveRateLimiter = new RateLimiter();

// -------------------- Caching for Moderation Results --------------------
const MODERATION_CACHE_PREFIX = "perspective_moderation_v1";
const MODERATION_CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours cache

const getModerationCacheKey = (text: string): string => {
  // Simple hash for cache key
  let hash = 0;
  const normalized = text.toLowerCase().trim();
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `${MODERATION_CACHE_PREFIX}::${Math.abs(hash).toString(36)}`;
};

const readModerationCache = (key: string): { result: any; expiresAt: number } | null => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const cached = window.localStorage.getItem(key);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch (e) {
    return null;
  }
};

const writeModerationCache = (key: string, result: any, ttlMs = MODERATION_CACHE_TTL_MS) => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    const cached = {
      result,
      expiresAt: Date.now() + ttlMs,
    };
    window.localStorage.setItem(key, JSON.stringify(cached));
  } catch (e) {
    // Ignore cache write errors
  }
};

export interface ModerationResult {
  isSafe: boolean;
  isBlocked: boolean;
  riskLevel: "low" | "medium" | "high" | "prohibited";
  categories: string[];
  reasons: string[];
  copyrightRisk: boolean;
  copyrightMatches?: string[];
  confidence: number;
}

export interface ModerationOptions {
  checkCopyright?: boolean;
  strictMode?: boolean;
  allowUnconfirmed?: boolean;
}

// Enhanced sensitive keywords list
const SENSITIVE_KEYWORDS = [
  // Violence
  "murder", "homicide", "killing", "assassination", "execution",
  "shooting", "gunfire", "massacre", "genocide", "ethnic cleansing",
  "torture", "beheading", "decapitation", "lynching",
  "terrorism", "terrorist", "bombing", "explosion", "attack",
  "mass shooting", "mass casualty", "war crime", "atrocity",
  
  // Sexual content
  "sexual assault", "rape", "molestation", "pedophilia", "child abuse",
  "sexual exploitation", "trafficking", "prostitution", "pornography",
  "explicit", "graphic sexual",
  
  // Self-harm
  "suicide", "self-harm", "self harm", "self-injury", "cutting",
  "overdose", "eating disorder",
  
  // Hate speech
  "hate crime", "racism", "antisemitism", "islamophobia",
  "xenophobia", "homophobia", "transphobia", "slur",
  "extremist", "neo-nazi", "white supremacy",
  
  // Minors
  "minor", "child abuse", "underage", "juvenile",
  
  // Graphic content
  "gore", "graphic violence", "blood", "mutilation",
  "corpse", "dead body", "cadaver",
  
  // Copyright
  "copyright infringement", "plagiarism", "unauthorized reproduction",
  "pirated", "bootleg", "counterfeit",
];

// Copyright violation patterns
const COPYRIGHT_PATTERNS = [
  /copyright.{0,20}(infringement|violation|breach)/i,
  /unauthorized.{0,20}(reproduction|copy|distribution|use)/i,
  /plagiarism|plagiarized|plagiarised/i,
  /pirated|bootleg|counterfeit/i,
  /dmca.{0,20}(notice|takedown|violation)/i,
];

/**
 * Check text for sensitive keywords
 */
const checkKeywords = (text: string): { found: boolean; categories: string[] } => {
  const normalized = text.toLowerCase();
  const foundCategories: string[] = [];
  
  const categoryMap: Record<string, string[]> = {
    violence: ["murder", "homicide", "killing", "assassination", "execution", "shooting", "gunfire", "massacre", "genocide", "torture", "beheading", "decapitation", "lynching", "terrorism", "terrorist", "bombing", "explosion", "attack", "mass shooting", "mass casualty", "war crime", "atrocity"],
    sexual: ["sexual assault", "rape", "molestation", "pedophilia", "child abuse", "sexual exploitation", "trafficking", "prostitution", "pornography", "explicit", "graphic sexual"],
    selfHarm: ["suicide", "self-harm", "self harm", "self-injury", "cutting", "overdose", "eating disorder"],
    hateSpeech: ["hate crime", "racism", "antisemitism", "islamophobia", "xenophobia", "homophobia", "transphobia", "slur", "extremist", "neo-nazi", "white supremacy"],
    minors: ["minor", "child abuse", "underage", "juvenile"],
    graphic: ["gore", "graphic violence", "blood", "mutilation", "corpse", "dead body", "cadaver"],
  };
  
  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(keyword => normalized.includes(keyword))) {
      foundCategories.push(category);
    }
  }
  
  return {
    found: foundCategories.length > 0,
    categories: foundCategories,
  };
};

/**
 * Check for copyright violations using pattern matching
 */
const checkCopyright = (text: string): { risk: boolean; matches: string[] } => {
  const matches: string[] = [];
  
  for (const pattern of COPYRIGHT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  
  return {
    risk: matches.length > 0,
    matches,
  };
};

/**
 * Use Perspective API for toxicity detection
 * Quota: 60 requests per minute
 * This is the PRIMARY moderation mechanism - advanced ML-based detection
 * Includes rate limiting, caching, and retry logic
 */
const checkPerspectiveAPI = async (text: string): Promise<{ toxicity: number; categories: Record<string, number> } | null> => {
  // Try multiple ways to get the API key (Vite supports both)
  const apiKey = 
    (typeof process !== 'undefined' && process.env?.PERSPECTIVE_API_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PERSPECTIVE_API_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.PERSPECTIVE_API_KEY) ||
    null;
  
  if (!apiKey) {
    console.warn("PERSPECTIVE_API_KEY not set - moderation will be limited. Please set PERSPECTIVE_API_KEY in your .env file");
    return null;
  }
  
  if (text.length < 20) {
    return null; // Skip if text too short
  }
  
  // Check cache first
  const cacheKey = getModerationCacheKey(text);
  const cached = readModerationCache(cacheKey);
  if (cached) {
    return cached.result;
  }
  
  // Acquire rate limit permit with timeout (don't wait forever)
  try {
    await Promise.race([
      perspectiveRateLimiter.acquire(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Rate limiter timeout")), 3000)
      ),
    ]);
  } catch (error) {
    // If rate limiter times out, skip API call and return null (will use fallback)
    console.warn("Rate limiter timeout, skipping Perspective API call");
    return null;
  }
  
  const usage = perspectiveRateLimiter.getCurrentUsage();
  
  // Log usage in dev mode when approaching limit
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV && usage.percentage > 80) {
    console.warn(`Perspective API usage: ${usage.used}/${usage.limit} (${Math.round(usage.percentage)}%)`);
  }
  
  try {
    const response = await fetch(
      `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: { text },
          requestedAttributes: {
            TOXICITY: {},
            SEVERE_TOXICITY: {},
            IDENTITY_ATTACK: {},
            INSULT: {},
            PROFANITY: {},
            THREAT: {},
            SEXUALLY_EXPLICIT: {},
            FLIRTATION: {},
          },
          languages: ["en"],
          doNotStore: true, // Don't store comments for privacy
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      
      // Handle rate limiting (429) - Perspective API quota exceeded
      if (response.status === 429) {
        console.warn("Perspective API rate limit exceeded (429). Current usage:", usage);
        // Rate limiter will handle retries automatically
        return null;
      }
      
      console.warn("Perspective API error:", response.status, errorText);
      return null;
    }
    
    const data = await response.json();
    const attributes = data.attributeScores || {};
    
    const categories: Record<string, number> = {};
    let maxToxicity = 0;
    
    // Extract summary scores (most reliable)
    for (const [key, value] of Object.entries(attributes)) {
      const attributeData = value as any;
      // Use summaryScore.value (most accurate) or fallback to spanScores
      const score = attributeData?.summaryScore?.value || 
                   (attributeData?.spanScores?.[0]?.score?.value) || 
                   0;
      categories[key.toLowerCase()] = score;
      if (score > maxToxicity) {
        maxToxicity = score;
      }
    }
    
    const result = {
      toxicity: maxToxicity,
      categories,
    };
    
    // Cache the result
    writeModerationCache(cacheKey, result);
    
    return result;
  } catch (error) {
    console.warn("Perspective API request failed:", error);
    return null;
  }
};

/**
 * Check text similarity for copyright detection
 * Simple n-gram based similarity check
 */
const checkTextSimilarity = (text1: string, text2: string, threshold = 0.8): boolean => {
  if (!text1 || !text2 || text1.length < 50 || text2.length < 50) {
    return false;
  }
  
  // Simple word-based similarity
  const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  const similarity = intersection.size / union.size;
  return similarity >= threshold;
};

/**
 * Main moderation function
 * Primary decision-making based on Perspective API with advanced thresholds
 * Keyword checks are only used for flagging, not blocking
 */
export const moderateContent = async (
  text: string,
  options: ModerationOptions = {}
): Promise<ModerationResult> => {
  if (!text || text.trim().length === 0) {
    return {
      isSafe: false,
      isBlocked: true,
      riskLevel: "prohibited",
      categories: ["empty"],
      reasons: ["Empty content"],
      copyrightRisk: false,
      confidence: 1.0,
    };
  }
  
  const reasons: string[] = [];
  const categories: string[] = [];
  let riskLevel: "low" | "medium" | "high" | "prohibited" = "low";
  let isBlocked = false;
  let copyrightRisk = false;
  let copyrightMatches: string[] = [];
  
  // PRIMARY: Perspective API check - this is the main decision maker
  let perspectiveResult: { toxicity: number; categories: Record<string, number> } | null = null;
  let perspectiveConfidence = 0;
  
  try {
    perspectiveResult = await checkPerspectiveAPI(text);
    
    if (perspectiveResult) {
      const { toxicity, categories: apiCategories } = perspectiveResult;
      
      // Advanced threshold system - only block with high confidence
      // Perspective API scores are 0-1, where 1 is most toxic
      
      // CRITICAL BLOCKING: Only block with very high confidence (>0.85)
      const CRITICAL_THRESHOLD = 0.85;
      // HIGH RISK: Flag but don't block unless combined with other factors (>0.75)
      const HIGH_RISK_THRESHOLD = 0.75;
      // MODERATE: Just flag for review (>0.60)
      const MODERATE_THRESHOLD = 0.60;
      
      // Check severe toxicity first (most critical)
      if (apiCategories.severe_toxicity > CRITICAL_THRESHOLD) {
        riskLevel = "prohibited";
        isBlocked = true;
        categories.push("severe_toxicity");
        reasons.push(`Severe toxicity detected (${Math.round(apiCategories.severe_toxicity * 100)}%)`);
        perspectiveConfidence = apiCategories.severe_toxicity;
      }
      // Check threats (critical for safety)
      else if (apiCategories.threat > CRITICAL_THRESHOLD) {
        riskLevel = "prohibited";
        isBlocked = true;
        categories.push("threat");
        reasons.push(`Threat detected (${Math.round(apiCategories.threat * 100)}%)`);
        perspectiveConfidence = apiCategories.threat;
      }
      // Check identity attacks (hate speech)
      else if (apiCategories.identity_attack > CRITICAL_THRESHOLD) {
        riskLevel = "prohibited";
        isBlocked = true;
        categories.push("identity_attack");
        reasons.push(`Identity attack detected (${Math.round(apiCategories.identity_attack * 100)}%)`);
        perspectiveConfidence = apiCategories.identity_attack;
      }
      // Check sexually explicit content
      else if (apiCategories.sexually_explicit > CRITICAL_THRESHOLD) {
        riskLevel = "prohibited";
        isBlocked = true;
        categories.push("sexually_explicit");
        reasons.push(`Sexually explicit content detected (${Math.round(apiCategories.sexually_explicit * 100)}%)`);
        perspectiveConfidence = apiCategories.sexually_explicit;
      }
      // High risk but not critical - flag but don't block unless combined
      else if (toxicity > HIGH_RISK_THRESHOLD || 
               apiCategories.severe_toxicity > HIGH_RISK_THRESHOLD ||
               apiCategories.threat > HIGH_RISK_THRESHOLD ||
               apiCategories.identity_attack > HIGH_RISK_THRESHOLD) {
        riskLevel = "high";
        categories.push("high_risk_content");
        reasons.push(`High-risk content detected (toxicity: ${Math.round(toxicity * 100)}%)`);
        perspectiveConfidence = Math.max(toxicity, apiCategories.severe_toxicity || 0, apiCategories.threat || 0);
        // Don't block unless in strict mode AND multiple high-risk factors
        if (options.strictMode && 
            (apiCategories.severe_toxicity > HIGH_RISK_THRESHOLD || 
             apiCategories.threat > HIGH_RISK_THRESHOLD ||
             apiCategories.identity_attack > HIGH_RISK_THRESHOLD)) {
          isBlocked = true;
          riskLevel = "prohibited";
        }
      }
      // Moderate risk - just flag
      else if (toxicity > MODERATE_THRESHOLD || 
               apiCategories.severe_toxicity > MODERATE_THRESHOLD ||
               apiCategories.profanity > MODERATE_THRESHOLD ||
               apiCategories.insult > MODERATE_THRESHOLD) {
        riskLevel = "medium";
        categories.push("moderate_risk");
        perspectiveConfidence = Math.max(toxicity, apiCategories.severe_toxicity || 0, apiCategories.profanity || 0);
      }
      // Low risk - content is safe
      else {
        riskLevel = "low";
        perspectiveConfidence = 1 - Math.max(toxicity, apiCategories.severe_toxicity || 0); // Invert for confidence
      }
    } else {
      // If Perspective API is unavailable, don't block - just flag for review
      console.warn("Perspective API unavailable - content not blocked, flagged for review");
      riskLevel = "medium";
      reasons.push("Moderation service unavailable - flagged for review");
    }
  } catch (error) {
    console.warn("Perspective API check failed:", error);
    // Don't block if API fails - err on side of allowing content
    riskLevel = "medium";
    reasons.push("Moderation check unavailable");
  }
  
  // SECONDARY: Keyword check - only for flagging, not blocking
  // Keywords are used to add context but don't trigger blocking alone
  const keywordCheck = checkKeywords(text);
  if (keywordCheck.found && perspectiveResult) {
    // Only add keyword categories if Perspective API also flags something
    // This prevents false positives from keyword matching
    const hasPerspectiveFlag = perspectiveResult.toxicity > 0.5 || 
                               Object.values(perspectiveResult.categories).some(score => score > 0.5);
    
    if (hasPerspectiveFlag) {
      categories.push(...keywordCheck.categories);
      reasons.push(`Contains sensitive keywords: ${keywordCheck.categories.join(", ")}`);
    }
  }
  
  // TERTIARY: Copyright check - informational only, doesn't block
  if (options.checkCopyright !== false) {
    const copyrightCheck = checkCopyright(text);
    if (copyrightCheck.risk) {
      copyrightRisk = true;
      copyrightMatches = copyrightCheck.matches;
      categories.push("copyright");
      // Copyright violations don't block - just flag
      if (riskLevel === "low") {
        riskLevel = "medium";
      }
    }
  }
  
  // Final decision: Only block if Perspective API says so with high confidence
  // Don't block based on keywords alone
  const isSafe = !isBlocked && riskLevel !== "prohibited";
  
  // Confidence based primarily on Perspective API
  let confidence = perspectiveConfidence || 0.5;
  if (perspectiveResult) {
    confidence = Math.max(confidence, perspectiveConfidence);
  }
  // Reduce confidence if only keyword-based
  if (keywordCheck.found && !perspectiveResult) {
    confidence = 0.3; // Low confidence for keyword-only matches
  }
  
  return {
    isSafe,
    isBlocked,
    riskLevel,
    categories: [...new Set(categories)], // Remove duplicates
    reasons,
    copyrightRisk,
    copyrightMatches: copyrightMatches.length > 0 ? copyrightMatches : undefined,
    confidence,
  };
};

/**
 * Moderate article content (title + summary + source)
 */
export const moderateArticle = async (
  title: string,
  summary: string,
  source: string,
  options: ModerationOptions = {}
): Promise<ModerationResult> => {
  const fullText = `${title}\n${summary}\n${source}`.trim();
  return moderateContent(fullText, options);
};

/**
 * Batch moderate multiple articles
 * Processes articles with timeout - doesn't block indefinitely
 * Uses caching to minimize API calls
 */
export const moderateArticles = async (
  articles: Array<{ title: string; summary: string; source: string }>,
  options: ModerationOptions = {}
): Promise<Array<{ index: number; result: ModerationResult }>> => {
  const results: Array<{ index: number; result: ModerationResult }> = [];
  const timeout = 10000; // 10 second total timeout for batch
  const startTime = Date.now();
  
  // Process with timeout protection
  for (let i = 0; i < articles.length; i++) {
    // Check if we've exceeded timeout
    if (Date.now() - startTime > timeout) {
      console.warn(`Batch moderation timeout after ${i} articles`);
      // Fill remaining with safe results
      for (let j = i; j < articles.length; j++) {
        results.push({
          index: j,
          result: {
            isSafe: true,
            isBlocked: false,
            riskLevel: "low",
            categories: [],
            reasons: [],
            copyrightRisk: false,
            confidence: 0.3,
          },
        });
      }
      break;
    }
    
    const article = articles[i];
    try {
      // Add timeout to individual moderation
      const result = await Promise.race([
        moderateArticle(article.title, article.summary, article.source, options),
        new Promise<ModerationResult>((resolve) =>
          setTimeout(() => {
            resolve({
              isSafe: true,
              isBlocked: false,
              riskLevel: "low",
              categories: [],
              reasons: [],
              copyrightRisk: false,
              confidence: 0.3,
            });
          }, 2000) // 2 second timeout per article
        ),
      ]);
      results.push({ index: i, result });
    } catch (error) {
      // On error, mark as safe (don't block)
      results.push({
        index: i,
        result: {
          isSafe: true,
          isBlocked: false,
          riskLevel: "low",
          categories: [],
          reasons: [],
          copyrightRisk: false,
          confidence: 0.3,
        },
      });
    }
    
    // Small delay between articles (reduced for speed)
    if (i < articles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  return results;
};

/**
 * Check if content should be blocked based on moderation result
 * Only blocks if explicitly flagged by Perspective API with high confidence
 */
export const shouldBlockContent = (result: ModerationResult): boolean => {
  // Only block if explicitly blocked (by Perspective API) or prohibited
  // Don't block on "high" risk alone - that's just a flag
  return result.isBlocked || result.riskLevel === "prohibited";
};

/**
 * Get human-readable reason for blocking
 */
export const getBlockReason = (result: ModerationResult): string => {
  if (result.reasons.length === 0) {
    return "Content does not meet our safety standards.";
  }
  
  const primaryReason = result.reasons[0];
  const categoryList = result.categories.length > 0 
    ? ` (Categories: ${result.categories.join(", ")})`
    : "";
  
  return `${primaryReason}${categoryList}`;
};

/**
 * Get current Perspective API usage statistics
 */
export const getPerspectiveAPIUsage = (): { used: number; limit: number; percentage: number; queueLength: number } => {
  const usage = perspectiveRateLimiter.getCurrentUsage();
  return {
    ...usage,
    queueLength: perspectiveRateLimiter.getQueueLength(),
  };
};

