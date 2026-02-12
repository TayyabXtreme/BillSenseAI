"use client";

import {
  Upload, Brain, BarChart3, SlidersHorizontal, Camera,
  MessageCircle, TrendingDown, Lightbulb, ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Upload or Enter",
    description:
      "Upload a photo of your bill for OCR extraction, or enter data manually with pre-filled tariff rates.",
    color: "from-blue-500/20 to-blue-500/0",
  },
  {
    icon: Brain,
    title: "AI Explanation",
    description:
      "Get a simple, human-friendly explanation of every charge on your bill powered by Gemini AI.",
    color: "from-purple-500/20 to-purple-500/0",
  },
  {
    icon: BarChart3,
    title: "Visual Dashboard",
    description:
      "See your bill breakdown with interactive charts, color-coded alerts, and clear totals.",
    color: "from-green-500/20 to-green-500/0",
  },
  {
    icon: SlidersHorizontal,
    title: "Usage Simulator",
    description:
      "Adjust sliders to see how reducing usage affects your bill. Get live savings estimates.",
    color: "from-orange-500/20 to-orange-500/0",
  },
  {
    icon: Camera,
    title: "Smart OCR",
    description:
      "AI-powered bill parsing extracts units, rates, and charges automatically from your bill photo.",
    color: "from-cyan-500/20 to-cyan-500/0",
  },
  {
    icon: TrendingDown,
    title: "Savings Tips",
    description:
      "Receive personalized tips to reduce your utility costs based on your consumption patterns.",
    color: "from-pink-500/20 to-pink-500/0",
  },
];

const steps = [
  {
    step: "01",
    icon: Camera,
    title: "Upload Your Bill",
    description:
      "Take a photo or upload an image of your utility bill. Our OCR technology extracts all the data.",
  },
  {
    step: "02",
    icon: BarChart3,
    title: "View Breakdown",
    description:
      "See your bill clearly broken down into base usage, taxes, and extra charges with visual charts.",
  },
  {
    step: "03",
    icon: MessageCircle,
    title: "AI Explains",
    description:
      "Click 'Explain My Bill' and AI will tell you why your bill is high or low in simple words.",
  },
  {
    step: "04",
    icon: Lightbulb,
    title: "Save Money",
    description:
      "Use the interactive simulator and AI tips to find ways to reduce your next bill.",
  },
];

export function Features() {
  return (
    <>
      {/* Features Grid */}
      <section id="features" className="relative py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs text-neutral-400 font-medium mb-5 uppercase tracking-wider">
              Features
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Everything You Need to
              <br className="hidden sm:block" />{" "}
              <span className="gradient-text">Save on Bills</span>
            </h2>
            <p className="text-neutral-400 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
              Powerful tools to understand, analyze, and optimize your utility
              bills with AI
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl p-6 sm:p-7 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 cursor-default overflow-hidden"
              >
                {/* Gradient glow on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div className="relative z-10">
                  <div className="p-3 rounded-xl bg-white/[0.06] w-fit mb-5 group-hover:bg-white/[0.1] transition-colors border border-white/[0.04]">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="relative py-20 sm:py-28 px-4 sm:px-6">
        {/* Divider gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs text-neutral-400 font-medium mb-5 uppercase tracking-wider">
              How it works
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Four Simple Steps
            </h2>
            <p className="text-neutral-400 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
              From bill upload to savings &mdash; it takes less than a minute
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {steps.map((step, i) => (
              <div
                key={step.step}
                className="group relative rounded-2xl p-7 sm:p-8 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 overflow-hidden"
              >
                {/* Step number watermark */}
                <span className="absolute top-3 right-5 text-[64px] sm:text-[80px] font-black text-white/[0.03] group-hover:text-white/[0.06] transition-colors leading-none select-none pointer-events-none">
                  {step.step}
                </span>

                <div className="relative z-10">
                  {/* Step indicator */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold text-neutral-500 bg-white/[0.06] px-2.5 py-1 rounded-md border border-white/[0.06]">
                      STEP {step.step}
                    </span>
                    {i < steps.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-neutral-600 hidden sm:block" />
                    )}
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.06] w-fit mb-4 border border-white/[0.04]">
                    <step.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
