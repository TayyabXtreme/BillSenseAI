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
    <div className="rounded-2xl p-6 bg-glass border border-border backdrop-blur-xl shadow-lg shadow-black/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-glass-strong border border-border">
          <Brain className="h-5 w-5 text-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">AI Insights</h2>
          <p className="text-xs text-muted-foreground">
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
          <div className="bg-glass-strong border border-glass-border rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-glass-strong mt-0.5 shrink-0">
                <MessageCircle className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">AI Explanation</p>
                <div className="text-sm text-neutral-600 dark:text-neutral-200 leading-relaxed whitespace-pre-line">
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
              className="bg-glass text-muted-foreground border-glass-border gap-1 hover:bg-glass-strong"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              Regenerate
            </Button>
            {tips.length === 0 && (
              <Button
                onClick={handleGetTips}
                disabled={tipsLoading}
                size="sm"
                className="bg-glass-strong text-foreground hover:bg-glass-hover border border-glass-border gap-1"
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
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">
              Savings Tips
            </h3>
          </div>
          {tips.map((tip, i) => (
            <div
              key={i}
              className="rounded-xl p-3 flex items-start gap-3 bg-glass hover:bg-glass-strong transition-colors border border-border"
            >
              <span className="shrink-0 w-6 h-6 rounded-full bg-glass-strong flex items-center justify-center text-xs font-medium text-foreground">
                {i + 1}
              </span>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
