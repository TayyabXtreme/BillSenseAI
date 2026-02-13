"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import { toast } from "sonner";
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
  Target,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Plus,
  PlusCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function DashboardPage() {
  const { user } = useUser();

  const bills = useQuery(
    api.bills.getRecentBills,
    user ? { userId: user.id, limit: 20 } : "skip"
  );

  const budgets = useQuery(
    api.budgets.getUserBudgets,
    user ? { userId: user.id } : "skip"
  );

  const upcomingBills = useQuery(
    api.bills.getUpcomingBills,
    user ? { userId: user.id } : "skip"
  );

  const overdueBills = useQuery(
    api.bills.getOverdueBills,
    user ? { userId: user.id } : "skip"
  );

  const setBudgetMutation = useMutation(api.budgets.setBudget);
  const deleteBudgetMutation = useMutation(api.budgets.deleteBudget);
  const markAsPaid = useMutation(api.bills.markBillAsPaid);

  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [budgetType, setBudgetType] = useState("electricity");
  const [budgetLimit, setBudgetLimit] = useState("");

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

  // Budget progress: sum current month spending per bill type
  const currentMonth = new Date().toLocaleString("default", { month: "long", year: "numeric" });
  const spendingByType = (bills || []).reduce((acc, b) => {
    if (b.month === currentMonth) {
      acc[b.billType] = (acc[b.billType] || 0) + b.totalAmount;
    }
    return acc;
  }, {} as Record<string, number>);

  // Monthly comparison: this month vs last month
  const now = new Date();
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthLabel = lastMonthDate.toLocaleString("default", { month: "long", year: "numeric" });
  const thisMonthBills = (bills || []).filter((b) => b.month === currentMonth);
  const lastMonthBills = (bills || []).filter((b) => b.month === lastMonthLabel);
  const thisMonthTotal = thisMonthBills.reduce((s, b) => s + b.totalAmount, 0);
  const lastMonthTotal = lastMonthBills.reduce((s, b) => s + b.totalAmount, 0);
  const thisMonthUnits = thisMonthBills.reduce((s, b) => s + b.unitsConsumed, 0);
  const lastMonthUnits = lastMonthBills.reduce((s, b) => s + b.unitsConsumed, 0);
  const monthlyChange = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100) : 0;

  const handleSetBudget = async () => {
    if (!user || !budgetLimit) return;
    const limit = parseFloat(budgetLimit);
    if (!limit || limit <= 0) { toast.error("Enter a valid budget"); return; }
    try {
      await setBudgetMutation({ userId: user.id, billType: budgetType, monthlyLimit: limit });
      toast.success("Budget set!");
      setBudgetDialogOpen(false);
      setBudgetLimit("");
    } catch { toast.error("Failed to set budget"); }
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

      {/* New Analysis CTA */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Your Bills</h2>
        <Button
          onClick={() => {
            const btn = document.querySelector('[data-new-analysis]') as HTMLButtonElement;
            if (btn) btn.click();
          }}
          className="bg-foreground text-background hover:bg-foreground/90 font-semibold text-sm h-9 px-4 rounded-xl gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          New Analysis
        </Button>
      </div>

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

      {/* Budget Goals + Payment Schedule + Monthly Comparison */}
      {totalBills > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Budget Goals */}
          <div className="rounded-2xl p-5 bg-glass border border-border backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                Budget Goals
              </h3>
              <button
                onClick={() => setBudgetDialogOpen(true)}
                className="p-1 rounded-md hover:bg-glass-strong text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-3">
              {budgets && budgets.length > 0 ? budgets.map((budget) => {
                const spent = spendingByType[budget.billType] || 0;
                const pct = Math.min((spent / budget.monthlyLimit) * 100, 100);
                const isOver = spent > budget.monthlyLimit;
                return (
                  <div key={budget._id} className="space-y-1.5 group/budget">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground capitalize flex items-center gap-1.5">
                        {budget.billType === "electricity" ? <Zap className="h-3 w-3 text-yellow-500" /> :
                         budget.billType === "water" ? <Droplets className="h-3 w-3 text-blue-500" /> :
                         <Flame className="h-3 w-3 text-orange-500" />}
                        {budget.billType}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isOver ? "text-red-500" : "text-foreground"}`}>
                          {spent.toLocaleString()} / {budget.monthlyLimit.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover/budget:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setBudgetType(budget.billType);
                              setBudgetLimit(budget.monthlyLimit.toString());
                              setBudgetDialogOpen(true);
                            }}
                            className="p-0.5 rounded hover:bg-glass-strong text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit budget"
                          >
                            <Pencil className="h-2.5 w-2.5" />
                          </button>
                          <button
                            onClick={async () => {
                              await deleteBudgetMutation({ budgetId: budget._id });
                              toast.success("Budget removed");
                            }}
                            className="p-0.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                            title="Delete budget"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 bg-glass-strong rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isOver ? "bg-red-500" : pct > 80 ? "bg-yellow-500" : "bg-green-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{Math.round(pct)}% used</span>
                      {isOver ? (
                        <p className="text-[10px] text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-2.5 w-2.5" />
                          Over by {(spent - budget.monthlyLimit).toLocaleString()} PKR
                        </p>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          {(budget.monthlyLimit - spent).toLocaleString()} PKR left
                        </span>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Set monthly budgets to track spending
                </p>
              )}
            </div>
          </div>

          {/* Upcoming Payments */}
          <div className="rounded-2xl p-5 bg-glass border border-border backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Upcoming Payments
              </h3>
              {(overdueBills?.length || 0) > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-500">
                  {overdueBills!.length} overdue
                </span>
              )}
            </div>
            <div className="space-y-2">
              {overdueBills && overdueBills.length > 0 && overdueBills.slice(0, 2).map((bill) => (
                <div key={bill._id} className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/5 border border-red-500/10">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{bill.name || bill.month}</p>
                    <p className="text-[10px] text-red-500">Overdue \u00b7 {bill.totalAmount.toLocaleString()} PKR</p>
                  </div>
                  <button
                    onClick={() => markAsPaid({ billId: bill._id as Id<"bills">, isPaid: true })}
                    className="text-[10px] text-green-500 hover:underline shrink-0"
                  >
                    Mark Paid
                  </button>
                </div>
              ))}
              {upcomingBills && upcomingBills.length > 0 && upcomingBills.slice(0, 3).map((bill) => (
                <div key={bill._id} className="flex items-center gap-2 p-2.5 rounded-xl bg-glass border border-border hover:bg-glass-strong transition-colors">
                  <div className="p-1.5 rounded-lg bg-glass-strong shrink-0">
                    {bill.billType === "electricity" ? <Zap className="h-3 w-3 text-yellow-500" /> :
                     bill.billType === "water" ? <Droplets className="h-3 w-3 text-blue-500" /> :
                     <Flame className="h-3 w-3 text-orange-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{bill.name || bill.month}</p>
                    <p className="text-[10px] text-muted-foreground">Due {bill.dueDate} \u00b7 {bill.totalAmount.toLocaleString()} PKR</p>
                  </div>
                  <button
                    onClick={() => markAsPaid({ billId: bill._id as Id<"bills">, isPaid: true })}
                    className="text-[10px] text-green-500 hover:underline shrink-0"
                  >
                    Paid
                  </button>
                </div>
              ))}
              {(!upcomingBills || upcomingBills.length === 0) && (!overdueBills || overdueBills.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Set due dates on bills to track payments
                </p>
              )}
            </div>
          </div>

          {/* Monthly Comparison */}
          <div className="rounded-2xl p-5 bg-glass border border-border backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              Monthly Comparison
            </h3>
            {lastMonthTotal > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-glass-strong border border-border text-center">
                    <p className="text-[10px] text-muted-foreground mb-1">This Month</p>
                    <p className="text-lg font-bold text-foreground">{thisMonthTotal.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">{thisMonthUnits} units</p>
                  </div>
                  <div className="p-3 rounded-xl bg-glass border border-border text-center">
                    <p className="text-[10px] text-muted-foreground mb-1">Last Month</p>
                    <p className="text-lg font-bold text-foreground">{lastMonthTotal.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">{lastMonthUnits} units</p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 p-3 rounded-xl ${monthlyChange <= 0 ? "bg-green-500/5 border border-green-500/10" : "bg-red-500/5 border border-red-500/10"}`}>
                  {monthlyChange <= 0 ? (
                    <TrendingDown className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-red-400 shrink-0" />
                  )}
                  <div>
                    <p className={`text-sm font-bold ${monthlyChange <= 0 ? "text-green-500" : "text-red-400"}`}>
                      {monthlyChange > 0 ? "+" : ""}{monthlyChange.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {monthlyChange <= 0 ? "Great! Spending decreased" : "Spending increased"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Difference</span>
                    <span className={`font-medium ${thisMonthTotal <= lastMonthTotal ? "text-green-500" : "text-red-400"}`}>
                      {thisMonthTotal <= lastMonthTotal ? "-" : "+"}{Math.abs(thisMonthTotal - lastMonthTotal).toLocaleString()} PKR
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Units Change</span>
                    <span className={`font-medium ${thisMonthUnits <= lastMonthUnits ? "text-green-500" : "text-red-400"}`}>
                      {thisMonthUnits <= lastMonthUnits ? "-" : "+"}{Math.abs(thisMonthUnits - lastMonthUnits)} units
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                Add bills for 2 months to see comparison
              </p>
            )}
          </div>
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
                      {bill.isPaid ? (
                        <span className="text-green-500 flex items-center gap-0.5"><CheckCircle2 className="h-2.5 w-2.5 inline" /> Paid</span>
                      ) : bill.status === "analyzed" ? "\u2713 AI Analyzed" : "\u25CF Draft"}
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

      {/* Budget Dialog */}
      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              Set Monthly Budget
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-sm text-foreground">Bill Type</label>
              <div className="flex gap-2">
                {[
                  { type: "electricity", icon: Zap, color: "text-yellow-500", label: "Electricity" },
                  { type: "water", icon: Droplets, color: "text-blue-500", label: "Water" },
                  { type: "gas", icon: Flame, color: "text-orange-500", label: "Gas" },
                ].map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => setBudgetType(opt.type)}
                    className={`flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-colors ${
                      budgetType === opt.type
                        ? "bg-glass-strong border-foreground/20 text-foreground"
                        : "bg-glass border-border text-muted-foreground hover:bg-glass-strong"
                    }`}
                  >
                    <opt.icon className={`h-3.5 w-3.5 ${opt.color}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-foreground">Monthly Limit (PKR)</label>
              <Input
                type="number"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                placeholder="e.g., 5000"
                className="bg-glass border-glass-border text-foreground rounded-xl"
                onKeyDown={(e) => e.key === "Enter" && handleSetBudget()}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBudgetDialogOpen(false)} className="border-border text-foreground hover:bg-glass-hover">
              Cancel
            </Button>
            <Button onClick={handleSetBudget} disabled={!budgetLimit} className="bg-foreground text-background hover:bg-foreground/90">
              Set Budget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
