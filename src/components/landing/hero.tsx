"use client";

import Link from "next/link";
import {
  ArrowRight, Sparkles, BarChart3, Shield, Zap, Upload, Brain,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 sm:pt-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-bg" />
      <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] rounded-full bg-white/[0.015] blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[400px] rounded-full bg-white/[0.012] blur-[120px] animate-pulse-slow" />
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glass border border-glass-border mb-8 animate-float">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-muted-foreground font-medium">
                AI-Powered Bill Analysis
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] mb-5 sm:mb-6">
              <span className="text-foreground">Understand</span>
              <br />
              <span className="text-foreground">Your </span>
              <span className="gradient-text">Utility</span>
              <br />
              <span className="gradient-text">Bills </span>
              <span className="text-muted-foreground">Instantly</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-8 leading-relaxed">
              Upload your electricity, gas, or water bill, and let AI break down every
              charge in plain language. Get <span className="text-foreground font-medium">personalized tips</span> to
              slash your next bill.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-8 sm:mb-10">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-neutral-200 px-7 h-12 text-sm font-semibold shadow-xl shadow-white/[0.08] group rounded-xl w-full sm:w-auto"
                >
                  Start Analyzing Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-glass text-foreground px-7 h-12 text-sm font-medium border-glass-border hover:bg-glass-strong hover:border-glass-border rounded-xl w-full sm:w-auto"
                >
                  See How It Works
                </Button>
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <span>98% AI Accuracy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span>Instant Results</span>
              </div>
            </div>
          </div>

          {/* Right - Visual / Mock dashboard */}
          <div className="relative hidden lg:block">
            {/* Main card */}
            <div className="rounded-2xl p-6 bg-glass backdrop-blur-xl border border-glass-border shadow-2xl shadow-black/40">
              {/* Fake header */}
              <div className="flex items-center gap-2 mb-5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-3 text-xs text-muted-foreground font-mono">BillSense Dashboard</span>
              </div>

              {/* Bill breakdown preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Bill - January 2026</p>
                    <p className="text-3xl font-bold text-foreground">8,450 <span className="text-sm text-muted-foreground font-normal">PKR</span></p>
                  </div>
                  <div className="p-3 rounded-xl bg-glass-strong border border-border">
                    <Zap className="h-6 w-6 text-foreground" />
                  </div>
                </div>

                {/* Mini bar chart */}
                <div className="flex items-end gap-2 h-24 pt-4">
                  {[45, 62, 38, 80, 55, 72, 68].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-md transition-all duration-500"
                        style={{
                          height: `${h}%`,
                          background: i === 6 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
                        }}
                      />
                      <span className="text-[9px] text-neutral-600">
                        {["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"][i]}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Breakdown items */}
                <div className="space-y-2 pt-2">
                  {[
                    { label: "Base Usage", amount: "6,500", pct: "77%" },
                    { label: "Taxes & Surcharges", amount: "1,300", pct: "15%" },
                    { label: "Extra Charges", amount: "650", pct: "8%" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-white/20" />
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{item.pct}</span>
                        <span className="text-sm font-medium text-foreground">{item.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating card - AI Tip */}
            <div className="absolute -bottom-4 -left-8 rounded-xl p-4 bg-background/90 backdrop-blur-xl border border-glass-border shadow-xl shadow-black/40 max-w-[240px] animate-float">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 shrink-0">
                  <TrendingDown className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground mb-0.5">AI Savings Tip</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Reduce AC usage by 2 hrs/day to save <span className="text-green-400 font-medium">1,200 PKR</span>/month
                  </p>
                </div>
              </div>
            </div>

            {/* Floating card - Upload */}
            <div className="absolute -top-3 -right-6 rounded-xl p-3 bg-background/90 backdrop-blur-xl border border-glass-border shadow-xl shadow-black/40 animate-float-delayed">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-glass-strong">
                  <Upload className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">OCR Scan</p>
                  <p className="text-[10px] text-muted-foreground">Auto-extract bill data</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile visual card (shown below content on small screens) */}
          <div className="lg:hidden rounded-2xl p-5 bg-glass backdrop-blur-xl border border-glass-border shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="ml-2 text-xs text-muted-foreground font-mono">BillSense Dashboard</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] text-muted-foreground mb-0.5">Total Bill - January 2026</p>
                <p className="text-2xl font-bold text-foreground">8,450 <span className="text-xs text-muted-foreground font-normal">PKR</span></p>
              </div>
              <div className="p-2.5 rounded-xl bg-glass-strong border border-border">
                <Zap className="h-5 w-5 text-foreground" />
              </div>
            </div>
            <div className="flex items-end gap-1.5 h-16 mb-4">
              {[45, 62, 38, 80, 55, 72, 68].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className="w-full rounded-t-sm"
                    style={{
                      height: `${h}%`,
                      background: i === 6 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
                    }}
                  />
                  <span className="text-[8px] text-muted-foreground">
                    {["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"][i]}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-glass-strong border border-border">
              <div className="p-1.5 rounded-lg bg-green-500/10 shrink-0">
                <TrendingDown className="h-3.5 w-3.5 text-green-400" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-foreground">AI Savings Tip</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Reduce AC usage by 2 hrs/day to save <span className="text-green-400 font-medium">1,200 PKR</span>/month
                </p>
              </div>
            </div>
          </div>

          {/* Mobile stats */}
          <div className="grid grid-cols-3 gap-3 lg:hidden">
            {[
              { icon: BarChart3, label: "Bills Analyzed", value: "10K+" },
              { icon: Shield, label: "Data Secure", value: "100%" },
              { icon: Sparkles, label: "AI Accuracy", value: "98%" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-4 text-center bg-glass border border-border">
                <stat.icon className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <div className="text-lg font-bold text-foreground">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
