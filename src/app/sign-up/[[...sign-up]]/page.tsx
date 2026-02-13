"use client";

import { useState, useEffect } from "react";
import { useSignUp, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Zap, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, User,
  ShieldCheck, AlertCircle, Check, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import {
  validateEmail, validatePassword, validateName, getPasswordStrength,
} from "@/lib/validation";

export default function SignUpPage() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const { user, isLoaded: userLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (userLoaded && user) {
      router.push("/dashboard");
    }
  }, [user, userLoaded, router]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Verification step
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  const clearError = (field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordChecks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { label: "One number (0-9)", met: /[0-9]/.test(password) },
    { label: "One special character (!@#$...)", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    // Client-side validation
    const newErrors: Record<string, string> = {};

    const nameErr = validateName(firstName, "First name");
    if (nameErr) newErrors.firstName = nameErr.message;

    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr.message;

    const passErr = validatePassword(password);
    if (passErr) newErrors.password = passErr.message;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(Object.values(newErrors)[0]);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
      toast.success("Verification code sent to your email!");
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Sign-up failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    if (!code.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    setVerifyLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Account created successfully!");
        router.push("/onboarding");
      } else {
        toast.error("Verification incomplete. Please try again.");
      }
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Invalid verification code";
      toast.error(msg);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isLoaded || !signUp) return;
    setGoogleLoading(true);
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sign-up/sso-callback",
        redirectUrlComplete: "/onboarding",
      });
    } catch (err: any) {
      toast.error("Could not sign up with Google");
      setGoogleLoading(false);
    }
  };

  // Verification Screen
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-3xl animate-pulse-slow" />

        <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2.5 rounded-xl bg-white/10 group-hover:bg-white/15 transition-colors shadow-lg shadow-white/5">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              BillSense<span className="text-neutral-400 font-light">.ai</span>
            </span>
          </Link>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-1">Verify Your Email</h1>
            <p className="text-neutral-400 text-sm">
              We sent a 6-digit code to{" "}
              <span className="text-neutral-200 font-medium">{email}</span>
            </p>
          </div>

          <div className="w-full rounded-2xl p-8 bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] shadow-2xl shadow-black/40">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-white/[0.08] border border-white/[0.1]">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-200">Verification Code</Label>
                <Input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="h-14 text-center text-2xl tracking-[0.5em] font-mono bg-white/[0.05] border-white/[0.1] text-white placeholder:text-neutral-500 placeholder:text-base placeholder:tracking-normal rounded-xl focus:border-white/25 focus:ring-1 focus:ring-white/10"
                  maxLength={6}
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                disabled={verifyLoading || code.length < 6}
                className="w-full h-12 bg-white text-black hover:bg-neutral-200 font-semibold rounded-xl shadow-lg shadow-white/10 text-sm transition-all group"
              >
                {verifyLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <button
              onClick={() => {
                if (signUp)
                  signUp.prepareEmailAddressVerification({ strategy: "email_code" })
                    .then(() => toast.success("New code sent!"))
                    .catch(() => toast.error("Failed to resend code"));
              }}
              className="w-full mt-4 text-sm text-neutral-400 hover:text-white transition-colors text-center"
            >
              Didn&apos;t receive a code?{" "}
              <span className="font-medium text-white">Resend</span>
            </button>
          </div>

          <button
            onClick={() => setVerifying(false)}
            className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            &larr; Back to sign up
          </button>
        </div>
      </div>
    );
  }

  // Main Sign Up Screen
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8">
      <div className="absolute inset-0 gradient-bg" />
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-white/[0.015] blur-3xl animate-pulse-slow" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-2.5 rounded-xl bg-white/10 group-hover:bg-white/15 transition-colors shadow-lg shadow-white/5">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            BillSense<span className="text-neutral-400 font-light">.ai</span>
          </span>
        </Link>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-1">Create Your Account</h1>
          <p className="text-neutral-400 text-sm">Start saving money on your utility bills</p>
        </div>

        {/* Sign Up Card */}
        <div className="w-full rounded-2xl p-6 sm:p-8 bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] shadow-2xl shadow-black/40">
          {/* Google Button */}
          <button
            onClick={handleGoogleSignUp}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/[0.18] text-white font-medium text-sm transition-all duration-200 disabled:opacity-50 mb-6"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/[0.1]" />
            <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/[0.1]" />
          </div>

          {/* Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-200">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); clearError("firstName"); }}
                    placeholder="John"
                    className={`pl-10 h-12 sm:h-11 bg-white/[0.05] text-white placeholder:text-neutral-500 rounded-xl focus:ring-1 focus:ring-white/10 ${
                      errors.firstName ? "border-red-500/60" : "border-white/[0.1] focus:border-white/25"
                    }`}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.firstName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-200">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="pl-10 h-12 sm:h-11 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-neutral-500 rounded-xl focus:border-white/25 focus:ring-1 focus:ring-white/10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-200">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                  placeholder="you@example.com"
                  className={`pl-10 h-12 sm:h-11 bg-white/[0.05] text-white placeholder:text-neutral-500 rounded-xl focus:ring-1 focus:ring-white/10 ${
                    errors.email ? "border-red-500/60" : "border-white/[0.1] focus:border-white/25"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3 shrink-0" /> {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-200">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                  placeholder="Min. 8 characters"
                  className={`pl-10 pr-11 h-12 sm:h-11 bg-white/[0.05] text-white placeholder:text-neutral-500 rounded-xl focus:ring-1 focus:ring-white/10 ${
                    errors.password ? "border-red-500/60" : "border-white/[0.1] focus:border-white/25"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3 shrink-0" /> {errors.password}
                </p>
              )}

              {/* Password Strength Bar + Checklist */}
              {password.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            i < passwordStrength.score ? passwordStrength.color : "bg-white/[0.08]"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-[10px] font-medium ${
                      passwordStrength.score <= 1 ? "text-red-400"
                      : passwordStrength.score <= 3 ? "text-yellow-400"
                      : "text-green-400"
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {passwordChecks.map((check) => (
                      <div key={check.label} className="flex items-center gap-2">
                        {check.met ? (
                          <Check className="h-3 w-3 text-green-400 shrink-0" />
                        ) : (
                          <X className="h-3 w-3 text-neutral-600 shrink-0" />
                        )}
                        <span className={`text-[11px] ${check.met ? "text-neutral-300" : "text-neutral-500"}`}>
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Clerk CAPTCHA */}
            <div id="clerk-captcha" className="py-2" />

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-white text-black hover:bg-neutral-200 font-semibold rounded-xl shadow-lg shadow-white/10 text-sm transition-all group mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-sm text-neutral-400">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-white hover:text-neutral-300 font-medium transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
