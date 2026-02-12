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
      console.log(`Parse: trying Gemini model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      const text = response.text;
      if (text) {
        console.log(`Parse: Gemini ${model} succeeded`);
        return text;
      }
    } catch (error: any) {
      const status = error?.status || error?.code;
      console.log(`Parse: Gemini ${model} failed (status: ${status})`);
      continue;
    }
  }
  return null;
}

function parseResult(content: string) {
  const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
  const parsed = JSON.parse(cleanContent);
  return {
    billType: parsed.billType || "electricity",
    unitsConsumed: Number(parsed.unitsConsumed) || 0,
    tariffRate: Number(parsed.tariffRate) || 10,
    extraCharges: Number(parsed.extraCharges) || 0,
    totalAmount: Number(parsed.totalAmount) || 0,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { ocrText } = await req.json();

    if (!ocrText || ocrText.trim().length === 0) {
      return NextResponse.json(
        { error: "No OCR text provided" },
        { status: 400 }
      );
    }

    const prompt = `Extract utility bill data from this OCR text. The bill could be an electricity or gas bill from Pakistan.

OCR Text:
"""
${ocrText}
"""

Extract these fields and return as JSON:
{
  "billType": "electricity" or "gas",
  "unitsConsumed": number (total units/kWh consumed),
  "tariffRate": number (rate per unit in PKR, default 10 if not found),
  "extraCharges": number (any additional charges in PKR, default 0),
  "totalAmount": number (total bill amount if found)
}

Rules:
- Look for keywords like "units", "kWh", "consumption", "consumed", "reading"
- Look for "rate", "tariff", "per unit", "price"
- Look for "total", "amount due", "payable", "net"
- Look for "surcharge", "tax", "fuel", "adjustment" for extra charges
- If you can't find a value, use reasonable defaults
- Only respond with valid JSON, no other text`;

    const content = await callGemini(prompt);

    if (!content) {
      return NextResponse.json(
        { error: "Gemini API quota exhausted. Please wait a minute and try again, or use manual entry." },
        { status: 503 }
      );
    }

    try {
      const result = parseResult(content);
      return NextResponse.json(result);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse bill data from AI response" },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error("Parse Bill Error:", error);
    return NextResponse.json(
      { error: "Failed to parse bill. Please try again shortly." },
      { status: 500 }
    );
  }
}
