'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Zap,
  Building2,
  Sun,
  Wind,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sliders,
  ChevronDown,
  ChevronUp,
  BatteryCharging,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LocationPreset {
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

const LOCATION_PRESETS: LocationPreset[] = [
  {
    name: 'Ahmedabad (Gujarat)',
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    latitude: 23.0225,
    longitude: 72.5714,
    timezone: 'Asia/Kolkata',
  },
  {
    name: 'Bhadla Solar Park (Rajasthan)',
    city: 'Bhadla',
    state: 'Rajasthan',
    country: 'India',
    latitude: 27.5360,
    longitude: 71.9170,
    timezone: 'Asia/Kolkata',
  },
  {
    name: 'Khavda Renewable Park (Kutch)',
    city: 'Khavda',
    state: 'Gujarat',
    country: 'India',
    latitude: 23.8500,
    longitude: 69.7300,
    timezone: 'Asia/Kolkata',
  },
  {
    name: 'Pavagada Solar Park (Karnataka)',
    city: 'Pavagada',
    state: 'Karnataka',
    country: 'India',
    latitude: 14.1000,
    longitude: 77.2800,
    timezone: 'Asia/Kolkata',
  },
];

export default function PlantOnboardingPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  // Form State with sensible defaults
  const [name, setName] = React.useState('Khavda Solar Park Phase 1');
  const [energyType, setEnergyType] = React.useState<'SOLAR' | 'WIND'>('SOLAR');
  
  // Location
  const [selectedPreset, setSelectedPreset] = React.useState<string>('Khavda Renewable Park (Kutch)');
  const [city, setCity] = React.useState('Khavda');
  const [state, setState] = React.useState('Gujarat');
  const [country, setCountry] = React.useState('India');
  const [latitude, setLatitude] = React.useState(23.8500);
  const [longitude, setLongitude] = React.useState(69.7300);
  const [timezone, setTimezone] = React.useState('Asia/Kolkata');

  // Capacity
  const [acCapacityMw, setAcCapacityMw] = React.useState(50.0);
  const [dcCapacityMw, setDcCapacityMw] = React.useState(60.0);

  // Advanced parameters
  const [panelTiltDeg, setPanelTiltDeg] = React.useState(22.0);
  const [panelAzimuthDeg, setPanelAzimuthDeg] = React.useState(0.0);
  const [inverterEfficiencyPct, setInverterEfficiencyPct] = React.useState(98.4);
  const [bessEnabled, setBessEnabled] = React.useState(true);
  const [bessPowerMw, setBessPowerMw] = React.useState(20.0);
  const [bessEnergyMwh, setBessEnergyMwh] = React.useState(40.0);
  const [rampLimitMwPerMin, setRampLimitMwPerMin] = React.useState(2.5);

  const handleSelectPreset = (presetName: string) => {
    setSelectedPreset(presetName);
    const found = LOCATION_PRESETS.find((p) => p.name === presetName);
    if (found) {
      setCity(found.city);
      setState(found.state);
      setCountry(found.country);
      setLatitude(found.latitude);
      setLongitude(found.longitude);
      setTimezone(found.timezone);
    }
  };

  const handleAcCapacityChange = (val: number) => {
    setAcCapacityMw(val);
    // Suggest standard 1.2x DC overbuild ratio
    setDcCapacityMw(Number((val * 1.2).toFixed(1)));
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Plant name is required.');
      return;
    }

    if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setErrorMessage('Please provide valid geographic coordinates (-90 to 90 lat, -180 to 180 long).');
      return;
    }

    if (acCapacityMw <= 0) {
      setErrorMessage('Installed AC capacity must be greater than 0 MW.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      type: energyType,
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      latitude,
      longitude,
      timezone,
      acCapacityMw,
      dcCapacityMw,
      panelTiltDeg,
      panelAzimuthDeg,
      inverterEfficiencyPct,
      bessEnabled,
      bessPowerMw: bessEnabled ? bessPowerMw : 0,
      bessEnergyMwh: bessEnabled ? bessEnergyMwh : 0,
      rampLimitMwPerMin,
    };

    try {
      const res = await fetch('/api/v1/plants/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        setErrorMessage('Your session has expired or you are not logged in. Please sign in first.');
        setIsSubmitting(false);
        setTimeout(() => {
          window.location.href = '/login?callbackUrl=/onboarding/plant';
        }, 1500);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to deploy plant configuration. Please verify inputs.');
        setIsSubmitting(false);
        return;
      }

      // Success: Full window redirect to dashboard to load newly onboarded plant
      window.location.href = '/dashboard';
    } catch {
      setErrorMessage('Network connection error while deploying plant. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-foreground flex flex-col justify-between antialiased">
      {/* Top Header */}
      <header className="border-b border-border bg-white px-6 py-3 flex items-center justify-between shadow-2xs">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="size-8 rounded bg-primary flex items-center justify-center text-white font-bold shadow-subtle">
            <Zap className="size-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm tracking-tight text-foreground">
              RenewableIQ
            </span>
            <span className="text-[10px] text-muted font-mono uppercase tracking-wider -mt-0.5">
              Plant Onboarding Workbench
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono text-muted">
          <span className="size-2 rounded-full bg-primary" />
          <span>REAL-TIME WEATHER & PHYSICS ENGINE</span>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 sm:p-8 flex flex-col justify-center">
        <div className="bg-white rounded-xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header Title */}
          <div className="space-y-1.5 border-b border-border pb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm border border-primary/20 bg-primary-tint text-[11px] font-mono uppercase tracking-wider text-primary-dark font-medium">
              <Sparkles className="size-3" />
              Simplified Setup
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
              Onboard Renewable Generation Plant
            </h1>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Configure your solar array or wind asset. RenewableIQ will immediately initialize Open-Meteo atmospheric forecasting and calculate physics-based generation estimates.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div 
              role="alert" 
              className="rounded-md border border-critical/30 bg-[#FDF4F4] p-3 flex items-start gap-2.5 text-xs text-critical animate-in fade-in-0"
            >
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleDeploy} className="space-y-5">
            {/* 1. Plant Name */}
            <div className="space-y-1.5">
              <label htmlFor="plant-name" className="block text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Building2 className="size-3.5 text-primary" />
                <span>Plant / Asset Name</span>
              </label>
              <Input
                id="plant-name"
                type="text"
                required
                placeholder="e.g. Khavda Solar Park Phase 1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 text-xs font-medium"
                disabled={isSubmitting}
              />
            </div>

            {/* 2. Energy Type Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">
                Energy Technology
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEnergyType('SOLAR')}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                    energyType === 'SOLAR'
                      ? 'border-primary bg-primary-tint/30 text-primary-dark font-semibold ring-1 ring-primary'
                      : 'border-border bg-surface text-foreground hover:bg-muted/10'
                  }`}
                >
                  <div className={`size-8 rounded flex items-center justify-center ${energyType === 'SOLAR' ? 'bg-primary text-white' : 'bg-muted/20 text-muted'}`}>
                    <Sun className="size-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Solar Photovoltaic (PV)</div>
                    <div className="text-[10px] text-muted">Irradiance & NOCT thermal derating</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setEnergyType('WIND')}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                    energyType === 'WIND'
                      ? 'border-primary bg-primary-tint/30 text-primary-dark font-semibold ring-1 ring-primary'
                      : 'border-border bg-surface text-foreground hover:bg-muted/10'
                  }`}
                >
                  <div className={`size-8 rounded flex items-center justify-center ${energyType === 'WIND' ? 'bg-primary text-white' : 'bg-muted/20 text-muted'}`}>
                    <Wind className="size-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Wind Turbine Generator</div>
                    <div className="text-[10px] text-muted">Hub height anemometry & power curve</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Location & Coordinates */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-primary" />
                  <span>Plant Geographic Location</span>
                </label>
                <span className="text-[11px] font-mono text-muted">Coordinates map to live Open-Meteo grid</span>
              </div>

              {/* Quick Preset Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LOCATION_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset.name)}
                    className={`px-2.5 py-2 rounded-md border text-left text-[11px] transition-all truncate ${
                      selectedPreset === preset.name
                        ? 'border-primary bg-primary-tint/40 font-semibold text-primary-dark'
                        : 'border-border hover:bg-muted/10 text-foreground-secondary'
                    }`}
                  >
                    <div className="truncate font-medium">{preset.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-muted font-mono">{preset.latitude.toFixed(2)}°, {preset.longitude.toFixed(2)}°</div>
                  </button>
                ))}
              </div>

              {/* Coordinates Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-muted">City</label>
                  <Input
                    type="text"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setSelectedPreset('Custom');
                    }}
                    className="h-9 text-xs"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-muted">State</label>
                  <Input
                    type="text"
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      setSelectedPreset('Custom');
                    }}
                    className="h-9 text-xs"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-muted">Latitude (°N)</label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => {
                      setLatitude(parseFloat(e.target.value) || 0);
                      setSelectedPreset('Custom');
                    }}
                    className="h-9 text-xs font-mono"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-muted">Longitude (°E)</label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => {
                      setLongitude(parseFloat(e.target.value) || 0);
                      setSelectedPreset('Custom');
                    }}
                    className="h-9 text-xs font-mono"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* 4. Installed Capacity */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Zap className="size-3.5 text-primary" />
                  <span>Installed Generation Capacity</span>
                </label>
                <span className="text-[11px] text-muted font-mono">Overbuild: {(dcCapacityMw / acCapacityMw).toFixed(2)}× DC/AC</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-foreground-secondary font-medium">AC Interconnect Capacity (MW AC)</label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={acCapacityMw}
                      onChange={(e) => handleAcCapacityChange(parseFloat(e.target.value) || 0)}
                      className="h-10 text-xs font-mono pr-12 font-bold text-foreground"
                      disabled={isSubmitting}
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-mono text-muted">MW</span>
                  </div>
                  <span className="text-[10px] text-muted">Maximum inverter output permitted by grid operator</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-foreground-secondary font-medium">DC Nameplate Capacity (MW DC)</label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={dcCapacityMw}
                      onChange={(e) => setDcCapacityMw(parseFloat(e.target.value) || 0)}
                      className="h-10 text-xs font-mono pr-12 font-bold text-foreground"
                      disabled={isSubmitting}
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-mono text-muted">MW</span>
                  </div>
                  <span className="text-[10px] text-muted">Total installed module nameplate rating</span>
                </div>
              </div>
            </div>

            {/* 5. Optional Advanced Engineering Collapsible */}
            <div className="border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between text-xs font-semibold text-foreground py-1.5 hover:text-primary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="size-3.5 text-muted" />
                  <span>Advanced Parameters (Optional)</span>
                </div>
                {showAdvanced ? (
                  <ChevronUp className="size-4 text-muted" />
                ) : (
                  <ChevronDown className="size-4 text-muted" />
                )}
              </button>

              {showAdvanced && (
                <div className="pt-3 space-y-4 animate-in fade-in-0 duration-200">
                  {energyType === 'SOLAR' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-muted">Panel Tilt (°)</label>
                        <Input
                          type="number"
                          step="0.5"
                          value={panelTiltDeg}
                          onChange={(e) => setPanelTiltDeg(parseFloat(e.target.value) || 0)}
                          className="h-9 text-xs font-mono"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-muted">Panel Azimuth (°)</label>
                        <Input
                          type="number"
                          step="1"
                          value={panelAzimuthDeg}
                          onChange={(e) => setPanelAzimuthDeg(parseFloat(e.target.value) || 0)}
                          className="h-9 text-xs font-mono"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-muted">Inverter Efficiency (%)</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={inverterEfficiencyPct}
                          onChange={(e) => setInverterEfficiencyPct(parseFloat(e.target.value) || 98.4)}
                          className="h-9 text-xs font-mono"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  )}

                  {/* Battery Configuration */}
                  <div className="p-3.5 rounded-lg border border-border-subtle bg-[#F8FAF8] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BatteryCharging className="size-4 text-primary" />
                        <span className="text-xs font-semibold text-foreground">BESS Storage Integration</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bessEnabled}
                          onChange={(e) => setBessEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-muted/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {bessEnabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-muted">Battery Power (MW)</label>
                          <Input
                            type="number"
                            step="1"
                            value={bessPowerMw}
                            onChange={(e) => setBessPowerMw(parseFloat(e.target.value) || 0)}
                            className="h-9 text-xs font-mono"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-muted">Battery Capacity (MWh)</label>
                          <Input
                            type="number"
                            step="1"
                            value={bessEnergyMwh}
                            onChange={(e) => setBessEnergyMwh(parseFloat(e.target.value) || 0)}
                            className="h-9 text-xs font-mono"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-muted">Configured Ramp Limit (MW/min)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={rampLimitMwPerMin}
                      onChange={(e) => setRampLimitMwPerMin(parseFloat(e.target.value) || 2.5)}
                      className="h-9 text-xs font-mono"
                      disabled={isSubmitting}
                    />
                    <span className="text-[10px] text-muted">Plant interconnect ramp tolerance used by the deterministic risk engine</span>
                  </div>
                </div>
              )}
            </div>

            {/* Deploy Action */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-primary hover:bg-primary-dark text-white font-semibold text-xs gap-2 shadow-subtle justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Configuring Digital Twin & Synchronizing Open-Meteo...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>Deploy Plant & Enter Command Center</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white px-6 py-3 text-center text-[11px] text-muted font-mono">
        RenewableIQ Operational Intelligence Platform · Deterministic Physics Baseline
      </footer>
    </div>
  );
}
