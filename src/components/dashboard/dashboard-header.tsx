"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { Zap, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export function DashboardHeader() {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 bg-neutral-950/85 backdrop-blur-2xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="p-1.5 rounded-lg bg-white/[0.08] border border-white/[0.06] group-hover:bg-white/[0.12] transition-colors">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              BillSense<span className="text-neutral-500 font-normal">.ai</span>
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <LayoutDashboard className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-xs text-neutral-400 font-medium">Dashboard</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03]">
            <div className="h-2 w-2 rounded-full bg-green-400/80" />
            <span className="text-xs text-neutral-400">
              {user?.firstName || "User"}
            </span>
          </div>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 ring-2 ring-white/[0.08]",
                userButtonPopoverCard:
                  "bg-neutral-950/95 backdrop-blur-xl border border-white/10",
                userButtonPopoverActionButton: "text-neutral-300 hover:text-white hover:bg-white/5",
                userButtonPopoverActionButtonText: "text-neutral-300",
                userButtonPopoverActionButtonIcon: "text-neutral-400",
                userButtonPopoverFooter: "hidden",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
