"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { BillInput, type BillData } from "@/components/dashboard/bill-input";
import { ThemeToggle } from "@/components/theme-toggle";
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
        className="border-r border-border"
      >
        {/* Header with logo + toggle */}
        <SidebarHeader className="p-3">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group min-w-0"
            >
              <div className="p-1.5 rounded-lg bg-glass-strong border border-border group-hover:bg-glass-hover transition-colors shrink-0">
                <Zap className="h-4 w-4 text-foreground" />
              </div>
              <span className="text-base font-bold tracking-tight text-foreground truncate group-data-[collapsible=icon]:hidden">
                BillSense
                <span className="text-muted-foreground font-normal">.ai</span>
              </span>
            </Link>
            <div className="flex items-center gap-1 shrink-0 group-data-[collapsible=icon]:hidden">
              <ThemeToggle />
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-glass-hover transition-colors"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
            </div>
          </div>
        </SidebarHeader>

        <SidebarSeparator className="bg-border" />

        <SidebarContent className="px-2 overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Main Nav */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground text-[10px] uppercase tracking-wider px-2">
              Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Expand button - only show when collapsed */}
                <SidebarMenuItem className="group-data-[state=expanded]:hidden">
                  <SidebarMenuButton
                    onClick={toggleSidebar}
                    className="h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-glass-hover transition-colors cursor-pointer"
                  >
                    <ChevronsRight className="h-4 w-4" />
                    <span className="text-sm">Expand</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard"}
                    className="h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-glass-hover data-[active=true]:bg-glass-strong data-[active=true]:text-foreground transition-colors"
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
                    className="h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-glass-hover transition-colors cursor-pointer"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span className="text-sm">New Analysis</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="bg-border" />

          {/* Bill History */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground text-[10px] uppercase tracking-wider px-2 flex items-center gap-2">
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
                        className="h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-glass-hover data-[active=true]:bg-glass-strong data-[active=true]:text-foreground transition-colors"
                      >
                        <Link href={`/dashboard/${bill._id}`}>
                          {bill.billType === "electricity" ? (
                            <Zap className="h-3.5 w-3.5 text-yellow-500 dark:text-yellow-400/70" />
                          ) : (
                            <Flame className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400/70" />
                          )}
                          <span className="text-sm truncate">{bill.month}</span>
                        </Link>
                      </SidebarMenuButton>
                      <SidebarMenuBadge
                        className={`text-[9px] ${
                          bill.status === "analyzed"
                            ? "text-green-500 dark:text-green-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {bill.status === "analyzed" ? "\u2713" : "\u25CF"}
                      </SidebarMenuBadge>
                    </SidebarMenuItem>
                  ))
                ) : (
                  <SidebarMenuItem>
                    <div className="px-3 py-4 text-center group-data-[collapsible=icon]:hidden">
                      <FileText className="h-5 w-5 mx-auto text-muted-foreground mb-1.5" />
                      <p className="text-[11px] text-muted-foreground">
                        No bills yet
                      </p>
                    </div>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="bg-border" />

          {/* Stats */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground text-[10px] uppercase tracking-wider px-2 flex items-center gap-2">
              <BarChart3 className="h-3 w-3" />
              Stats
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-3 py-2 space-y-2 group-data-[collapsible=icon]:hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Total Bills
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    {bills?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Analyzed</span>
                  <span className="text-xs font-medium text-green-500 dark:text-green-400">
                    {analyzedCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    AI Powered
                  </span>
                  <Sparkles className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3 border-t border-border">
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 ring-2 ring-border",
                  userButtonPopoverCard:
                    "bg-neutral-950 backdrop-blur-xl border border-white/10 shadow-2xl",
                  userButtonPopoverActionButton:
                    "text-neutral-200 hover:text-white hover:bg-white/10",
                  userButtonPopoverActionButtonText: "text-neutral-200",
                  userButtonPopoverActionButtonIcon: "text-neutral-300",
                  userButtonPopoverFooter: "hidden",
                },
              }}
            />
            <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-sm text-foreground truncate font-medium">
                {user?.firstName || "User"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user?.emailAddresses?.[0]?.emailAddress}
              </p>
            </div>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* New Analysis Dialog */}
      <Dialog open={showNewAnalysis} onOpenChange={setShowNewAnalysis}>
        <DialogContent className="sm:max-w-[550px] bg-background border-border p-0 gap-0 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-foreground text-lg flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-muted-foreground" />
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
