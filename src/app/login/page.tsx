'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  Zap, 
  CloudSun, 
  TrendingUp, 
  AlertTriangle, 
  ArrowDown, 
  ShieldCheck, 
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

function LoginForm() {
  const searchParams = useSearchParams();
  const { status } = useSession();
  
  const rawCallback = searchParams.get('callbackUrl');
  const callbackUrl =
    rawCallback && rawCallback.startsWith('/') && !rawCallback.startsWith('//')
      ? rawCallback
      : '/dashboard';
  const rawError = searchParams.get('error');
  const successMessage = searchParams.get('message');

  // Form states
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  // Loading state
  const [isLoadingCredentials, setIsLoadingCredentials] = React.useState(false);

  // Field validation & errors
  const [validationError, setValidationError] = React.useState<{ email?: string; password?: string }>({});
  const [errorMessage, setErrorMessage] = React.useState<string | null>(() => {
    if (!rawError) return null;
    if (rawError === 'OAuthSignin' || rawError === 'OAuthCallback') {
      return 'Authentication was cancelled or could not be completed. Please try again.';
    }
    if (rawError === 'CredentialsSignin') {
      return 'Invalid email or password. Please verify your credentials or create an account.';
    }
    return 'Authentication failed. Please check your credentials or try again.';
  });

  // Modal dialog state
  const [showForgotDialog, setShowForgotDialog] = React.useState(false);

  // If already authenticated, redirect to dashboard or safe callback
  React.useEffect(() => {
    if (status === 'authenticated') {
      window.location.href = callbackUrl;
    }
  }, [status, callbackUrl]);

  async function handleCredentialsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoadingCredentials) return;

    const errors: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = 'Work email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address (e.g. operator@company.com).';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationError(errors);
      return;
    }

    setValidationError({});
    setErrorMessage(null);
    setIsLoadingCredentials(true);

    try {
      const result = await signIn('credentials', {
        email: trimmedEmail,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setErrorMessage('Invalid operator email or password. Please check your credentials or create an account.');
        setIsLoadingCredentials(false);
      } else {
        // Use full navigation to clear any cached auth state and ensure clean session bootstrap
        window.location.href = callbackUrl;
      }
    } catch {
      setErrorMessage('Unable to connect to the authentication service. Please check your network and try again.');
      setIsLoadingCredentials(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-primary/20 bg-primary-tint text-[11px] font-mono uppercase tracking-wider text-primary-dark font-medium">
          Control Room Access
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground font-display">
          Sign in to RenewableIQ
        </h2>
        <p className="text-xs text-foreground-secondary leading-relaxed">
          Access real-time renewable generation forecasting, physics modeling, deterministic risk evaluation, and BESS dispatch recommendations.
        </p>
      </div>

      {/* Auth States Feedback */}
      {status === 'loading' ? (
        <div className="rounded-md border border-border-subtle bg-surface p-6 flex flex-col items-center justify-center gap-3 text-center shadow-subtle">
          <Loader2 className="size-6 text-primary animate-spin" />
          <div className="text-xs font-medium text-foreground">Verifying operational credentials...</div>
          <div className="text-[11px] text-muted">Checking database session directory</div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Success Message Banner */}
          {successMessage && !errorMessage && (
            <div 
              role="status" 
              className="rounded-md border border-primary/30 bg-[#F0F6F2] p-3 flex items-start gap-2.5 text-xs text-primary-dark animate-in fade-in-0 duration-200"
            >
              <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-primary" />
              <div className="flex-1">
                <div className="font-semibold">{successMessage}</div>
                <div className="text-[11px] text-foreground-secondary mt-0.5">
                  Sign in with your registered email and password to enter the workbench.
                </div>
              </div>
            </div>
          )}

          {/* Human-Readable Error Banner */}
          {errorMessage && (
            <div 
              role="alert" 
              className="rounded-md border border-critical/30 bg-[#FDF4F4] p-3 flex items-start gap-2.5 text-xs text-critical animate-in fade-in-0 duration-200"
            >
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold">{errorMessage}</div>
                <div className="text-[11px] text-critical/80 mt-0.5">
                  Verify your credentials or create a new operator account below.
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setErrorMessage(null)}
                className="h-6 px-2 text-[11px] text-critical hover:bg-critical/10"
              >
                <RefreshCw className="size-3 mr-1" />
                Dismiss
              </Button>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleCredentialsSubmit} className="space-y-3.5" noValidate>
            {/* Email Input */}
            <div className="space-y-1">
              <label htmlFor="login-email" className="block text-xs font-semibold text-foreground">
                Work Email
              </label>
              <div className="relative">
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="operator@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationError.email) {
                      setValidationError((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  className={`h-11 min-h-[44px] text-xs font-medium pl-9 ${
                    validationError.email ? 'border-critical focus:border-critical focus-ring' : ''
                  }`}
                  disabled={isLoadingCredentials}
                />
                <Mail className="size-4 text-muted absolute left-3 top-3.5 pointer-events-none" />
              </div>
              {validationError.email && (
                <p className="text-[11px] text-critical font-medium animate-in fade-in-0 duration-150">
                  {validationError.email}
                </p>
              )}
            </div>

            {/* Password Input with Show/Hide */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="block text-xs font-semibold text-foreground">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotDialog(true)}
                  className="text-[11px] text-primary hover:text-primary-dark font-medium transition-colors focus-ring rounded-xs"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationError.password) {
                      setValidationError((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  className={`h-11 min-h-[44px] text-xs font-mono pl-9 pr-10 ${
                    validationError.password ? 'border-critical focus:border-critical focus-ring' : ''
                  }`}
                  disabled={isLoadingCredentials}
                />
                <KeyRound className="size-4 text-muted absolute left-3 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 size-7 flex items-center justify-center text-muted hover:text-foreground transition-colors rounded-sm focus-ring"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {validationError.password && (
                <p className="text-[11px] text-critical font-medium animate-in fade-in-0 duration-150">
                  {validationError.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="secondary"
              className="w-full h-11 min-h-[44px] text-xs font-semibold gap-2 justify-center border-border hover:border-primary/40 hover:bg-[#F2F6F3]"
              disabled={isLoadingCredentials}
            >
              {isLoadingCredentials ? (
                <>
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </Button>

            {/* Create Account Link */}
            <div className="flex items-center justify-center pt-2 text-xs text-foreground-secondary">
              <span>New to RenewableIQ?</span>
              <Link
                href="/signup"
                className="ml-1 text-primary hover:text-primary-dark font-semibold transition-colors focus-ring rounded-xs"
              >
                Create operator account
              </Link>
            </div>
          </form>

          {/* Security Footnote */}
          <div className="pt-4 border-t border-border-subtle space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-muted">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>Secure database authentication with bcrypt password hashing</span>
            </div>
            <p className="text-[10px] text-muted leading-normal">
              Operational parameters and forecasting outputs are bound strictly to your authenticated operator session.
            </p>
          </div>
        </div>
      )}

      {/* Back to public landing link */}
      <div className="text-center pt-2">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs text-foreground-secondary hover:text-primary transition-colors focus-ring rounded-sm"
        >
          <span>← Back to public overview</span>
        </Link>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <KeyRound className="size-4 text-primary" />
              Reset Operational Password
            </DialogTitle>
            <DialogDescription className="text-xs pt-1 leading-relaxed">
              Self-service password recovery is managed by your organization&apos;s system administrator.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3 rounded-md bg-[#F8FAF8] border border-border-subtle space-y-2">
              <div className="font-semibold text-foreground">Password Assistance</div>
              <p className="text-foreground-secondary leading-relaxed">
                If you forgot your password, please contact your organization administrator or create a new operator account.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="h-8 text-xs font-medium"
                onClick={() => setShowForgotDialog(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="h-8 text-xs font-medium"
                asChild
              >
                <Link href="/signup">
                  Register New Account
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F7F8F5] text-foreground">
      {/* Left Column: Industrial Brand & Operational Architecture */}
      <div className="lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-border bg-[#F4F6F3] relative overflow-hidden">
        {/* Subtle geometric grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#E2E8E2_1px,transparent_1px),linear-gradient(to_bottom,#E2E8E2_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Brand Logo & Expansion */}
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center gap-2.5 focus-ring rounded-md">
              <div className="flex size-9 items-center justify-center rounded-md bg-primary-dark text-white shadow-xs">
                <Zap className="size-4.5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-foreground">
                RenewableIQ
              </span>
            </Link>
            <div className="text-xs font-mono text-muted tracking-tight">
              Renewable Generation Intelligence & Grid Execution
            </div>
          </div>

          {/* Value Proposition Statement */}
          <div className="space-y-4 max-w-lg">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-white text-xs font-semibold text-foreground">
              <span className="size-2 rounded-full bg-primary" />
              <span>See the Shift. Before It Hits.</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-display leading-[1.15]">
              Real-time generation forecasting and grid compliance intelligence.
            </h1>
            <p className="text-sm sm:text-base text-foreground-secondary leading-relaxed font-normal">
              Forecast renewable generation using deterministic physics. Detect operational ramp risk. Recommend automated BESS grid dispatch actions before penalties trigger.
            </p>
          </div>

          {/* Technical Visual Flow: WEATHER -> FORECAST -> RISK -> ACTION */}
          <div className="pt-4 max-w-md">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted mb-3 font-semibold">
              Operational Pipeline Flow
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-3 p-3 rounded-md border border-border bg-white shadow-xs">
                <div className="size-8 rounded-sm bg-[#EBF3ED] flex items-center justify-center text-primary shrink-0">
                  <CloudSun className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground">1. HIGH-RES ATMOSPHERIC TELEMETRY</div>
                  <div className="text-[11px] text-muted truncate">DNI, GHI, Convective cell tracking via Open-Meteo</div>
                </div>
                <ArrowDown className="size-3.5 text-muted shrink-0" />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-md border border-border bg-white shadow-xs">
                <div className="size-8 rounded-sm bg-[#EBF3ED] flex items-center justify-center text-primary shrink-0">
                  <TrendingUp className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground">2. 72-HOUR DETERMINISTIC FORECASTING</div>
                  <div className="text-[11px] text-muted truncate">NOCT cell temperature derating & irradiance modeling</div>
                </div>
                <ArrowDown className="size-3.5 text-muted shrink-0" />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-md border border-border bg-white shadow-xs">
                <div className="size-8 rounded-sm bg-[#FDF6EA] flex items-center justify-center text-warning shrink-0">
                  <AlertTriangle className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground">3. RAMP & GRID COMPLIANCE DETECTION</div>
                  <div className="text-[11px] text-muted truncate">Configured interconnect ramp rate threshold checks</div>
                </div>
                <ArrowDown className="size-3.5 text-muted shrink-0" />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-md border border-primary/30 bg-[#F0F6F2] shadow-xs">
                <div className="size-8 rounded-sm bg-primary text-white flex items-center justify-center shrink-0">
                  <Zap className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-primary-dark">4. RULE-BASED DISPATCH PRESCRIPTION</div>
                  <div className="text-[11px] text-foreground-secondary truncate">Automated BESS ramp smoothing dispatch plans</div>
                </div>
                <ArrowRight className="size-3.5 text-primary shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Operational Footer Details */}
        <div className="relative z-10 pt-8 mt-8 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-foreground-secondary">
          <div>
            <span className="font-semibold text-foreground">RenewableIQ Generation Platform</span>
            <span className="text-muted ml-2">Clean Physics Baseline</span>
          </div>
          <div className="font-mono text-[11px] px-2 py-0.5 rounded-sm bg-white border border-border text-primary-dark font-medium">
            LIVE · OPEN-METEO
          </div>
        </div>
      </div>

      {/* Right Column: Sign-in Card */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-surface">
        <React.Suspense fallback={
          <div className="w-full max-w-md p-8 flex flex-col items-center justify-center gap-3">
            <Loader2 className="size-6 text-primary animate-spin" />
            <div className="text-xs text-muted">Loading authentication form...</div>
          </div>
        }>
          <LoginForm />
        </React.Suspense>
      </div>
    </div>
  );
}
