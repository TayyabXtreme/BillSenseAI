"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { BillInput, type BillData } from "@/components/dashboard/bill-input";
import { BillSummary } from "@/components/dashboard/bill-summary";
import { AIExplanation } from "@/components/dashboard/ai-explanation";
import { InteractiveTips } from "@/components/dashboard/interactive-tips";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Upload,
  BarChart3,
  Brain,
  Zap,
  TrendingDown,
  TrendingUp,
  Flame,
  ArrowRight,
  FileText,
  Activity,
  Calendar,
  PlusCircle,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const [currentBill, setCurrentBill] = useState<BillData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const bills = useQuery(
    api.bills.getRecentBills,
    user ? { userId: user.id, limit: 10 } : "skip"
  );

  const createBill = useMutation(api.bills.createBill);
  const updateExplanation = useMutation(api.bills.updateBillExplanation);

  const [currentBillId, setCurrentBillId] = useState<string | null>(null);

  const handleBillSubmit = async (data: BillData) => {
    if (!user) return;
    setIsLoading(true);

    try {
      const billId = await createBill({
        userId: user.id,
        billType: data.billType,
        unitsConsumed: data.unitsConsumed,
        tariffRate: data.tariffRate,
        extraCharges: data.extraCharges,
        taxes: data.taxes,
        totalAmount: data.totalAmount,
        baseAmount: data.baseAmount,
        billDate: data.billDate,
        month: data.month,
        ocrRawText: data.ocrRawText,
        status: "draft",
      });

      setCurrentBill(data);
      setCurrentBillId(billId);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save bill. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplanationReceived = async (
    explanation: string,
    tips: string[]
  ) => {
    if (!currentBillId) return;
    try {
      await updateExplanation({
        billId: currentBillId as any,
        aiExplanation: explanation,
        aiTips: tips.length > 0 ? tips : undefined,
      });
    } catch (error) {
      console.error("Failed to save explanation:", error);
    }
  };

  // Quick stats
  const totalBills = bills?.length || 0;
  const totalSpent = bills?.reduce((sum, b) => sum + b.totalAmount, 0) || 0;
  const avgBill = totalBills > 0 ? totalSpent / totalBills : 0;
  const analyzedCount =
    bills?.filter((b) => b.status === "analyzed").length || 0;
  const latestBill = bills?.[0];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Welcome Section */}
      {!currentBill && (
        <div className="space-y-5">
          {/* Welcome Hero */}
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
                  Upload a bill or enter details manually. AI will explain every
                  charge and help you save.
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            {totalBills > 0 && (
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-border">
                {[
                  {
                    icon: BarChart3,
                    label: "Total Bills",
                    value: totalBills.toString(),
                  },
                  {
                    icon: Check,
                    label: "AI Analyzed",
                    value: analyzedCount.toString(),
                    accent: "text-green-400",
                  },
                  {
                    icon: Zap,
                    label: "Total Spent",
                    value: `${totalSpent.toLocaleString("en-PK", { maximumFractionDigits: 0 })} PKR`,
                  },
                  {
                    icon: TrendingDown,
                    label: "Avg Bill",
                    value: `${avgBill.toLocaleString("en-PK", { maximumFractionDigits: 0 })} PKR`,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl bg-glass border border-border p-3 sm:p-4"
                  >
                    <stat.icon className="h-4 w-4 text-muted-foreground mb-2 hidden sm:block" />
                    <p
                      className={`text-lg sm:text-xl font-bold truncate ${stat.accent || "text-foreground"}`}
                    >
                      {stat.value}
                    </p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* How it works (only when no bills) */}
          {totalBills === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  icon: Upload,
                  step: "1",
                  title: "Upload or Enter",
                  desc: "Snap a photo of your bill or type in the details",
                },
                {
                  icon: Brain,
                  step: "2",
                  title: "AI Analyzes",
                  desc: "Gemini AI explains every charge in simple words",
                },
                {
                  icon: TrendingDown,
                  step: "3",
                  title: "Save Money",
                  desc: "Get personalized tips and use the savings simulator",
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
        </div>
      )}

      {/* Active Analysis Banner */}
      {currentBill && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-glass border border-border">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <p className="text-sm text-neutral-600 dark:text-neutral-300 flex-1">
            Analyzing{" "}
            <span className="text-foreground font-medium">
              {currentBill.billType}
            </span>{" "}
            bill for{" "}
            <span className="text-foreground font-medium">{currentBill.month}</span>
          </p>
          <div className="flex gap-2">
            {currentBillId && (
              <Button
                onClick={() => router.push(`/dashboard/${currentBillId}`)}
                size="sm"
                className="bg-glass-strong text-foreground hover:bg-glass-hover border border-glass-border gap-1 text-xs h-8"
              >
                <ArrowRight className="h-3 w-3" />
                Full View
              </Button>
            )}
            <button
              onClick={() => {
                setCurrentBill(null);
                setCurrentBillId(null);
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1 rounded-lg hover:bg-glass-hover"
            >
              New Bill
            </button>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Column: Input + AI */}
        <div className="lg:col-span-5 space-y-5 sm:space-y-6">
          <BillInput onBillSubmit={handleBillSubmit} isLoading={isLoading} />
          {currentBill && (
            <AIExplanation
              bill={currentBill}
              onExplanationReceived={handleExplanationReceived}
            />
          )}
        </div>

        {/* Right Column: Summary + Tips + Recent */}
        <div className="lg:col-span-7 space-y-5 sm:space-y-6">
          {currentBill && <BillSummary bill={currentBill} />}
          {currentBill && <InteractiveTips bill={currentBill} />}

          {/* Recent Bills - always visible */}
          <div className="rounded-2xl p-6 bg-glass border border-border backdrop-blur-xl shadow-lg shadow-black/20">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-muted-foreground" />
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
                {bills.slice(0, 5).map((bill) => (
                  <Link
                    key={bill._id}
                    href={`/dashboard/${bill._id}`}
                    className="flex items-center justify-between p-3 bg-glass border border-border rounded-xl hover:bg-glass-strong hover:border-glass-border transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-glass-strong">
                        {bill.billType === "electricity" ? (
                          <Zap className="h-4 w-4 text-yellow-400/70" />
                        ) : (
                          <Flame className="h-4 w-4 text-orange-400/70" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground group-hover:text-foreground">
                          {bill.month}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {bill.unitsConsumed} units ·{" "}
                          {bill.billType.charAt(0).toUpperCase() +
                            bill.billType.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {bill.totalAmount.toLocaleString()} PKR
                        </p>
                        <p
                          className={`text-[10px] ${
                            bill.status === "analyzed"
                              ? "text-green-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          {bill.status === "analyzed"
                            ? "✓ AI Analyzed"
                            : "● Draft"}
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
                  Upload or enter a bill to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
