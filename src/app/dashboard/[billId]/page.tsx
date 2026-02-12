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
  BarChart as RechartsBarChart,
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
  BarChart3,
  Gauge,
  BadgeDollarSign,
} from "lucide-react";
import Link from "next/link";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const appliances = [
  { name: "Air Conditioner", reduction: 25, icon: "\u2744\uFE0F" },
  { name: "Water Heater", reduction: 15, icon: "\uD83D\uDEBF" },
  { name: "Iron", reduction: 8, icon: "\uD83D\uDC54" },
  { name: "Washing Machine", reduction: 5, icon: "\uD83E\uDDFA" },
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

  const allBills = useQuery(
    api.bills.getUserBills,
    user?.id ? { userId: user.id } : "skip"
  );

  const updateExplanation = useMutation(api.bills.updateBillExplanation);

  const [explanation, setExplanation] = useState("");
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [usageReduction, setUsageReduction] = useState([0]);
  const [disabledAppliances, setDisabledAppliances] = useState<string[]>([]);

  const displayExplanation = explanation || bill?.aiExplanation || "";
  const displayTips = tips.length > 0 ? tips : bill?.aiTips || [];

  if (bill === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-glass border border-border flex items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Loading bill details...</p>
        </div>
      </div>
    );
  }

  if (bill === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <div className="h-20 w-20 rounded-2xl bg-glass border border-border flex items-center justify-center">
          <FileText className="h-9 w-9 text-neutral-600" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-1">Bill not found</h2>
          <p className="text-sm text-muted-foreground">This bill may have been deleted.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="bg-glass text-foreground border-glass-border hover:bg-glass-strong">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const pieData = [
    { name: "Base Usage", value: bill.baseAmount, color: "#f5f5f5" },
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

  const comparisonData = (allBills || [])
    .slice(0, 6)
    .reverse()
    .map((b) => ({
      month: b.month?.substring(0, 3) || "N/A",
      amount: b.totalAmount,
      units: b.unitsConsumed,
      isCurrent: b._id === billId,
    }));

  const avgAmount =
    allBills && allBills.length > 0
      ? allBills.reduce((s, b) => s + b.totalAmount, 0) / allBills.length
      : bill.totalAmount;
  const diffFromAvg = bill.totalAmount - avgAmount;
  const diffPercent = avgAmount > 0 ? ((diffFromAvg / avgAmount) * 100).toFixed(1) : "0";

  const applianceReduction = appliances
    .filter((a) => disabledAppliances.includes(a.name))
    .reduce((sum, a) => sum + a.reduction, 0);
  const totalReductionPercent = Math.min(usageReduction[0] + applianceReduction, 90);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomBar = (props: any) => {
    const { x, y, width, height, payload } = props;
    const fill = payload.isCurrent ? "#ffffff" : "#525252";
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} ry={4} />
        {payload.isCurrent && (
          <rect x={x} y={y} width={width} height={height} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1} rx={4} ry={4} />
        )}
      </g>
    );
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Back + Bill Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-glass-hover gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex-1 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-glass-strong border border-border">
            {bill.billType === "electricity" ? (
              <Zap className="h-6 w-6 text-yellow-400" />
            ) : (
              <Flame className="h-6 w-6 text-orange-400" />
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {bill.billType.charAt(0).toUpperCase() + bill.billType.slice(1)} Bill
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {bill.month}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                bill.status === "analyzed"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-glass text-muted-foreground border border-border"
              }`}>
                {bill.status === "analyzed" ? "\u2713 Analyzed" : "\u25CF Draft"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Amount", value: `${bill.totalAmount.toLocaleString()}`, unit: "PKR", icon: BadgeDollarSign, accent: "text-foreground", bg: "bg-glass-strong" },
          { label: "Units Used", value: `${bill.unitsConsumed}`, unit: "units", icon: Activity, accent: "text-foreground", bg: "bg-glass" },
          { label: "Tariff Rate", value: `${bill.tariffRate}`, unit: "PKR/unit", icon: Gauge, accent: "text-foreground", bg: "bg-glass" },
          { label: "Daily Average", value: `~${dailyUsage.toFixed(1)}`, unit: "units/day", icon: BarChart3, accent: "text-foreground", bg: "bg-glass" },
        ].map((metric) => (
          <div key={metric.label} className={`rounded-xl p-4 ${metric.bg} border border-border backdrop-blur-xl group hover:bg-glass-strong transition-colors`}>
            <div className="flex items-center justify-between mb-3">
              <metric.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground/60 transition-colors" />
              {metric.label === "Total Amount" && diffFromAvg !== 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  diffFromAvg > 0 ? "text-red-400 bg-red-500/10" : "text-green-400 bg-green-500/10"
                }`}>
                  {diffFromAvg > 0 ? "+" : ""}{diffPercent}%
                </span>
              )}
            </div>
            <p className={`text-xl font-bold ${metric.accent} truncate`}>{metric.value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{metric.unit}</p>
          </div>
        ))}
      </div>

      {/* Usage Level Banner */}
      <div className={`flex items-center gap-3 p-4 rounded-xl ${
        usageLevel === "high" ? "usage-high" : usageLevel === "medium" ? "usage-medium" : "usage-low"
      }`}>
        <UsageIcon className="h-5 w-5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">{usageLevelLabel}</p>
          <p className="text-xs opacity-70">~{dailyUsage.toFixed(1)} units/day average over 30 days</p>
        </div>
        {allBills && allBills.length > 1 && (
          <div className="text-right">
            <p className="text-xs opacity-60">vs avg</p>
            <p className={`text-sm font-bold ${diffFromAvg > 0 ? "text-red-400" : "text-green-400"}`}>
              {diffFromAvg > 0 ? "+" : ""}{Math.round(diffFromAvg).toLocaleString()} PKR
            </p>
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Pie Chart + Breakdown */}
          <div className="rounded-2xl p-6 bg-glass border border-border backdrop-blur-xl shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Bill Breakdown
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15,15,15,0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        color: "#e5e5e5",
                        fontSize: "12px",
                        padding: "8px 12px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                      }}
                      formatter={(value: number) => [`${value.toLocaleString()} PKR`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3 flex flex-col justify-center">
                {[
                  { label: "Base Usage", value: bill.baseAmount, color: "bg-neutral-100", pct: bill.totalAmount > 0 ? Math.round((bill.baseAmount / bill.totalAmount) * 100) : 0 },
                  { label: "Taxes", value: bill.taxes, color: "bg-neutral-500", pct: bill.totalAmount > 0 ? Math.round((bill.taxes / bill.totalAmount) * 100) : 0 },
                  { label: "Extra", value: bill.extraCharges, color: "bg-neutral-700", pct: bill.totalAmount > 0 ? Math.round((bill.extraCharges / bill.totalAmount) * 100) : 0 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <p className="text-xs text-muted-foreground flex-1">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.pct}%</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground pl-4">{item.value.toLocaleString()} PKR</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Details Table */}
            <div className="bg-glass border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    { label: "Bill Type", value: bill.billType.charAt(0).toUpperCase() + bill.billType.slice(1) },
                    { label: "Units Consumed", value: `${bill.unitsConsumed} units` },
                    { label: "Tariff Rate", value: `${bill.tariffRate} PKR/unit` },
                    { label: "Base Amount", value: `${bill.baseAmount.toLocaleString()} PKR` },
                    { label: "Taxes (5%)", value: `${bill.taxes.toLocaleString()} PKR` },
                    { label: "Extra Charges", value: `${bill.extraCharges.toLocaleString()} PKR` },
                  ].map((row, i) => (
                    <tr key={row.label} className={i % 2 === 0 ? "bg-white/[0.015]" : "bg-transparent"}>
                      <td className="px-4 py-2.5 text-muted-foreground">{row.label}</td>
                      <td className="px-4 py-2.5 text-foreground text-right font-medium">{row.value}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-border bg-glass">
                    <td className="px-4 py-3 text-foreground font-semibold">Total</td>
                    <td className="px-4 py-3 text-foreground text-right font-bold text-lg">{bill.totalAmount.toLocaleString()} PKR</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bill Comparison Chart */}
          {comparisonData.length > 1 && (
            <div className="rounded-2xl p-6 bg-glass border border-border backdrop-blur-xl shadow-lg shadow-black/20">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  Bill History
                </h2>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    Current
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-neutral-600" />
                    Other
                  </span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <RechartsBarChart data={comparisonData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#737373", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#525252", fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={35} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,15,15,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      color: "#e5e5e5",
                      fontSize: "12px",
                      padding: "8px 12px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} PKR`, "Total"]}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  />
                  <Bar dataKey="amount" shape={<CustomBar />} radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Average</p>
                  <p className="text-sm font-bold text-foreground">{Math.round(avgAmount).toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">This Bill</p>
                  <p className="text-sm font-bold text-foreground">{bill.totalAmount.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Difference</p>
                  <p className={`text-sm font-bold ${diffFromAvg > 0 ? "text-red-400" : "text-green-400"}`}>
                    {diffFromAvg > 0 ? "+" : ""}{Math.round(diffFromAvg).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Savings Simulator */}
          <div className="rounded-2xl p-6 bg-glass border border-border backdrop-blur-xl shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
              Savings Simulator
            </h2>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm text-foreground">Reduce Usage By</Label>
                <span className="text-sm font-bold text-foreground bg-glass-strong px-2.5 py-1 rounded-lg">{usageReduction[0]}%</span>
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

            <div className="mb-6">
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3 flex items-center gap-2">
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
                        : "bg-glass border border-border hover:bg-glass-strong"
                    }`}
                  >
                    <span className="text-lg">{appliance.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{appliance.name}</p>
                      <p className="text-[10px] text-muted-foreground">save {appliance.reduction}%</p>
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

            <div className="bg-glass-strong border border-glass-border rounded-xl p-5">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">New Units</p>
                  <p className="text-xl font-bold text-foreground">{Math.round(newUnits)}</p>
                </div>
                <div className="border-x border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">New Bill</p>
                  <p className="text-xl font-bold text-foreground">{Math.round(newTotal).toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">PKR</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">You Save</p>
                  <p className="text-xl font-bold text-green-400">{savings > 0 ? Math.round(savings).toLocaleString() : "0"}</p>
                  <p className="text-[10px] text-muted-foreground">PKR</p>
                </div>
              </div>
            </div>

            {savings > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl usage-low mt-4">
                <TrendingDown className="h-4 w-4 shrink-0" />
                <p className="text-sm">
                  Reduce {totalReductionPercent}% usage {"\u2192"} save{" "}
                  <span className="font-bold">{Math.round(savings).toLocaleString()} PKR</span>
                  {" "}({bill.totalAmount > 0 ? ((savings / bill.totalAmount) * 100).toFixed(1) : "0"}%)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Analysis */}
        <div className="space-y-6">
          <div className="rounded-2xl p-6 bg-glass border border-border backdrop-blur-xl shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
              <Brain className="h-5 w-5 text-muted-foreground" />
              AI Analysis
              <span className="ml-auto text-[10px] text-muted-foreground font-normal">Powered by Gemini AI</span>
            </h2>

            <div className="flex items-center gap-3 p-4 mb-5 rounded-xl bg-glass border border-border">
              <div className="relative">
                <div className={`h-3 w-3 rounded-full ${displayExplanation ? "bg-green-400" : "bg-muted-foreground"}`} />
                {displayExplanation && <div className="absolute inset-0 h-3 w-3 rounded-full bg-green-400 animate-ping opacity-30" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{displayExplanation ? "Analysis Complete" : "Not Analyzed Yet"}</p>
                <p className="text-[10px] text-muted-foreground">{displayExplanation ? "AI has analyzed this bill" : "Click below to analyze with Gemini AI"}</p>
              </div>
              <Sparkles className={`h-5 w-5 ${displayExplanation ? "text-green-400" : "text-muted-foreground"}`} />
            </div>

            {!displayExplanation && (
              <Button onClick={handleExplain} disabled={loading} className="w-full bg-white text-black hover:bg-neutral-200 h-12 font-semibold shadow-lg shadow-white/5 mb-4 text-sm">
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analyzing your bill...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" />Explain My Bill with AI</>
                )}
              </Button>
            )}

            {displayExplanation && (
              <div className="space-y-4">
                <div className="bg-glass-strong border border-glass-border rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-glass-strong mt-0.5 shrink-0">
                      <MessageCircle className="h-4 w-4 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">AI Explanation</p>
                      <div className="text-sm text-neutral-600 dark:text-neutral-200 leading-relaxed whitespace-pre-line">{displayExplanation}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleExplain} variant="outline" size="sm" disabled={loading} className="bg-glass text-muted-foreground border-glass-border gap-1 hover:bg-glass-strong">
                    <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />Regenerate
                  </Button>
                  {displayTips.length === 0 && (
                    <Button onClick={handleGetTips} disabled={tipsLoading} size="sm" className="bg-glass-strong text-foreground hover:bg-glass-hover border border-glass-border gap-1">
                      {tipsLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lightbulb className="h-3 w-3" />}
                      Get Savings Tips
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {displayTips.length > 0 && (
            <div className="rounded-2xl p-6 bg-glass border border-border backdrop-blur-xl shadow-lg shadow-black/20">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-muted-foreground" />
                AI Savings Tips
                <span className="ml-auto text-xs text-muted-foreground bg-glass px-2 py-0.5 rounded-full">{displayTips.length} tips</span>
              </h2>
              <div className="space-y-3">
                {displayTips.map((tip, i) => (
                  <div key={i} className="rounded-xl p-4 flex items-start gap-3 bg-glass hover:bg-glass-strong transition-colors border border-border group">
                    <span className="shrink-0 w-7 h-7 rounded-lg bg-glass-strong group-hover:bg-glass-hover flex items-center justify-center text-xs font-bold text-foreground transition-colors">{i + 1}</span>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
              <Button onClick={handleGetTips} disabled={tipsLoading} variant="outline" size="sm" className="mt-4 bg-glass text-muted-foreground border-glass-border gap-1 hover:bg-glass-strong">
                {tipsLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                Regenerate Tips
              </Button>
            </div>
          )}

          {bill.ocrRawText && (
            <div className="rounded-2xl p-6 bg-glass border border-border backdrop-blur-xl shadow-lg shadow-black/20">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                OCR Extracted Text
              </h2>
              <div className="bg-glass border border-border rounded-xl p-4 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">{bill.ocrRawText}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
