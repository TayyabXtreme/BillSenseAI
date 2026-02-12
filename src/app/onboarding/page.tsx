"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Zap,
  MapPin,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  CheckCircle2,
  BarChart3,
  Shield,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const benefits = [
  { icon: BarChart3, text: "Visual bill breakdown" },
  { icon: Lightbulb, text: "AI-powered savings tips" },
  { icon: Shield, text: "Smart OCR extraction" },
];

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const createUser = useMutation(api.users.createUser);
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const [step, setStep] = useState(0);
  const [name, setName] = useState(user?.fullName || "");
  const [location, setLocation] = useState("");
  const [avgBill, setAvgBill] = useState("");
  const [billType, setBillType] = useState("electricity");
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await createUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: name || user.fullName || "User",
        imageUrl: user.imageUrl,
      });

      await completeOnboarding({
        clerkId: user.id,
        name: name || user.fullName || "User",
        location: location || undefined,
        avgMonthlyBill: avgBill ? parseFloat(avgBill) : undefined,
        preferredBillType: billType,
      });

      toast.success("Welcome to BillSense AI!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 3;

  const stepLabels = ["Welcome", "Profile", "Preferences"];

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-bg" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-white/[0.01] blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-white/[0.015] blur-[100px]" />

      {/* Left Panel - Brand / Info (desktop only) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative z-10 flex-col justify-between p-10 xl:p-14">
        <div>
          <div className="flex items-center gap-2.5 mb-20">
            <div className="p-2 rounded-xl bg-white/[0.08] border border-white/[0.06]">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              BillSense<span className="text-neutral-500">.ai</span>
            </span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
            Let&apos;s set up
            <br />
            your <span className="gradient-text">profile</span>
          </h1>
          <p className="text-neutral-400 text-base xl:text-lg leading-relaxed max-w-md mb-10">
            A few quick steps to personalize your experience and start saving on utility bills.
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            {benefits.map((b) => (
              <div key={b.text} className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.06]">
                  <b.icon className="h-4 w-4 text-neutral-300" />
                </div>
                <span className="text-sm text-neutral-300">{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-neutral-600">
          &copy; {new Date().getFullYear()} BillSense AI
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 relative z-10 flex items-center justify-center px-4 sm:px-8 py-10">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="p-1.5 rounded-lg bg-white/[0.08] border border-white/[0.06]">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">
              BillSense<span className="text-neutral-500">.ai</span>
            </span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                        i < step
                          ? "bg-white text-black"
                          : i === step
                            ? "bg-white/[0.15] text-white border border-white/[0.2]"
                            : "bg-white/[0.04] text-neutral-600 border border-white/[0.06]"
                      }`}
                    >
                      {i < step ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium hidden sm:block ${
                        i <= step ? "text-neutral-300" : "text-neutral-600"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${
                      i < step
                        ? "bg-white"
                        : i === step
                          ? "bg-white/[0.2]"
                          : "bg-white/[0.04]"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="rounded-2xl p-7 sm:p-9 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/30">
            {/* Step 0: Welcome */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <div className="mx-auto w-fit p-5 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.08] mb-6 animate-float">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
                    Hey {user?.firstName || "there"}! 👋
                  </h2>
                  <p className="text-neutral-400 text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
                    BillSense AI helps you understand your utility bills and
                    discover ways to save money. Let&apos;s get you started.
                  </p>
                </div>

                {/* Quick stats preview */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[
                    { label: "Avg Saved", value: "15%" },
                    { label: "AI Accuracy", value: "98%" },
                    { label: "Users", value: "10K+" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                    >
                      <div className="text-lg font-bold text-white">
                        {stat.value}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="mb-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                    Your Details
                  </h2>
                  <p className="text-sm text-neutral-400">
                    Help us personalize your experience
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-neutral-300 text-sm flex items-center gap-2">
                      <User className="h-3.5 w-3.5" /> Your Name
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="h-12 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-neutral-600 rounded-xl focus:border-white/25 focus:ring-1 focus:ring-white/10 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-neutral-300 text-sm flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" /> Location{" "}
                      <span className="text-neutral-600 font-normal">
                        (Optional)
                      </span>
                    </Label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Karachi, Pakistan"
                      className="h-12 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-neutral-600 rounded-xl focus:border-white/25 focus:ring-1 focus:ring-white/10 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-neutral-300 text-sm flex items-center gap-2">
                      <DollarSign className="h-3.5 w-3.5" /> Avg Monthly Bill
                      (PKR){" "}
                      <span className="text-neutral-600 font-normal">
                        (Optional)
                      </span>
                    </Label>
                    <Input
                      type="number"
                      value={avgBill}
                      onChange={(e) => setAvgBill(e.target.value)}
                      placeholder="e.g., 5000"
                      className="h-12 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-neutral-600 rounded-xl focus:border-white/25 focus:ring-1 focus:ring-white/10 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Bill Preference */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="mb-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                    Bill Preference
                  </h2>
                  <p className="text-sm text-neutral-400">
                    What type of bills do you mostly deal with?
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      value: "electricity",
                      emoji: "⚡",
                      label: "Electricity",
                      desc: "Electric power bills",
                    },
                    {
                      value: "gas",
                      emoji: "🔥",
                      label: "Gas",
                      desc: "Natural gas bills",
                    },
                    {
                      value: "water",
                      emoji: "💧",
                      label: "Water",
                      desc: "Water utility bills",
                    },
                    {
                      value: "all",
                      emoji: "📊",
                      label: "All Types",
                      desc: "I deal with all types",
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setBillType(option.value)}
                      className={`w-full p-4 sm:p-5 rounded-xl text-left transition-all duration-200 border flex items-center gap-4 ${
                        billType === option.value
                          ? "bg-white/[0.08] border-white/[0.18] shadow-lg shadow-white/[0.03]"
                          : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1]"
                      }`}
                    >
                      <span className="text-2xl">{option.emoji}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-white text-sm sm:text-base">
                          {option.label}
                        </div>
                        <div className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                          {option.desc}
                        </div>
                      </div>
                      {billType === option.value && (
                        <CheckCircle2 className="h-5 w-5 text-white shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.06]">
              {step > 0 ? (
                <Button
                  variant="ghost"
                  onClick={() => setStep(step - 1)}
                  className="text-neutral-400 hover:text-white gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < totalSteps - 1 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  className="bg-white text-black hover:bg-neutral-200 gap-2 h-11 px-6 font-semibold"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={loading}
                  className="bg-white text-black hover:bg-neutral-200 gap-2 h-11 px-6 font-semibold"
                >
                  {loading ? "Setting up..." : "Get Started"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Skip */}
          <div className="text-center mt-4">
            <button
              onClick={handleComplete}
              className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
