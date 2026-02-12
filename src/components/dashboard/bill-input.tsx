"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileText,
  Camera,
  Loader2,
  Zap,
  Flame,
  Droplets,
  X,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export interface BillData {
  billType: "electricity" | "gas" | "water";
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
  const [billType, setBillType] = useState<"electricity" | "gas" | "water">("electricity");
  const [units, setUnits] = useState("");
  const [tariff, setTariff] = useState("10");
  const [extra, setExtra] = useState("0");
  const [billDate, setBillDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [ocrExtracted, setOcrExtracted] = useState(false);
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
      ocrRawText: ocrText || undefined,
    });

    toast.success(ocrExtracted ? "Extracted bill submitted!" : "Bill calculated successfully!");
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
    toast.info("Analyzing bill image with AI...");

    try {
      // Convert file to base64 and send directly to Gemini Vision API
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onloadend = () => {
          const result = r.result as string;
          // Strip the data:image/xxx;base64, prefix
          resolve(result.split(",")[1]);
        };
        r.onerror = reject;
        r.readAsDataURL(file);
      });

      const mimeType = file.type || "image/jpeg";

      // Send image directly to AI for structured extraction (no tesseract needed)
      const response = await fetch("/api/ai/parse-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      if (response.ok) {
        const parsed = await response.json();
        // Set all extracted fields
        if (parsed.unitsConsumed != null && parsed.unitsConsumed > 0) setUnits(parsed.unitsConsumed.toString());
        if (parsed.tariffRate != null && parsed.tariffRate > 0) setTariff(parsed.tariffRate.toString());
        if (parsed.extraCharges != null && parsed.extraCharges > 0) setExtra(parsed.extraCharges.toString());
        if (parsed.billType) setBillType(parsed.billType);
        if (parsed.billDate) setBillDate(parsed.billDate);
        setOcrExtracted(true);
        setOcrText("AI Vision extraction");

        if (parsed.unitsConsumed > 0) {
          toast.success("Bill data extracted successfully! Review and submit below.", { duration: 4000 });
        } else {
          toast.success("Some data extracted — please enter units manually.");
        }
      } else {
        if (response.status === 503) {
          toast.warning("AI service is busy. Please try again in a moment.");
        } else {
          toast.warning("AI couldn't parse the bill. Please enter the numbers manually.");
        }
      }
    } catch (error) {
      console.error("Image processing error:", error);
      toast.error("Failed to process image. Please try manual entry.");
    } finally {
      setOcrLoading(false);
    }
  };

  const clearUpload = () => {
    setUploadedImage(null);
    setOcrText("");
    setOcrExtracted(false);
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
              ? "bg-yellow-500/15 border border-yellow-500/30 shadow-lg shadow-yellow-500/5"
              : "bg-glass border border-border hover:bg-glass-strong"
          }`}
        >
          <Zap className={`h-4 w-4 ${billType === "electricity" ? "text-yellow-500" : "text-foreground"}`} />
          <span className={`text-sm font-medium ${billType === "electricity" ? "text-yellow-500" : "text-foreground"}`}>Electricity</span>
        </button>
        <button
          onClick={() => setBillType("gas")}
          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${
            billType === "gas"
              ? "bg-orange-500/15 border border-orange-500/30 shadow-lg shadow-orange-500/5"
              : "bg-glass border border-border hover:bg-glass-strong"
          }`}
        >
          <Flame className={`h-4 w-4 ${billType === "gas" ? "text-orange-500" : "text-foreground"}`} />
          <span className={`text-sm font-medium ${billType === "gas" ? "text-orange-500" : "text-foreground"}`}>Gas</span>
        </button>
        <button
          onClick={() => setBillType("water")}
          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${
            billType === "water"
              ? "bg-blue-500/15 border border-blue-500/30 shadow-lg shadow-blue-500/5"
              : "bg-glass border border-border hover:bg-glass-strong"
          }`}
        >
          <Droplets className={`h-4 w-4 ${billType === "water" ? "text-blue-500" : "text-foreground"}`} />
          <span className={`text-sm font-medium ${billType === "water" ? "text-blue-500" : "text-foreground"}`}>Water</span>
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

          {ocrExtracted && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">AI Extracted Data</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {units && (
                  <div className="flex items-center gap-2 text-xs">
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="text-muted-foreground">Units:</span>
                    <span className="text-foreground font-medium">{units}</span>
                  </div>
                )}
                {tariff && (
                  <div className="flex items-center gap-2 text-xs">
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="text-muted-foreground">Tariff:</span>
                    <span className="text-foreground font-medium">{tariff} PKR</span>
                  </div>
                )}
                {extra && parseFloat(extra) > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="text-muted-foreground">Extra:</span>
                    <span className="text-foreground font-medium">{extra} PKR</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs">
                  <Check className="h-3 w-3 text-green-500" />
                  <span className="text-muted-foreground">Type:</span>
                  <span className="text-foreground font-medium capitalize">{billType}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Review the extracted data below and click Analyze to proceed.</p>
            </div>
          )}

          {ocrText && !ocrExtracted && (
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
          className={`w-full h-11 font-semibold shadow-lg ${
            ocrExtracted 
              ? "bg-green-600 text-white hover:bg-green-700 shadow-green-500/10" 
              : "bg-white text-black hover:bg-neutral-200 shadow-white/5"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : ocrExtracted ? (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze Extracted Bill
            </>
          ) : (
            "Analyze Bill"
          )}
        </Button>
      </div>
    </div>
  );
}
