"use client";

import Link from "next/link";
import { Zap, ArrowRight, Github, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const footerLinks = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it Works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative">
      {/* CTA Section */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-glass border border-border text-xs text-muted-foreground font-medium mb-5 uppercase tracking-wider">
            Get Started
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Ready to Understand
            <br className="hidden sm:block" />{" "}
            <span className="gradient-text">Your Bills?</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto text-base sm:text-lg leading-relaxed">
            Join thousands of users who save money by understanding their utility
            bills with AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-neutral-200 px-8 h-12 text-base font-semibold group w-full sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#features">
              <Button
                size="lg"
                variant="outline"
                className="border-glass-border bg-glass text-foreground hover:bg-glass-strong px-8 h-12 text-base w-full sm:w-auto"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer bottom */}
      <div className="border-t border-border py-12 sm:py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-glass-strong border border-border">
                  <Zap className="h-4 w-4 text-foreground" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  BillSense<span className="text-muted-foreground">.ai</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-4">
                AI-powered utility bill analyzer that helps you understand and save on your monthly bills.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="p-2 rounded-lg bg-glass hover:bg-glass-strong border border-border transition-colors">
                  <Github className="h-4 w-4 text-muted-foreground" />
                </a>
                <a href="#" className="p-2 rounded-lg bg-glass hover:bg-glass-strong border border-border transition-colors">
                  <Twitter className="h-4 w-4 text-muted-foreground" />
                </a>
                <a href="#" className="p-2 rounded-lg bg-glass hover:bg-glass-strong border border-border transition-colors">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </a>
              </div>
            </div>

            {/* Link columns */}
            {footerLinks.map((group) => (
              <div key={group.heading}>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {group.heading}
                </h4>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Copyright */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} BillSense AI. All rights reserved.
            </p>
            <p className="text-xs text-neutral-600">
              Built with Next.js, Convex & Gemini AI
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
