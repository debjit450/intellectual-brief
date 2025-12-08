import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};

// New function to generate the full article body
export const generateFullArticle = async (title: string, summary: string, source: string) => {
  const modelId = "gemini-2.5-flash";

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
    return response.text;
  } catch (error) {
    console.error("Gemini Article Generation Error:", error);
    return "## Service Unavailable\n\nWe are currently unable to retrieve the full intelligence report for this article. Please try again later or visit the original source.";
  }
};