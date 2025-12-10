import { Article } from "../types";

// Keywords that signal violent, abusive, or legally risky content
export const SENSITIVE_KEYWORDS = [
  "abuse",
  "assault",
  "minor",
  "child",
  "suicide",
  "self-harm",
  "self harm",
  "sexual",
  "exploitation",
  "trafficking",
  "kidnap",
  "kidnapping",
  "abduction",
  "rape",
  "crime",
  "violent",
  "violence",
  "homicide",
  "murder",
  "shooting",
  "gunfire",
  "attack",
  "massacre",
  "terror",
  "explosion",
  "bomb",
  "graphic",
  "gore",
  "blood",
  "beheading",
  "decapitation",
  "hate",
  "extremist",
  "mass casualty",
  "war crime",
  "domestic violence",
  "copyright",
  "infringement",
  "lawsuit",
  "legal dispute",
  "piracy",
  "counterfeit",
];

export const containsSensitiveKeywords = (text: string): boolean => {
  const normalized = (text || "").toLowerCase();
  return SENSITIVE_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

export const filterUnsafeArticles = (articles: Article[]): Article[] => {
  return articles.filter(
    (article) =>
      !containsSensitiveKeywords(
        `${article.title} ${article.summary} ${article.category || ""}`
      )
  );
};

