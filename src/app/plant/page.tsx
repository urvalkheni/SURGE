'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sun, Battery, MapPin, Save, Check, AlertCircle } from 'lucide-react';
import { usePlant } from '@/contexts/plant-context';

export default function PlantPage() {
  const { plant, configuration, refreshPlant } = usePlant();

  // Form State
  const [name, setName] = React.useState('');
  const [city, setCity] = React.useState('');
  const [state, setState] = React.useState('');
  const [latitude, setLatitude] = React.useState<number>(23.0225);
  const [longitude, setLongitude] = React.useState<number>(72.5714);

  const [acCapacityMw, setAcCapacityMw] = React.useState<number>(42.0);
  const [dcCapacityMw, setDcCapacityMw] = React.useState<number>(50.0);
  const [panelTiltDeg, setPanelTiltDeg] = React.useState<number>(25);
  const [panelAzimuthDeg, setPanelAzimuthDeg] = React.useState<number>(180);
  const [inverterEfficiencyPct, setInverterEfficiencyPct] = React.useState<number>(98.5);
  const [rampLimitMwPerMin, setRampLimitMwPerMin] = React.useState<number>(2.5);

  const [bessEnabled, setBessEnabled] = React.useState<boolean>(true);
  const [bessPowerMw, setBessPowerMw] = React.useState<number>(20.0);
  const [bessEnergyMwh, setBessEnergyMwh] = React.useState<number>(40.0);

  const [energyPricePerMwh, setEnergyPricePerMwh] = React.useState<number>(0);

  const [isSaving, setIsSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Hydrate form from plant and configuration
  React.useEffect(() => {
    if (plant) {
      setName(plant.name || '');
      setCity(plant.city || '');
      setState(plant.state || '');
      setLatitude(plant.latitude || 23.0225);
      setLongitude(plant.longitude || 72.5714);
    }
    if (configuration) {
      setAcCapacityMw(configuration.acCapacityMw || 42.0);
      setDcCapacityMw(configuration.dcCapacityMw || 50.0);
      setPanelTiltDeg(configuration.panelTiltDeg ?? 25);
      setPanelAzimuthDeg(configuration.panelAzimuthDeg ?? 180);
      setInverterEfficiencyPct(configuration.inverterEfficiencyPct ?? 98.5);
      setRampLimitMwPerMin(configuration.rampLimitMwPerMin ?? 2.5);
      setBessEnabled(configuration.bessEnabled ?? true);
      setBessPowerMw(configuration.bessPowerMw ?? 20.0);
      setBessEnergyMwh(configuration.bessEnergyMwh ?? 40.0);
      setEnergyPricePerMwh(configuration.energyPricePerMwh ?? 0);
    }
  }, [plant, configuration]);

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/plants/current', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          city,
          state,
          latitude,
          longitude,
          acCapacityMw,
          dcCapacityMw,
          panelTiltDeg,
          panelAzimuthDeg,
          inverterEfficiencyPct,
          rampLimitMwPerMin,
          bessEnabled,
          bessPowerMw,
          bessEnergyMwh,
          energyPricePerMwh,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to save configuration.');
      } else {
        setSaved(true);
        await refreshPlant();
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const locationStr = plant ? `${plant.city}, ${plant.state} (${plant.country})` : 'Gujarat, India';
  const coordsStr = `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`;
  const gridNodeStr = configuration?.gridNode || 'GETCO-220KV';

  return (
    <AppShell activePlantId={plant?.id || 'current'}>
      <PageContainer>
        <PageHeader
          title="Plant Digital Twin Configuration"
          description="Technical hardware parametrization, solar array geometry, inverter banks, and BESS storage capacity."
          breadcrumbs={[
            { label: 'System' },
            { label: 'Plant Digital Twin' },
          ]}
          actions={
            <Button
              size="sm"
              variant="primary"
              className="gap-1.5 h-9"
              onClick={handleSave}
              disabled={isSaving}
            >
              {saved ? <Check className="size-3.5" /> : <Save className="size-3.5" />}
              <span>{isSaving ? 'Saving...' : saved ? 'Configuration Saved' : 'Save Configuration'}</span>
            </Button>
          }
        />

        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-lg border border-danger/30 bg-danger-tint/20 flex items-start gap-2.5 text-xs text-danger-dark">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        <div className="space-y-6">
          {/* Plant Identity Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">Asset Site</span>
                  <MapPin className="size-4 text-primary" />
                </div>
                <CardTitle className="text-sm mt-1">{name || 'Ahmedabad Solar Plant'}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-foreground-secondary space-y-1">
                <div>Location: {locationStr}</div>
                <div>Coordinates: {coordsStr}</div>
                <div className="font-mono text-[11px] text-foreground font-semibold">Interconnect Node: {gridNodeStr}</div>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">Solar PV Array</span>
                  <Sun className="size-4 text-warning" />
                </div>
                <CardTitle className="text-sm mt-1">{dcCapacityMw.toFixed(1)} MW DC / {acCapacityMw.toFixed(1)} MW AC</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-foreground-secondary space-y-1">
                <div>Tracker: {configuration?.trackingType || 'Single-Axis Tracking (±45°)'}</div>
                <div>Azimuth: {panelAzimuthDeg}° True South · Tilt: {panelTiltDeg}°</div>
                <div>Inverter Eff: {inverterEfficiencyPct}% · Ramp Limit: {rampLimitMwPerMin} MW/min</div>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">Co-Located BESS</span>
                  <Battery className="size-4 text-primary" />
                </div>
                <CardTitle className="text-sm mt-1">
                  {bessEnabled ? `${bessEnergyMwh} MWh Capacity` : 'No BESS Deployed'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-foreground-secondary space-y-1">
                {bessEnabled ? (
                  <>
                    <div>Max Power: ±{bessPowerMw} MW</div>
                    <div>Current SOC: {configuration?.bessSocPct ?? 68}% · Efficiency: 92%</div>
                    <div className="text-primary font-semibold">State: Armed &amp; Synced</div>
                  </>
                ) : (
                  <>
                    <div>Storage: Disabled</div>
                    <div>Direct Grid Feed</div>
                    <div className="text-muted font-semibold">State: Solar PV Only</div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Subsystem Configuration Form */}
          <Card className="shadow-card">
            <CardHeader className="border-b border-border-subtle bg-[#FAFBF9] pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Hardware Parametrization Engine</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Configure physical solar array characteristics, inverter power envelopes, and BESS specifications
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-mono text-[11px] text-primary border-primary/30">
                  REAL DATABASE PERSISTENCE
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Section 1: Asset Information */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-primary" />
                  Site Identity &amp; Geography
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-foreground-secondary block mb-1">Plant Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-9 px-3 rounded-md border border-border bg-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground-secondary block mb-1">City / District</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-9 px-3 rounded-md border border-border bg-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground-secondary block mb-1">State / Province</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full h-9 px-3 rounded-md border border-border bg-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground-secondary block mb-1">Coordinates (Lat, Lon)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.0001"
                        value={latitude}
                        onChange={(e) => setLatitude(parseFloat(e.target.value))}
                        className="w-1/2 h-9 px-2 rounded-md border border-border bg-surface text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Lat"
                      />
                      <input
                        type="number"
                        step="0.0001"
                        value={longitude}
                        onChange={(e) => setLongitude(parseFloat(e.target.value))}
                        className="w-1/2 h-9 px-2 rounded-md border border-border bg-surface text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Lon"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Solar PV Array & Inverters */}
              <div className="pt-4 border-t border-border-subtle">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
                  <Sun className="size-3.5 text-warning" />
                  Solar PV Array &amp; Inverter Specifications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-foreground-secondary block mb-1">AC Interconnect Capacity (MW)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={acCapacityMw}
                      onChange={(e) => setAcCapacityMw(parseFloat(e.target.value))}
                      className="w-full h-9 px-3 rounded-md border border-border bg-surface text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground-secondary block mb-1">DC Nameplate Capacity (MWp)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={dcCapacityMw}
                      onChange={(e) => setDcCapacityMw(parseFloat(e.target.value))}
                      className="w-full h-9 px-3 rounded-md border border-border bg-surface text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground-secondary block mb-1">Panel Tilt (°)</label>
                    <input
                      type="number"
                      step="1"
                      value={panelTiltDeg}
                      onChange={(e) => setPanelTiltDeg(parseInt(e.target.value))}
                      className="w-full h-9 px-3 rounded-md border border-border bg-surface text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground-secondary block mb-1">Panel Azimuth (°)</label>
                    <input
                      type="number"
                      step="1"
                      value={panelAzimuthDeg}
                      onChange={(e) => setPanelAzimuthDeg(parseInt(e.target.value))}
                      className="w-full h-9 px-3 rounded-md border border-border bg-surface text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="text-xs font-medium text-foreground-secondary block mb-1">Inverter Efficiency (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={inverterEfficiencyPct}
                      onChange={(e) => setInverterEfficiencyPct(parseFloat(e.target.value))}
                      className="w-full h-9 px-3 rounded-md border border-border bg-surface text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground-secondary block mb-1">Grid Ramp Tolerance Limit (MW/min)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={rampLimitMwPerMin}
                      onChange={(e) => setRampLimitMwPerMin(parseFloat(e.target.value))}
                      className="w-full h-9 px-3 rounded-md border border-border bg-surface text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Battery Energy Storage System (BESS) */}
              <div className="pt-4 border-t border-border-subtle">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <Battery className="size-3.5 text-primary" />
                    Co-Located Battery Energy Storage System (BESS)
                  </h4>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={bessEnabled}
                      onChange={(e) => setBessEnabled(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary size-4"
                    />
                    <span>BESS Unit Enabled</span>
                  </label>
                </div>

                {bessEnabled ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F8FAF8] p-4 rounded-lg border border-border-subtle">
                    <div>
                      <label className="text-xs font-medium text-foreground-secondary block mb-1">Max Power Rating (MW)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={bessPowerMw}
                        onChange={(e) => setBessPowerMw(parseFloat(e.target.value))}
                        className="w-full h-9 px-3 rounded-md border border-border bg-surface text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground-secondary block mb-1">Energy Storage Capacity (MWh)</label>
                      <input
                        type="number"
                        step="1"
                        value={bessEnergyMwh}
                        onChange={(e) => setBessEnergyMwh(parseFloat(e.target.value))}
                        className="w-full h-9 px-3 rounded-md border border-border bg-surface text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg border border-dashed border-border text-xs text-muted">
                    Battery storage is disabled for this asset. Prescriptive recommendations will utilize inverter slew-rate derating and grid coordinator notifications instead of battery injection.
                  </div>
                )}
              </div>

              {/* Section 4: Tariffs & PPA */}
              <div className="pt-4 border-t border-border-subtle">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
                  <span className="font-bold text-foreground-secondary text-xs">₹</span>
                  Commercial &amp; Tariff Configuration
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-foreground-secondary block mb-1">
                      PPA Tariff (₹ / MWh)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={energyPricePerMwh}
                      onChange={(e) => setEnergyPricePerMwh(parseFloat(e.target.value))}
                      className="w-full h-9 px-3 rounded-md border border-border bg-surface text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="0 (Unconfigured)"
                    />
                    <span className="text-[11px] text-muted mt-1 block">
                      Leave 0 if financial exposure calculations should remain unconfigured.
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <Button
                  size="sm"
                  variant="primary"
                  className="gap-1.5 h-9"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {saved ? <Check className="size-3.5" /> : <Save className="size-3.5" />}
                  <span>{isSaving ? 'Saving Changes...' : saved ? 'Configuration Saved' : 'Save Configuration'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </AppShell>
  );
}
