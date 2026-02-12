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
      console.log(`Tips: trying Gemini model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      const text = response.text;
      if (text) {
        console.log(`Tips: Gemini ${model} succeeded`);
        return text;
      }
    } catch (error: any) {
      const status = error?.status || error?.code;
      console.log(`Tips: Gemini ${model} failed (status: ${status})`);
      continue;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { bill, language } = await req.json();

    const langInstruction = language === "urdu"
      ? "IMPORTANT: Write ALL tips in Urdu (اردو) script. Use simple everyday Urdu."
      : language === "hindi"
        ? "IMPORTANT: Write ALL tips in Hindi (हिंदी) script. Use simple everyday Hindi."
        : "Write tips in simple English.";

    const prompt = `You are an energy savings expert. Based on this utility bill data, provide exactly 5 practical, actionable tips to reduce the bill. Each tip should be specific and easy to follow.

${langInstruction}

Bill Details:
- Type: ${bill.billType}
- Units: ${bill.unitsConsumed} units (daily avg: ~${(bill.unitsConsumed / 30).toFixed(1)} units/day)
- Rate: ${bill.tariffRate} PKR/unit
- Total: ${bill.totalAmount} PKR
- Extra Charges: ${bill.extraCharges} PKR

Respond with a JSON array of exactly 5 strings, each being a concise tip (1-2 sentences max).
Example format: ["Tip 1 text", "Tip 2 text", "Tip 3 text", "Tip 4 text", "Tip 5 text"]
Only respond with the JSON array, nothing else.`;

    const content = await callGemini(prompt);

    let tips: string[];
    if (content) {
      try {
        const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
        tips = JSON.parse(cleanContent);
        if (!Array.isArray(tips)) throw new Error("Not an array");
      } catch {
        tips = getFallbackTips(bill.billType);
      }
    } else {
      tips = getFallbackTips(bill.billType);
    }

    return NextResponse.json({ tips });
  } catch (error) {
    console.error("AI Tips Error:", error);
    return NextResponse.json({
      tips: getFallbackTips("electricity"),
    });
  }
}

function getFallbackTips(billType: string): string[] {
  if (billType === "gas") {
    return [
      "Lower your water heater temperature to 120°F (49°C) to save up to 10% on gas.",
      "Seal gaps around doors and windows to prevent heat loss.",
      "Use lids on pots while cooking to reduce gas consumption by 20%.",
      "Insulate hot water pipes to maintain temperature and reduce reheating.",
      "Service your gas appliances annually for optimal efficiency.",
    ];
  }
  return [
    "Switch off lights and fans when leaving a room to save up to 10%.",
    "Set your AC to 24-26°C instead of lower temperatures.",
    "Replace old bulbs with energy-efficient LED lights.",
    "Unplug phone chargers and electronics when not in use.",
    "Use natural ventilation during mild weather instead of AC.",
  ];
}
