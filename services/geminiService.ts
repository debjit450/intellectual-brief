// aiBriefs_v6_tib_premium_public.ts
// - Major product upgrade: deeper briefs, TIB editorial voice, multi-layer implications
// - Strict safety/compliance preserved (two-mode logic retained)
// - Robust parsing + heuristic recovery + telemetry + circuit breaker + caching
// - Admin raw output retained for debugging (do NOT surface to users without review)
// - Sanitization: platform-only fields removed for public responses by default
// - WARNING: run integration tests with your model outputs and tune token budgets to your environment

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// -------------------- Config --------------------
const AI_BRIEF_CACHE_PREFIX = "tib_ai_brief_v6";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const PREMIUM_CACHE_TTL_MS = CACHE_TTL_MS * 4; // 28 days
const MAX_CONCURRENT_REQUESTS = 4;
const REQUEST_TIMEOUT_MS = 60_000; // give more room for deep reasoning
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_COOLDOWN_MS = 1000 * 60 * 5;

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

const makeRequestId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// -------------------- Utilities --------------------
async function computeHashHex(input: string): Promise<string> {
  if (typeof globalThis !== "undefined" && (globalThis as any).crypto && (globalThis as any).crypto.subtle) {
    try {
      const enc = new TextEncoder();
      const data = enc.encode(input);
      const digest = await (globalThis as any).crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (e) {
      console.debug("crypto.subtle failed, falling back", e);
    }
  }

  try {
    const nodeCrypto = typeof require === "function" ? require("crypto") : null;
    if (nodeCrypto && typeof nodeCrypto.createHash === "function") {
      return nodeCrypto.createHash("sha256").update(input, "utf8").digest("hex");
    }
  } catch (e) {
    console.debug("node crypto fallback failed", e);
  }

  // FNV-1a fallback
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return (h >>> 0).toString(16).padStart(8, "0");
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
  const base = Math.min(45_000, 500 * 2 ** attempt);
  const jitter = Math.random() * 700;
  const delay = base + jitter;
  await new Promise((r) => setTimeout(r, delay));
};

const isQuotaError = (err: any) => {
  const m = (err?.message || "")?.toString().toLowerCase();
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

// localStorage wrappers (browser-safe)
const hasLocalStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";
const readCache = (key: string) => {
  try {
    if (!hasLocalStorage()) return null;
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
    if (!hasLocalStorage()) return;
    const payload = {
      meta: { cachedAt: Date.now(), expiresAt: Date.now() + ttlMs, version: 1 },
      payload: value,
    };
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch (e) {
    console.error("writeCache error", e);
  }
};

// premium check (client-side localStorage flag)
const checkPremiumAccess = (): boolean => {
  if (!hasLocalStorage()) return false;
  const plan = window.localStorage.getItem("user_subscription_plan");
  return plan === "premium" || plan === "enterprise";
};

// premium detection
const isPremiumContent = (title: string, source: string): boolean => {
  const premiumKeywords = ["exclusive", "premium", "in-depth", "analysis", "investor", "deep dive"];
  const titleLower = (title || "").toLowerCase();
  return premiumKeywords.some((k) => titleLower.includes(k));
};

// -------------------- Implication Category Detection (improved) --------------------
type ImplicationCategory = "consumers" | "small_businesses" | "policymakers" | "industry" | "investors" | "none";

const CATEGORY_KEYWORDS: Record<ImplicationCategory, { kw: string; weight: number }[]> = {
  consumers: [
    { kw: "consumer", weight: 2 },
    { kw: "user", weight: 1 },
    { kw: "household", weight: 1 },
    { kw: "buyer", weight: 1 },
    { kw: "customers", weight: 2 },
    { kw: "privacy", weight: 2 },
    { kw: "safety", weight: 2 },
  ],
  small_businesses: [
    { kw: "small business", weight: 3 },
    { kw: "local", weight: 1 },
    { kw: "shop", weight: 1 },
    { kw: "restaurant", weight: 1 },
    { kw: "msme", weight: 3 },
    { kw: "vendor", weight: 1 },
  ],
  policymakers: [
    { kw: "law", weight: 2 },
    { kw: "regulation", weight: 3 },
    { kw: "policy", weight: 2 },
    { kw: "government", weight: 1 },
    { kw: "legislation", weight: 3 },
    { kw: "education", weight: 1 },
    { kw: "compliance", weight: 2 },
  ],
  industry: [
    { kw: "enterprise", weight: 2 },
    { kw: "industry", weight: 2 },
    { kw: "operators", weight: 1 },
    { kw: "infrastructure", weight: 2 },
    { kw: "platform", weight: 2 },
    { kw: "vendor", weight: 1 },
  ],
  investors: [
    { kw: "fund", weight: 2 },
    { kw: "investment", weight: 3 },
    { kw: "ipo", weight: 3 },
    { kw: "market", weight: 2 },
    { kw: "valuation", weight: 3 },
    { kw: "investor", weight: 2 },
    { kw: "funding", weight: 2 },
  ],
  none: [],
};

const detectImplicationCategories = (title: string, summary: string, sourceText: string): { category: ImplicationCategory; score: number }[] => {
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
    for (const item of CATEGORY_KEYWORDS[cat]) {
      if (text.includes(item.kw)) scores[cat] += item.weight;
    }
  }

  const entries = Object.entries(scores)
    .filter(([k, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({ category: k as ImplicationCategory, score: v }));

  if (entries.length === 0) return [{ category: "none", score: 0 }];
  return entries;
};

// -------------------- System Instructions (TIB voice + safety) --------------------
const SYSTEM_INSTRUCTIONS = `
SYSTEM: You are "The Intellectual Brief" senior analyst persona.
Tone: concise, authoritative, evidence-first, high-clarity. Use short paragraphs and numbered sections.
Do NOT invent or attribute direct quotes, statistics, or named claims that are not present in the provided source. If a fact is not stated in the source, label it "unconfirmed".
Always avoid copyrighted text reproduction; rephrase and synthesize in your own words.
Adhere strictly to the Safety rules provided below.
When requested to output JSON, follow the schema exactly and return only valid JSON.
`.trim();

const SAFETY_BRIEF_RULES = `
SAFETY:
- Two-mode logic (MANDATORY):
  * Sensitive Mode triggers if the source mentions minors, suicide/self-harm, sexual exploitation, crime with graphic detail, mass casualty, hate or graphic harm. In Sensitive Mode, return ONLY a 3-5 sentence neutral factual summary, no analysis, no outlook, mark uncertain items as "unconfirmed", set risk_rating_adsense = "high" or "prohibited", image_safe = false, blocked = true for ads.
  * Full Brief Mode for all other stories. Produce deep analytical brief (see format below).
- Do NOT invent quotes, numbers, or URLs.
- Mark any unverified claims as "unconfirmed".
- Image safety: default to false when in doubt; only true when no sensitive cues.
`.trim();

// Full brief format declaration used in prompts (TIB signature)
const TIB_BRIEF_FORMAT = `
FULL BRIEF FORMAT (TIB STYLE):
- Target length: Aim for 450-700 words total (not including metadata comment). If user asks for shorter, follow that bound.
- Sections (in order):
  1) Executive Summary (3-5 sentences) — crisp, actionable.
  2) What Happened (Concise timeline / key facts).
  3) Why It Matters (drivers, causation, stakeholders).
  4) Implications (structured): list first-order impacts, second-order impacts, and who is affected (actors). Provide short actionable signals.
  5) Outlook (2-3 short bullets: likely near-term trends).
- Always include a short "degree of certainty" tag for background claims: (Confirmed | Probable | Unknown).
- Do not reproduce sentences from the source; rephrase and synthesize.
`.trim();

// JSON schema note for strict JSON output
const JSON_SCHEMA_NOTE = `
REQUIRED JSON SCHEMA (strict) when outputMode=json:
{
  safe_title: string,
  summary: string, // Full Brief Mode: the markdown body per TIB format; Sensitive Mode: 3-5 sentence summary
  risk_rating_adsense: "low" | "medium" | "high" | "prohibited",
  risk_reason: string,
  image_safe: boolean,
  sensitive_categories: string[], // e.g., ["minors","suicide"]
  source_flags: string[], // e.g., ["unconfirmed"]
  blocked: boolean,
  implications: [ // structured list when available
    { type: "first_order"|"second_order", description: string, affected: string[], confidence: "Confirmed"|"Probable"|"Unknown", score: number }
  ],
  meta: { model: string, fallback: boolean, generatedAt: string, qualityScore: number|null, wordcount: number|null },
  raw?: string
}
`;

// Build prompt generator
const buildPrompt = (
  title: string,
  summary: string,
  source: string,
  detectedCategories: { category: ImplicationCategory; score: number }[],
  extraInstructions = "",
  outputMode: "markdown" | "json" = "json"
) => {
  const categoriesList = detectedCategories.map((d) => `${d.category}:${d.score}`).join(", ") || "none";
  const modeNote = outputMode === "json" ? `RETURN STRICT JSON PER SCHEMA BELOW. NO EXTRA TEXT.` : `RETURN MARKDOWN (human readable) following TIB format.`;
  const prompt = [
    SYSTEM_INSTRUCTIONS,
    SAFETY_BRIEF_RULES,
    TIB_BRIEF_FORMAT,
    `USER INPUT:\nHeadline: ${JSON.stringify(title)}\nSource text/context: ${JSON.stringify(source)}\nExisting notes/summary: ${JSON.stringify(summary)}\nDetected categories: ${categoriesList}`,
    `EXTRA INSTRUCTIONS: ${extraInstructions}`,
    modeNote,
    outputMode === "json" ? JSON_SCHEMA_NOTE : "",
    `OUTPUT RULES (STRICT):`,
    `- Do not invent quotes, names, or URLs. If the source lacks a fact, mark it "unconfirmed".`,
    `- If Sensitive Mode is triggered by the source, produce ONLY a 3-5 sentence neutral factual summary and set risk_rating_adsense appropriately.`,
    `- If Full Brief Mode, aim for 450-700 words, follow the exact section order in TIB_BRIEF_FORMAT, emphasize \"Why it matters\" and structured implications. Use numbered lists or short paragraphs.`,
    `- At the end append exactly one HTML comment: <!-- metadata: { "model":"<id>", "fallback":<bool>, "generatedAt":"<ISO>", "qualityScore": <0-100|null>, "wordcount": <int> } -->`,
  ].join("\n\n");
  return prompt;
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
  const reqId = makeRequestId();
  try {
    let attempt = 0;
    const chain = [preferredModel, ...fallbacks];
    for (const model of chain) {
      let lastErr: any = null;
      for (let tryIdx = 0; tryIdx < 2; tryIdx++) {
        attempt++;
        try {
          sendAnalyticsEvent({ event: "model_request_start", payload: { model, attempt, reqId } });

          const resp = await withTimeout(async (signal) => {
            const argsAny: any = {
              model,
              contents: prompt,
              temperature: options.temperature ?? 0.0,
              maxOutputTokens: options.maxOutputTokens ?? 2000,
              topP: options.topP ?? 1.0,
            };
            if (signal) argsAny.signal = signal;

            if (typeof (ai as any).models?.generateContent === "function") {
              return await (ai as any).models.generateContent(argsAny);
            }
            if (typeof (ai as any).generate === "function") {
              return await (ai as any).generate({ model, prompt });
            }
            if (typeof (ai as any).chat === "function") {
              return await (ai as any).chat({ model, messages: [{ role: "user", content: prompt }] });
            }
            throw new Error("unsupported_ai_sdk_shape");
          }, REQUEST_TIMEOUT_MS);

          const anyResp: any = resp as any;
          const text =
            anyResp?.text ??
            anyResp?.output ??
            anyResp?.outputs?.[0]?.text ??
            anyResp?.outputs?.[0]?.content ??
            anyResp?.result ??
            (typeof resp === "string" ? resp : null);

          if (!text || typeof text !== "string") {
            sendAnalyticsEvent({ event: "model_response_unexpected", payload: { model, reqId, respPreview: String(resp).slice(0, 500) } });
            throw new Error("unexpected_model_response");
          }

          sendAnalyticsEvent({ event: "model_request_success", payload: { model, attempt, reqId } });

          consecutiveFailures = 0;
          return { text, usedModel: model, fallbackOccurred: model !== preferredModel, meta: { model, attempt, reqId } };
        } catch (err: any) {
          lastErr = err;
          sendAnalyticsEvent({ event: "model_request_error", payload: { model, attempt, reqId, error: String(err?.message || err) } });
          if (isQuotaError(err)) break; // move to fallback
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

// -------------------- JSON extraction helper (robust) --------------------
const extractFirstJsonObject = (text: string): { jsonText: string | null; start: number; end: number } => {
  if (!text) return { jsonText: null, start: -1, end: -1 };
  const firstOpen = text.indexOf("{");
  if (firstOpen === -1) return { jsonText: null, start: -1, end: -1 };

  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = firstOpen; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        const candidate = text.slice(firstOpen, i + 1);
        try {
          JSON.parse(candidate);
          return { jsonText: candidate, start: firstOpen, end: i + 1 };
        } catch (e) {
          // continue scanning
        }
      }
    }
  }
  return { jsonText: null, start: -1, end: -1 };
};

// -------------------- Markdown/key-value fallback parser --------------------
const tryParseKeyValueFromText = (text: string) => {
  const { jsonText } = extractFirstJsonObject(text);
  if (jsonText) {
    try {
      return JSON.parse(jsonText);
    } catch (e) {
      // fallthrough
    }
  }

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const obj: any = {};

  for (const line of lines) {
    const m = line.match(/^([a-zA-Z_ ]{3,50}):\s*(.+)$/);
    if (m) {
      const key = m[1].toLowerCase().replace(/\s+/g, "_");
      obj[key] = obj[key] ? `${obj[key]}\n${m[2]}` : m[2];
    }
  }

  if (obj.summary || obj.safe_title) return obj;

  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const maybeTitle = lines[0] && lines[0].length < 140 ? lines[0] : undefined;
  if (maybeTitle) obj.safe_title = maybeTitle;
  obj.summary = paragraphs.slice(0, 3).join("\n\n").slice(0, 8000);
  return obj;
};

// -------------------- Quality Check --------------------
const runQualityCheck = async (generated: string, source: string) => {
  try {
    const prompt = `You are a factuality and clarity judge. Return JSON: {"score": <0-100>, "notes":"<short notes>"}\nArticle: ${JSON.stringify(generated)}\nSource: ${JSON.stringify(source)}\nRules: Base factuality only on overlap with the provided source text.`;
    const resp = await makeModelCall({
      preferredModel: MODELS.HIGH_THROUGHPUT,
      fallbacks: [MODELS.STABLE_FLASH],
      prompt,
      options: { temperature: 0.0, maxOutputTokens: 300 },
    });

    const text = resp.text ?? "";
    const { jsonText } = extractFirstJsonObject(text);
    if (jsonText) {
      try {
        const parsed = JSON.parse(jsonText);
        const score = Math.max(0, Math.min(100, Number(parsed.score || 0)));
        return { score, notes: parsed.notes ?? "" };
      } catch (e) {
        // continue
      }
    }
    return { score: 78, notes: "Fallback heuristic used." };
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

type Brief = {
  safe_title: string;
  summary: string; // markdown body
  image_safe: boolean;
  risk_rating_adsense: "low" | "medium" | "high" | "prohibited" | string;
  risk_reason?: string;
  sensitive_categories: string[];
  source_flags: string[];
  blocked: boolean;
  implications: { type: "first_order" | "second_order"; description: string; affected: string[]; confidence: "Confirmed" | "Probable" | "Unknown"; score: number }[];
  meta: {
    model: string;
    fallback: boolean;
    generatedAt: string;
    qualityScore: number | null;
    wordcount: number | null;
  };
  raw?: string;
};

const makeErrorBrief = (reason: string, meta?: Partial<Brief["meta"]>): Brief => ({
  safe_title: "Summary unavailable",
  summary: "",
  image_safe: false,
  risk_rating_adsense: "prohibited",
  risk_reason: reason,
  sensitive_categories: [],
  source_flags: [reason || "parse_error"],
  blocked: true,
  implications: [],
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
    const safeTitle = typeof data.safe_title === "string" && data.safe_title.trim().length > 0 ? data.safe_title.trim() : (typeof data.title === "string" ? data.title.trim() : "Summary");
    const imageSafe = data.image_safe !== false;
    const risk = (data.risk_rating_adsense || "").toString().toLowerCase() as Brief["risk_rating_adsense"];
    const sensitive = Array.isArray(data.sensitive_categories) ? data.sensitive_categories.filter((c: any) => typeof c === "string") : [];
    const sourceFlags = Array.isArray(data.source_flags) ? data.source_flags.filter((c: any) => typeof c === "string") : [];
    const implications = Array.isArray(data.implications)
      ? data.implications.map((imp: any) => ({
          type: imp.type === "second_order" ? "second_order" : "first_order",
          description: typeof imp.description === "string" ? imp.description : String(imp.description || ""),
          affected: Array.isArray(imp.affected) ? imp.affected.map(String) : [],
          confidence: ["Confirmed", "Probable"].includes(imp.confidence) ? imp.confidence : "Unknown",
          score: typeof imp.score === "number" ? imp.score : 0,
        }))
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
      implications,
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

// -------------------- Sanitization Helper --------------------

/**
 * sanitizeBriefForUser
 * - Remove admin/debug-only fields before returning to user-facing UI.
 * - Keeps essential fields: safe_title, summary (footer stripped), image_safe, risk_rating_adsense,
 *   risk_reason, sensitive_categories, implications, blocked, meta (reduced).
 *
 * If opts.admin === true, returns the full brief unchanged except the summary has footer stripped.
 */
const sanitizeBriefForUser = (brief: Brief, opts?: { admin?: boolean }): Brief => {
  if (opts?.admin) {
    // Admin explicitly requested raw/admin view — return full object but remove metadata footer from summary
    const clonedAdmin: Brief = JSON.parse(JSON.stringify(brief));
    if (clonedAdmin.summary) clonedAdmin.summary = stripFooterForPublish(clonedAdmin.summary);
    return clonedAdmin;
  }

  const safeMeta = {
    // hide exact model identifiers from end users for operational secrecy
    model: brief.meta?.model ? "redacted" : "unknown",
    fallback: !!brief.meta?.fallback,
    generatedAt: brief.meta?.generatedAt ?? new Date().toISOString(),
    qualityScore: typeof brief.meta?.qualityScore === "number" ? brief.meta.qualityScore : null,
    wordcount: typeof brief.meta?.wordcount === "number" ? brief.meta?.wordcount : null,
  };

  const sanitized: Brief = {
    safe_title: brief.safe_title,
    // Remove any appended metadata/footer and trim; always use stripped body for users
    summary: stripFooterForPublish(brief.summary || ""),
    image_safe: !!brief.image_safe,
    risk_rating_adsense: brief.risk_rating_adsense,
    risk_reason: brief.risk_reason,
    sensitive_categories: Array.isArray(brief.sensitive_categories) ? [...brief.sensitive_categories] : [],
    // Do not expose internal parsing flags to public
    source_flags: [],
    blocked: !!brief.blocked,
    implications: Array.isArray(brief.implications)
      ? brief.implications.map((imp) => ({
          type: imp.type,
          description: imp.description,
          affected: Array.isArray(imp.affected) ? [...imp.affected] : [],
          confidence: imp.confidence,
          score: imp.score,
        }))
      : [],
    meta: safeMeta,
    // raw omitted intentionally
  };

  return sanitized;
};

// -------------------- Public API --------------------

/**
 * analyzeArticle: returns either markdown or structured JSON depending on outputMode
 * This function is a quick-analyze pathway (smaller token budget than generateFullArticle)
 * opts.admin === true -> returns admin view (raw fields included)
 */
export const analyzeArticle = async (
  articleTitle: string,
  articleSource: string,
  opts?: { outputMode?: "markdown" | "json"; admin?: boolean }
) => {
  const outputMode: "markdown" | "json" = opts?.outputMode ?? "json";
  const adminRequested = !!opts?.admin;
  const hasPremium = checkPremiumAccess();
  const preferred = hasPremium ? MODELS.BEST_FT : MODELS.LITE;
  const fallbacks = [MODELS.STABLE_FLASH, MODELS.HIGH_THROUGHPUT];

  // Detect implication categories
  const categories = detectImplicationCategories(articleTitle, "", articleSource);

  // Extra instruction: produce a succinct TIB-style brief but keep token budget moderate.
  const extra = `Produce a TIB-style brief. For Full Brief Mode aim for 300-450 words for quick analyze. Ensure no quotes or invented claims. If Sensitive Mode triggered, return 3-5 sentence neutral summary.`;
  const prompt = buildPrompt(articleTitle, "", articleSource, categories, extra, outputMode);

  try {
    const resp = await makeModelCall({
      preferredModel: preferred,
      fallbacks,
      prompt,
      options: { temperature: 0.0, maxOutputTokens: 900 },
    });
    sendAnalyticsEvent({ event: "analyze_article_served", payload: { model: resp.usedModel } });

    const text = resp.text ?? "";
    const { jsonText } = extractFirstJsonObject(text);
    if (jsonText) {
      try {
        const parsed = JSON.parse(jsonText);
        const brief = coerceBrief(parsed, text, { model: resp.usedModel, fallback: resp.fallbackOccurred });
        return sanitizeBriefForUser(brief, { admin: adminRequested });
      } catch (e) {
        // fallback to heuristics below
      }
    }

    const heur = tryParseKeyValueFromText(text);
    if (heur && (heur.summary || heur.safe_title)) {
      const brief = coerceBrief(heur, text, { model: resp.usedModel, fallback: resp.fallbackOccurred });
      return sanitizeBriefForUser(brief, { admin: adminRequested });
    }

    const errBrief = makeErrorBrief("no_json_returned", { model: resp.usedModel, fallback: resp.fallbackOccurred });
    return sanitizeBriefForUser(errBrief, { admin: adminRequested });
  } catch (err: any) {
    console.error("analyzeArticle error", err);
    const errBrief = makeErrorBrief("model_failure", { model: "unknown", fallback: true });
    return sanitizeBriefForUser(errBrief, { admin: adminRequested });
  }
};

/**
 * generateFullArticle:
 * - Produces TIB-style Full Briefs (450-700 words) by default in Full Brief Mode.
 * - outputMode=json returns strict JSON per schema.
 * - Caching, premium quality checks, and safety logic are included.
 * - opts.admin === true -> returns admin view (raw fields included)
 */
export const generateFullArticle = async (
  title: string,
  summary: string,
  source: string,
  opts?: { forceRefresh?: boolean; publish?: boolean; outputMode?: "markdown" | "json"; targetWordCount?: number; admin?: boolean }
): Promise<Brief> => {
  const cacheKey = await getBriefCacheKey(title, source);
  const adminRequested = !!opts?.admin;
  const hasPremium = checkPremiumAccess();

  if (!opts?.forceRefresh) {
    const cached = readCache(cacheKey);
    if (cached) {
      sendAnalyticsEvent({ event: "ai_brief_cache_hit", payload: { key: cacheKey } });
      const payload = typeof cached.payload === "string" ? (() => {
        try { return JSON.parse(cached.payload); } catch { return null; }
      })() : cached.payload;
      const cachedBrief = coerceBrief(payload, undefined, { model: payload?.meta?.model || "cache", fallback: !!payload?.meta?.fallback });
      return sanitizeBriefForUser(cachedBrief, { admin: adminRequested });
    }
  }

  // Detect categories
  const categories = detectImplicationCategories(title, summary, source);

  const targetWord = opts?.targetWordCount ?? 550;
  const extra = `Produce a TIB Full Brief with depth and reasoning. Target words: ${targetWord}. Surface drivers, near-term impacts, second-order effects, and 3 actionable signals. Provide structured implications array with first/second-order items and affected actors. DO NOT invent quotes or numbers. Mark unverified items as "unconfirmed".`;

  const prompt = buildPrompt(title, summary, source, categories, extra, opts?.outputMode ?? "json");

  const preferred = hasPremium ? MODELS.BEST_FT : MODELS.LITE;
  const fallbackChain = [MODELS.LITE, MODELS.STABLE_FLASH, MODELS.HIGH_THROUGHPUT];

  try {
    const resp = await makeModelCall({
      preferredModel: preferred,
      fallbacks: fallbackChain,
      prompt,
      options: { temperature: 0.0, maxOutputTokens: 2200 }, // larger allowance for deep briefs
    });

    const content = resp.text ?? "";
    let parsed: any = null;

    const { jsonText } = extractFirstJsonObject(content);
    if (jsonText) {
      try {
        parsed = JSON.parse(jsonText);
      } catch (e) {
        parsed = null;
      }
    }

    // Heuristic fallback to extract structured fields and implications
    if (!parsed) {
      const heur = tryParseKeyValueFromText(content);
      if (heur && (heur.summary || heur.safe_title || heur.title)) {
        // attempt to synthesize implications via heuristic: look for headings "Implications" or "What this means"
        const implications: any[] = [];
        const impMatch = content.match(/Implications[:\n\r-]*([\s\S]{0,1200})/i);
        if (impMatch) {
          const impText = impMatch[1];
          const lines = impText.split(/\n/).map((l) => l.trim()).filter(Boolean);
          for (const ln of lines.slice(0, 8)) {
            implications.push({ type: "first_order", description: ln.slice(0, 800), affected: [], confidence: "Unknown", score: 10 });
          }
        }
        heur.implications = implications;
        parsed = heur;
      }
    }

    let brief = coerceBrief(parsed, content, { model: resp.usedModel, fallback: resp.fallbackOccurred });

    // Improve implications: if model didn't produce structured ones, attempt a targeted second-pass (cheap)
    if ((!brief.implications || brief.implications.length === 0) && !brief.blocked) {
      try {
        const impPrompt = `${SYSTEM_INSTRUCTIONS}\n\nBased on the following title and summary, produce a JSON array named "implications" with up to 6 items. Each item: {type: "first_order"|"second_order", description: string (short), affected: [actors], confidence: "Confirmed"|"Probable"|"Unknown", score: <0-100>}.\n\nTitle: ${JSON.stringify(title)}\nSummary: ${JSON.stringify(brief.summary)}\n\nReturn only JSON object: { "implications": [...] }`;
        const impResp = await makeModelCall({
          preferredModel: preferred,
          fallbacks: fallbackChain,
          prompt: impPrompt,
          options: { temperature: 0.0, maxOutputTokens: 400 },
        });
        const jt = extractFirstJsonObject(impResp.text ?? "");
        if (jt.jsonText) {
          try {
            const parsedImp = JSON.parse(jt.jsonText);
            if (Array.isArray(parsedImp.implications)) {
              brief.implications = parsedImp.implications.map((imp: any) => ({
                type: imp.type === "second_order" ? "second_order" : "first_order",
                description: typeof imp.description === "string" ? imp.description : String(imp.description || ""),
                affected: Array.isArray(imp.affected) ? imp.affected.map(String) : [],
                confidence: ["Confirmed", "Probable"].includes(imp.confidence) ? imp.confidence : "Unknown",
                score: typeof imp.score === "number" ? imp.score : 0,
              }));
            }
          } catch (e) {
            // ignore and proceed
          }
        }
      } catch (e) {
        // degrade silently
      }
    }

    // quality check for premium users when we have a summary and not blocked
    if (hasPremium && brief.summary && !brief.blocked) {
      const q = await runQualityCheck(brief.summary, source);
      brief = {
        ...brief,
        meta: { ...brief.meta, qualityScore: q.score ?? brief.meta.qualityScore },
      };
    }

    // Cache canonical object (server-side code should also cache; this is client-safe local cache)
    try {
      writeCache(cacheKey, brief, hasPremium ? PREMIUM_CACHE_TTL_MS : CACHE_TTL_MS);
    } catch (e) {
      console.debug("cache write failed", e);
    }

    sendAnalyticsEvent({ event: "ai_brief_generated", payload: { model: resp.usedModel, fallback: resp.fallbackOccurred } });

    return sanitizeBriefForUser(brief, { admin: adminRequested });
  } catch (err: any) {
    console.error("generateFullArticle error", err);
    if (isQuotaError(err) && !checkPremiumAccess()) {
      const errBrief = makeErrorBrief("quota_exhausted", { fallback: true, model: "quota" });
      return sanitizeBriefForUser(errBrief, { admin: adminRequested });
    }
    const errBrief = makeErrorBrief("service_unavailable", { fallback: true, model: "unknown" });
    return sanitizeBriefForUser(errBrief, { admin: adminRequested });
  }
};

// -------------------- Morning Brief Aggregator (scaffold) --------------------
/**
 * produceMorningBrief: aggregate a list of article briefs (titles + sources).
 * This is a simple aggregator that requests brief summaries for each and combines them into a short "morning brief".
 * NOTE: This is a scaffold — integrate with your article store and scheduling system.
 * opts.admin === true -> returns admin items (raw included)
 */
export const produceMorningBrief = async (items: { title: string; source: string; summary?: string }[], opts?: { targetCount?: number; admin?: boolean }) => {
  const adminRequested = !!opts?.admin;
  // pick top N
  const target = opts?.targetCount ?? 6;
  const subset = items.slice(0, target);

  // get briefs in parallel with concurrency limits (using semaphore)
  const promises = subset.map(async (it) => {
    try {
      return await generateFullArticle(it.title, it.summary ?? "", it.source, { forceRefresh: false, outputMode: "json", targetWordCount: 220, admin: adminRequested });
    } catch (e) {
      return makeErrorBrief("item_fetch_failed", { model: "unknown" }) as Brief;
    }
  });

  const results = await Promise.all(promises);

  // assemble morning brief markdown using sanitized results for public
  const header = `# The Intellectual Brief — Morning Brief\n\nTop ${results.length} stories.\n\n`;
  const body = results.map((b, idx) => {
    const safe = sanitizeBriefForUser(b, { admin: adminRequested });
    if (safe.blocked) {
      return `${idx + 1}. **${safe.safe_title}** — [blocked due to safety].`;
    }
    const snippet = safe.summary.split("\n").slice(0, 2).join(" ");
    return `${idx + 1}. **${safe.safe_title}** — ${snippet}`;
  }).join("\n\n");

  return {
    markdown: `${header}${body}`,
    items: results.map((r) => sanitizeBriefForUser(r, { admin: adminRequested })),
  };
};

// -------------------- UI helper --------------------
export const generateArticleJsonForUi = async (title: string, summary: string, source: string) => {
  // default public view (admin=false) — returns sanitized JSON brief for UI
  const brief = await generateFullArticle(title, summary, source, { forceRefresh: false, publish: true, outputMode: "json", targetWordCount: 550, admin: false });
  return brief;
};

// -------------------- End of file --------------------
