"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { BillInput, type BillData } from "@/components/dashboard/bill-input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Zap,
  LayoutDashboard,
  PlusCircle,
  History,
  BarChart3,
  Sparkles,
  Flame,
  FileText,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export function AppSidebar() {
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar, state } = useSidebar();
  const [showNewAnalysis, setShowNewAnalysis] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bills = useQuery(
    api.bills.getRecentBills,
    user ? { userId: user.id, limit: 10 } : "skip"
  );

  const createBill = useMutation(api.bills.createBill);

  const analyzedCount =
    bills?.filter((b) => b.status === "analyzed").length || 0;

  const handleBillSubmit = async (data: BillData) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const billId = await createBill({
        userId: user.id,
        billType: data.billType,
        unitsConsumed: data.unitsConsumed,
        tariffRate: data.tariffRate,
        extraCharges: data.extraCharges,
        taxes: data.taxes,
        totalAmount: data.totalAmount,
        baseAmount: data.baseAmount,
        billDate: data.billDate,
        month: data.month,
        ocrRawText: data.ocrRawText,
        status: "draft",
      });
      toast.success("Bill saved! Redirecting to analysis...");
      setShowNewAnalysis(false);
      router.push(`/dashboard/${billId}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save bill.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="border-r border-white/[0.06] bg-neutral-950/80"
      >
        {/* Header with logo + toggle */}
        <SidebarHeader className="p-3">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group min-w-0"
            >
              <div className="p-1.5 rounded-lg bg-white/[0.08] border border-white/[0.06] group-hover:bg-white/[0.12] transition-colors shrink-0">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold tracking-tight text-white truncate group-data-[collapsible=icon]:hidden">
                BillSense
                <span className="text-neutral-500 font-normal">.ai</span>
              </span>
            </Link>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0 group-data-[collapsible=icon]:hidden"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          </div>
        </SidebarHeader>

        <SidebarSeparator className="bg-white/[0.06]" />

        <SidebarContent className="px-2 overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Main Nav */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-neutral-500 text-[10px] uppercase tracking-wider px-2">
              Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Expand button - only show when collapsed */}
                <SidebarMenuItem className="group-data-[state=expanded]:hidden">
                  <SidebarMenuButton
                    onClick={toggleSidebar}
                    className="h-9 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                  >
                    <ChevronsRight className="h-4 w-4" />
                    <span className="text-sm">Expand</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard"}
                    className="h-9 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] data-[active=true]:bg-white/[0.08] data-[active=true]:text-white transition-colors"
                  >
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="text-sm">Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setShowNewAnalysis(true)}
                    className="h-9 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span className="text-sm">New Analysis</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="bg-white/[0.06]" />

          {/* Bill History */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-neutral-500 text-[10px] uppercase tracking-wider px-2 flex items-center gap-2">
              <History className="h-3 w-3" />
              Recent Bills
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {bills && bills.length > 0 ? (
                  bills.slice(0, 8).map((bill) => (
                    <SidebarMenuItem key={bill._id}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === `/dashboard/${bill._id}`}
                        className="h-9 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] data-[active=true]:bg-white/[0.08] data-[active=true]:text-white transition-colors"
                      >
                        <Link href={`/dashboard/${bill._id}`}>
                          {bill.billType === "electricity" ? (
                            <Zap className="h-3.5 w-3.5 text-yellow-400/70" />
                          ) : (
                            <Flame className="h-3.5 w-3.5 text-orange-400/70" />
                          )}
                          <span className="text-sm truncate">{bill.month}</span>
                        </Link>
                      </SidebarMenuButton>
                      <SidebarMenuBadge
                        className={`text-[9px] ${
                          bill.status === "analyzed"
                            ? "text-green-400"
                            : "text-neutral-500"
                        }`}
                      >
                        {bill.status === "analyzed" ? "✓" : "●"}
                      </SidebarMenuBadge>
                    </SidebarMenuItem>
                  ))
                ) : (
                  <SidebarMenuItem>
                    <div className="px-3 py-4 text-center group-data-[collapsible=icon]:hidden">
                      <FileText className="h-5 w-5 mx-auto text-neutral-600 mb-1.5" />
                      <p className="text-[11px] text-neutral-500">
                        No bills yet
                      </p>
                    </div>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="bg-white/[0.06]" />

          {/* Stats */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-neutral-500 text-[10px] uppercase tracking-wider px-2 flex items-center gap-2">
              <BarChart3 className="h-3 w-3" />
              Stats
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-3 py-2 space-y-2 group-data-[collapsible=icon]:hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500">
                    Total Bills
                  </span>
                  <span className="text-xs font-medium text-white">
                    {bills?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500">Analyzed</span>
                  <span className="text-xs font-medium text-green-400">
                    {analyzedCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500">
                    AI Powered
                  </span>
                  <Sparkles className="h-3 w-3 text-neutral-400" />
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 ring-2 ring-white/[0.08]",
                  userButtonPopoverCard:
                    "bg-neutral-950/95 backdrop-blur-xl border border-white/10",
                  userButtonPopoverActionButton:
                    "text-neutral-300 hover:text-white hover:bg-white/5",
                  userButtonPopoverActionButtonText: "text-neutral-300",
                  userButtonPopoverActionButtonIcon: "text-neutral-400",
                  userButtonPopoverFooter: "hidden",
                },
              }}
            />
            <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-sm text-white truncate font-medium">
                {user?.firstName || "User"}
              </p>
              <p className="text-[10px] text-neutral-500 truncate">
                {user?.emailAddresses?.[0]?.emailAddress}
              </p>
            </div>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* New Analysis Dialog */}
      <Dialog open={showNewAnalysis} onOpenChange={setShowNewAnalysis}>
        <DialogContent className="sm:max-w-[550px] bg-neutral-950 border-white/[0.08] p-0 gap-0 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-white text-lg flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-neutral-400" />
              New Bill Analysis
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-4">
            <BillInput
              onBillSubmit={handleBillSubmit}
              isLoading={isSubmitting}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
