"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Sparkles,
  BarChart3,
  Zap,
  TrendingDown,
  TrendingUp,
  Flame,
  Droplets,
  ArrowRight,
  FileText,
  Activity,
  Wallet,
  Gauge,
  Calendar,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useUser();

  const bills = useQuery(
    api.bills.getRecentBills,
    user ? { userId: user.id, limit: 20 } : "skip"
  );

  // Stats
  const totalBills = bills?.length || 0;
  const totalSpent = bills?.reduce((sum, b) => sum + b.totalAmount, 0) || 0;
  const avgBill = totalBills > 0 ? totalSpent / totalBills : 0;
  const analyzedCount = bills?.filter((b) => b.status === "analyzed").length || 0;
  const totalUnits = bills?.reduce((sum, b) => sum + b.unitsConsumed, 0) || 0;
  const latestBill = bills?.[0];
  const previousBill = bills?.[1];
  const spendingTrend =
    latestBill && previousBill
      ? ((latestBill.totalAmount - previousBill.totalAmount) / previousBill.totalAmount) * 100
      : 0;

  // Chart: spending trend (newest last)
  const spendingData = (bills || [])
    .slice(0, 12)
    .reverse()
    .map((b) => ({
      month: b.month?.substring(0, 3) || "N/A",
      amount: b.totalAmount,
    }));

  // Chart: units usage
  const usageData = (bills || [])
    .slice(0, 12)
    .reverse()
    .map((b) => ({
      month: b.month?.substring(0, 3) || "N/A",
      units: b.unitsConsumed,
    }));

  // Chart: bill type pie
  const typeCounts = (bills || []).reduce(
    (acc, b) => {
      acc[b.billType] = (acc[b.billType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const pieData = Object.entries(typeCounts).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
    color:
      type === "electricity"
        ? "#eab308"
        : type === "water"
          ? "#3b82f6"
          : "#f97316",
  }));

  // Chart: stacked cost breakdown per bill
  const comparisonData = (bills || [])
    .slice(0, 6)
    .reverse()
    .map((b) => ({
      month: b.month?.substring(0, 3) || "N/A",
      base: b.baseAmount,
      taxes: b.taxes,
      extra: b.extraCharges,
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-background/95 backdrop-blur-xl border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs font-medium text-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-[11px] text-muted-foreground">
            {p.name}: <span className="text-foreground font-medium">{p.value?.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Welcome + Stats */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-glass-strong via-glass to-transparent p-7 sm:p-10">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="p-4 rounded-2xl bg-glass-strong border border-border animate-float shrink-0">
            <Sparkles className="h-8 w-8 text-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1.5 tracking-tight">
              Welcome back, {user?.firstName || "there"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl">
              {totalBills > 0
                ? "Here\u2019s your utility spending overview. Click \u201CNew Analysis\u201D in the sidebar to add a bill."
                : "Get started by clicking \u201CNew Analysis\u201D in the sidebar to upload or enter your first bill."}
            </p>
          </div>
        </div>

        {totalBills > 0 && (
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-border">
            {[
              {
                icon: BarChart3,
                label: "Total Bills",
                value: totalBills.toString(),
              },
              {
                icon: Wallet,
                label: "Total Spent",
                value: `${totalSpent.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`,
                unit: "PKR",
              },
              {
                icon: Gauge,
                label: "Avg Bill",
                value: `${avgBill.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`,
                unit: "PKR",
              },
              {
                icon: spendingTrend <= 0 ? TrendingDown : TrendingUp,
                label: "vs Last Bill",
                value: `${spendingTrend > 0 ? "+" : ""}${spendingTrend.toFixed(1)}%`,
                accent: spendingTrend <= 0 ? "text-green-500" : "text-red-400",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-glass border border-border p-3 sm:p-4"
              >
                <stat.icon className="h-4 w-4 text-muted-foreground mb-2 hidden sm:block" />
                <p className={`text-lg sm:text-xl font-bold truncate ${stat.accent || "text-foreground"}`}>
                  {stat.value}
                  {stat.unit && (
                    <span className="text-xs font-normal text-muted-foreground ml-1">{stat.unit}</span>
                  )}
                </p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts Grid — visible when 2+ bills exist */}
      {totalBills >= 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Spending Trend Area Chart */}
          <div className="rounded-2xl p-5 bg-glass border border-border backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Spending Trend
              </h3>
              <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-glass-strong border border-border">
                PKR
              </span>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendingData}>
                  <defs>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-foreground)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--color-foreground)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="amount" name="Amount" stroke="var(--color-foreground)" strokeWidth={2} fill="url(#spendGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Units Usage Bar Chart */}
          <div className="rounded-2xl p-5 bg-glass border border-border backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                Units Consumed
              </h3>
              <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-glass-strong border border-border">
                units
              </span>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={usageData} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="units" name="Units" fill="var(--color-foreground)" radius={[4, 4, 0, 0]} opacity={0.7} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cost Breakdown Stacked Bar */}
          <div className="rounded-2xl p-5 bg-glass border border-border backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Cost Breakdown
              </h3>
              <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-glass-strong border border-border">
                per bill
              </span>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={comparisonData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="base" name="Base" stackId="cost" fill="var(--color-foreground)" opacity={0.7} />
                  <Bar dataKey="taxes" name="Taxes" stackId="cost" fill="#737373" />
                  <Bar dataKey="extra" name="Extra" stackId="cost" fill="#525252" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bill Type Pie + Summary */}
          <div className="rounded-2xl p-5 bg-glass border border-border backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                Bill Types
              </h3>
            </div>
            <div className="flex items-center gap-6">
              <div className="h-[180px] w-[180px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{entry.name}</span>
                      <span className="text-sm font-semibold text-foreground">{entry.value}</span>
                    </div>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total Units</span>
                    <span className="text-sm font-bold text-foreground">{totalUnits.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">AI Analyzed</span>
                    <span className="text-sm font-bold text-green-500">{analyzedCount}/{totalBills}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalBills === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              icon: FileText,
              step: "1",
              title: "New Analysis",
              desc: "Click \u201CNew Analysis\u201D in the sidebar to upload a bill photo or enter details",
            },
            {
              icon: Sparkles,
              step: "2",
              title: "AI Analyzes",
              desc: "Gemini AI reads every charge and explains your bill in simple words",
            },
            {
              icon: TrendingDown,
              step: "3",
              title: "Save Money",
              desc: "Get personalized tips and use the savings simulator to plan ahead",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex items-start gap-3 rounded-xl p-4 bg-glass border border-border"
            >
              <div className="p-2 rounded-lg bg-glass-strong shrink-0">
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-0.5">
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Bills List */}
      <div className="rounded-2xl p-6 bg-glass border border-border backdrop-blur-xl shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Recent Bills
          </h2>
          {totalBills > 0 && (
            <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-glass border border-border">
              {totalBills} total
            </span>
          )}
        </div>

        {bills && bills.length > 0 ? (
          <div className="space-y-2">
            {bills.slice(0, 6).map((bill) => (
              <Link
                key={bill._id}
                href={`/dashboard/${bill._id}`}
                className="flex items-center justify-between p-3 bg-glass border border-border rounded-xl hover:bg-glass-strong hover:border-glass-border transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-glass-strong">
                    {bill.billType === "electricity" ? (
                      <Zap className="h-4 w-4 text-yellow-500" />
                    ) : bill.billType === "water" ? (
                      <Droplets className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Flame className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {bill.name || bill.month}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {bill.unitsConsumed} units · {bill.billType.charAt(0).toUpperCase() + bill.billType.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {bill.totalAmount.toLocaleString()} PKR
                    </p>
                    <p className={`text-[10px] ${bill.status === "analyzed" ? "text-green-500" : "text-muted-foreground"}`}>
                      {bill.status === "analyzed" ? "\u2713 AI Analyzed" : "\u25CF Draft"}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No bills analyzed yet</p>
            <p className="text-xs mt-1 text-muted-foreground">
              Click &ldquo;New Analysis&rdquo; in the sidebar to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
