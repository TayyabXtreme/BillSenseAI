"use client";

import { useState, useMemo } from "react";
import { SlidersHorizontal, TrendingDown, Lightbulb } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { BillData } from "./bill-input";

interface InteractiveTipsProps {
  bill: BillData;
}

const appliances = [
  { name: "Air Conditioner", reduction: 25, icon: "❄️" },
  { name: "Water Heater", reduction: 15, icon: "🚿" },
  { name: "Iron", reduction: 8, icon: "👔" },
  { name: "Washing Machine", reduction: 5, icon: "🧺" },
];

export function InteractiveTips({ bill }: InteractiveTipsProps) {
  const [usageReduction, setUsageReduction] = useState([0]);
  const [disabledAppliances, setDisabledAppliances] = useState<string[]>([]);

  const calculations = useMemo(() => {
    const applianceReduction = appliances
      .filter((a) => disabledAppliances.includes(a.name))
      .reduce((sum, a) => sum + a.reduction, 0);

    const totalReductionPercent = Math.min(
      usageReduction[0] + applianceReduction,
      90
    );
    const newUnits =
      bill.unitsConsumed * (1 - totalReductionPercent / 100);
    const newBase = newUnits * bill.tariffRate;
    const newTaxes = newBase * 0.05;
    const newTotal = newBase + newTaxes + bill.extraCharges;
    const savings = bill.totalAmount - newTotal;

    return {
      totalReductionPercent,
      newUnits: Math.round(newUnits),
      newTotal: Math.round(newTotal),
      savings: Math.round(savings),
      savingsPercent:
        bill.totalAmount > 0
          ? ((savings / bill.totalAmount) * 100).toFixed(1)
          : "0",
    };
  }, [bill, usageReduction, disabledAppliances]);

  const toggleAppliance = (name: string) => {
    setDisabledAppliances((prev) =>
      prev.includes(name)
        ? prev.filter((a) => a !== name)
        : [...prev, name]
    );
  };

  return (
    <div className="rounded-2xl p-6 bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-lg shadow-black/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-white/[0.08] border border-white/[0.06]">
          <SlidersHorizontal className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Usage Simulator</h2>
          <p className="text-xs text-neutral-400">
            See how reducing usage affects your bill
          </p>
        </div>
      </div>

      {/* Main Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm text-neutral-200">Reduce Usage By</Label>
          <span className="text-sm font-bold text-white">
            {usageReduction[0]}%
          </span>
        </div>
        <Slider
          value={usageReduction}
          onValueChange={setUsageReduction}
          min={0}
          max={50}
          step={5}
          className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-white/20 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-white/10"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-neutral-500">0%</span>
          <span className="text-xs text-neutral-500">50%</span>
        </div>
      </div>

      {/* Appliance Toggles */}
      <div className="mb-6">
        <p className="text-sm text-neutral-300 mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Turn off appliances to save more
        </p>
        <div className="grid grid-cols-2 gap-3">
          {appliances.map((appliance) => (
            <div
              key={appliance.name}
              onClick={() => toggleAppliance(appliance.name)}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left cursor-pointer ${
                disabledAppliances.includes(appliance.name)
                  ? "usage-low border border-green-500/20"
                  : "bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08]"
              }`}
            >
              <span className="text-lg">{appliance.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {appliance.name}
                </p>
                <p className="text-[10px] text-neutral-400">
                  -{appliance.reduction}% usage
                </p>
              </div>
              <Switch
                checked={disabledAppliances.includes(appliance.name)}
                onCheckedChange={() => toggleAppliance(appliance.name)}
                className="scale-75"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        <div className="bg-white/[0.06] border border-white/[0.1] rounded-xl p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-neutral-400 mb-1">New Units</p>
              <p className="text-lg font-bold text-white">
                {calculations.newUnits}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">New Bill</p>
              <p className="text-lg font-bold text-white">
                {calculations.newTotal.toLocaleString()}
              </p>
              <p className="text-[10px] text-neutral-400">PKR</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">You Save</p>
              <p className="text-lg font-bold text-green-400">
                {calculations.savings > 0
                  ? calculations.savings.toLocaleString()
                  : "0"}
              </p>
              <p className="text-[10px] text-neutral-500">PKR</p>
            </div>
          </div>
        </div>

        {calculations.savings > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-xl usage-low">
            <TrendingDown className="h-4 w-4 shrink-0" />
            <p className="text-sm">
              By reducing {calculations.totalReductionPercent}% of usage, you save{" "}
              <span className="font-bold">
                {calculations.savings.toLocaleString()} PKR
              </span>{" "}
              ({calculations.savingsPercent}% of your bill)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
