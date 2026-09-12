'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Zap,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Check,
  CheckCircle2,
  Activity,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignupPage() {
  const router = useRouter();
  const { status } = useSession();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // If already authenticated, redirect to onboarding or dashboard
  React.useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/onboarding/plant');
    }
  }, [status, router]);

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!hasMinLength || !hasUpper || !hasLower || !hasNumber) {
      setErrorMessage('Password must satisfy all security requirements.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Registration failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Automatically sign in the new user
      const loginRes = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        // Redirect to login if auto-login fails
        window.location.href = '/login?message=Account+created+successfully.+Please+sign+in.';
      } else {
        // Proceed to plant onboarding with active session
        window.location.href = '/onboarding/plant';
      }
    } catch {
      setErrorMessage('Network disruption encountered. Please check connectivity and try again.');
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center select-none antialiased">
      {/* Top Identity Bar */}
      <div className="border-b border-border/80 bg-surface/60 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="size-7 rounded bg-primary flex items-center justify-center text-white font-bold shadow-subtle">
            <Zap className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm tracking-tight text-foreground">
              RenewableIQ
            </span>
            <span className="text-[10px] text-muted font-mono tracking-wider uppercase -mt-0.5">
              Industrial Generation Platform
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="hidden sm:inline text-muted">EXISTING OPERATOR?</span>
          <Link
            href="/login"
            className="px-2.5 py-1 rounded border border-border hover:bg-border/30 text-foreground font-semibold text-xs transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Industrial Plant Intelligence Overview */}
          <div className="lg:col-span-6 flex flex-col justify-between bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

            <div className="space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-medium">
                <ShieldCheck className="size-3.5" />
                <span>OPERATOR ACCESS REGISTRATION</span>
              </div>

              <div className="space-y-2">
                <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground tracking-tight leading-tight">
                  Deploy Real-Time Generation & Ramp Intelligence
                </h1>
                <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                  Join the unified dispatch workstation. Onboard your solar PV assets, connect live
                  Open-Meteo meteorological streams, and automate statutory grid ramp mitigation.
                </p>
              </div>

              {/* Operational Architecture Funnel */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-semibold">
                  Platform Architecture Stack
                </span>
                <div className="space-y-2.5 font-mono text-xs">
                  <div className="p-3 rounded-lg border border-border bg-[#FAFBF9] flex items-center gap-3">
                    <div className="size-7 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Activity className="size-4" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-[11px]">
                        1. High-Resolution Meteorological Stream
                      </p>
                      <p className="text-[10px] text-muted">
                        Live Global Tilted Irradiance (GTI), DNI & cloud cover via Open-Meteo
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-[#FAFBF9] flex items-center gap-3">
                    <div className="size-7 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Layers className="size-4" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-[11px]">
                        2. Physics Photovoltaic Estimation
                      </p>
                      <p className="text-[10px] text-muted">
                        Array temperature derating, inverter clipping & continuous 72h forecast
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-[#FAFBF9] flex items-center gap-3">
                    <div className="size-7 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <ShieldCheck className="size-4" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-[11px]">
                        3. Rule-Based Triage & BESS Dispatch
                      </p>
                      <p className="text-[10px] text-muted">
                        Automated ramp smoothing orders sized directly to your battery system
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Security Footer */}
            <div className="pt-6 mt-6 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono text-muted relative z-10">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                DATABASE AUTH ACTIVE
              </span>
              <span>AES-256 ENCRYPTED</span>
            </div>
          </div>

          {/* Right Column: Operator Account Creation Form */}
          <div className="lg:col-span-6 bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-card flex flex-col justify-center">
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground">
                  Create Operator Account
                </h2>
                <p className="text-xs text-foreground-secondary mt-1">
                  Enter your credentials to register. You will be guided through solar plant configuration next.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger-dark text-xs flex items-start gap-2.5">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-foreground flex items-center gap-1.5">
                    <User className="size-3.5 text-primary" />
                    <span>FULL NAME</span>
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Om Mistry"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 text-xs font-sans"
                    disabled={isLoading}
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="size-3.5 text-primary" />
                    <span>CORPORATE / FLEET EMAIL</span>
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="operator@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 text-xs font-sans"
                    disabled={isLoading}
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-foreground flex items-center gap-1.5">
                    <Lock className="size-3.5 text-primary" />
                    <span>PASSWORD</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 text-xs font-mono pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-primary" />
                    <span>CONFIRM PASSWORD</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-10 text-xs font-mono pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements Checklist */}
                <div className="p-3 bg-[#FAFBF9] border border-border-subtle rounded-lg space-y-1.5 text-[11px] font-mono">
                  <span className="font-semibold text-muted text-[10px] uppercase">
                    Security Requirements
                  </span>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-primary' : 'text-muted'}`}>
                      <Check className="size-3" />
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-primary' : 'text-muted'}`}>
                      <Check className="size-3" />
                      <span>Uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasLower ? 'text-primary' : 'text-muted'}`}>
                      <Check className="size-3" />
                      <span>Lowercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-primary' : 'text-muted'}`}>
                      <Check className="size-3" />
                      <span>Number included</span>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 bg-primary hover:bg-primary-dark text-white font-medium text-xs gap-2 shadow-subtle mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Creating Account & Initiating Session...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Operator Account</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Sign In Link */}
              <div className="pt-4 border-t border-border-subtle text-center text-xs text-foreground-secondary">
                <span>Already have an account? </span>
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
