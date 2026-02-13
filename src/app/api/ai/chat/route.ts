import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

async function callGemini(prompt: string): Promise<string | null> {
  for (const model of GEMINI_MODELS) {
    try {
      console.log(`Chat: trying Gemini model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      const text = response.text;
      if (text) {
        console.log(`Chat: Gemini ${model} succeeded`);
        return text;
      }
    } catch (error: any) {
      const status = error?.status || error?.code;
      console.log(`Chat: Gemini ${model} failed (status: ${status})`);
      continue;
    }
  }
  return null;
}

interface Bill {
  _id: string;
  name?: string;
  billType: string;
  unitsConsumed: number;
  tariffRate: number;
  extraCharges: number;
  taxes: number;
  totalAmount: number;
  baseAmount: number;
  billDate: string;
  month: string;
  status: string;
  isPaid?: boolean;
  dueDate?: string;
  aiExplanation?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { message, bills, history } = (await req.json()) as {
      message: string;
      bills: Bill[];
      history: ChatMessage[];
    };

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Build bill context summary
    const billsSummary =
      bills && bills.length > 0
        ? bills
            .map((b, i) => {
              const name = b.name || `${b.billType} - ${b.month}`;
              return `Bill #${i + 1}: "${name}"
  - Type: ${b.billType}
  - Units: ${b.unitsConsumed}, Tariff: ${b.tariffRate} PKR/unit
  - Base: ${b.baseAmount} PKR, Taxes: ${b.taxes} PKR, Extra: ${b.extraCharges} PKR
  - Total: ${b.totalAmount} PKR
  - Date: ${b.billDate}, Month: ${b.month}
  - Status: ${b.status}${b.isPaid ? ", Paid" : b.dueDate ? `, Due: ${b.dueDate}` : ", Unpaid"}`;
            })
            .join("\n\n")
        : "No bills uploaded yet.";

    // Build conversation history
    const historyText =
      history && history.length > 0
        ? history
            .slice(-10) // Keep last 10 messages for context
            .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
            .join("\n\n")
        : "";

    const prompt = `You are BillSense AI — a smart, friendly, and helpful utility bill assistant. You have access to the user's bill data and can answer questions about their bills, provide analysis, comparisons, savings tips, and general utility-related advice.

## Your Capabilities:
- Answer questions about the user's specific bills (amounts, dates, types, trends)
- Compare bills across months or types
- Provide energy/water/gas saving tips
- Explain bill components (base amount, taxes, extra charges)
- Identify spending patterns and anomalies
- Help with budgeting and payment tracking
- General knowledge about utility billing in Pakistan

## Formatting Rules:
- Use Markdown formatting for readable responses
- Use **bold** for important numbers and key info
- Use bullet points and numbered lists where helpful
- Use tables for comparisons if needed
- Keep responses concise but thorough
- Use emojis sparingly for visual appeal (⚡🔥💧💰📊)
- If the user asks about a bill that doesn't exist, let them know politely

## User's Bills Data:
${billsSummary}

${historyText ? `## Conversation History:\n${historyText}\n` : ""}
## Current User Message:
${message}

Respond helpfully and conversationally. If the user asks about a specific bill, reference the exact data. If they ask something unrelated to bills, you can still help but gently remind them you're specialized in utility bill analysis.`;

    const reply = await callGemini(prompt);

    if (!reply) {
      return NextResponse.json(
        {
          error:
            "AI service is temporarily unavailable. Please try again in a moment.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
