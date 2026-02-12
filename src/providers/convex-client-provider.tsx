"use client";

import { ReactNode } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { Toaster } from "sonner";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="bottom-right"
      toastOptions={{
        style: {
          background:
            resolvedTheme === "dark"
              ? "rgba(20, 20, 20, 0.9)"
              : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(16px)",
          border:
            resolvedTheme === "dark"
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(0,0,0,0.08)",
          color: resolvedTheme === "dark" ? "#e5e5e5" : "#171717",
        },
      }}
    />
  );
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  return (
    <ClerkProvider
      appearance={{
        baseTheme: isDark ? dark : undefined,
        variables: {
          colorPrimary: isDark ? "#ffffff" : "#171717",
          colorBackground: isDark ? "#0a0a0a" : "#ffffff",
          colorText: isDark ? "#e5e5e5" : "#171717",
          colorInputBackground: isDark ? "#141414" : "#f5f5f5",
          colorInputText: isDark ? "#e5e5e5" : "#171717",
          borderRadius: "0.75rem",
        },
        elements: {
          formButtonPrimary:
            "bg-white text-black hover:bg-neutral-200 transition-all shadow-lg",
          card: isDark
            ? "bg-neutral-950/80 backdrop-blur-2xl border border-white/10 shadow-2xl"
            : "bg-white backdrop-blur-2xl border border-neutral-200 shadow-xl",
          headerTitle: isDark ? "text-white" : "text-neutral-900",
          headerSubtitle: isDark ? "text-neutral-400" : "text-neutral-500",
          socialButtonsBlockButton: isDark
            ? "bg-white/5 border border-white/10 text-white hover:bg-white/10 backdrop-blur-xl"
            : "bg-neutral-50 border border-neutral-200 text-neutral-900 hover:bg-neutral-100",
          socialButtonsBlockButtonText: isDark ? "text-white font-medium" : "text-neutral-900 font-medium",
          formFieldLabel: isDark ? "text-neutral-300" : "text-neutral-600",
          formFieldInput: isDark
            ? "bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-white/30 focus:ring-white/10"
            : "bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-neutral-200",
          footerActionLink: isDark ? "text-white hover:text-neutral-300" : "text-neutral-900 hover:text-neutral-600",
          identityPreviewText: isDark ? "text-white" : "text-neutral-900",
          identityPreviewEditButton: isDark ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-900",
          formResendCodeLink: isDark ? "text-white hover:text-neutral-300" : "text-neutral-900 hover:text-neutral-600",
          dividerLine: isDark ? "bg-white/10" : "bg-neutral-200",
          dividerText: isDark ? "text-neutral-500" : "text-neutral-400",
          otpCodeFieldInput: isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-neutral-300 text-neutral-900",
          userButtonPopoverCard: isDark
            ? "bg-neutral-950 backdrop-blur-xl border border-white/10 shadow-2xl"
            : "bg-white backdrop-blur-xl border border-neutral-200 shadow-xl",
          userButtonPopoverActionButton: isDark
            ? "text-neutral-200 hover:text-white hover:bg-white/10"
            : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100",
          userButtonPopoverActionButtonText: isDark ? "text-neutral-200" : "text-neutral-700",
          userButtonPopoverActionButtonIcon: isDark ? "text-neutral-300" : "text-neutral-500",
          userButtonPopoverFooter: "hidden",
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
        <ThemedToaster />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
