'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const rawError = searchParams.get('error');

  const [isLoadingGoogle, setIsLoadingGoogle] = React.useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(
    rawError ? 'Authentication failed. Please try again.' : null
  );

  // If already authenticated, redirect to dashboard or callback
  React.useEffect(() => {
    if (status === 'authenticated') {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  async function handleGoogleSignIn() {
    try {
      setIsLoadingGoogle(true);
      setErrorMessage(null);
      const result = await signIn('google', { 
        callbackUrl, 
        redirect: false 
      });
      if (result?.error) {
        setErrorMessage('Authentication failed. Please try again.');
        setIsLoadingGoogle(false);
      }
    } catch {
      setErrorMessage('Authentication failed. Please try again.');
      setIsLoadingGoogle(false);
    }
  }

  async function handleDemoSignIn() {
    try {
      setIsLoadingDemo(true);
      setErrorMessage(null);
      const result = await signIn('demo-operator', { 
        callbackUrl, 
        redirect: false 
      });
      if (result?.error) {
        setErrorMessage('Authentication failed. Please try again.');
        setIsLoadingDemo(false);
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setErrorMessage('Authentication failed. Please try again.');
      setIsLoadingDemo(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-primary/20 bg-primary-tint text-[11px] font-mono uppercase tracking-wider text-primary-dark font-medium">
          Control Room Access
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground font-display">
          Sign in to RenewableIQ
        </h2>
        <p className="text-xs text-foreground-secondary leading-relaxed">
          Access the real-time renewable generation forecasting workbench, risk ledger, and battery dispatch recommendations.
        </p>
      </div>

      {/* Auth States Feedback */}
      {status === 'loading' ? (
        <div className="rounded-md border border-border-subtle bg-surface p-6 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="size-6 text-primary animate-spin" />
          <div className="text-xs font-medium text-foreground">Verifying operational credentials...</div>
          <div className="text-[11px] text-muted">Checking SCADA identity directory</div>
        </div>
      ) : (
        <div className="space-y-4">
          {errorMessage && (
            <div 
              role="alert" 
              className="rounded-md border border-critical/30 bg-[#FDF4F4] p-3 flex items-start gap-2.5 text-xs text-critical animate-in fade-in-0 duration-200"
            >
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold">{errorMessage}</div>
                <div className="text-[11px] text-critical/80 mt-0.5">
                  Verify your Google account permissions or proceed using Demo Operator mode.
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setErrorMessage(null)}
                className="h-6 px-2 text-[11px] text-critical hover:bg-critical/10"
              >
                <RefreshCw className="size-3 mr-1" />
                Try again
              </Button>
            </div>
          )}

          {/* Primary Action: Google OAuth */}
          <Button
            type="button"
            variant="primary"
            className="w-full h-11 text-xs font-semibold gap-2.5 justify-center shadow-xs"
            onClick={handleGoogleSignIn}
            disabled={isLoadingGoogle || isLoadingDemo}
          >
            {isLoadingGoogle ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Signing you in...</span>
              </>
            ) : (
              <>
                <svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </Button>

          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-subtle" />
            </div>
            <span className="relative bg-surface px-2 text-[10px] uppercase font-mono tracking-wider text-muted">
              OR EVALUATOR DEMO ACCESS
            </span>
          </div>

          {/* Secondary Fast Access: Deterministic Demo Operator */}
          <Button
            type="button"
            variant="secondary"
            className="w-full h-11 text-xs font-semibold gap-2.5 justify-center border-border hover:border-primary/40 hover:bg-[#F2F6F3]"
            onClick={handleDemoSignIn}
            disabled={isLoadingGoogle || isLoadingDemo}
          >
            {isLoadingDemo ? (
              <>
                <Loader2 className="size-4 animate-spin text-primary" />
                <span>Entering Control Room...</span>
              </>
            ) : (
              <>
                <UserCheck className="size-4 text-primary" />
                <span>Continue as Demo Operator (Om Mistry)</span>
              </>
            )}
          </Button>

          {/* Security Footnote */}
          <div className="pt-3 border-t border-border-subtle space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-muted">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>Secure authentication via Google OAuth & Control SCADA directory</span>
            </div>
            <p className="text-[10px] text-muted leading-normal">
              By signing in, you access the deterministic Ahmedabad Solar Plant (42 MW AC) digital twin under simulation interlock protocol IEC-62351.
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
          {/* Brand Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 focus-ring rounded-md">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary-dark text-white shadow-xs">
              <Zap className="size-4.5" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-foreground">
              Renewable<span className="text-primary">IQ</span>
            </span>
          </Link>

          {/* Value Proposition Statement */}
          <div className="space-y-4 max-w-lg">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-white text-xs font-semibold text-foreground">
              <span className="size-2 rounded-full bg-primary" />
              <span>Renewable Energy Intelligence</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-display leading-[1.15]">
              Real-time generation forecasting and grid compliance intelligence.
            </h1>
            <p className="text-sm sm:text-base text-foreground-secondary leading-relaxed font-normal">
              Forecast renewable generation. Detect operational ramp risk. Recommend automated BESS grid dispatch actions before penalties trigger.
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
                  <div className="text-[11px] text-muted">DNI, GHI, Convective cell tracking & NWP</div>
                </div>
                <ArrowDown className="size-3.5 text-muted shrink-0" />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-md border border-border bg-white shadow-xs">
                <div className="size-8 rounded-sm bg-[#EBF3ED] flex items-center justify-center text-primary shrink-0">
                  <TrendingUp className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground">2. 72-HOUR ENSEMBLE FORECASTING</div>
                  <div className="text-[11px] text-muted">P10 / P50 / P90 quantile uncertainty bounds</div>
                </div>
                <ArrowDown className="size-3.5 text-muted shrink-0" />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-md border border-border bg-white shadow-xs">
                <div className="size-8 rounded-sm bg-[#FDF6EA] flex items-center justify-center text-warning shrink-0">
                  <AlertTriangle className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground">3. RAMP & GRID PENALTY DETECTION</div>
                  <div className="text-[11px] text-muted">-0.62 MW/min ramp breach vs -0.40 limit</div>
                </div>
                <ArrowDown className="size-3.5 text-muted shrink-0" />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-md border border-primary/30 bg-[#F0F6F2] shadow-xs">
                <div className="size-8 rounded-sm bg-primary text-white flex items-center justify-center shrink-0">
                  <Zap className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-primary-dark">4. AUTOMATED DISPATCH PRESCRIPTION</div>
                  <div className="text-[11px] text-foreground-secondary">19.0 MW BESS ramp smoothing (REC-4011)</div>
                </div>
                <ArrowRight className="size-3.5 text-primary shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Operational Footer Details */}
        <div className="relative z-10 pt-8 mt-8 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-foreground-secondary">
          <div>
            <span className="font-semibold text-foreground">Ahmedabad Solar Plant</span>
            <span className="text-muted ml-2">42 MW AC · 50 MW DC</span>
          </div>
          <div className="font-mono text-[11px] px-2 py-0.5 rounded-sm bg-white border border-border text-primary-dark font-medium">
            SCADA SIMULATED · 18ms
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
