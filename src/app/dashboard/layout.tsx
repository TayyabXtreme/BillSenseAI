"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { ChevronRight, LayoutDashboard, FileText } from "lucide-react";

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
            ? "text-neutral-500 hover:text-neutral-300"
            : "text-white font-medium"
        }`}
      >
        <LayoutDashboard className="h-3.5 w-3.5" />
        <span>Dashboard</span>
      </Link>
      {isDetail && (
        <>
          <ChevronRight className="h-3 w-3 text-neutral-600" />
          <span className="text-white font-medium flex items-center gap-1.5">
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
            {/* Top bar - breadcrumb only */}
            <header className="sticky top-0 z-40 flex items-center h-12 px-5 border-b border-white/[0.06] bg-neutral-950/85 backdrop-blur-2xl">
              <DashboardBreadcrumb />
            </header>

            {/* Page Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
