import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  BatteryCharging, 
  Activity, 
  Sun, 
  Wind, 
  ArrowRight, 
  BarChart3, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Server, 
  ChevronRight,
  RotateCcw,
  Sparkles,
  Sliders,
  Globe,
  Radio,
  FileText,
  Leaf
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, loginAsDemo } = useAuth();

  // Interactive Simulator State
  const [activeScenario, setActiveScenario] = useState('cloud_shock'); // 'normal' | 'cloud_shock' | 'heatwave' | 'wind_lull'

  // Generate dynamic simulation hourly data based on activeScenario
  const simulationData = useMemo(() => {
    const hours = [
      "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "00:00"
    ];

    return hours.map((time, idx) => {
      // Base generation profile
      const solarBase = [10, 45, 110, 155, 140, 75, 15, 0, 0, 0][idx];
      const windBase = [30, 25, 20, 20, 25, 35, 55, 65, 50, 40][idx];
      const demandBase = [90, 120, 140, 150, 145, 140, 160, 175, 150, 110][idx];

      let solar = solarBase;
      let wind = windBase;
      let demand = demandBase;
      let bess = 0;

      if (activeScenario === 'cloud_shock') {
        // Solar drops 40% between 10:00 and 16:00
        if (idx >= 2 && idx <= 5) {
          solar = Math.round(solarBase * 0.6);
          bess = 35; // BESS discharges to compensate
        }
      } else if (activeScenario === 'heatwave') {
        // Demand spikes 30 MW during peak hours
        if (idx >= 6 && idx <= 8) {
          demand = demandBase + 30;
          bess = 45; // Battery discharges to peak-shave
        }
      } else if (activeScenario === 'wind_lull') {
        // Wind drops 50% in evening
        if (idx >= 6) {
          wind = Math.round(windBase * 0.5);
          bess = 30;
        }
      }

      const totalGen = solar + wind;
      const netBalance = totalGen + bess - demand;

      return {
        time,
        solar,
        wind,
        totalGen,
        demand,
        bess,
        netBalance
      };
    });
  }, [activeScenario]);

  const handleLaunchDemo = () => {
    loginAsDemo('Chief Grid Dispatcher');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white font-sans antialiased">
      
      {/* ------------------------------------------------------------------ */}
      {/* 1. TOP NAVIGATION (Clean White Sticky Navbar)                       */}
      {/* ------------------------------------------------------------------ */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b border-slate-200/80 shadow-2xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img src="/surge-icon.png" alt="SURGE" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">
                  SURGE
                </span>
                <span className="px-2 py-0.5 text-[10px] font-sans font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                  v3.2 Grid
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans leading-none">Forecast the Grid. Before the Gap.</p>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#simulator" className="hover:text-blue-600 transition-colors">Live Simulator</a>
            <a href="#capabilities" className="hover:text-blue-600 transition-colors">Capabilities</a>
            <a href="#architecture" className="hover:text-blue-600 transition-colors">Intelligence Flow</a>
            <a href="#benchmarks" className="hover:text-blue-600 transition-colors">CERC Benchmarks</a>
            <a href="#database" className="hover:text-blue-600 transition-colors">Supabase DB</a>
          </div>

          {/* Right Action CTA Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <span>Control Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <span>Operator Access</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/* 2. HERO SECTION                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/60">
        
        {/* Soft Ambient Light Gradient Blobs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-emerald-100/50 via-teal-50/60 to-blue-100/50 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          
          {/* Real-Time Operational Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs text-xs text-slate-700">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-emerald-700 font-bold">18.4 GW Fleet Online</span>
            <span className="text-slate-300">•</span>
            <span className="font-medium text-slate-600">National Load Despatch Interconnection Active</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Predict. Dispatch.{' '}
              <span className="text-emerald-600">
                Balance.
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Industrial-grade 72-hour solar and wind quantile forecasting, sub-hourly ramp detection, and automated BESS dispatch for SLDCs and renewable energy clusters across India.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Enter Operational Control Room</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={handleLaunchDemo}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 font-semibold text-sm shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Instant Demo (Krish Patel - Gujarat SLDC)</span>
            </button>

            <Link
              to="/signup"
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 py-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-sm transition-all"
            >
              <span>Register Operator</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Metric Telemetry Row (Matching Dashboard Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-6" id="benchmarks">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Day-Ahead Accuracy</span>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 font-mono">97.4%</div>
              <p className="text-[11px] text-emerald-600 font-semibold">Dual-tier XGBoost & Quantiles</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CERC DSM Band</span>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 font-mono">&lt; 10%</div>
              <p className="text-[11px] text-blue-600 font-semibold">Zero penalty threshold</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inference Latency</span>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 font-mono">&lt; 850ms</div>
              <p className="text-[11px] text-amber-600 font-semibold">Sub-hourly dispatch sync</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Penalties Prevented</span>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 font-mono">₹4.2 Cr</div>
              <p className="text-[11px] text-emerald-600 font-semibold">Across Gujarat & Rajasthan REMCs</p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. INTERACTIVE SIMULATOR (Live Grid Stress-Test)                   */}
      {/* ------------------------------------------------------------------ */}
      <section id="simulator" className="py-16 bg-slate-100/70 border-b border-slate-200/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md uppercase tracking-wider mb-2">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Interactive Dispatch Simulator</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Experience Real-Time Grid Stress Mitigation
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                Test how SURGE detects sudden atmospheric fluctuations and automatically calculates BESS battery dispatches to safeguard grid frequency.
              </p>
            </div>

            {/* Scenario Switcher Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveScenario('normal')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  activeScenario === 'normal'
                    ? 'bg-white border-slate-300 text-slate-900 shadow-xs font-bold'
                    : 'bg-slate-200/60 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                Baseline Operations
              </button>
              <button
                onClick={() => setActiveScenario('cloud_shock')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeScenario === 'cloud_shock'
                    ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs font-bold'
                    : 'bg-slate-200/60 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Cloud Drift (-40% Solar)</span>
              </button>
              <button
                onClick={() => setActiveScenario('heatwave')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeScenario === 'heatwave'
                    ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-xs font-bold'
                    : 'bg-slate-200/60 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-rose-500" />
                <span>Heatwave Surge (+30 MW)</span>
              </button>
              <button
                onClick={() => setActiveScenario('wind_lull')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeScenario === 'wind_lull'
                    ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-xs font-bold'
                    : 'bg-slate-200/60 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <Wind className="w-3.5 h-3.5 text-blue-500" />
                <span>Evening Wind Lull (-50%)</span>
              </button>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 font-sans">Gujarat SLDC • Kutch-Saurashtra Renewable Corridor</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                  <span>Solar (MW)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500" />
                  <span>Wind (MW)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                  <span className="font-semibold text-emerald-700">BESS Mitigation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                  <span>Grid Demand (MW)</span>
                </div>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="solarGradLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="windGradLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="bessGradLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#cbd5e1" />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#cbd5e1" unit=" MW" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="2 2" />
                  <Area type="monotone" dataKey="solar" stroke="#f59e0b" fill="url(#solarGradLight)" strokeWidth={2} name="Solar MW" />
                  <Area type="monotone" dataKey="wind" stroke="#3b82f6" fill="url(#windGradLight)" strokeWidth={2} name="Wind MW" />
                  <Area type="monotone" dataKey="bess" stroke="#10b981" fill="url(#bessGradLight)" strokeWidth={2.5} name="BESS Dispatch MW" />
                  <Area type="monotone" dataKey="demand" stroke="#ef4444" fill="transparent" strokeWidth={2} strokeDasharray="4 4" name="Grid Demand MW" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Status Feedback bar */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Autonomous Mitigation Active:</strong>{' '}
                  {activeScenario === 'normal' && 'Optimal generation dispatch. Reserve batteries kept in float charge.'}
                  {activeScenario === 'cloud_shock' && 'Solar deficit neutralized: 35 MW BESS discharge initiated to maintain 50.02 Hz frequency.'}
                  {activeScenario === 'heatwave' && 'Peak shaved: 45 MW discharged from Charanka BESS bank. ₹1,20,000 in DSM penalty avoided.'}
                  {activeScenario === 'wind_lull' && 'Wind deficit offset: Standby peaker and 30 MW storage ramped within 12 seconds.'}
                </span>
              </div>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 whitespace-nowrap"
              >
                <span>View Full Control Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. CORE CAPABILITIES (Grid Features)                                */}
      {/* ------------------------------------------------------------------ */}
      <section id="capabilities" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Industrial Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Engineered for High-Penetration Renewable Grids
          </h2>
          <p className="text-sm text-slate-500">
            From single 100 MW solar arrays to 18,000 MW state transmission networks, SURGE bridges meteorological prediction and real-time physical dispatch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-blue-400/80 shadow-xs hover:shadow-md transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Multi-Tier Quantile Forecasting</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dual-stage hybrid modeling combining PVLib solar geometries and XGBoost quantile regressors (P10, P50, P90) to capture extreme atmospheric tails.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>72h Lookahead Horizon</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-blue-400/80 shadow-xs hover:shadow-md transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">CERC DSM Penalty Shield</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Continuous compliance monitoring ensuring scheduled vs actual generation stays within Indian regulatory deviation limits (&lt;10%) to prevent CERC surcharges.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-blue-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Automated Schedule Revision</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-amber-400/80 shadow-xs hover:shadow-md transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <BatteryCharging className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Autonomous BESS Optimization</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time battery energy storage dispatch algorithms that calculate optimal state-of-charge (SoC), ramp smoothing, and peak arbitrage margins.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-amber-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Instant Dispatch Approval Modal</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-teal-400/80 shadow-xs hover:shadow-md transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
              <Sun className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Hyper-Local Weather Layers</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Open-Meteo satellite ingestion computing Direct Normal Irradiance (DNI), Diffuse Horizontal (DHI), and wind shear coefficients at 100m hub heights.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-teal-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sub-hourly Atmospheric Sync</span>
            </div>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-400/80 shadow-xs hover:shadow-md transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Pan-India Spatial Hierarchy</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Seamless drill-down from State SLDC (Gujarat, Rajasthan, Chhattisgarh) to District Hub (Patan, Kutch, Jodhpur) down to individual solar & wind parks.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-indigo-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Multi-Region Fleet Registry</span>
            </div>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-rose-400/80 shadow-xs hover:shadow-md transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Predictive Ramp Warning Ledger</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Early detection of rapid generation drop-offs (&gt;20 MW / 15-min) with automated priority dispatch tickets and audit trails.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-rose-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Real-Time Operator Alerting</span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 5. INTELLIGENCE PIPELINE ARCHITECTURE                              */}
      {/* ------------------------------------------------------------------ */}
      <section id="architecture" className="py-20 bg-slate-100/70 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Pipeline Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              End-to-End Operational Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              How live telemetry transforms into automated dispatch approvals in sub-second cycles.
            </p>
          </div>

          {/* Step Flow Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center font-mono text-xs font-bold text-emerald-700">
                01
              </div>
              <h4 className="text-sm font-bold text-slate-900">Telemetry Ingestion</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Connects to plant SCADA meters, inverter buses, and Open-Meteo satellite arrays every 15 minutes.
              </p>
              <div className="text-[10px] font-mono text-slate-400">API • Modbus • MQTT</div>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center font-mono text-xs font-bold text-blue-700">
                02
              </div>
              <h4 className="text-sm font-bold text-slate-900">Physics Engineering</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Calculates solar zenith angles, panel tilt geometry, air mass index, and atmospheric clear-sky baseline.
              </p>
              <div className="text-[10px] font-mono text-slate-400">PVLib • Solar Angles • Shear</div>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center font-mono text-xs font-bold text-amber-700">
                03
              </div>
              <h4 className="text-sm font-bold text-slate-900">Quantile AI Inference</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                XGBoost and gradient boosted models compute continuous probabilistic bounds across 72 hours.
              </p>
              <div className="text-[10px] font-mono text-slate-400">XGBoost • P10/P50/P90</div>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center font-mono text-xs font-bold text-emerald-700">
                04
              </div>
              <h4 className="text-sm font-bold text-slate-900">Prescriptive Dispatch</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Recommends exact BESS charge/discharge megawatts and logs approvals to Supabase database.
              </p>
              <div className="text-[10px] font-mono text-slate-400">BESS • Peaker • Audit Trail</div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 6. DATABASE & SUPABASE SECTION                                     */}
      {/* ------------------------------------------------------------------ */}
      <section id="database" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 lg:p-12 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Clean & Simple Supabase PostgreSQL</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Zero Unnecessary Data.<br />
              <span className="text-emerald-600">Pure Operational Integrity.</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Your Supabase instance at <code className="text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">db.glydzrwquhaomhonzrnu.supabase.co</code> is configured with a streamlined 3-table architecture:
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center font-mono text-[10px] font-bold text-emerald-700 shrink-0">1</span>
                <div>
                  <strong className="text-slate-900">public.profiles</strong>: Operator credentials, SLDC station assignment, and role-based access.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center font-mono text-[10px] font-bold text-blue-700 shrink-0">2</span>
                <div>
                  <strong className="text-slate-900">public.dispatch_actions</strong>: Audit log of BESS mitigation actions, financial savings, and CO₂ metrics.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center font-mono text-[10px] font-bold text-amber-700 shrink-0">3</span>
                <div>
                  <strong className="text-slate-900">public.operator_preferences</strong>: Stores selected region, substation feeder, and operator view states.
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <span>Create Operator Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/login"
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs transition-all shadow-2xs"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Right Code / Schema View */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 font-mono text-[11px] text-slate-300 overflow-x-auto shadow-inner space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-[10px]">
              <span>supabase/simple_schema.sql</span>
              <span className="text-emerald-400 font-bold">1-Click Ready</span>
            </div>
            <p className="text-emerald-400">-- Profiles Table (Synced with auth.users)</p>
            <p className="text-slate-400">CREATE TABLE public.profiles (</p>
            <p className="pl-4">id UUID PRIMARY KEY DEFAULT gen_random_uuid(),</p>
            <p className="pl-4">email TEXT UNIQUE NOT NULL,</p>
            <p className="pl-4">full_name TEXT,</p>
            <p className="pl-4">role TEXT DEFAULT 'Grid Operator',</p>
            <p className="pl-4">station TEXT DEFAULT 'Gujarat SLDC'</p>
            <p className="text-slate-400">);</p>
            <p className="text-blue-400 pt-2">-- Real-Time Dispatch Audit Log</p>
            <p className="text-slate-400">CREATE TABLE public.dispatch_actions (</p>
            <p className="pl-4">id UUID PRIMARY KEY DEFAULT gen_random_uuid(),</p>
            <p className="pl-4">action_type TEXT NOT NULL,</p>
            <p className="pl-4">magnitude_mw NUMERIC NOT NULL,</p>
            <p className="pl-4">financial_savings_inr NUMERIC DEFAULT 0,</p>
            <p className="pl-4">created_at TIMESTAMPTZ DEFAULT now()</p>
            <p className="text-slate-400">);</p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 7. FINAL CALL TO ACTION BANNER                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 bg-white border-t border-slate-200/80 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Ready to Safeguard Your Grid from Intermittency?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Experience real-time clean energy forecasting, ramp risk warnings, and automated BESS dispatch in action.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs hover:shadow-md transition-all hover:scale-102 cursor-pointer"
            >
              <span>Launch Operational Control Room</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm transition-all shadow-2xs"
            >
              <span>Create New Operator Account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 8. INSTITUTIONAL FOOTER (Clean White Footer)                       */}
      {/* ------------------------------------------------------------------ */}
      <footer className="bg-white border-t border-slate-200 py-12 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                <img src="/surge-icon.png" alt="SURGE" className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-slate-900 font-sans text-base">SURGE</span>
              <span className="text-slate-300">|</span>
              <span className="text-[11px] text-slate-500">Forecast the Grid. Before the Gap.</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All 6 Regional Grid Hubs Nominal</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-[11px]">
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider">Control Room</h5>
              <div className="space-y-1.5">
                <div><Link to="/dashboard" className="hover:text-blue-600">Command Center</Link></div>
                <div><Link to="/forecast" className="hover:text-blue-600">72h Forecast Engine</Link></div>
                <div><Link to="/alerts" className="hover:text-blue-600">Risk & Ramp Alerts</Link></div>
                <div><Link to="/recommendations" className="hover:text-blue-600">BESS Storage Dispatch</Link></div>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider">Telemetry</h5>
              <div className="space-y-1.5">
                <div><Link to="/plants" className="hover:text-blue-600">Plant Digital Twin</Link></div>
                <div><Link to="/weather" className="hover:text-blue-600">Atmospheric GHI & Wind</Link></div>
                <div><Link to="/accuracy" className="hover:text-blue-600">Model Verification (MAPE)</Link></div>
                <div><Link to="/settings" className="hover:text-blue-600">SCADA Thresholds</Link></div>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider">Authentication</h5>
              <div className="space-y-1.5">
                <div><Link to="/login" className="hover:text-blue-600">Operator Sign In</Link></div>
                <div><Link to="/signup" className="hover:text-blue-600">Create Operator Account</Link></div>
                <div><span onClick={handleLaunchDemo} className="hover:text-amber-600 cursor-pointer">Quick Demo Access</span></div>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider">Compliance</h5>
              <div className="space-y-1.5 text-slate-500">
                <div>CERC DSM Regulations 2022</div>
                <div>Indian Electricity Grid Code (IEGC)</div>
                <div>CEA Cyber Security Guidelines</div>
                <div>REMC Operational Protocols</div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <span>© 2026 SURGE Grid Intelligence Systems. All rights reserved.</span>
            <span>Supabase Database: <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded font-mono">db.glydzrwquhaomhonzrnu.supabase.co</code></span>
          </div>
        </div>
      </footer>

    </div>
  );
}
