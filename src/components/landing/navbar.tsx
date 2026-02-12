"use client";

import { useState } from "react";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Zap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-header backdrop-blur-2xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="p-1.5 rounded-lg bg-glass-strong group-hover:bg-glass-hover transition-colors border border-border">
              <Zap className="h-5 w-5 text-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              BillSense<span className="text-muted-foreground font-normal">.ai</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-glass-hover transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <SignedOut>
              <Link href="/sign-in">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground hover:bg-glass-hover text-sm h-9 px-4"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-white text-black hover:bg-neutral-200 font-semibold text-sm h-9 px-5 rounded-lg shadow-lg shadow-black/10">
                  Get Started
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button className="bg-white text-black hover:bg-neutral-200 font-semibold text-sm h-9 px-5 rounded-lg">
                  Dashboard
                </Button>
              </Link>
            </SignedIn>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-glass-hover transition-colors"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-2xl border-t border-border px-4 pb-5 pt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-glass-hover rounded-lg transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-border space-y-2">
            <SignedOut>
              <Link href="/sign-in" className="block">
                <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground hover:bg-glass-hover justify-center h-11">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up" className="block">
                <Button className="w-full bg-white text-black hover:bg-neutral-200 font-semibold justify-center h-11">
                  Get Started
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="block">
                <Button className="w-full bg-white text-black hover:bg-neutral-200 font-semibold justify-center h-11">
                  Dashboard
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      )}
    </nav>
  );
}
