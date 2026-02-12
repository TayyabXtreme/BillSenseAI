"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Zap,
  LayoutDashboard,
  PlusCircle,
  History,
  BarChart3,
  Sparkles,
  Flame,
  Droplets,
  FileText,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Type,
} from "lucide-react";

export function AppSidebar() {
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar, state } = useSidebar();
  const [showNewAnalysis, setShowNewAnalysis] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bill management state
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [newName, setNewName] = useState("");
  const [editFields, setEditFields] = useState({
    unitsConsumed: "",
    tariffRate: "",
    extraCharges: "",
    billDate: "",
  });
  const renameInputRef = useRef<HTMLInputElement>(null);

  const bills = useQuery(
    api.bills.getRecentBills,
    user ? { userId: user.id, limit: 10 } : "skip"
  );

  const createBill = useMutation(api.bills.createBill);
  const deleteBillMutation = useMutation(api.bills.deleteBill);
  const renameBillMutation = useMutation(api.bills.renameBill);
  const updateBillMutation = useMutation(api.bills.updateBill);

  const analyzedCount =
    bills?.filter((b) => b.status === "analyzed").length || 0;

  // Focus rename input when dialog opens
  useEffect(() => {
    if (renameDialogOpen && renameInputRef.current) {
      setTimeout(() => renameInputRef.current?.focus(), 100);
    }
  }, [renameDialogOpen]);

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

  const handleRename = async () => {
    if (!selectedBill || !newName.trim()) return;
    try {
      await renameBillMutation({
        billId: selectedBill._id as Id<"bills">,
        name: newName.trim(),
      });
      toast.success("Bill renamed!");
      setRenameDialogOpen(false);
    } catch {
      toast.error("Failed to rename bill.");
    }
  };

  const handleDelete = async () => {
    if (!selectedBill) return;
    try {
      await deleteBillMutation({
        billId: selectedBill._id as Id<"bills">,
      });
      toast.success("Bill deleted!");
      setDeleteDialogOpen(false);
      // If we're viewing this bill, redirect to dashboard
      if (pathname === `/dashboard/${selectedBill._id}`) {
        router.push("/dashboard");
      }
    } catch {
      toast.error("Failed to delete bill.");
    }
  };

  const handleEdit = async () => {
    if (!selectedBill) return;
    try {
      const u = parseFloat(editFields.unitsConsumed);
      const t = parseFloat(editFields.tariffRate);
      const e = parseFloat(editFields.extraCharges) || 0;

      if (!u || u <= 0 || !t || t <= 0) {
        toast.error("Please enter valid units and tariff.");
        return;
      }

      const baseAmount = u * t;
      const taxes = baseAmount * 0.05;
      const totalAmount = baseAmount + taxes + e;
      const date = new Date(editFields.billDate);

      await updateBillMutation({
        billId: selectedBill._id as Id<"bills">,
        unitsConsumed: u,
        tariffRate: t,
        extraCharges: e,
        taxes,
        totalAmount,
        baseAmount,
        billDate: editFields.billDate,
        month: date.toLocaleString("default", { month: "long", year: "numeric" }),
      });
      toast.success("Bill updated!");
      setEditDialogOpen(false);
    } catch {
      toast.error("Failed to update bill.");
    }
  };

  const openRenameDialog = (bill: any) => {
    setSelectedBill(bill);
    setNewName(bill.name || bill.month || "");
    setRenameDialogOpen(true);
  };

  const openDeleteDialog = (bill: any) => {
    setSelectedBill(bill);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (bill: any) => {
    setSelectedBill(bill);
    setEditFields({
      unitsConsumed: bill.unitsConsumed?.toString() || "",
      tariffRate: bill.tariffRate?.toString() || "",
      extraCharges: bill.extraCharges?.toString() || "0",
      billDate: bill.billDate || new Date().toISOString().split("T")[0],
    });
    setEditDialogOpen(true);
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
                    <SidebarMenuItem key={bill._id} className="group/bill relative">
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === `/dashboard/${bill._id}`}
                        className="h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-glass-hover data-[active=true]:bg-glass-strong data-[active=true]:text-foreground transition-colors pr-8"
                      >
                        <Link href={`/dashboard/${bill._id}`}>
                          {bill.billType === "electricity" ? (
                            <Zap className="h-3.5 w-3.5 text-yellow-500 dark:text-yellow-400/70" />
                          ) : bill.billType === "water" ? (
                            <Droplets className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400/70" />
                          ) : (
                            <Flame className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400/70" />
                          )}
                          <span className="text-sm truncate">{bill.name || bill.month}</span>
                        </Link>
                      </SidebarMenuButton>
                      {/* Actions dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md opacity-0 group-hover/bill:opacity-100 hover:bg-glass-strong text-muted-foreground hover:text-foreground transition-all group-data-[collapsible=icon]:hidden">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-background border-border">
                          <DropdownMenuItem
                            onClick={() => openRenameDialog(bill)}
                            className="text-sm gap-2 cursor-pointer"
                          >
                            <Type className="h-3.5 w-3.5" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(bill)}
                            className="text-sm gap-2 cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(bill)}
                            className="text-sm gap-2 cursor-pointer text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              Rename Bill
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Give this bill a custom name for easier identification.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              ref={renameInputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., January Electricity"
              className="bg-glass border-glass-border text-foreground rounded-xl"
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
              className="border-border text-foreground hover:bg-glass-hover"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={!newName.trim()}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[450px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Pencil className="h-4 w-4 text-muted-foreground" />
              Edit Bill
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Update the bill details. Total will be recalculated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-foreground">Units Consumed</label>
                <Input
                  type="number"
                  value={editFields.unitsConsumed}
                  onChange={(e) => setEditFields({ ...editFields, unitsConsumed: e.target.value })}
                  className="bg-glass border-glass-border text-foreground rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-foreground">Tariff Rate (PKR)</label>
                <Input
                  type="number"
                  value={editFields.tariffRate}
                  onChange={(e) => setEditFields({ ...editFields, tariffRate: e.target.value })}
                  className="bg-glass border-glass-border text-foreground rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-foreground">Extra Charges (PKR)</label>
                <Input
                  type="number"
                  value={editFields.extraCharges}
                  onChange={(e) => setEditFields({ ...editFields, extraCharges: e.target.value })}
                  className="bg-glass border-glass-border text-foreground rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-foreground">Bill Date</label>
                <Input
                  type="date"
                  value={editFields.billDate}
                  onChange={(e) => setEditFields({ ...editFields, billDate: e.target.value })}
                  className="bg-glass border-glass-border text-foreground rounded-xl dark:[color-scheme:dark] [color-scheme:light]"
                />
              </div>
            </div>
            {/* Live total preview */}
            {editFields.unitsConsumed && editFields.tariffRate && (
              <div className="bg-glass-strong border border-glass-border rounded-xl p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">New Total</span>
                  <span className="font-bold text-foreground">
                    {(() => {
                      const u = parseFloat(editFields.unitsConsumed) || 0;
                      const t = parseFloat(editFields.tariffRate) || 0;
                      const e = parseFloat(editFields.extraCharges) || 0;
                      const base = u * t;
                      return (base + base * 0.05 + e).toLocaleString("en-PK", { maximumFractionDigits: 0 });
                    })()}{" "}
                    <span className="text-xs font-normal text-muted-foreground">PKR</span>
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="border-border text-foreground hover:bg-glass-hover"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              Update Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500" />
              Delete Bill
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Are you sure you want to delete &ldquo;{selectedBill?.name || selectedBill?.month}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-border text-foreground hover:bg-glass-hover"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
