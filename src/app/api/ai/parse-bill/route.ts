import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Gemini models to try in order (vision-capable)
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

async function callGeminiWithImage(
  prompt: string,
  imageBase64?: string,
  mimeType?: string
): Promise<string | null> {
  for (const model of GEMINI_MODELS) {
    try {
      console.log(`Parse: trying Gemini model: ${model}`);
      const contents: any[] = [];

      if (imageBase64 && mimeType) {
        // Multimodal: image + text
        contents.push({
          role: "user",
          parts: [
            {
              inlineData: {
                data: imageBase64,
                mimeType,
              },
            },
            { text: prompt },
          ],
        });
      } else {
        // Text only
        contents.push({ role: "user", parts: [{ text: prompt }] });
      }

      const response = await ai.models.generateContent({
        model,
        contents,
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
    baseAmount: Number(parsed.baseAmount) || 0,
    taxes: Number(parsed.taxes) || 0,
    billDate: parsed.billDate || "",
    month: parsed.month || "",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ocrText, imageBase64, mimeType } = body;

    if (!ocrText && !imageBase64) {
      return NextResponse.json(
        { error: "No image or text provided" },
        { status: 400 }
      );
    }

    const prompt = `You are an expert utility bill parser. ${imageBase64 ? "Look at this utility bill image carefully and extract ALL data." : "Extract ALL data from this OCR text of a utility bill."} The bill could be electricity, gas, or water from any country.
${ocrText ? `\nOCR Text:\n"""\n${ocrText}\n"""` : ""}

Extract these fields and return as JSON:
{
  "billType": "electricity" or "gas" or "water",
  "unitsConsumed": number (CRITICAL - this is the MOST important field),
  "tariffRate": number (rate per unit, calculate from base and units if not explicit),
  "extraCharges": number (surcharges, fuel adjustments, service charges, etc.),
  "taxes": number (all taxes combined),
  "baseAmount": number (base usage charge = units × rate),
  "totalAmount": number (grand total / amount due / net payable),
  "billDate": "YYYY-MM-DD" (billing date or due date),
  "month": "Month Year" (e.g., "January 2026", the billing period)
}

CRITICAL RULES FOR UNITS:
- unitsConsumed is the MOST IMPORTANT field — you MUST find it
- Look for: "units consumed", "units used", "units billed", "consumption", "kWh", "total units"
- Look for meter readings: current reading minus previous reading = units consumed
- Look for patterns like "350 units", "kWh: 450", "consumption 280"
- On Pakistani bills: look in the table rows for "units" column, or "UNITS CONSUMED" heading
- If you see meter readings (present/current minus previous/last), SUBTRACT them to get units
- NEVER return 0 for units if there are any numbers on the bill that could represent consumption
- Even if OCR quality is poor, estimate units from the bill amount: units ≈ totalAmount / tariffRate

Other extraction rules:
- Detect bill type from keywords: "kWh", "electricity", "WAPDA", "LESCO", "K-Electric" → electricity; "SSGC", "SNGPL", "gas", "MCF", "BTU" → gas; "water", "WASA", "gallons", "cubic" → water
- For tariff: look for "rate per unit", "tariff", "price/unit". If not found, calculate as baseAmount / unitsConsumed
- For taxes: look for "GST", "tax", "govt charges", "FPA", "FC surcharge", "TV fee"
- For extraCharges: look for "surcharge", "fuel adjustment", "meter rent", "service charge", "electricity duty", "PTV fee", "Neelum Jhelum"
- For baseAmount: look for "cost of electricity", "units charges", "base charge". If not found, calculate as unitsConsumed × tariffRate
- For totalAmount: look for "total", "amount due", "payable", "net amount", "grand total"
- For billDate: look for "bill date", "date", "issue date", "due date". Format as YYYY-MM-DD
- For month: look for "billing month", "for the month of", "period". Format as "Month Year"
- If totalAmount is found but baseAmount is not, estimate: baseAmount = totalAmount - taxes - extraCharges
- If taxes not found, estimate as 5% of baseAmount
- Use 0 ONLY for taxes/extraCharges if truly not found. For unitsConsumed, try HARDER before giving 0
- Only respond with valid JSON, no other text`;

    const content = await callGeminiWithImage(prompt, imageBase64, mimeType);

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
