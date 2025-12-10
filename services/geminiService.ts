// aiBriefs.ts
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// -------------------- Config --------------------
const AI_BRIEF_CACHE_PREFIX = "tib_ai_brief_v4";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days (non-premium)
const PREMIUM_CACHE_TTL_MS = CACHE_TTL_MS * 4; // 28 days
const MAX_CONCURRENT_REQUESTS = 4;
const REQUEST_TIMEOUT_MS = 45_000;
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_COOLDOWN_MS = 1000 * 60 * 5;

// Official models (only these IDs)
const MODELS = {
  BEST_FT: "gemini-2.5-flash",
  LITE: "gemini-2.5-flash-lite",
  STABLE_FLASH: "gemini-2.0-flash",
  HIGH_THROUGHPUT: "gemini-1.5-flash",
  PRO: "gemini-2.5-pro",
};

// pluggable analytics hook
const sendAnalyticsEvent = (ev: { event: string; payload?: any }) => {
  console.debug("[AI_ANALYTICS]", ev.event, ev.payload ?? "");
};

// -------------------- Utilities --------------------

// SHA-256 hex (browser + node-safe fallback)
async function computeHashHex(input: string): Promise<string> {
  if (typeof crypto !== "undefined" && (crypto as any).subtle) {
    const enc = new TextEncoder();
    const data = enc.encode(input);
    const digest = await (crypto as any).subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

const getBriefCacheKey = async (title: string, source: string) => {
  const raw = `${AI_BRIEF_CACHE_PREFIX}::v1::${title}::${source}`;
  const hashed = await computeHashHex(raw);
  return `${AI_BRIEF_CACHE_PREFIX}::${hashed}`;
};

// semaphore
class Semaphore {
  private capacity: number;
  private queue: Array<() => void> = [];
  private current = 0;
  constructor(cap: number) { this.capacity = cap; }
  async acquire() {
    if (this.current < this.capacity) {
      this.current++;
      return () => this.release();
    }
    return new Promise<() => void>((resolve) => {
      this.queue.push(() => {
        this.current++;
        resolve(() => this.release());
      });
    });
  }
  private release() {
    this.current = Math.max(0, this.current - 1);
    if (this.queue.length) {
      const next = this.queue.shift();
      if (next) next();
    }
  }
}
const globalSemaphore = new Semaphore(MAX_CONCURRENT_REQUESTS);

// circuit breaker state
let consecutiveFailures = 0;
let circuitBrokenUntil = 0;
const isCircuitOpen = () => Date.now() < circuitBrokenUntil;

// backoff with jitter
const backoff = async (attempt: number) => {
  const base = Math.min(30_000, 500 * 2 ** attempt);
  const jitter = Math.random() * 500;
  const delay = base + jitter;
  await new Promise((r) => setTimeout(r, delay));
};

const isQuotaError = (err: any) => {
  const m = (err?.message || "").toString().toLowerCase();
  return (
    err?.status === 429 ||
    err?.code === 429 ||
    m.includes("quota") ||
    m.includes("rate limit") ||
    m.includes("exceeded") ||
    m.includes("resource exhausted")
  );
};

const withTimeout = async <T>(promiseFactory: (signal: AbortSignal) => Promise<T>, ms: number) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await promiseFactory(controller.signal);
  } finally {
    clearTimeout(id);
  }
};

// localStorage wrappers
const readCache = (key: string) => {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.meta?.expiresAt && Date.now() > parsed.meta.expiresAt) {
      window.localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch (e) {
    console.error("readCache error", e);
    return null;
  }
};
const writeCache = (key: string, value: any, ttlMs = CACHE_TTL_MS) => {
  try {
    if (typeof window === "undefined") return;
    const payload = {
      meta: { cachedAt: Date.now(), expiresAt: Date.now() + ttlMs, version: 1 },
      payload: value,
    };
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch (e) {
    console.error("writeCache error", e);
  }
};

// auth/premium checks (replace with real auth if needed)
const checkPremiumAccess = (): boolean => {
  if (typeof window === "undefined") return false;
  const plan = window.localStorage.getItem("user_subscription_plan");
  return plan === "premium" || plan === "enterprise";
};

// premium detection for content
const isPremiumContent = (title: string, source: string): boolean => {
  const premiumKeywords = ["exclusive", "premium", "in-depth", "analysis", "investor"];
  const titleLower = title.toLowerCase();
  return premiumKeywords.some((k) => titleLower.includes(k));
};

// -------------------- System Instructions --------------------
const SYSTEM_INSTRUCTIONS = `
SYSTEM INSTRUCTIONS (STRICT)
- You are a senior technology journalist and analyst. Produce accurate, evidence-first writing.
- Never fabricate quotes, numbers, or citations. If a specific fact is not present in the provided source or summary, state uncertainty explicitly (e.g., "not specified", "according to the source", "unconfirmed").
- When asked for "implications", consider the entire audience: readers, consumers, households, small businesses, policymakers, educators, and technologists — not only developers or investors.
- Provide clear, practical, and digestible action points or takeaways for everyday readers as well as sector stakeholders.
- Indicate degree of certainty for background facts: (Confirmed / Probable / Unknown).
- Do NOT invent URLs. Only include URLs if they are present in the provided source string.
- Keep word counts within requested bounds. If asked for 600-800 words, aim for ~700 and do not include visible wordcount lines in the article body.
- Output must be valid Markdown.
- At the end append a single HTML comment EXACTLY like: <!-- metadata: { "model":"<id>", "fallback":<bool>, "generatedAt":"<ISO>", "qualityScore": <0-100|null>, "wordcount": <int> } -->
`.trim();

const buildPrompt = (title: string, summary: string, source: string, extra?: string) => {
  return `
${SYSTEM_INSTRUCTIONS}

USER INSTRUCTIONS:
- Task: Write a full news article (600-800 words) with analysis and a concluding thought.
- Headline: ${JSON.stringify(title)}
- Source context: ${JSON.stringify(source)}
- Summary: ${JSON.stringify(summary)}
- Extra: ${extra ?? ""}

RESPONSE FORMAT:
- Do NOT prepend or append any visible read-time or wordcount lines. Only the canonical footer (HTML comment) is allowed.
- Use Markdown with sections: Lead, Analysis, Conclusion.
- Include a 3-point "Implications" section that provides distinct, practical takeaways for:
  1) everyday readers / consumers (what to know or do),
  2) small businesses / local operators (practical considerations),
  3) policymakers / educators / technologists (policy, product, or system-level implications).
  (Keep each implication 1-2 sentences; be concrete and avoid jargon.)
- At the end append ONE HTML comment: <!-- metadata: { "model":"<id>", "fallback":<bool>, "generatedAt":"<ISO>", "qualityScore": <0-100|null>, "wordcount": <int> } -->
`.trim();
};

// -------------------- Model Call Orchestration --------------------

const makeModelCall = async ({
  preferredModel,
  fallbacks = [],
  prompt,
  options = {},
}: {
  preferredModel: string;
  fallbacks?: string[];
  prompt: string;
  options?: { temperature?: number; maxOutputTokens?: number; topP?: number };
}) => {
  if (isCircuitOpen()) {
    throw new Error("AI service temporarily disabled due to repeated errors. Try again later.");
  }

  const release = await globalSemaphore.acquire();
  try {
    let attempt = 0;
    const chain = [preferredModel, ...fallbacks];
    for (const model of chain) {
      let lastErr: any = null;
      for (let tryIdx = 0; tryIdx < 2; tryIdx++) {
        attempt++;
        try {
          sendAnalyticsEvent({ event: "model_request_start", payload: { model, attempt } });
          const resp = await withTimeout(
            async (signal) => {
              return await ai.models.generateContent({
                model,
                contents: prompt,
                temperature: options.temperature ?? 0.0,
                maxOutputTokens: options.maxOutputTokens ?? 800,
                topP: options.topP ?? 1.0,
                ...(signal ? { signal } : {}),
              } as any);
            },
            REQUEST_TIMEOUT_MS
          );

          const text = resp?.text ?? resp?.output ?? (typeof resp === "string" ? resp : null);
          sendAnalyticsEvent({ event: "model_request_success", payload: { model, attempt } });

          consecutiveFailures = 0;
          return { text, usedModel: model, fallbackOccurred: model !== preferredModel, meta: { model, attempt } };
        } catch (err: any) {
          lastErr = err;
          sendAnalyticsEvent({ event: "model_request_error", payload: { model, attempt, error: String(err?.message || err) } });
          if (isQuotaError(err)) break; // move to fallback immediately
          await backoff(tryIdx + 1);
        }
      }
      if (lastErr && isQuotaError(lastErr)) continue;
    }

    consecutiveFailures++;
    if (consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD) {
      circuitBrokenUntil = Date.now() + CIRCUIT_BREAKER_COOLDOWN_MS;
      sendAnalyticsEvent({ event: "circuit_breaker_open", payload: { until: circuitBrokenUntil } });
    }
    throw new Error("All models failed or were rate-limited.");
  } finally {
    release();
  }
};

// -------------------- Quality Check (premium optional) --------------------
const runQualityCheck = async (generated: string, source: string) => {
  try {
    const prompt = `
You are a factuality and clarity judge. Return JSON: {"score": <0-100>, "notes": "<short notes>"}
Article: ${JSON.stringify(generated)}
Source: ${JSON.stringify(source)}
Rules: Base factuality only on overlap with the provided source text.
`.trim();

    const resp = await makeModelCall({
      preferredModel: MODELS.HIGH_THROUGHPUT,
      fallbacks: [MODELS.STABLE_FLASH],
      prompt,
      options: { temperature: 0.0, maxOutputTokens: 200 },
    });

    const text = resp.text ?? "";
    const jMatch = text.match(/\{[\s\S]*\}/);
    if (jMatch) {
      try {
        const parsed = JSON.parse(jMatch[0]);
        const score = Math.max(0, Math.min(100, Number(parsed.score || 0)));
        return { score, notes: parsed.notes ?? "" };
      } catch (e) {
        // continue
      }
    }
    return { score: 75, notes: "Fallback heuristic used." };
  } catch (e) {
    return { score: 70, notes: "Quality check failed." };
  }
};

// -------------------- Normalization & Validation --------------------
type GenMeta = {
  model?: string | null;
  fallback?: boolean;
  generatedAt?: string | null;
  qualityScore?: number | null;
  wordcount?: number | null;
  rawLegacy?: string[]; // removed legacy bits
};

const removeVisibleWordcountHints = (s: string) => {
  if (!s) return s;
  const patterns = [
    /^\s*Estimated\s+word\s+count[:\s]*~?\d+\b.*$\n?/gim,
    /^\s*Estimated\s+read\s+time[:\s]*[^\n]*$\n?/gim,
    /^\s*Reading\s+time[:\s]*[^\n]*$\n?/gim,
    /^\s*~?\d{2,4}\s*(words|word)\b.*$\n?/gim,
    /Estimated\s+word\s+count[:\s]*~?\d+\b/ig,
    /^\s*Estimated\s+word\s+count.*$\n?/gim,
  ];
  let out = s;
  for (const re of patterns) {
    out = out.replace(re, "");
  }
  out = out.replace(/^\s*~\d{2,4}\s*$/m, "");
  return out.trim();
};

const normalizeGeneratedContent = (raw: string): { contentWithFooter: string; body: string; meta: GenMeta } => {
  const resultMeta: GenMeta = { qualityScore: null, wordcount: null, rawLegacy: [] };
  let content = raw ?? "";

  // 0) Aggressively remove visible wordcount/read-time hints early
  content = removeVisibleWordcountHints(content);

  // 1) Extract canonical footer: <!-- metadata: { ... } -->
  const footerRegex = /<!--\s*metadata:\s*({[\s\S]*?})\s*-->\s*$/m;
  const footerMatch = content.match(footerRegex);
  if (footerMatch) {
    try {
      const jsonStr = footerMatch[1];
      const parsed = JSON.parse(jsonStr);
      resultMeta.model = parsed.model ?? null;
      resultMeta.fallback = parsed.fallback ?? false;
      resultMeta.generatedAt = parsed.generatedAt ?? null;
      resultMeta.qualityScore = parsed.qualityScore ?? null;
      resultMeta.wordcount = parsed.wordcount ?? null;
    } catch (e) {
      resultMeta.rawLegacy!.push("bad_footer_json");
    }
    content = content.replace(footerRegex, "").trim();
  }

  // 2) Remove legacy plaintext model lines (e.g., "model: gpt-4 ...")
  const legacyLineRegex = /^model:\s*[^\n]+\n?/gim;
  const legacyMatches = content.match(legacyLineRegex);
  if (legacyMatches && legacyMatches.length) {
    resultMeta.rawLegacy = resultMeta.rawLegacy!.concat(legacyMatches);
    content = content.replace(legacyLineRegex, "").trim();
  }

  // 3) Remove any remaining inline word hints again (safety)
  content = removeVisibleWordcountHints(content);

  // 4) compute precise word count
  const computedWordCount = content.split(/\s+/).filter(Boolean).length;
  if (!resultMeta.wordcount) resultMeta.wordcount = computedWordCount;

  // 5) normalize qualityScore: if float <=1 assumed 0..1
  if (typeof resultMeta.qualityScore === "number") {
    if (resultMeta.qualityScore <= 1.0) {
      resultMeta.qualityScore = Math.round(resultMeta.qualityScore * 100);
    } else {
      resultMeta.qualityScore = Math.round(resultMeta.qualityScore);
    }
  }

  // 6) Build canonical footer JSON (we keep this for cache/analytics)
  const canonicalMeta = {
    model: resultMeta.model ?? "unknown",
    fallback: !!resultMeta.fallback,
    generatedAt: resultMeta.generatedAt ?? new Date().toISOString(),
    qualityScore: typeof resultMeta.qualityScore === "number" ? resultMeta.qualityScore : null,
    wordcount: resultMeta.wordcount ?? computedWordCount,
  };

  const footerJson = `\n\n<!-- metadata: ${JSON.stringify(canonicalMeta)} -->`;
  const contentWithFooter = `${content.trim()}\n${footerJson}`;

  // body is the content WITHOUT the footer and without legacy stray lines (and with visible wordcount removed)
  const body = content.trim();

  return { contentWithFooter, body, meta: resultMeta };
};

// -------------------- Helper: stripFooterForPublish --------------------
const stripFooterForPublish = (contentWithFooter: string) => {
  return contentWithFooter.replace(/<!--\s*metadata:\s*({[\s\S]*?})\s*-->\s*$/m, "").trim();
};

// -------------------- Public API --------------------

/**
 * analyzeArticle: 3-point summary for general audiences
 */
export const analyzeArticle = async (articleTitle: string, articleSource: string) => {
  const hasPremium = checkPremiumAccess();
  const preferred = hasPremium ? MODELS.BEST_FT : MODELS.LITE;
  const fallbacks = [MODELS.STABLE_FLASH, MODELS.HIGH_THROUGHPUT];

  const prompt = `
${SYSTEM_INSTRUCTIONS}

Task: Provide a concise 3-point executive summary for the article:
Title: ${JSON.stringify(articleTitle)}
Source: ${JSON.stringify(articleSource)}

Constraints:
- 3 bullet points, each 1-2 sentences.
- For each bullet, include a one-line practical takeaway targeted at: everyday readers (what to know or do), small businesses/local operators, and policymakers/technologists (brief).
- Avoid jargon; be accessible to a general audience.
- If uncertain, use "According to the source" or "Not specified".
`.trim();

  try {
    const resp = await makeModelCall({
      preferredModel: preferred,
      fallbacks,
      prompt,
      options: { temperature: 0.0, maxOutputTokens: 220 },
    });
    sendAnalyticsEvent({ event: "analyze_article_served", payload: { model: resp.usedModel } });
    return resp.text ?? null;
  } catch (err: any) {
    console.error("analyzeArticle error", err);
    return null;
  }
};

/**
 * generateFullArticle:
 * - premium-aware model selection
 * - cache with TTL and versioning (stores full content + footer)
 * - returns (by default) the article body WITHOUT metadata/footer so UI never sees it
 *
 * opts:
 *  - forceRefresh?: boolean
 *  - publish?: boolean (default true) — if false, returns { body, meta, full } for admin/analytics
 */
export const generateFullArticle = async (
  title: string,
  summary: string,
  source: string,
  opts?: { forceRefresh?: boolean; publish?: boolean }
): Promise<string | { body: string; meta: any; full: string }> => {
  const cacheKey = await getBriefCacheKey(title, source);
  const hasPremium = checkPremiumAccess();
  const isPremium = isPremiumContent(title, source);

  if (isPremium && !hasPremium) {
    const gated = "## ONLY AVAILABLE IN PAID PLANS\n\nThis article contains premium content that requires a Premium or Enterprise subscription. [Upgrade now](/pricing) to access exclusive in-depth analyses, premium intelligence briefs, and priority access to our AI-powered news analysis.";
    writeCache(cacheKey, gated, CACHE_TTL_MS);
    return opts?.publish === false ? { body: gated, meta: { gated: true }, full: gated } : gated;
  }

  if (!opts?.forceRefresh) {
    const cached = readCache(cacheKey);
    if (cached) {
      sendAnalyticsEvent({ event: "ai_brief_cache_hit", payload: { key: cacheKey } });
      const cachedFull = cached.payload as string;
      const normalized = normalizeGeneratedContent(cachedFull);
      if (opts?.publish === false) {
        return { body: normalized.body, meta: normalized.meta, full: normalized.contentWithFooter };
      }
      return normalized.body;
    }
  }

  const userInstructions = `
Please produce a full news article (600-800 words). Keep objective tone, do not invent quotes, mark uncertain claims.
Include a 3-point "Implications" section that gives practical, non-technical takeaways for everyday readers, small businesses, and policymakers/technologists.
`;

  const prompt = buildPrompt(title, summary, source, userInstructions);

  const preferred = hasPremium ? MODELS.BEST_FT : MODELS.LITE;
  const fallbackChain = hasPremium
    ? [MODELS.LITE, MODELS.STABLE_FLASH, MODELS.HIGH_THROUGHPUT]
    : [MODELS.STABLE_FLASH, MODELS.HIGH_THROUGHPUT];

  try {
    const resp = await makeModelCall({
      preferredModel: preferred,
      fallbacks: fallbackChain,
      prompt,
      options: { temperature: 0.0, maxOutputTokens: 900 },
    });

    let content = resp.text ?? "";

    // Normalize (extract footer, remove legacy lines and visible wordcount hints)
    const normalized = normalizeGeneratedContent(content);
    const fullWithFooter = normalized.contentWithFooter; // for cache & audit
    let body = normalized.body; // the cleaned body (no footer, no legacy lines, no visible wordcount lines)

    // Optional quality check for premium users (we inject into cached footer only)
    if (hasPremium && body) {
      const q = await runQualityCheck(body, source);
      try {
        const footerRegex = /<!--\s*metadata:\s*({[\s\S]*?})\s*-->\s*$/m;
        const footerMatch = fullWithFooter.match(footerRegex);
        if (footerMatch) {
          const parsed = JSON.parse(footerMatch[1]);
          parsed.qualityScore = Number(q.score);
          parsed.generatedAt = parsed.generatedAt ?? new Date().toISOString();
          const updatedFull = `${body}\n\n<!-- metadata: ${JSON.stringify(parsed)} -->`;
          writeCache(cacheKey, updatedFull, hasPremium ? PREMIUM_CACHE_TTL_MS : CACHE_TTL_MS);
        } else {
          const freshMeta = {
            model: resp.usedModel ?? "unknown",
            fallback: !!resp.fallbackOccurred,
            generatedAt: new Date().toISOString(),
            qualityScore: q.score ?? null,
            wordcount: body.split(/\s+/).filter(Boolean).length,
          };
          const updatedFull = `${body}\n\n<!-- metadata: ${JSON.stringify(freshMeta)} -->`;
          writeCache(cacheKey, updatedFull, hasPremium ? PREMIUM_CACHE_TTL_MS : CACHE_TTL_MS);
        }
      } catch (e) {
        writeCache(cacheKey, fullWithFooter, hasPremium ? PREMIUM_CACHE_TTL_MS : CACHE_TTL_MS);
      }
    } else {
      writeCache(cacheKey, fullWithFooter, hasPremium ? PREMIUM_CACHE_TTL_MS : CACHE_TTL_MS);
    }

    sendAnalyticsEvent({
      event: "ai_brief_generated",
      payload: { model: resp.usedModel, fallback: resp.fallbackOccurred },
    });

    if (opts?.publish === false) {
      return { body, meta: normalized.meta, full: fullWithFooter };
    }
    return body;
  } catch (err: any) {
    console.error("generateFullArticle error", err);
    if (isQuotaError(err) && !hasPremium) {
      const message = "## Service Temporarily Unavailable\n\nOur AI service is currently at capacity. **Premium subscribers have priority access** and alternative AI models to ensure uninterrupted service.\n\n[Upgrade to Premium](/pricing) to get priority access, unlimited briefs, and premium content.\n";
      return message;
    }
    return "## Service Temporarily Unavailable\n\nWe are currently unable to retrieve the full intelligence report for this article. Please try again later or visit the original source.";
  }
};
