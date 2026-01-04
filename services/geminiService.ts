import { GoogleGenAI } from "@google/genai";
import { ComparisonData } from "../types";

export const getRootCauseAnalysis = async (data: ComparisonData): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing. Please set process.env.API_KEY");
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are an expert e-commerce Data Analyst for a small business.
      Analyze the following performance comparison between the Last 7 Days vs Previous 7 Days.
      
      DATA:
      - Revenue Change: ${data.delta.revenuePct.toFixed(1)}% (From $${data.previousPeriod.totalRevenue.toFixed(0)} to $${data.currentPeriod.totalRevenue.toFixed(0)})
      - Orders Change: ${data.delta.ordersPct.toFixed(1)}%
      - Ad Spend Change: ${data.delta.adSpendPct.toFixed(1)}%
      - AOV Change: ${data.delta.aovPct.toFixed(1)}%
      - ROAS Change: ${data.delta.roasPct.toFixed(1)}%

      TASK:
      1. Identify the primary "Root Cause" of the revenue movement.
      2. Explain strictly in 3 sentences max.
      3. Use a professional, direct, and helpful tone.
      4. Focus on the relationship between Spend, Traffic (implied by orders/spend), and Average Order Value.

      Example output format:
      "Revenue dropped by 30% primarily due to a 40% reduction in Ad Spend. While your AOV remained stable, the lack of paid traffic significantly reduced total order volume. Consider scaling back up your successful campaigns."
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Unable to generate analysis at this time.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI analyst. Please ensure your API Key is valid.";
  }
};