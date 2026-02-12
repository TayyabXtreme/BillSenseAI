"use client";

import { useState } from "react";
import {
  Brain,
  MessageCircle,
  Loader2,
  Sparkles,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { BillData } from "./bill-input";

interface AIExplanationProps {
  bill: BillData;
  onExplanationReceived?: (explanation: string, tips: string[]) => void;
}

export function AIExplanation({ bill, onExplanationReceived }: AIExplanationProps) {
  const [explanation, setExplanation] = useState("");
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [tipsLoading, setTipsLoading] = useState(false);

  const handleExplain = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bill }),
      });

      if (!response.ok) throw new Error("Failed to get explanation");

      const data = await response.json();
      setExplanation(data.explanation);
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
        body: JSON.stringify({ bill }),
      });

      if (!response.ok) throw new Error("Failed to get tips");

      const data = await response.json();
      setTips(data.tips);
      if (onExplanationReceived) {
        onExplanationReceived(explanation, data.tips);
      }
      toast.success("Savings tips generated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate tips. Please try again.");
    } finally {
      setTipsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl p-6 bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-lg shadow-black/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-white/[0.08] border border-white/[0.06]">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">AI Insights</h2>
          <p className="text-xs text-neutral-400">
            Powered by Gemini AI
          </p>
        </div>
      </div>

      {/* Explain Button */}
      {!explanation && (
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
              Explain My Bill
            </>
          )}
        </Button>
      )}

      {/* AI Explanation Card */}
      {explanation && (
        <div className="space-y-4">
          <div className="bg-white/[0.06] border border-white/[0.1] rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-white/[0.1] mt-0.5 shrink-0">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-2">AI Explanation</p>
                <div className="text-sm text-neutral-200 leading-relaxed whitespace-pre-line">
                  {explanation}
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
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              Regenerate
            </Button>
            {tips.length === 0 && (
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

      {/* Tips Cards */}
      {tips.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-neutral-300" />
            <h3 className="text-sm font-medium text-neutral-200">
              Savings Tips
            </h3>
          </div>
          {tips.map((tip, i) => (
            <div
              key={i}
              className="rounded-xl p-3 flex items-start gap-3 bg-white/[0.03] hover:bg-white/[0.06] transition-colors border border-white/[0.06]"
            >
              <span className="shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-white">
                {i + 1}
              </span>
              <p className="text-sm text-neutral-300 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
