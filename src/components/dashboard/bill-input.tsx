"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileText,
  Camera,
  Loader2,
  Zap,
  Flame,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export interface BillData {
  billType: "electricity" | "gas";
  unitsConsumed: number;
  tariffRate: number;
  extraCharges: number;
  taxes: number;
  baseAmount: number;
  totalAmount: number;
  billDate: string;
  month: string;
  ocrRawText?: string;
}

interface BillInputProps {
  onBillSubmit: (data: BillData) => void;
  isLoading: boolean;
}

export function BillInput({ onBillSubmit, isLoading }: BillInputProps) {
  const [billType, setBillType] = useState<"electricity" | "gas">("electricity");
  const [units, setUnits] = useState("");
  const [tariff, setTariff] = useState("10");
  const [extra, setExtra] = useState("0");
  const [billDate, setBillDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateBill = useCallback(
    (u: number, t: number, e: number) => {
      const baseAmount = u * t;
      const taxes = baseAmount * 0.05;
      const totalAmount = baseAmount + taxes + e;
      return { baseAmount, taxes, totalAmount };
    },
    []
  );

  const handleManualSubmit = () => {
    const u = parseFloat(units);
    const t = parseFloat(tariff);
    const e = parseFloat(extra) || 0;

    if (!u || u <= 0) {
      toast.error("Please enter valid units consumed");
      return;
    }
    if (!t || t <= 0) {
      toast.error("Please enter a valid tariff rate");
      return;
    }

    const { baseAmount, taxes, totalAmount } = calculateBill(u, t, e);
    const date = new Date(billDate);

    onBillSubmit({
      billType,
      unitsConsumed: u,
      tariffRate: t,
      extraCharges: e,
      taxes,
      baseAmount,
      totalAmount,
      billDate,
      month: date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),
    });

    toast.success("Bill calculated successfully!");
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => setUploadedImage(reader.result as string);
    reader.readAsDataURL(file);

    setOcrLoading(true);
    toast.info("Processing bill image with OCR...");

    try {
      // Use tesseract.js for OCR
      const Tesseract = await import("tesseract.js");
      const {
        data: { text },
      } = await Tesseract.recognize(file, "eng");

      setOcrText(text);

      // Now send OCR text to AI for structured extraction
      const response = await fetch("/api/ai/parse-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ocrText: text }),
      });

      if (response.ok) {
        const parsed = await response.json();
        setUnits(parsed.unitsConsumed?.toString() || "");
        setTariff(parsed.tariffRate?.toString() || "10");
        setExtra(parsed.extraCharges?.toString() || "0");
        if (parsed.billType) setBillType(parsed.billType);
        toast.success("Bill data extracted successfully!");
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 503) {
          toast.warning("AI service is busy. Fields populated from OCR — please verify the numbers.");
        } else {
          toast.warning("AI couldn't parse the bill. Please enter the numbers manually.");
        }
        // Try basic regex extraction as fallback
        const numbers = text.match(/\d+\.?\d*/g);
        if (numbers && numbers.length > 0) {
          setUnits(
            numbers
              .find((n) => parseFloat(n) > 10 && parseFloat(n) < 5000)
              ?.toString() || ""
          );
        }
      }
    } catch (error) {
      console.error("OCR Error:", error);
      toast.error("Failed to process image. Please try manual entry.");
    } finally {
      setOcrLoading(false);
    }
  };

  const clearUpload = () => {
    setUploadedImage(null);
    setOcrText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="rounded-2xl p-6 bg-glass border border-border backdrop-blur-xl shadow-lg shadow-black/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-glass-strong border border-border">
          <FileText className="h-5 w-5 text-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Bill Input</h2>
          <p className="text-xs text-muted-foreground">
            Upload a photo or enter details manually
          </p>
        </div>
      </div>

      {/* Bill Type Selector */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setBillType("electricity")}
          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${
            billType === "electricity"
              ? "bg-glass-strong border border-glass-border shadow-lg shadow-black/5"
              : "bg-glass border border-border hover:bg-glass-strong"
          }`}
        >
          <Zap className="h-4 w-4 text-foreground" />
          <span className="text-sm font-medium text-foreground">Electricity</span>
        </button>
        <button
          onClick={() => setBillType("gas")}
          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${
            billType === "gas"
              ? "bg-glass-strong border border-glass-border shadow-lg shadow-black/5"
              : "bg-glass border border-border hover:bg-glass-strong"
          }`}
        >
          <Flame className="h-4 w-4" />
          <span className="text-sm font-medium text-foreground">Gas</span>
        </button>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="w-full bg-glass border border-glass-border mb-6 h-11">
          <TabsTrigger
            value="upload"
            className="flex-1 data-[state=active]:bg-glass-strong data-[state=active]:text-foreground text-muted-foreground gap-2"
          >
            <Camera className="h-4 w-4" />
            Upload Photo
          </TabsTrigger>
          <TabsTrigger
            value="manual"
            className="flex-1 data-[state=active]:bg-glass-strong data-[state=active]:text-foreground text-muted-foreground gap-2"
          >
            <FileText className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          {!uploadedImage ? (
            <label className="flex flex-col items-center justify-center w-full h-48 rounded-xl bg-glass border border-dashed border-glass-border cursor-pointer hover:bg-glass-strong hover:border-foreground/25 transition-all group">
              <Upload className="h-10 w-10 text-muted-foreground group-hover:text-foreground transition-colors mb-3" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground">
                Click to upload or drag & drop
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 10MB
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative">
              <img
                src={uploadedImage}
                alt="Bill"
                className="w-full h-48 object-cover rounded-xl border border-glass-border"
              />
              <button
                onClick={clearUpload}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              {ocrLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl">
                  <div className="flex items-center gap-3 text-white">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Processing with AI...</span>
                  </div>
                </div>
              )}
              {!ocrLoading && ocrText && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs">
                  <Check className="h-3 w-3" />
                  Data extracted
                </div>
              )}
            </div>
          )}

          {ocrText && (
            <div className="bg-glass border border-glass-border rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-1">Extracted Text:</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 max-h-20 overflow-y-auto font-mono">
                {ocrText.slice(0, 300)}
                {ocrText.length > 300 && "..."}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Manual Tab */}
        <TabsContent value="manual" className="space-y-4">
          {/* This space intentionally left for the shared form below */}
        </TabsContent>
      </Tabs>

      {/* Shared form fields */}
      <div className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-foreground text-sm">Units Consumed</Label>
            <Input
              type="number"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              placeholder="e.g., 350"
              className="h-10 bg-glass border-glass-border text-foreground placeholder:text-muted-foreground rounded-xl focus:border-foreground/25"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground text-sm">
              Tariff Rate (PKR/unit)
            </Label>
            <Input
              type="number"
              value={tariff}
              onChange={(e) => setTariff(e.target.value)}
              placeholder="10"
              className="h-10 bg-glass border-glass-border text-foreground placeholder:text-muted-foreground rounded-xl focus:border-foreground/25"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-foreground text-sm">
              Extra Charges (PKR)
            </Label>
            <Input
              type="number"
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="0"
              className="h-10 bg-glass border-glass-border text-foreground placeholder:text-muted-foreground rounded-xl focus:border-foreground/25"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground text-sm">Bill Date</Label>
            <Input
              type="date"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              className="h-10 bg-glass border-glass-border text-foreground rounded-xl focus:border-foreground/25 dark:[color-scheme:dark] [color-scheme:light]"
            />
          </div>
        </div>

        {/* Live preview */}
        {units && tariff && (
          <div className="bg-glass-strong border border-glass-border rounded-xl p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-300">Estimated Total</span>
              <span className="text-xl font-bold text-foreground">
                {calculateBill(
                  parseFloat(units) || 0,
                  parseFloat(tariff) || 0,
                  parseFloat(extra) || 0
                ).totalAmount.toLocaleString("en-PK", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  PKR
                </span>
              </span>
            </div>
          </div>
        )}

        <Button
          onClick={handleManualSubmit}
          disabled={isLoading || !units}
          className="w-full bg-white text-black hover:bg-neutral-200 h-11 font-semibold shadow-lg shadow-white/5"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            "Analyze Bill"
          )}
        </Button>
      </div>
    </div>
  );
}
