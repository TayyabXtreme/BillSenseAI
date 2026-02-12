"use client";

import { use, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Zap,
  Flame,
  Brain,
  Sparkles,
  Loader2,
  MessageCircle,
  Lightbulb,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Check,
  ArrowLeft,
  Calendar,
  FileText,
  Activity,
  SlidersHorizontal,
  Download,
} from "lucide-react";
import Link from "next/link";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const appliances = [
  { name: "Air Conditioner", reduction: 25, icon: "❄️" },
  { name: "Water Heater", reduction: 15, icon: "🚿" },
  { name: "Iron", reduction: 8, icon: "👔" },
  { name: "Washing Machine", reduction: 5, icon: "🧺" },
];

export default function BillDetailPage({
  params,
}: {
  params: Promise<{ billId: string }>;
}) {
  const { billId } = use(params);
  const { user } = useUser();

  const bill = useQuery(api.bills.getBillById, {
    billId: billId as Id<"bills">,
  });

  const updateExplanation = useMutation(api.bills.updateBillExplanation);

  const [explanation, setExplanation] = useState("");
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [usageReduction, setUsageReduction] = useState([0]);
  const [disabledAppliances, setDisabledAppliances] = useState<string[]>([]);

  // Use saved AI data if available
  const displayExplanation = explanation || bill?.aiExplanation || "";
  const displayTips = tips.length > 0 ? tips : bill?.aiTips || [];

  if (bill === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
          <p className="text-sm text-neutral-500">Loading bill details...</p>
        </div>
      </div>
    );
  }

  if (bill === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <FileText className="h-12 w-12 text-neutral-600" />
        <h2 className="text-xl font-semibold text-white">Bill not found</h2>
        <p className="text-sm text-neutral-500">
          This bill may have been deleted.
        </p>
        <Link href="/dashboard">
          <Button
            variant="outline"
            className="bg-white/[0.06] text-white border-white/10 hover:bg-white/[0.1]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  // Calculations
  const pieData = [
    { name: "Base Usage", value: bill.baseAmount, color: "#e5e5e5" },
    { name: "Taxes (5%)", value: bill.taxes, color: "#737373" },
    { name: "Extra Charges", value: bill.extraCharges, color: "#404040" },
  ];

  const dailyUsage = bill.unitsConsumed / 30;
  let usageLevel: "low" | "medium" | "high" = "low";
  let usageLevelLabel = "Normal Usage";
  let UsageIcon = Check;

  if (dailyUsage > 30) {
    usageLevel = "high";
    usageLevelLabel = "High Usage Alert!";
    UsageIcon = AlertTriangle;
  } else if (dailyUsage > 15) {
    usageLevel = "medium";
    usageLevelLabel = "Moderate Usage";
    UsageIcon = TrendingUp;
  }

  // Simulator calculations
  const applianceReduction = appliances
    .filter((a) => disabledAppliances.includes(a.name))
    .reduce((sum, a) => sum + a.reduction, 0);
  const totalReductionPercent = Math.min(
    usageReduction[0] + applianceReduction,
    90
  );
  const newUnits = bill.unitsConsumed * (1 - totalReductionPercent / 100);
  const newBase = newUnits * bill.tariffRate;
  const newTaxes = newBase * 0.05;
  const newTotal = newBase + newTaxes + bill.extraCharges;
  const savings = bill.totalAmount - newTotal;

  const toggleAppliance = (name: string) => {
    setDisabledAppliances((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleExplain = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bill: {
            billType: bill.billType,
            unitsConsumed: bill.unitsConsumed,
            tariffRate: bill.tariffRate,
            extraCharges: bill.extraCharges,
            taxes: bill.taxes,
            baseAmount: bill.baseAmount,
            totalAmount: bill.totalAmount,
            billDate: bill.billDate,
            month: bill.month,
          },
        }),
      });
      if (!response.ok) throw new Error("Failed to get explanation");
      const data = await response.json();
      setExplanation(data.explanation);
      await updateExplanation({
        billId: billId as Id<"bills">,
        aiExplanation: data.explanation,
      });
      toast.success("AI explanation generated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate explanation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetTips = async () => {
    setTipsLoading(true);
    try {
      const response = await fetch("/api/ai/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bill: {
            billType: bill.billType,
            unitsConsumed: bill.unitsConsumed,
            tariffRate: bill.tariffRate,
            extraCharges: bill.extraCharges,
            taxes: bill.taxes,
            baseAmount: bill.baseAmount,
            totalAmount: bill.totalAmount,
            billDate: bill.billDate,
            month: bill.month,
          },
        }),
      });
      if (!response.ok) throw new Error("Failed to get tips");
      const data = await response.json();
      setTips(data.tips);
      await updateExplanation({
        billId: billId as Id<"bills">,
        aiExplanation: displayExplanation || "No explanation yet",
        aiTips: data.tips,
      });
      toast.success("Savings tips generated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate tips. Please try again.");
    } finally {
      setTipsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Back + Bill Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link href="/dashboard">
          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-400 hover:text-white hover:bg-white/[0.06] gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex-1 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-white/[0.08] border border-white/[0.06]">
            {bill.billType === "electricity" ? (
              <Zap className="h-6 w-6 text-yellow-400" />
            ) : (
              <Flame className="h-6 w-6 text-orange-400" />
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              {bill.billType.charAt(0).toUpperCase() + bill.billType.slice(1)}{" "}
              Bill
            </h1>
            <div className="flex items-center gap-3 text-sm text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {bill.month}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  bill.status === "analyzed"
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-white/[0.06] text-neutral-400 border border-white/[0.08]"
                }`}
              >
                {bill.status === "analyzed" ? "✓ Analyzed" : "● Draft"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Amount",
            value: `${bill.totalAmount.toLocaleString()} PKR`,
            icon: Zap,
            accent: "text-white",
          },
          {
            label: "Units Used",
            value: `${bill.unitsConsumed}`,
            icon: Activity,
            accent: "text-neutral-300",
          },
          {
            label: "Rate",
            value: `${bill.tariffRate} PKR/unit`,
            icon: TrendingUp,
            accent: "text-neutral-300",
          },
          {
            label: "Daily Avg",
            value: `~${dailyUsage.toFixed(1)} units`,
            icon: BarChart,
            accent: "text-neutral-300",
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl p-4 bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl"
          >
            <metric.icon className="h-4 w-4 text-neutral-500 mb-2" />
            <p className={`text-lg font-bold ${metric.accent} truncate`}>
              {metric.value}
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {metric.label}
            </p>
          </div>
        ))}
      </div>

      {/* Usage Level Banner */}
      <div
        className={`flex items-center gap-3 p-4 rounded-xl ${
          usageLevel === "high"
            ? "usage-high"
            : usageLevel === "medium"
            ? "usage-medium"
            : "usage-low"
        }`}
      >
        <UsageIcon className="h-5 w-5 shrink-0" />
        <div>
          <p className="text-sm font-medium">{usageLevelLabel}</p>
          <p className="text-xs opacity-70">
            ~{dailyUsage.toFixed(1)} units/day average over 30 days
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Bill Breakdown */}
        <div className="space-y-6">
          {/* Pie Chart + Breakdown */}
          <div className="rounded-2xl p-6 bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <FileText className="h-5 w-5 text-neutral-400" />
              Bill Breakdown
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "rgba(20,20,20,0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: "#e5e5e5",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [
                        `${value.toLocaleString()} PKR`,
                        "",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3 flex flex-col justify-center">
                {[
                  {
                    label: "Base Usage",
                    value: bill.baseAmount,
                    color: "bg-neutral-200",
                  },
                  {
                    label: "Taxes (5%)",
                    value: bill.taxes,
                    color: "bg-neutral-500",
                  },
                  {
                    label: "Extra Charges",
                    value: bill.extraCharges,
                    color: "bg-neutral-700",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${item.color}`}
                    />
                    <div className="flex-1">
                      <p className="text-xs text-neutral-400">{item.label}</p>
                      <p className="text-sm font-medium text-white">
                        {item.value.toLocaleString()} PKR
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Details Table */}
            <div className="bg-white/[0.04] border border-white/[0.1] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    {
                      label: "Bill Type",
                      value:
                        bill.billType.charAt(0).toUpperCase() +
                        bill.billType.slice(1),
                    },
                    {
                      label: "Units Consumed",
                      value: `${bill.unitsConsumed} units`,
                    },
                    {
                      label: "Tariff Rate",
                      value: `${bill.tariffRate} PKR/unit`,
                    },
                    {
                      label: "Base Amount",
                      value: `${bill.baseAmount.toLocaleString()} PKR`,
                    },
                    {
                      label: "Taxes (5%)",
                      value: `${bill.taxes.toLocaleString()} PKR`,
                    },
                    {
                      label: "Extra Charges",
                      value: `${bill.extraCharges.toLocaleString()} PKR`,
                    },
                  ].map((row, i) => (
                    <tr
                      key={row.label}
                      className={i % 2 === 0 ? "bg-white/[0.02]" : ""}
                    >
                      <td className="px-4 py-2.5 text-neutral-400">
                        {row.label}
                      </td>
                      <td className="px-4 py-2.5 text-white text-right font-medium">
                        {row.value}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-white/10 bg-white/[0.04]">
                    <td className="px-4 py-3 text-white font-semibold">
                      Total
                    </td>
                    <td className="px-4 py-3 text-white text-right font-bold text-lg">
                      {bill.totalAmount.toLocaleString()} PKR
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Savings Simulator */}
          <div className="rounded-2xl p-6 bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-neutral-400" />
              Savings Simulator
            </h2>

            {/* Slider */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm text-neutral-200">
                  Reduce Usage By
                </Label>
                <span className="text-sm font-bold text-white">
                  {usageReduction[0]}%
                </span>
              </div>
              <Slider
                value={usageReduction}
                onValueChange={setUsageReduction}
                min={0}
                max={50}
                step={5}
                className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-white/20 [&_[role=slider]]:shadow-lg"
              />
            </div>

            {/* Appliance Toggles */}
            <div className="mb-6">
              <p className="text-sm text-neutral-300 mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Turn off appliances to save more
              </p>
              <div className="grid grid-cols-2 gap-3">
                {appliances.map((appliance) => (
                  <div
                    key={appliance.name}
                    onClick={() => toggleAppliance(appliance.name)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                      disabledAppliances.includes(appliance.name)
                        ? "usage-low border border-green-500/20"
                        : "bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08]"
                    }`}
                  >
                    <span className="text-lg">{appliance.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">
                        {appliance.name}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        -{appliance.reduction}%
                      </p>
                    </div>
                    <Switch
                      checked={disabledAppliances.includes(appliance.name)}
                      onCheckedChange={() => toggleAppliance(appliance.name)}
                      className="scale-75"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="bg-white/[0.06] border border-white/[0.1] rounded-xl p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-neutral-400 mb-1">New Units</p>
                  <p className="text-lg font-bold text-white">
                    {Math.round(newUnits)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-1">New Bill</p>
                  <p className="text-lg font-bold text-white">
                    {Math.round(newTotal).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-neutral-400">PKR</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-1">You Save</p>
                  <p className="text-lg font-bold text-green-400">
                    {savings > 0
                      ? Math.round(savings).toLocaleString()
                      : "0"}
                  </p>
                  <p className="text-[10px] text-neutral-500">PKR</p>
                </div>
              </div>
            </div>

            {savings > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl usage-low mt-3">
                <TrendingDown className="h-4 w-4 shrink-0" />
                <p className="text-sm">
                  By reducing {totalReductionPercent}% usage, you save{" "}
                  <span className="font-bold">
                    {Math.round(savings).toLocaleString()} PKR
                  </span>{" "}
                  (
                  {bill.totalAmount > 0
                    ? ((savings / bill.totalAmount) * 100).toFixed(1)
                    : "0"}
                  %)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Analysis */}
        <div className="space-y-6">
          {/* AI Section */}
          <div className="rounded-2xl p-6 bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <Brain className="h-5 w-5 text-neutral-400" />
              AI Analysis
            </h2>

            {/* Status Indicator */}
            <div className="flex items-center gap-3 p-3 mb-5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  displayExplanation
                    ? "bg-green-400 animate-pulse"
                    : "bg-neutral-500"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm text-white">
                  {displayExplanation
                    ? "Analysis Complete"
                    : "Not Analyzed Yet"}
                </p>
                <p className="text-[10px] text-neutral-500">
                  {displayExplanation
                    ? "AI has analyzed this bill"
                    : "Click below to analyze with Gemini AI"}
                </p>
              </div>
              <Sparkles
                className={`h-4 w-4 ${
                  displayExplanation ? "text-green-400" : "text-neutral-600"
                }`}
              />
            </div>

            {/* Explain Button */}
            {!displayExplanation && (
              <Button
                onClick={handleExplain}
                disabled={loading}
                className="w-full bg-white text-black hover:bg-neutral-200 h-11 font-semibold shadow-lg shadow-white/5 mb-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Analyzing your bill...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Explain My Bill with AI
                  </>
                )}
              </Button>
            )}

            {/* AI Explanation */}
            {displayExplanation && (
              <div className="space-y-4">
                <div className="bg-white/[0.06] border border-white/[0.1] rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-white/[0.1] mt-0.5 shrink-0">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 mb-2">
                        AI Explanation
                      </p>
                      <div className="text-sm text-neutral-200 leading-relaxed whitespace-pre-line">
                        {displayExplanation}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleExplain}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    className="bg-white/[0.06] text-neutral-300 border-white/10 gap-1 hover:bg-white/[0.1]"
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
                    />
                    Regenerate
                  </Button>
                  {displayTips.length === 0 && (
                    <Button
                      onClick={handleGetTips}
                      disabled={tipsLoading}
                      size="sm"
                      className="bg-white/10 text-white hover:bg-white/15 border border-white/10 gap-1"
                    >
                      {tipsLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Lightbulb className="h-3 w-3" />
                      )}
                      Get Savings Tips
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tips Cards */}
          {displayTips.length > 0 && (
            <div className="rounded-2xl p-6 bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-lg shadow-black/20">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-neutral-400" />
                AI Savings Tips
              </h2>
              <div className="space-y-3">
                {displayTips.map((tip, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-3 flex items-start gap-3 bg-white/[0.03] hover:bg-white/[0.06] transition-colors border border-white/[0.06]"
                  >
                    <span className="shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-white">
                      {i + 1}
                    </span>
                    <p className="text-sm text-neutral-300 leading-relaxed">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>

              {/* Regenerate tips */}
              <Button
                onClick={handleGetTips}
                disabled={tipsLoading}
                variant="outline"
                size="sm"
                className="mt-4 bg-white/[0.06] text-neutral-300 border-white/10 gap-1 hover:bg-white/[0.1]"
              >
                {tipsLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Regenerate Tips
              </Button>
            </div>
          )}

          {/* OCR Raw Text (if available) */}
          {bill.ocrRawText && (
            <div className="rounded-2xl p-6 bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-lg shadow-black/20">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-neutral-400" />
                OCR Extracted Text
              </h2>
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 max-h-48 overflow-y-auto">
                <pre className="text-xs text-neutral-400 whitespace-pre-wrap font-mono leading-relaxed">
                  {bill.ocrRawText}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
