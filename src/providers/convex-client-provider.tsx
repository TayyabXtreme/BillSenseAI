"use client";

import { ReactNode } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { Toaster } from "sonner";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#ffffff",
          colorBackground: "#0a0a0a",
          colorText: "#e5e5e5",
          colorInputBackground: "#141414",
          colorInputText: "#e5e5e5",
          borderRadius: "0.75rem",
        },
        elements: {
          formButtonPrimary:
            "bg-white text-black hover:bg-neutral-200 transition-all shadow-lg",
          card: "bg-neutral-950/80 backdrop-blur-2xl border border-white/10 shadow-2xl",
          headerTitle: "text-white",
          headerSubtitle: "text-neutral-400",
          socialButtonsBlockButton:
            "bg-white/5 border border-white/10 text-white hover:bg-white/10 backdrop-blur-xl",
          socialButtonsBlockButtonText: "text-white font-medium",
          formFieldLabel: "text-neutral-300",
          formFieldInput:
            "bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-white/30 focus:ring-white/10",
          footerActionLink: "text-white hover:text-neutral-300",
          identityPreviewText: "text-white",
          identityPreviewEditButton: "text-neutral-400 hover:text-white",
          formResendCodeLink: "text-white hover:text-neutral-300",
          dividerLine: "bg-white/10",
          dividerText: "text-neutral-500",
          otpCodeFieldInput:
            "bg-white/5 border-white/10 text-white",
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(20, 20, 20, 0.9)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e5e5e5",
            },
          }}
        />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
