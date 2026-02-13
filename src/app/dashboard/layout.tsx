"use client";

import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { ChatPanel } from "@/components/dashboard/chat-panel";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ChevronRight, LayoutDashboard, FileText, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

function DashboardBreadcrumb() {
  const pathname = usePathname();
  const isDetail =
    pathname !== "/dashboard" && pathname.startsWith("/dashboard/");

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      <Link
        href="/dashboard"
        className={`flex items-center gap-1.5 transition-colors ${
          isDetail
            ? "text-muted-foreground hover:text-foreground"
            : "text-foreground font-medium"
        }`}
      >
        <LayoutDashboard className="h-3.5 w-3.5" />
        <span>Dashboard</span>
      </Link>
      {isDetail && (
        <>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span className="text-foreground font-medium flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Bill Analysis
          </span>
        </>
      )}
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    if (user) {
      createUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || "User",
        imageUrl: user.imageUrl,
      }).catch(() => {});
    }
  }, [user, createUser]);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 gradient-bg pointer-events-none z-0" />
      <div className="relative z-10">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="bg-transparent min-h-screen">
            {/* Mobile Header Bar */}
            <header className="sticky top-0 z-40 flex md:hidden items-center justify-between h-14 px-4 border-b border-border bg-header backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                <Link href="/dashboard" className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-glass-strong border border-border">
                    <Zap className="h-4 w-4 text-foreground" />
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    BillSense<span className="text-muted-foreground font-normal">.ai</span>
                  </span>
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "h-7 w-7",
                    },
                  }}
                />
              </div>
            </header>

            {/* Desktop Top bar - breadcrumb only */}
            <header className="sticky top-0 z-40 hidden md:flex items-center h-12 px-5 border-b border-border bg-header backdrop-blur-2xl">
              <DashboardBreadcrumb />
            </header>

            {/* Page Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
      {/* Chat Panel - Outside SidebarProvider to ensure proper positioning */}
      <ChatPanel />
    </div>
  );
}
