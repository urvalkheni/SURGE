'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { 
  ShieldCheck, 
  KeyRound, 
  LogOut, 
  LayoutDashboard, 
  MapPin, 
  Zap, 
  Info 
} from 'lucide-react';

import { AppShell } from '@/components/layout/app-shell';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { demoPlant } from '@/data/demo-data';

export default function ProfilePage() {
  const { data: session } = useSession();

  const userName = session?.user?.name || 'Om Mistry';
  const userEmail = session?.user?.email || 'om.mistry@renewableiq.internal';
  const userImage = session?.user?.image;
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const isGoogleSession = Boolean(session?.user?.email && !session.user.email.endsWith('@renewableiq.internal'));
  const authProvider = isGoogleSession ? 'Google OAuth' : 'Demo Operator Session (Google SSO)';

  async function handleSignOut() {
    await signOut({ callbackUrl: '/login' });
  }

  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          title="Operator Profile"
          description="Operational credentials, access privileges, assigned plant digital twin, and session lifecycle."
          breadcrumbs={[
            { label: 'System' },
            { label: 'Operator Profile' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="secondary" className="gap-1.5 h-9">
                <Link href="/dashboard">
                  <LayoutDashboard className="size-3.5" />
                  <span>Command Center</span>
                </Link>
              </Button>
              <Button 
                size="sm" 
                variant="danger" 
                className="gap-1.5 h-9"
                onClick={handleSignOut}
              >
                <LogOut className="size-3.5" />
                <span>Sign out</span>
              </Button>
            </div>
          }
        />

        <div className="space-y-6">
          {/* Read-only Directory Notice */}
          <div className="rounded-md border border-border-subtle bg-[#F8FAF8] p-3.5 flex items-start gap-3 text-xs text-foreground-secondary">
            <Info className="size-4 text-primary shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-foreground">Single Sign-On Identity:</span> Operator profile parameters are synchronized with Google OAuth and central SCADA directory. To request role elevation or asset assignment transfers, submit an operational change request to the Grid Interconnect Coordinator.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 1/3: Operator Identity Card */}
            <Card className="h-fit">
              <CardHeader className="text-center pb-4 border-b border-border-subtle">
                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary-dark text-white font-mono text-2xl font-bold shadow-md overflow-hidden mb-3">
                  {userImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={userImage} alt={userName} className="size-full object-cover" />
                  ) : (
                    <span>{userInitials}</span>
                  )}
                </div>
                <CardTitle className="text-lg">{userName}</CardTitle>
                <CardDescription className="text-xs">{userEmail}</CardDescription>
                <div className="flex justify-center mt-2">
                  <Badge variant="nominal" className="text-[11px] font-mono uppercase tracking-wider">
                    Lead Operations Engineer
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-border-subtle">
                  <span className="text-muted">Authorization Tier</span>
                  <span className="font-mono font-semibold text-foreground">Tier-1 Dispatch Lead</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border-subtle">
                  <span className="text-muted">SCADA Station ID</span>
                  <span className="font-mono text-foreground">CR-WS-04-AHM</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border-subtle">
                  <span className="text-muted">Organization</span>
                  <span className="font-medium text-foreground">RenewableIQ Operations</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted">Session Status</span>
                  <span className="inline-flex items-center gap-1.5 text-primary font-semibold">
                    <span className="size-1.5 rounded-full bg-primary" />
                    Authenticated
                  </span>
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <Button 
                  variant="outline" 
                  className="w-full text-xs text-critical hover:bg-critical/10 hover:text-critical border-border-subtle"
                  onClick={handleSignOut}
                >
                  <LogOut className="size-3.5 mr-2" />
                  Sign out of Control Room
                </Button>
              </CardFooter>
            </Card>

            {/* Right 2/3: Authentication Details & Plant Assignment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Authentication Security Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <KeyRound className="size-4 text-primary" />
                      <CardTitle className="text-sm">Authentication & Credentials</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      OAuth 2.0 / OIDC
                    </Badge>
                  </div>
                  <CardDescription>
                    Cryptographic token verification and Single Sign-On session attributes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-md border border-border-subtle bg-[#F8FAF8] space-y-1">
                      <div className="text-[11px] text-muted">Authentication Provider</div>
                      <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                        <ShieldCheck className="size-3.5 text-primary" />
                        <span>{authProvider}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-md border border-border-subtle bg-[#F8FAF8] space-y-1">
                      <div className="text-[11px] text-muted">Active Session Token</div>
                      <div className="text-xs font-mono font-semibold text-foreground truncate">
                        JWT · HS256-Signed · Active
                      </div>
                    </div>

                    <div className="p-3 rounded-md border border-border-subtle bg-[#F8FAF8] space-y-1">
                      <div className="text-[11px] text-muted">Interlock Protocol</div>
                      <div className="text-xs font-semibold text-foreground">
                        IEC 62351 Substation Security
                      </div>
                    </div>

                    <div className="p-3 rounded-md border border-border-subtle bg-[#F8FAF8] space-y-1">
                      <div className="text-[11px] text-muted">Disallow Dual-Session</div>
                      <div className="text-xs font-semibold text-foreground">
                        Enforced (1 Operator per Terminal)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Plant Digital Twin Assignment */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="size-4 text-primary" />
                      <CardTitle className="text-sm">Primary Operational Asset Assignment</CardTitle>
                    </div>
                    <Badge variant="nominal" className="text-[10px] font-mono">
                      SYNCHRONIZED
                    </Badge>
                  </div>
                  <CardDescription>
                    Designated generation facility for real-time forecasting and recommendation execution
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-md border border-border-subtle bg-[#F8FAF8] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-primary" />
                        <span className="text-sm font-bold text-foreground font-display">
                          {demoPlant.name}
                        </span>
                      </div>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-sm bg-white border border-border-subtle font-semibold text-primary-dark">
                        {demoPlant.gridNodeId}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                      <div>
                        <div className="text-[11px] text-muted">AC Capacity</div>
                        <div className="font-mono font-bold text-foreground">{demoPlant.acCapacityMw} MW AC</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted">DC Capacity</div>
                        <div className="font-mono font-bold text-foreground">{demoPlant.dcCapacityMw} MW DC</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted">Interconnection</div>
                        <div className="font-mono font-semibold text-foreground">GETCO 220kV</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted">Telemetry Mode</div>
                        <div className="font-mono font-semibold text-primary-dark">SIMULATED · 18ms</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-foreground-secondary pt-2 border-t border-border-subtle">
                      <MapPin className="size-3.5 text-primary shrink-0" />
                      <span>{demoPlant.locationName}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}
