import React, { useState } from 'react';
import { 
  User, 
  BatteryCharging, 
  Radio, 
  Bell, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Sliders, 
  Volume2, 
  CloudSun,
  Activity,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { 
    settings, 
    updateSettings, 
    resetSettings, 
    selectedState, 
    availableStates,
    loadData
  } = useApp();

  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const stateName = availableStates.find(s => s.id === selectedState)?.name || "Gujarat";

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    updateSettings({ [key]: value });
  };

  const handleSave = () => {
    updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
    // Reload forecast with updated settings
    loadData();
  };

  const handleReset = () => {
    resetSettings();
    setFormData({ ...settings });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  // Play a soft high-tech chime using Web Audio API
  const playTestChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio Context not supported or allowed without interaction", e);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Operator Profile', icon: User },
    { id: 'grid', label: 'Grid & Capacity', icon: Sliders },
    { id: 'battery', label: 'BESS Battery Storage', icon: BatteryCharging },
    { id: 'telemetry', label: 'Weather & Telemetry', icon: Radio },
    { id: 'alerts', label: 'Alerts & Audio', icon: Bell },
  ];

  const totalCap = Number(formData.solarCapacityMw || 100) + Number(formData.windCapacityMw || 100);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Page Header with Save Feedback */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 font-sans tracking-wide uppercase">
              SYSTEM CONFIGURATION
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Active Control
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            System & Grid Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure dynamic plant capacities, alert triggers, dispatch thresholds, and telemetry options.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Settings Applied!</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Tabs + Content + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Vertical Tabs */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-xs space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/70 font-bold shadow-2xs' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick System Status Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Live Grid Config
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-500">Monitored Capacity</span>
                <span className="font-bold text-slate-800">{totalCap} MW</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-500">Deficit Alert Threshold</span>
                <span className="font-bold text-rose-600">-{formData.deficitThresholdMw} MW</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-500">BESS Storage</span>
                <span className="font-bold text-emerald-600">{formData.batteryCapacityMwh} MWh</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-500">DSM Tolerance</span>
                <span className="font-bold text-blue-600">&lt; {formData.cercToleranceBandPct}%</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-500">Auto Refresh</span>
                <span className="font-bold text-slate-700">
                  {formData.autoRefreshInterval > 0 ? `${formData.autoRefreshInterval}s` : 'Manual'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right Column: Active Tab Content */}
        <div className="lg:col-span-9 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          {/* TAB 1: OPERATOR PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Operator Profile</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your operator credentials, badge initials, and assigned dispatch desk.
                </p>
              </div>

              {/* Avatar Live Preview */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white text-lg font-extrabold flex items-center justify-center shadow-xs">
                  {(formData.operatorName || "KP")
                    .split(" ")
                    .filter(Boolean)
                    .map(n => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "OP"}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {formData.operatorName || "Krish Patel"}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {formData.operatorRole || "Chief Grid Dispatcher"}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Active Session • {formData.operatorDesk}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Operator Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.operatorName}
                    onChange={(e) => handleChange('operatorName', e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Krish Patel"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Operator Role / Title
                  </label>
                  <input
                    type="text"
                    value={formData.operatorRole}
                    onChange={(e) => handleChange('operatorRole', e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Chief Grid Dispatcher"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Assigned Desk / SLDC Facility
                  </label>
                  <input
                    type="text"
                    value={formData.operatorDesk}
                    onChange={(e) => handleChange('operatorDesk', e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Gujarat SLDC - Gotri, Vadodara"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Notification Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.operatorEmail}
                    onChange={(e) => handleChange('operatorEmail', e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. operator@sldc.gov.in"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GRID & CAPACITY MODEL */}
          {activeTab === 'grid' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Grid & Capacity Parameters</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Adjust reference plant capacities, local substation baseline offsets, and deficit triggers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Solar Capacity Slider */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Reference Solar Capacity</span>
                    </label>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {formData.solarCapacityMw} MW
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={formData.solarCapacityMw}
                    onChange={(e) => handleChange('solarCapacityMw', Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>10 MW</span>
                    <span>250 MW</span>
                    <span>500 MW</span>
                  </div>
                </div>

                {/* Wind Capacity Slider */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-blue-500" />
                      <span>Reference Wind Capacity</span>
                    </label>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      {formData.windCapacityMw} MW
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={formData.windCapacityMw}
                    onChange={(e) => handleChange('windCapacityMw', Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>10 MW</span>
                    <span>250 MW</span>
                    <span>500 MW</span>
                  </div>
                </div>

                {/* Deficit Alert Threshold */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Deficit Alert Trigger Threshold
                    </label>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      -{formData.deficitThresholdMw} MW
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={formData.deficitThresholdMw}
                    onChange={(e) => handleChange('deficitThresholdMw', Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500">
                    Triggers high deficit warning when grid balance drops below -{formData.deficitThresholdMw} MW.
                  </p>
                </div>

                {/* CERC DSM Compliance Band */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      CERC DSM Tolerance Band
                    </label>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      &lt; {formData.cercToleranceBandPct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5.0"
                    max="20.0"
                    step="0.5"
                    value={formData.cercToleranceBandPct}
                    onChange={(e) => handleChange('cercToleranceBandPct', Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500">
                    Maximum permissible deviation percentage under CERC Deviation Settlement Mechanism.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BESS BATTERY STORAGE */}
          {activeTab === 'battery' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Battery Energy Storage (BESS)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure local battery storage absorption and discharge limits used in AI recommendations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Installed BESS Capacity
                    </label>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {formData.batteryCapacityMwh} MWh
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="5"
                    value={formData.batteryCapacityMwh}
                    onChange={(e) => handleChange('batteryCapacityMwh', Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500">
                    Total storage capacity available for midday solar absorption and peak shaving.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Max Charge / Discharge Rate
                    </label>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      {formData.batteryMaxRateMw} MW
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    step="5"
                    value={formData.batteryMaxRateMw}
                    onChange={(e) => handleChange('batteryMaxRateMw', Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500">
                    Maximum instantaneous power transfer rate into/out of the battery system.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Minimum Reserve State of Charge (SoC)
                    </label>
                    <span className="text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {formData.batteryMinSocPct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="40"
                    step="5"
                    value={formData.batteryMinSocPct}
                    onChange={(e) => handleChange('batteryMinSocPct', Number(e.target.value))}
                    className="w-full accent-slate-700 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500">
                    Safety buffer kept in reserve to protect cell degradation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WEATHER & TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Weather & Telemetry Sync</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure live meteorological APIs and automatic background refresh polling.
                </p>
              </div>

              {/* Live Weather Toggle */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <CloudSun className="w-4 h-4 text-amber-500" />
                    <span>Live Open-Meteo Weather API Integration</span>
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-md">
                    Queries ECMWF and GFS numerical weather models in real-time for hyper-local solar radiation and wind velocities.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.liveWeatherEnabled}
                    onChange={(e) => handleChange('liveWeatherEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Auto Refresh Interval */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Background Auto-Telemetry Refresh Rate
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { val: 15, label: 'Every 15s' },
                    { val: 30, label: 'Every 30s' },
                    { val: 60, label: 'Every 60s' },
                    { val: 0, label: 'Manual Only' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleChange('autoRefreshInterval', opt.val)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        formData.autoRefreshInterval === opt.val
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Horizon */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Default Forecast Horizon
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: 24, label: '24 Hours (Day Ahead)' },
                    { val: 48, label: '48 Hours (2-Day)' },
                    { val: 72, label: '72 Hours (3-Day Horizon)' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleChange('defaultHorizon', opt.val)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        formData.defaultHorizon === opt.val
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ALERTS & AUDIO */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Alerts & Audio Notifications</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure dispatch alarm sounds and critical deficit notifications.
                </p>
              </div>

              {/* Audio Chime Toggle */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-blue-600" />
                    <span>Audio Chimes on High Deficit Alerts</span>
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-md">
                    Plays an audible notification sound when upcoming evening deficit exceeds threshold.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={playTestChime}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
                  >
                    Test Chime 🔔
                  </button>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.soundAlerts}
                      onChange={(e) => handleChange('soundAlerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Email Notifications */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900">
                    SLDC Email Dispatch Warnings
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-md">
                    Send automated alert digests to {formData.operatorEmail || 'operator email'}.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.emailAlerts}
                    onChange={(e) => handleChange('emailAlerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
