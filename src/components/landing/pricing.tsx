"use client";

import Link from "next/link";
import { Check, Zap, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    icon: Zap,
    price: "0",
    period: "forever",
    description: "Perfect for getting started with bill analysis",
    features: [
      "Up to 5 bills per month",
      "AI bill explanation",
      "Basic savings tips",
      "Bill breakdown charts",
      "PDF & Excel export",
      "Dark / Light mode",
    ],
    cta: "Get Started Free",
    href: "/sign-up",
    popular: false,
    accent: "border-border",
  },
  {
    name: "Pro",
    icon: Crown,
    price: "499",
    period: "/month",
    description: "For households that want to maximize savings",
    features: [
      "Unlimited bill analysis",
      "AI explanation + savings tips",
      "Multi-language (EN, اردو, हिंदी)",
      "Budget goals & alerts",
      "Payment tracking & reminders",
      "WhatsApp bill sharing",
      "Monthly comparison reports",
      "Savings simulator",
      "Priority AI processing",
    ],
    cta: "Start Pro Trial",
    href: "/sign-up",
    popular: true,
    accent: "border-foreground/30",
  },
  {
    name: "Enterprise",
    icon: Building2,
    price: "Custom",
    period: "",
    description: "For organizations managing multiple properties",
    features: [
      "Everything in Pro",
      "Unlimited users & properties",
      "API access",
      "Bulk bill upload",
      "Custom AI training",
      "Dedicated account manager",
      "SSO & team management",
      "Analytics dashboard",
    ],
    cta: "Contact Sales",
    href: "#",
    popular: false,
    accent: "border-border",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-20 sm:py-28 px-4 sm:px-6">
      {/* Divider gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-glass border border-border text-xs text-muted-foreground font-medium mb-5 uppercase tracking-wider">
            Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Simple, Transparent
            <br className="hidden sm:block" />{" "}
            <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
            Start free and upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 sm:p-7 bg-glass border ${plan.accent} hover:bg-glass-strong transition-all duration-300 ${
                plan.popular ? "md:-mt-4 md:mb-4 shadow-2xl shadow-black/20" : ""
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-foreground text-background text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan icon + name */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-2.5 rounded-xl border border-border ${plan.popular ? "bg-glass-hover" : "bg-glass-strong"}`}>
                  <plan.icon className={`h-5 w-5 ${plan.popular ? "text-foreground" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <p className="text-[11px] text-muted-foreground">{plan.description}</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-border">
                <div className="flex items-baseline gap-1">
                  {plan.price !== "Custom" && (
                    <span className="text-sm text-muted-foreground">PKR</span>
                  )}
                  <span className="text-4xl font-bold text-foreground tracking-tight">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-7">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className={`h-4 w-4 shrink-0 mt-0.5 ${plan.popular ? "text-green-400" : "text-muted-foreground"}`} />
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href={plan.href} className="block">
                <Button
                  className={`w-full h-11 font-semibold text-sm rounded-xl ${
                    plan.popular
                      ? "bg-foreground text-background hover:bg-foreground/90 shadow-lg"
                      : "bg-glass-strong text-foreground border border-border hover:bg-glass-hover"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          All plans include end-to-end encryption, 99.9% uptime, and 24/7 support.
        </p>
      </div>
    </section>
  );
}
