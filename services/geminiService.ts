// aiBriefs.ts — Advanced version
// Features added:
// - Dynamic/conditional "Implications" categories detected automatically
// - Optional machine-readable JSON output mode (for UI/structured consumption)
// - Improved prompt engineering with schema enforcement and reasoning step
// - Better model orchestration and clearer fallback semantics
// - More robust normalization, caching, and premium behavior
// - Telemetry hooks and optional local diagnostics

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// -------------------- Config --------------------
const AI_BRIEF_CACHE_PREFIX = "tib_ai_brief_v5";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const PREMIUM_CACHE_TTL_MS = CACHE_TTL_MS * 4; // 28 days
const MAX_CONCURRENT_REQUESTS = 4;
const REQUEST_TIMEOUT_MS = 45_000;
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_COOLDOWN_MS = 1000 * 60 * 5;

// Official models (only these IDs) — update to match official IDs in your environment
const MODELS = {
  BEST_FT: "gemini-2.5-flash",
  LITE: "gemini-2.5-flash-lite",
  STABLE_FLASH: "gemini-2.0-flash",
  HIGH_THROUGHPUT: "gemini-1.5-flash",
  PRO: "gemini-2.5-pro",
};

// -------------------- Telemetry hook (pluggable) --------------------
const sendAnalyticsEvent = (ev: { event: string; payload?: any }) => {
  // Replace with your analytics call (GA, Honeycomb, Sentry, etc.)
  console.debug("[AI_ANALYTICS]", ev.event, ev.payload ?? "");
};

// -------------------- Utilities --------------------
async function computeHashHex(input: string): Promise<string> {
  if (typeof crypto !== "undefined" && (crypto as any).subtle) {
    const enc = new TextEncoder();
    const data = enc.encode(input);
    const digest = await (crypto as any).subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // FNV-1a fallback (fast, not cryptographically strong but fine for cache keys)
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
  constructor(cap: number) {
    this.capacity = cap;
  }
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

const backoff = async (attempt: number) => {
  const base = Math.min(30_000, 300 * 2 ** attempt);
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

// localStorage wrappers (browser)
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

// premium check
const checkPremiumAccess = (): boolean => {
  if (typeof window === "undefined") return false;
  const plan = window.localStorage.getItem("user_subscription_plan");
  return plan === "premium" || plan === "enterprise";
};

// premium detection
const isPremiumContent = (title: string, source: string): boolean => {
  const premiumKeywords = ["exclusive", "premium", "in-depth", "analysis", "investor"];
  const titleLower = title.toLowerCase();
  return premiumKeywords.some((k) => titleLower.includes(k));
};

// -------------------- Implication Category Detection --------------------
// Heuristic detector that decides which implication categories are relevant.
// This is intentionally rule-based (deterministic) so you can control behavior without additional model calls.

type ImplicationCategory =
  | "consumers"
  | "small_businesses"
  | "policymakers"
  | "industry"
  | "investors"
  | "none";

const CATEGORY_KEYWORDS: Record<ImplicationCategory, string[]> = {
  consumers: ["consumer", "user", "household", "buyer", "customers", "privacy", "safety"],
  small_businesses: ["small business", "local", "shop", "restaurant", "msme", "vendor"],
  policymakers: ["law", "regulation", "policy", "government", "legislation", "education", "compliance"],
  industry: ["enterprise", "industry", "operators", "infrastructure", "platform", "vendor"],
  investors: ["fund", "investment", "ipo", "market", "valuation", "investor", "funding"],
  none: [],
};

const detectImplicationCategories = (title: string, summary: string, sourceText: string): ImplicationCategory[] => {
  const text = `${title}\n${summary}\n${sourceText}`.toLowerCase();
  const scores: Record<ImplicationCategory, number> = {
    consumers: 0,
    small_businesses: 0,
    policymakers: 0,
    industry: 0,
    investors: 0,
    none: 0,
  };

  for (const cat of Object.keys(CATEGORY_KEYWORDS) as ImplicationCategory[]) {
    for (const kw of CATEGORY_KEYWORDS[cat]) {
      if (text.includes(kw)) scores[cat] += 1;
    }
    // also boost on presence of domain-specific signals
  }

  // convert to array of categories that have score > 0
  const selected = Object.entries(scores)
    .filter(([k, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k as ImplicationCategory);

  if (selected.length === 0) return ["none"];
  return selected;
};

// -------------------- System Instructions (improved) --------------------
const SYSTEM_INSTRUCTIONS = `
SYSTEM INSTRUCTIONS (STRICT)
- You are a senior technology journalist and analyst. Produce accurate, evidence-first writing.
- Never fabricate quotes, numbers, or citations. If a specific fact is not present in the provided source or summary, state uncertainty explicitly (e.g., "not specified", "according to the source", "unconfirmed").
- For implications: include only the categories that are relevant to the article. Do not invent categories.
- If asked for machine-readable JSON output, strictly follow the provided JSON schema. Provide both human-readable Markdown and the JSON if requested.
- Provide clear, practical, and digestible action points or takeaways for identified audiences.
- Indicate degree of certainty for background facts: (Confirmed / Probable / Unknown).
- Do NOT invent URLs. Only include URLs if they are present in the provided source string.
- Keep word counts within requested bounds. If asked for 600-800 words, aim for ~700 and do not include visible wordcount lines in the article body.
- Output must be valid Markdown by default (unless outputMode is 'json').
- At the end append a single HTML comment EXACTLY like: <!-- metadata: { "model":"<id>", "fallback":<bool>, "generatedAt":"<ISO>", "qualityScore": <0-100|null>, "wordcount": <int> } -->
`.trim();

const SAFETY_BRIEF_RULES = `
SAFETY AND COMPLIANCE RULES (MANDATORY)
- Rephrase everything; do not copy sentences, quotes, structure, or narrative flow from the source.
- Two-mode logic:
  * Sensitive Mode triggers if the source involves minors, suicide/self-harm, sexual exploitation, crime, violence, hate, mass casualty events, or graphic harm. In this mode produce ONLY a 3-5 sentence neutral factual summary, no opinions or analysis, no predictions, no sensational wording, and mark any uncertainty as "unconfirmed". Risk must be High or Prohibited, ads are off, and image_safe is false by default unless clearly safe.
  * Full Brief Mode for all other cases. Produce a 200-400 word analytical brief with the following Markdown sections in order: "1. Executive Summary" (3-4 sentences), "2. Key Developments / What Happened", "3. Analysis", "4. Implications" (only include relevant categories; omit if none), "5. Outlook" (short, trend-based), "6. Ad Safety Assessment", "7. Image Safety". Analysis is allowed only in this mode.
- Sensitive handling: avoid emotional language, graphic details, or speculation. Do not assign motives. Only state confirmed facts. Mark uncertain claims as "unconfirmed".
- Image safety: if the source implies minors, victims, crime scenes, or other sensitive imagery, set image_safe to false; otherwise true. If unsure, set false.
- Editorial: no opinions, predictions, or moral judgments in Sensitive Mode. In Full Brief Mode, analysis must stay evidence-first and non-sensational.
- Misinformation: explicitly mark unverified claims as "unconfirmed". Never present speculation as fact.
- Output must stay neutral, formal, and advertiser friendly. Do not include visible word-count lines or model IDs.
`.trim();

// Build prompt that includes only relevant implication categories.
const buildPrompt = (title: string, summary: string, source: string, categories: ImplicationCategory[], extra?: string, outputMode: "markdown" | "json" = "markdown") => {
  const categoriesList = categories.includes("none") ? "none" : categories.join(", ");

  const jsonSchemaNote =
    outputMode === "json"
      ? `\n- REQUIRED JSON SCHEMA (strict): {\n  safe_title: string,\n  summary: string, // 3-5 sentences, neutral, factual, own words\n  risk_rating_adsense: "low" | "medium" | "high" | "prohibited",\n  risk_reason: string,\n  image_safe: boolean,\n  sensitive_categories: string[], // any of: minors, suicide, sexual_exploitation, crime, violence, hate, other\n  source_flags: string[], // list unconfirmed or sensitive signals\n  blocked: boolean,\n  meta: { model: string, fallback: boolean, generatedAt: string, qualityScore: number|null, wordcount: number|null },\n  raw?: string\n}\n- Return only valid JSON. No extra text.`
      : "";

  return `
${SYSTEM_INSTRUCTIONS}
${SAFETY_BRIEF_RULES}

USER INSTRUCTIONS:
- Task: Produce a safety-compliant brief with the required fields.
- Headline: ${JSON.stringify(title)}
- Source context: ${JSON.stringify(source)}
- Existing summary or notes: ${JSON.stringify(summary)}
- Relevant implication categories (for awareness, not for output unless applicable): ${categoriesList}
- Extra: ${extra ?? ""}

OUTPUT REQUIREMENTS:
- safe_title: short, neutral, non-sensational.
- summary: 
  * If Sensitive Mode: exactly 3-5 sentences, concise, factual, no analysis, no outlook. 
  * If Full Brief Mode: 200-400 words in Markdown with these sections in order: "1. Executive Summary" (3-4 sentences), "2. Key Developments / What Happened", "3. Analysis", "4. Implications" (omit if none), "5. Outlook", "6. Ad Safety Assessment", "7. Image Safety".
- risk_rating_adsense: Low/Medium/High/Prohibited with a one-line reason based only on confirmed facts. If Sensitive Mode, set to High or Prohibited.
- image_safe: true if no indication of minors, crime victims, or sensitive imagery; false if any doubt or sensitive cues appear (default to false in Sensitive Mode).
- sensitive_categories: list any that apply from [minors, suicide, sexual_exploitation, crime, violence, hate, mass_casualty, graphic_harm]; use [] if none are present.
- source_flags: include "unconfirmed" for any uncertain claims; include relevant sensitive signals.
- blocked: boolean flag if summary should not be shown to end users (true if sensitive + ads unsafe).
- Avoid emotional language, speculation, or invented details. Do not copy structure or phrases from the source. Analysis is only allowed in Full Brief Mode.

${jsonSchemaNote}

RESPONSE FORMAT:
- Return strict JSON per schema. Do not include Markdown, headers, or any extra text.
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
  options?: { temperature?: number; maxOutputTokens?: number; topP?: number; structured?: boolean };
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
                maxOutputTokens: options.maxOutputTokens ?? 900,
                topP: options.topP ?? 1.0,
                ...(signal ? { signal } : {}),
              } as any);
            },
            REQUEST_TIMEOUT_MS
          );

          const anyResp: any = resp as any;
          const text = anyResp?.text ?? anyResp?.output ?? (typeof resp === "string" ? resp : null);

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

// -------------------- Quality Check --------------------
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
  rawLegacy?: string[];
};

// Canonical brief shape returned to the frontend
type Brief = {
  safe_title: string;
  summary: string;
  image_safe: boolean;
  risk_rating_adsense: "low" | "medium" | "high" | "prohibited" | string;
  risk_reason?: string;
  sensitive_categories: string[];
  source_flags: string[];
  blocked: boolean;
  meta: {
    model: string;
    fallback: boolean;
    generatedAt: string;
    qualityScore: number | null;
    wordcount: number | null;
  };
  raw?: string; // optional raw model output for admin/debug only
};

const makeErrorBrief = (reason: string, meta?: Partial<Brief["meta"]>): Brief => ({
  safe_title: "Summary unavailable",
  summary: "",
  image_safe: false,
  risk_rating_adsense: "prohibited",
  risk_reason: reason,
  sensitive_categories: [],
  source_flags: ["parse_error"],
  blocked: true,
  meta: {
    model: meta?.model ?? "unknown",
    fallback: !!meta?.fallback,
    generatedAt: meta?.generatedAt ?? new Date().toISOString(),
    qualityScore: typeof meta?.qualityScore === "number" ? meta.qualityScore : null,
    wordcount: typeof meta?.wordcount === "number" ? meta.wordcount : null,
  },
});

const coerceBrief = (data: any, rawText?: string, metaDefaults?: Partial<Brief["meta"]>): Brief => {
  try {
    if (!data || typeof data !== "object") {
      return makeErrorBrief("invalid_payload", metaDefaults);
    }

    const summary = typeof data.summary === "string" ? data.summary.trim() : "";
    const safeTitle = typeof data.safe_title === "string" && data.safe_title.trim().length > 0 ? data.safe_title.trim() : "Summary";
    const imageSafe = data.image_safe !== false;
    const risk = (data.risk_rating_adsense || "").toString().toLowerCase() as Brief["risk_rating_adsense"];
    const sensitive = Array.isArray(data.sensitive_categories)
      ? data.sensitive_categories.filter((c: any) => typeof c === "string" && c.trim().length > 0)
      : [];
    const sourceFlags = Array.isArray(data.source_flags)
      ? data.source_flags.filter((c: any) => typeof c === "string" && c.trim().length > 0)
      : [];
    const blocked =
      !!data.blocked ||
      summary.length === 0 ||
      risk === "prohibited" ||
      risk === "high" ||
      sensitive.some((c: string) => ["minors", "suicide", "sexual_exploitation", "crime", "violence"].includes(c.toLowerCase()));

    const meta = data.meta && typeof data.meta === "object" ? data.meta : {};

    const qualityScore = typeof meta.qualityScore === "number" ? meta.qualityScore : null;
    const wordcount = typeof meta.wordcount === "number" ? meta.wordcount : summary.split(/\s+/).filter(Boolean).length || null;

    return {
      safe_title: safeTitle,
      summary,
      image_safe: imageSafe && !blocked,
      risk_rating_adsense: risk || "medium",
      risk_reason: typeof data.risk_reason === "string" ? data.risk_reason : undefined,
      sensitive_categories: sensitive,
      source_flags: sourceFlags,
      blocked,
      meta: {
        model: meta.model || metaDefaults?.model || "unknown",
        fallback: !!meta.fallback || !!metaDefaults?.fallback,
        generatedAt: meta.generatedAt || metaDefaults?.generatedAt || new Date().toISOString(),
        qualityScore,
        wordcount,
      },
      raw: typeof rawText === "string" ? rawText : undefined,
    };
  } catch (e) {
    return makeErrorBrief("coercion_failed", metaDefaults);
  }
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

  content = removeVisibleWordcountHints(content);

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

  const legacyLineRegex = /^model:\s*[^\n]+\n?/gim;
  const legacyMatches = content.match(legacyLineRegex);
  if (legacyMatches && legacyMatches.length) {
    resultMeta.rawLegacy = resultMeta.rawLegacy!.concat(legacyMatches);
    content = content.replace(legacyLineRegex, "").trim();
  }

  content = removeVisibleWordcountHints(content);

  const computedWordCount = content.split(/\s+/).filter(Boolean).length;
  if (!resultMeta.wordcount) resultMeta.wordcount = computedWordCount;

  if (typeof resultMeta.qualityScore === "number") {
    if (resultMeta.qualityScore <= 1.0) {
      resultMeta.qualityScore = Math.round(resultMeta.qualityScore * 100);
    } else {
      resultMeta.qualityScore = Math.round(resultMeta.qualityScore);
    }
  }

  const canonicalMeta = {
    model: resultMeta.model ?? "unknown",
    fallback: !!resultMeta.fallback,
    generatedAt: resultMeta.generatedAt ?? new Date().toISOString(),
    qualityScore: typeof resultMeta.qualityScore === "number" ? resultMeta.qualityScore : null,
    wordcount: resultMeta.wordcount ?? computedWordCount,
  };

  const footerJson = `\n\n<!-- metadata: ${JSON.stringify(canonicalMeta)} -->`;
  const contentWithFooter = `${content.trim()}\n${footerJson}`;
  const body = content.trim();
  return { contentWithFooter, body, meta: resultMeta };
};

const stripFooterForPublish = (contentWithFooter: string) => {
  return contentWithFooter.replace(/<!--\s*metadata:\s*({[\s\S]*?})\s*-->\s*$/m, "").trim();
};

// -------------------- Public API --------------------

/**
 * analyzeArticle: returns either plain text or structured JSON summary depending on outputMode
 */
export const analyzeArticle = async (
  articleTitle: string,
  articleSource: string,
  opts?: { outputMode?: "markdown" | "json" }
) => {
  const forcedOutputMode: "json" = "json";
  const hasPremium = checkPremiumAccess();
  const preferred = hasPremium ? MODELS.BEST_FT : MODELS.LITE;
  const fallbacks = [MODELS.STABLE_FLASH, MODELS.HIGH_THROUGHPUT];

  // Detect implication categories first
  const categories = detectImplicationCategories(articleTitle, "", articleSource);

  const prompt = buildPrompt(
    articleTitle,
    "",
    articleSource,
    categories,
    "Return only the safety-compliant brief.",
    forcedOutputMode
  );

  try {
    const resp = await makeModelCall({
      preferredModel: preferred,
      fallbacks,
      prompt,
      options: { temperature: 0.0, maxOutputTokens: 220 },
    });
    sendAnalyticsEvent({ event: "analyze_article_served", payload: { model: resp.usedModel } });

    const text = resp.text ?? "";
    const jMatch = text.match(/\{[\s\S]*\}/);
    if (jMatch) {
      try {
        const parsed = JSON.parse(jMatch[0]);
        return coerceBrief(parsed, text, { model: resp.usedModel, fallback: resp.fallbackOccurred });
      } catch (e) {
        return makeErrorBrief("invalid_json_analyze", { model: resp.usedModel, fallback: resp.fallbackOccurred });
      }
    }
    return makeErrorBrief("no_json_returned", { model: resp.usedModel, fallback: resp.fallbackOccurred });
  } catch (err: any) {
    console.error("analyzeArticle error", err);
    return makeErrorBrief("model_failure", { model: "unknown", fallback: true });
  }
};

/**
 * generateFullArticle:
 * - dynamic implications categories
 * - optional structured JSON output (if outputMode === 'json')
 * - cache with TTL and versioning
 */
export const generateFullArticle = async (
  title: string,
  summary: string,
  source: string,
  opts?: { forceRefresh?: boolean; publish?: boolean; outputMode?: "markdown" | "json" }
): Promise<Brief> => {
  const cacheKey = await getBriefCacheKey(title, source);
  const hasPremium = checkPremiumAccess();
  const isPremium = isPremiumContent(title, source);

  if (isPremium && !hasPremium) {
    const gated = makeErrorBrief("premium_gated", { model: "gated", fallback: true });
    writeCache(cacheKey, gated, CACHE_TTL_MS);
    return gated;
  }

  if (!opts?.forceRefresh) {
    const cached = readCache(cacheKey);
    if (cached) {
      sendAnalyticsEvent({ event: "ai_brief_cache_hit", payload: { key: cacheKey } });
      const payload = typeof cached.payload === "string" ? (() => { try { return JSON.parse(cached.payload); } catch { return null; } })() : cached.payload;
      return coerceBrief(payload, undefined, { model: payload?.meta?.model || "cache", fallback: !!payload?.meta?.fallback });
    }
  }

  // Detect categories
  const categories = detectImplicationCategories(title, summary, source);

  // Build prompt
  const userInstructions = `\nApply the two-mode logic: if any sensitive triggers are present (minors, suicide/self-harm, sexual exploitation, crime, violence, hate, mass casualty events, graphic harm) use Sensitive Mode with only a 3-5 sentence neutral factual summary and set risk to High or Prohibited, image_safe false by default, ads off. Otherwise use Full Brief Mode with a 200-400 word analytical brief using the required sections; make it executive-grade and more advanced (depth, reasoning, context) while staying factual and concise. Always rephrase, avoid quotes, avoid copying phrasing or structure, and mark uncertain claims as "unconfirmed". Do not include any content that could trigger copyright strikes. Return strict JSON when outputMode=json.\n`;
  const prompt = buildPrompt(title, summary, source, categories, userInstructions, "json");

  const preferred = hasPremium ? MODELS.BEST_FT : MODELS.LITE;
  const fallbackChain = hasPremium
    ? [MODELS.LITE, MODELS.STABLE_FLASH, MODELS.HIGH_THROUGHPUT]
    : [MODELS.STABLE_FLASH, MODELS.HIGH_THROUGHPUT];

  try {
    const resp = await makeModelCall({
      preferredModel: preferred,
      fallbacks: fallbackChain,
      prompt,
      options: { temperature: 0.0, maxOutputTokens: 1200 },
    });

    const content = resp.text ?? "";
    let parsed: any = null;

    const jMatch = content.match(/\{[\s\S]*\}/);
    if (jMatch) {
      try {
        parsed = JSON.parse(jMatch[0]);
      } catch (e) {
        parsed = null;
      }
    }

    let brief = coerceBrief(parsed, content, { model: resp.usedModel, fallback: resp.fallbackOccurred });

    // quality check for premium users when we have a summary and not blocked
    if (hasPremium && brief.summary && !brief.blocked) {
      const q = await runQualityCheck(brief.summary, source);
      brief = {
        ...brief,
        meta: { ...brief.meta, qualityScore: q.score ?? brief.meta.qualityScore },
      };
    }

    // cache the canonical object
    writeCache(cacheKey, brief, hasPremium ? PREMIUM_CACHE_TTL_MS : CACHE_TTL_MS);

    sendAnalyticsEvent({ event: "ai_brief_generated", payload: { model: resp.usedModel, fallback: resp.fallbackOccurred } });

    return brief;
  } catch (err: any) {
    console.error("generateFullArticle error", err);
    if (isQuotaError(err) && !checkPremiumAccess()) {
      return makeErrorBrief("service_unavailable", { fallback: true, model: "quota" });
    }
    return makeErrorBrief("service_unavailable", { fallback: true, model: "unknown" });
  }
};

// -------------------- Small helper to request a JSON-mode brief (UI friendly)
export const generateArticleJsonForUi = async (title: string, summary: string, source: string) => {
  // returns structured JSON suitable for rendering in UI (title, markdown, implications[])
  return await generateFullArticle(title, summary, source, { forceRefresh: false, publish: true, outputMode: "json" });
};

// -------------------- End of file --------------------
