"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Check,
  Zap,
} from "lucide-react";
import type { BillData } from "./bill-input";

interface BillSummaryProps {
  bill: BillData;
}

export function BillSummary({ bill }: BillSummaryProps) {
  const pieData = [
    { name: "Base Usage", value: bill.baseAmount, color: "#e5e5e5" },
    { name: "Taxes (5%)", value: bill.taxes, color: "#737373" },
    { name: "Extra Charges", value: bill.extraCharges, color: "#404040" },
  ];

  // Determine usage level
  const dailyUsage = bill.unitsConsumed / 30;
  let usageLevel: "low" | "medium" | "high" = "low";
  let usageLevelLabel = "Normal Usage";
  let UsageIcon = Check;

  if (dailyUsage > 30) {
    usageLevel = "high";
    usageLevelLabel = "High Usage Alert!";
    UsageIcon = AlertTriangle;
  } else if (dailyUsage > 15) {
    usageLevel = "medium";
    usageLevelLabel = "Moderate Usage";
    UsageIcon = TrendingUp;
  }

  return (
    <div className="rounded-2xl p-6 bg-glass border border-border backdrop-blur-xl shadow-lg shadow-black/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-glass-strong border border-border">
          <Zap className="h-5 w-5 text-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Bill Summary</h2>
          <p className="text-xs text-muted-foreground">{bill.month}</p>
        </div>
      </div>

      {/* Total Amount */}
      <div className="text-center mb-6 p-6 bg-glass-strong border border-glass-border rounded-xl">
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-1">Total Amount</p>
        <p className="text-4xl font-bold text-foreground glow-text">
          {bill.totalAmount.toLocaleString("en-PK", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </p>
        <p className="text-sm text-muted-foreground mt-1">PKR</p>
      </div>

      {/* Usage Alert */}
      <div
        className={`flex items-center gap-3 p-3 rounded-xl mb-6 ${
          usageLevel === "high"
            ? "usage-high"
            : usageLevel === "medium"
            ? "usage-medium"
            : "usage-low"
        }`}
      >
        <UsageIcon className="h-5 w-5 shrink-0" />
        <div>
          <p className="text-sm font-medium">{usageLevelLabel}</p>
          <p className="text-xs opacity-70">
            ~{dailyUsage.toFixed(1)} units/day
          </p>
        </div>
      </div>

      {/* Chart and Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
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
                  "",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown */}
        <div className="space-y-3 flex flex-col justify-center">
          {[
            {
              label: "Base Usage",
              value: bill.baseAmount,
              color: "bg-neutral-200",
            },
            {
              label: "Taxes (5%)",
              value: bill.taxes,
              color: "bg-neutral-500",
            },
            {
              label: "Extra Charges",
              value: bill.extraCharges,
              color: "bg-neutral-700",
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-foreground">
                  {item.value.toLocaleString()} PKR
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details Table */}
      <div className="mt-6 bg-glass border border-glass-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {[
              { label: "Bill Type", value: bill.billType.charAt(0).toUpperCase() + bill.billType.slice(1) },
              { label: "Units Consumed", value: `${bill.unitsConsumed} units` },
              { label: "Tariff Rate", value: `${bill.tariffRate} PKR/unit` },
              { label: "Base Amount", value: `${bill.baseAmount.toLocaleString()} PKR` },
              { label: "Taxes (5%)", value: `${bill.taxes.toLocaleString()} PKR` },
              { label: "Extra Charges", value: `${bill.extraCharges.toLocaleString()} PKR` },
            ].map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? "bg-white/[0.02]" : ""}>
                <td className="px-4 py-2.5 text-neutral-600 dark:text-neutral-300">{row.label}</td>
                <td className="px-4 py-2.5 text-foreground text-right font-medium">
                  {row.value}
                </td>
              </tr>
            ))}
            <tr className="border-t border-glass-border bg-glass">
              <td className="px-4 py-3 text-foreground font-semibold">Total</td>
              <td className="px-4 py-3 text-foreground text-right font-bold text-lg">
                {bill.totalAmount.toLocaleString()} PKR
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
