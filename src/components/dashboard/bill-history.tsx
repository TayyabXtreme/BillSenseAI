"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Id } from "../../../convex/_generated/dataModel";

interface Bill {
  _id: Id<"bills">;
  billType: string;
  unitsConsumed: number;
  totalAmount: number;
  month: string;
  billDate: string;
  status: string;
}

interface BillHistoryProps {
  bills: Bill[];
  onDelete?: (billId: Id<"bills">) => void;
}

export function BillHistory({ bills, onDelete }: BillHistoryProps) {
  const chartData = [...bills]
    .reverse()
    .slice(-6)
    .map((bill) => ({
      month: bill.month.split(" ")[0]?.slice(0, 3) || bill.month,
      amount: bill.totalAmount,
      units: bill.unitsConsumed,
    }));

  if (bills.length === 0) {
    return (
      <div className="rounded-2xl p-6 bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-lg shadow-black/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-white/[0.08] border border-white/[0.06]">
            <History className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-white">Bill History</h2>
        </div>
        <div className="text-center py-12 text-neutral-400">
          <History className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No bills analyzed yet</p>
          <p className="text-xs mt-1">
            Your analyzed bills will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-lg shadow-black/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-white/[0.08] border border-white/[0.06]">
          <History className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Bill History</h2>
          <p className="text-xs text-neutral-400">
            Last {Math.min(bills.length, 6)} bills
          </p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#737373", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                tick={{ fill: "#737373", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(20,20,20,0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#e5e5e5",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [
                  `${value.toLocaleString()} PKR`,
                  "Amount",
                ]}
              />
              <Bar
                dataKey="amount"
                fill="rgba(255,255,255,0.2)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bills List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {bills.slice(0, 6).map((bill) => (
          <div
            key={bill._id}
            className="flex items-center justify-between p-3 bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/[0.08] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">
                {bill.billType === "electricity" ? "⚡" : bill.billType === "water" ? "💧" : "🔥"}
              </span>
              <div>
                <p className="text-sm font-medium text-white">{bill.month}</p>
                <p className="text-xs text-neutral-400">
                  {bill.unitsConsumed} units
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-white">
                  {bill.totalAmount.toLocaleString()} PKR
                </p>
                <p className="text-[10px] text-neutral-400">
                  {bill.status === "analyzed" ? "✓ Analyzed" : "Draft"}
                </p>
              </div>
              {onDelete && (
                <button
                  onClick={() => onDelete(bill._id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/10 text-neutral-500 hover:text-red-400 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
