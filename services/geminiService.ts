import { GoogleGenAI } from "@google/genai";
import { MarkRecord } from "../types";

const processResultAnalysis = async (marks: MarkRecord[]) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "API Key not configured.";

  const ai = new GoogleGenAI({ apiKey });
  
  // Prepare data summary for the prompt
  const marksSummary = marks.map(m => 
    `${m.courseCode}: ${m.total} (${m.gradeLetter})`
  ).join('\n');

  const prompt = `
    Analyze the following university examination results.
    Provide a brief, professional summary for the Dean.
    Highlight:
    1. Overall performance trend.
    2. Any courses where grades are unusually low (potential teaching issue).
    3. Any outlier high performances.
    
    Data:
    ${marksSummary}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI Analysis currently unavailable.";
  }
};

export const geminiService = {
  processResultAnalysis
};