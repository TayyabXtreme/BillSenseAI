import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Gemini models to try in order
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

async function callGemini(prompt: string): Promise<string | null> {
  for (const model of GEMINI_MODELS) {
    try {
      console.log(`Explain: trying Gemini model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      const text = response.text;
      if (text) {
        console.log(`Explain: Gemini ${model} succeeded`);
        return text;
      }
    } catch (error: any) {
      const status = error?.status || error?.code;
      console.log(`Explain: Gemini ${model} failed (status: ${status})`);
      continue;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { bill } = await req.json();

    const prompt = `You are a friendly utility bill advisor. Explain this utility bill in simple words for a normal user. Be conversational and helpful.

Bill Details:
- Type: ${bill.billType} bill
- Units Consumed: ${bill.unitsConsumed} units
- Tariff Rate: ${bill.tariffRate} PKR per unit
- Base Amount: ${bill.baseAmount} PKR
- Taxes (5%): ${bill.taxes} PKR
- Extra Charges: ${bill.extraCharges} PKR
- Total Amount: ${bill.totalAmount} PKR
- Daily Average: ~${(bill.unitsConsumed / 30).toFixed(1)} units/day
- Bill Date: ${bill.billDate}

Instructions:
1. Explain the bill breakdown in simple language
2. Mention whether the usage seems high, medium, or low (30+ units/day is high, 15-30 is moderate, below 15 is low)
3. Explain why it might be high or low
4. Give 1-2 practical tips to reduce the bill
5. Keep it under 200 words
6. Use a friendly, encouraging tone
7. Use bullet points for clarity`;

    const explanation = await callGemini(prompt);

    if (!explanation) {
      return NextResponse.json(
        { error: "Gemini API quota exhausted. Please wait a minute and try again." },
        { status: 503 }
      );
    }

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("AI Explain Error:", error);
    return NextResponse.json(
      { error: "Failed to generate explanation. Please try again shortly." },
      { status: 500 }
    );
  }
}
