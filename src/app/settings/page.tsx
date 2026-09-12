'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { 
  User, 
  ShieldCheck, 
  Sun, 
  Bell, 
  Database, 
  LogOut, 
  Check, 
  Save, 
  ExternalLink,
  Wifi,
  Server,
  AlertTriangle,
  Info
} from 'lucide-react';

import { AppShell } from '@/components/layout/app-shell';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePlant } from '@/contexts/plant-context';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { plant, configuration, weather } = usePlant();

  const userName = session?.user?.name || 'Operator';
  const userEmail = session?.user?.email || '';
  const userImage = session?.user?.image;
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const authProvider = 'EMAIL / PASSWORD (CREDENTIALS)';

  // Operational notification preferences
  const [preferences, setPreferences] = React.useState({
    riskAlerts: true,
    recommendationAlerts: true,
    forecastUpdates: true,
    soundAlerts: false,
  });

  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('surge_settings_notifications') || localStorage.getItem('renewableiq_settings_notifications');
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch {
      // LocalStorage fallback
    }
  }, []);

  function togglePreference(key: keyof typeof preferences) {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('surge_settings_notifications', JSON.stringify(updated));
      } catch {
        // LocalStorage fallback
      }
      return updated;
    });
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2500);
  }

  function handleSavePreferences() {
    setSaveStatus('saving');
    setTimeout(() => {
      try {
        localStorage.setItem('surge_settings_notifications', JSON.stringify(preferences));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } catch {
        setSaveStatus('failed');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }, 350);
  }

  async function handleSignOut() {
    await signOut({ redirectTo: '/login' });
  }

  const configuredApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || null;

  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          title="Platform Settings"
          description="Operational control room parameters, asset assignments, local notification filters, and ML API boundary status."
          breadcrumbs={[
            { label: 'System' },
            { label: 'Settings' },
          ]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono text-muted bg-[#F8FAF8] px-2 py-1 rounded border border-border-subtle hidden sm:inline-block">
                LOCAL DEMO PREFERENCE
              </span>
              {saveStatus === 'saved' && (
                <span className="text-xs text-primary font-semibold flex items-center gap-1 animate-in fade-in-0">
                  <Check className="size-3.5" />
                  <span>Preferences saved</span>
                </span>
              )}
              {saveStatus === 'failed' && (
                <span className="text-xs text-critical font-semibold flex items-center gap-1 animate-in fade-in-0">
                  <AlertTriangle className="size-3.5" />
                  <span>Failed to save</span>
                </span>
              )}
              <Button
                size="sm"
                variant="primary"
                className="gap-1.5 h-9 min-h-[36px]"
                onClick={handleSavePreferences}
                disabled={saveStatus === 'saving'}
              >
                <Save className="size-3.5" />
                <span>
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save Preferences'}
                </span>
              </Button>
            </div>
          }
        />

        <div className="space-y-6">
          {/* Section 1: ACCOUNT */}
          <Card>
            <CardHeader className="pb-3 border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">ACCOUNT</CardTitle>
                </div>
                <Badge variant="nominal" className="text-[10px] font-mono">
                  ACTIVE OPERATOR
                </Badge>
              </div>
              <CardDescription>
                Authenticated operator credentials and Single Sign-On session control
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-md border border-border-subtle bg-[#F8FAF8]">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary-dark text-white font-mono text-xs font-bold shrink-0 overflow-hidden">
                    {userImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={userImage} alt={userName} className="size-full object-cover" />
                    ) : (
                      <span>{userInitials}</span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-foreground">{userName}</div>
                    <div className="text-[11px] text-foreground-secondary">{userEmail}</div>
                    <div className="text-[10px] text-muted flex items-center gap-1.5 pt-0.5">
                      <ShieldCheck className="size-3 text-primary" />
                      <span>Provider: <strong className="text-foreground">{authProvider}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                    <Link href="/profile">
                      <span>View Profile</span>
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    className="h-8 text-xs gap-1.5"
                    onClick={handleSignOut}
                  >
                    <LogOut className="size-3.5" />
                    <span>Sign out</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: PLANT */}
          <Card>
            <CardHeader className="pb-3 border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="size-4 text-warning" />
                  <CardTitle className="text-sm font-semibold">PLANT</CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  CANONICAL DIGITAL TWIN
                </Badge>
              </div>
              <CardDescription>
                Primary generation asset specifications and grid interconnection bus configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-md border border-border-subtle bg-[#F8FAF8]">
                  <div className="text-[11px] text-muted">Selected Plant</div>
                  <div className="text-xs font-bold text-foreground mt-0.5">{plant?.name || 'Renewable Solar Asset'}</div>
                  <div className="text-[10px] font-mono text-muted">Asset ID: {plant?.id || 'PLANT-DEFAULT'}</div>
                </div>

                <div className="p-3 rounded-md border border-border-subtle bg-[#F8FAF8]">
                  <div className="text-[11px] text-muted">Capacity (AC)</div>
                  <div className="text-xs font-mono font-bold text-foreground mt-0.5">{(configuration?.acCapacityMw ?? 42.0).toFixed(1)} MW AC</div>
                  <div className="text-[10px] text-muted">Interconnection Limit</div>
                </div>

                <div className="p-3 rounded-md border border-border-subtle bg-[#F8FAF8]">
                  <div className="text-[11px] text-muted">DC Nameplate Capacity</div>
                  <div className="text-xs font-mono font-bold text-foreground mt-0.5">{(configuration?.dcCapacityMw ?? 50.0).toFixed(1)} MW DC</div>
                  <div className="text-[10px] text-muted">DC/AC Overbuild: {((configuration?.dcCapacityMw || 50) / (configuration?.acCapacityMw || 42)).toFixed(2)}×</div>
                </div>

                <div className="p-3 rounded-md border border-border-subtle bg-[#F8FAF8]">
                  <div className="text-[11px] text-muted">Grid Substation</div>
                  <div className="text-xs font-mono font-bold text-foreground mt-0.5">{configuration?.gridOperator || 'GETCO'} {configuration?.gridVoltageKv || 220}kV</div>
                  <div className="text-[10px] text-muted font-mono">{configuration?.gridNode || 'GRID-INTERCONNECT-01'}</div>
                </div>
              </div>

              <div className="p-3 rounded-md border border-border-subtle bg-[#FAFCFA] flex flex-wrap items-center justify-between gap-2 text-xs text-foreground-secondary">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-primary" />
                  <span>Substation Location: <strong>{plant ? `${plant.city}, ${plant.state} (${plant.latitude.toFixed(4)}°N, ${plant.longitude.toFixed(4)}°E)` : 'Location Configured'}</strong></span>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary-dark">
                  <Link href="/plant">
                    <span>Manage Digital Twin Config</span>
                    <ExternalLink className="size-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: NOTIFICATIONS */}
          <Card>
            <CardHeader className="pb-3 border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="size-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">NOTIFICATIONS</CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono text-muted bg-[#F8FAF8]">
                  LOCAL DEMO PREFERENCE
                </Badge>
              </div>
              <CardDescription>
                Configure real-time control room alerts for ramp events, dispatch advisories, and model updates
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="rounded-md border border-border-subtle bg-[#F8FAF8] p-3 text-[11px] text-foreground-secondary flex items-start gap-2">
                <Info className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">LOCAL DEMO PREFERENCE:</strong> Notification toggles configure your immediate browser session preferences. No cloud telemetry database is required during this evaluation phase.
                </span>
              </div>

              <div className="divide-y divide-border-subtle rounded-md border border-border-subtle">
                {/* Risk Alerts */}
                <div className="flex items-center justify-between p-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-foreground">Risk Alerts</div>
                    <div className="text-[11px] text-foreground-secondary">
                      Notify immediately when ramp rates exceed CERC threshold (-0.40 MW/min) or irradiance drops &gt;50%.
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={preferences.riskAlerts ? 'primary' : 'outline'}
                    className="h-8 px-3 text-xs"
                    onClick={() => togglePreference('riskAlerts')}
                  >
                    {preferences.riskAlerts ? 'ENABLED' : 'DISABLED'}
                  </Button>
                </div>

                {/* Recommendation Alerts */}
                <div className="flex items-center justify-between p-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-foreground">Recommendation Alerts</div>
                    <div className="text-[11px] text-foreground-secondary">
                      Prompt operator when prescriptive BESS ramp-smoothing dispatches (e.g. REC-4011) are formulated.
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={preferences.recommendationAlerts ? 'primary' : 'outline'}
                    className="h-8 px-3 text-xs"
                    onClick={() => togglePreference('recommendationAlerts')}
                  >
                    {preferences.recommendationAlerts ? 'ENABLED' : 'DISABLED'}
                  </Button>
                </div>

                {/* Forecast Updates */}
                <div className="flex items-center justify-between p-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-foreground">Forecast Updates</div>
                    <div className="text-[11px] text-foreground-secondary">
                      Show toast indicators on 15-minute NWP weather assimilation cycles and quantile re-calibrations.
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={preferences.forecastUpdates ? 'primary' : 'outline'}
                    className="h-8 px-3 text-xs"
                    onClick={() => togglePreference('forecastUpdates')}
                  >
                    {preferences.forecastUpdates ? 'ENABLED' : 'DISABLED'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: DATA & PRIVACY / DEMO TRANSPARENCY */}
          <Card>
            <CardHeader className="pb-3 border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="size-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">DATA & PRIVACY</CardTitle>
                </div>
                <Badge variant="nominal" className="text-[10px] font-mono">
                  TRANSPARENCY AUDIT
                </Badge>
              </div>
              <CardDescription>
                System telemetry origin, SCADA simulation layer status, and external ML API boundary diagnostics
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-md border border-border-subtle bg-[#F8FAF8] space-y-1.5">
                  <div className="text-[11px] text-muted">Weather Telemetry</div>
                  <div className="text-sm font-bold text-primary flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-primary" />
                    <span>OPEN-METEO LIVE</span>
                  </div>
                  <div className="text-[11px] text-foreground-secondary">
                    {plant ? `${plant.latitude.toFixed(4)}°N, ${plant.longitude.toFixed(4)}°E` : '23.0225°N, 72.5714°E'} · {weather?.current?.temperatureC ?? 32.4}°C · GTI {weather?.current?.gtiWm2 ?? 820} W/m²
                  </div>
                </div>

                <div className="p-3.5 rounded-md border border-border-subtle bg-[#F8FAF8] space-y-1.5">
                  <div className="text-[11px] text-muted">Generation Forecast</div>
                  <div className="text-sm font-bold text-primary-dark flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-primary-dark" />
                    <span>PHYSICS BASELINE</span>
                  </div>
                  <div className="text-[11px] text-foreground-secondary">
                    Deterministic PV model derated for temp and clipped at AC inverter capacity
                  </div>
                </div>

                <div className="p-3.5 rounded-md border border-border-subtle bg-[#F8FAF8] space-y-1.5">
                  <div className="text-[11px] text-muted">SCADA Telemetry Bus</div>
                  <div className="text-sm font-bold text-muted-foreground flex items-center gap-1.5">
                    <Wifi className="size-3.5 text-muted" />
                    <span>NOT CONNECTED</span>
                  </div>
                  <div className="text-[11px] text-foreground-secondary font-mono">
                    Inverter/RTU telemetry stream awaiting physical link
                  </div>
                </div>

                <div className="p-3.5 rounded-md border border-border-subtle bg-[#F8FAF8] space-y-1.5">
                  <div className="text-[11px] text-muted">External ML API</div>
                  <div className="text-sm font-bold text-amber-700 flex items-center gap-1.5">
                    <Server className="size-3.5 text-amber-600" />
                    <span>{configuredApiUrl ? 'CONFIGURED' : 'NOT CONNECTED'}</span>
                  </div>
                  <div className="text-[11px] text-foreground-secondary">
                    {configuredApiUrl 
                      ? `Target: ${configuredApiUrl}` 
                      : 'Waiting for team ML/FastAPI service deployment'}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-md border border-border-subtle bg-[#FAF8F5] text-xs text-foreground-secondary space-y-1">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5 text-warning" />
                  <span>External ML / FastAPI Backend Boundary Note</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  RenewableIQ is architected with a decoupled API service layer (`src/services/api/`). When the ML team deploys the external FastAPI service with endpoint `POST /api/v1/forecast`, specify `NEXT_PUBLIC_API_BASE_URL` in `.env.local` to immediately switch telemetry from demo data to live model inference without altering any UI components.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </AppShell>
  );
}
