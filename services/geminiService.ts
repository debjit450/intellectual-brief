import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// cache prefix for AI briefs
const AI_BRIEF_CACHE_PREFIX = "tib_ai_brief_v1";

const getBriefCacheKey = (title: string, source: string) => {
  // simple deterministic key based on title + source
  return `${AI_BRIEF_CACHE_PREFIX}::${title}::${source}`;
};

// Check if user has premium access
const checkPremiumAccess = (): boolean => {
  if (typeof window === 'undefined') return false;
  const plan = localStorage.getItem('user_subscription_plan');
  return plan === 'premium' || plan === 'enterprise';
};

// Check if content should be premium-only (you can customize this logic)
const isPremiumContent = (title: string, source: string): boolean => {
  // Example: Mark certain articles as premium-only
  // You can customize this based on your business logic
  const premiumKeywords = ['exclusive', 'premium', 'in-depth', 'analysis'];
  const titleLower = title.toLowerCase();
  return premiumKeywords.some(keyword => titleLower.includes(keyword));
};

// Existing analysis function
export const analyzeArticle = async (articleTitle: string, articleSource: string) => {
  const modelId = "gemini-2.5-flash"; 
  
  const prompt = `
    Provide a concise executive summary for the tech news story titled "${articleTitle}" from "${articleSource}".
    Format as a 3-point list of key implications for investors or developers.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    // @ts-ignore - depending on SDK version, adapt as needed
    return response.text;
  } catch (error) {
    console.error("Analysis Error:", error);
    return null;
  }
};

// New function to generate the full article body
// Now with localStorage caching: once generated, always reused
export const generateFullArticle = async (title: string, summary: string, source: string) => {
  const modelId = "gemini-2.5-flash";
  const cacheKey = getBriefCacheKey(title, source);
  const hasPremium = checkPremiumAccess();
  const isPremium = isPremiumContent(title, source);

  // Check if this is premium content and user doesn't have access
  if (isPremium && !hasPremium) {
    return "## ONLY AVAILABLE IN PAID PLANS\n\nThis article contains premium content that requires a Premium or Enterprise subscription. [Upgrade now](/pricing) to access exclusive in-depth analyses, premium intelligence briefs, and priority access to our AI-powered news analysis.";
  }

  // --- Try cache first (no expiry) ---
  if (typeof window !== "undefined") {
    try {
      const cached = window.localStorage.getItem(cacheKey);
      if (cached) {
        // Check if cached content is premium-only
        if (cached.includes("ONLY AVAILABLE IN PAID PLANS") && !hasPremium) {
          return cached;
        }
        // console.log("Serving AI brief from cache:", cacheKey);
        return cached;
      }
    } catch (err) {
      console.error("Failed to read AI brief cache:", err);
    }
  }

  const prompt = `
    You are a senior technology journalist for a top-tier publication like The New York Times or Bloomberg.
    Write a full, comprehensive news article (approx 600-800 words) based on the following headline and summary.
    
    Headline: "${title}"
    Source Context: "${source}"
    Summary Context: "${summary}"
    
    Requirements:
    1. Write in a sophisticated, objective, and professional tone.
    2. Structure with a compelling lead, body paragraphs with analysis, and a concluding thought.
    3. Use Markdown formatting for headers (#, ##) and emphasis.
    4. Do not invent fake quotes from specific real people unless they are public figures involved in the topic, otherwise use general attribution or analysis.
    5. Treat this as the definitive report on the subject.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    // @ts-ignore - adapt to SDK version
    const text = response.text as string | undefined;

    const content =
      text ||
      "## Service Unavailable\n\nWe are currently unable to retrieve the full intelligence report for this article. Please try again later or visit the original source.";

    // --- Persist generated brief so we never regenerate for same (title, source) ---
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(cacheKey, content);
      } catch (err) {
        console.error("Failed to write AI brief cache:", err);
      }
    }

    return content;
  } catch (error: any) {
    console.error("Article Generation Error:", error);
    
    // Check if error is due to service exhaustion or quota exceeded
    const errorMessage = error?.message?.toLowerCase() || '';
    const isQuotaExceeded = errorMessage.includes('quota') || 
                           errorMessage.includes('exceeded') || 
                           errorMessage.includes('rate limit') ||
                           errorMessage.includes('resource exhausted') ||
                           error?.code === 429 ||
                           error?.status === 429;

    if (isQuotaExceeded && !hasPremium) {
      return "## Service Temporarily Unavailable\n\nOur AI service is currently at capacity. **Premium subscribers have priority access** and alternative AI models to ensure uninterrupted service.\n\n[Upgrade to Premium](/pricing) to get:\n- Priority access when service is exhausted\n- Unlimited AI-generated briefs\n- Premium article content\n- Ad-free experience\n\n*Payment gateway integration coming soon. Contact us for early access.*";
    }

    return "## Service Temporarily Unavailable\n\nWe are currently unable to retrieve the full intelligence report for this article. Please try again later or visit the original source.";
  }
};
