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
  Sparkles,
  Sliders,
  Globe,
  Radio,
  FileText,
  Leaf,
  Building2,
  Clock,
  Play,
  Menu,
  X
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

  // Mobile navigation menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive Simulator State
  const [activeScenario, setActiveScenario] = useState('cloud_shock'); // 'normal' | 'cloud_shock' | 'heatwave' | 'wind_lull'

  // Generate dynamic simulation hourly data based on activeScenario
  const simulationData = useMemo(() => {
    const hours = [
      "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "00:00"
    ];

    return hours.map((time, idx) => {
      const solarBase = [10, 45, 110, 155, 140, 75, 15, 0, 0, 0][idx];
      const windBase = [30, 25, 20, 20, 25, 35, 55, 65, 50, 40][idx];
      const demandBase = [90, 120, 140, 150, 145, 140, 160, 175, 150, 110][idx];

      let solar = solarBase;
      let wind = windBase;
      let demand = demandBase;
      let bess = 0;

      if (activeScenario === 'cloud_shock') {
        if (idx >= 2 && idx <= 5) {
          solar = Math.round(solarBase * 0.6);
          bess = 35; // BESS discharges to compensate
        }
      } else if (activeScenario === 'heatwave') {
        if (idx >= 6 && idx <= 8) {
          demand = demandBase + 30;
          bess = 45; // Battery discharges to peak-shave
        }
      } else if (activeScenario === 'wind_lull') {
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

  const handleDemoAccess = () => {
    loginAsDemo('Chief Grid Dispatcher');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white font-sans antialiased">
      
      {/* ------------------------------------------------------------------ */}
      {/* 1. TOP NAVIGATION                                                  */}
      {/* ------------------------------------------------------------------ */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b border-slate-200/80 shadow-2xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform overflow-hidden">
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
          <div className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#showcase" className="hover:text-blue-600 transition-colors">Clean Infrastructure</a>
            <a href="#simulator" className="hover:text-blue-600 transition-colors">Live Simulator</a>
            <a href="#capabilities" className="hover:text-blue-600 transition-colors">Capabilities</a>
            <a href="#benchmarks" className="hover:text-blue-600 transition-colors">CERC DSM Benchmarks</a>
          </div>

          {/* Right Action CTA Buttons & Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="truncate max-w-[130px]">{user?.name || "Operator"}</span>
                </span>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <span className="hidden xs:inline">Dashboard</span>
                  <span className="xs:hidden">App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <button
                  onClick={handleDemoAccess}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all cursor-pointer"
                  title="Sign in immediately as demo operator"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>1-Click Demo</span>
                </button>
                <Link
                  to="/login"
                  className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <span>Register</span>
                  <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
              title="Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 pt-3 pb-5 space-y-3 shadow-xl animate-fade-in">
            <div className="flex flex-col space-y-1 text-xs font-semibold text-slate-700">
              <a 
                href="#showcase" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Clean Infrastructure
              </a>
              <a 
                href="#simulator" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Live Simulator
              </a>
              <a 
                href="#capabilities" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Industrial Capabilities
              </a>
              <a 
                href="#benchmarks" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                CERC DSM Benchmarks
              </a>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              {!isAuthenticated && (
                <button
                  onClick={() => { setMobileMenuOpen(false); handleDemoAccess(); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>1-Click Demo Operator</span>
                </button>
              )}
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <span>Enter Operational Control Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/* 2. ADVANCED HERO SECTION (Left: Text & CTAs | Right: Photo & Overlays) */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200/60">
        {/* Soft Ambient Light Gradient Blobs */}
        <div className="absolute top-10 left-1/3 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-r from-emerald-100/60 via-teal-50/70 to-blue-100/60 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          
          {/* Main 2-Column Split Hero (Left: Predict Dispatch Balance, Right: Photo) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Headline, Subtitle, CTAs, Micro-Benchmarks */}
            <div className="lg:col-span-6 xl:col-span-6 space-y-5 sm:space-y-6 text-left">
              {/* Status Pill */}
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 shadow-2xs text-[11px] sm:text-xs text-slate-700 animate-fade-in flex-wrap">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-mono text-emerald-700 font-bold">18.4 GW Fleet Online</span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="font-medium text-slate-600">SLDC Interconnection Active</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Predict. Dispatch.{' '}
                <span className="block mt-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Balance.
                </span>
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-xl leading-relaxed">
                Industrial-grade 72-hour solar and wind quantile forecasting, sub-hourly ramp detection, and automated BESS dispatch for SLDCs and renewable energy clusters across India.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1">
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer text-center"
                >
                  <span>Operational Control Room</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={handleDemoAccess}
                  className="flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 font-semibold text-xs sm:text-sm shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer text-center"
                >
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>1-Click Demo</span>
                </button>

                <Link
                  to="/signup"
                  className="flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm transition-all cursor-pointer text-center"
                >
                  <span>Register Facility</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Key Trust & Compliance Badges Below CTAs */}
              <div className="pt-3 border-t border-slate-200/70 grid grid-cols-3 gap-2 sm:gap-3 text-left">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-900 truncate">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>CERC DSM</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500">&lt;10% Zero Penalty</p>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-900 truncate">
                    <Cpu className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Quantiles</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500">P10 • P50 • P90</p>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-900 truncate">
                    <Activity className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Real-time</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500">&lt;850ms Latency</p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Real High-Resolution Photo Showcase with Glassmorphic Floating Telemetry */}
            <div className="lg:col-span-6 xl:col-span-6 relative">
              {/* Ambient Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-teal-500/20 rounded-3xl blur-xl opacity-70" />

              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-2xl bg-slate-900 group">
                {/* High-Resolution Clean Energy Infrastructure Photo */}
                <div className="w-full h-[320px] sm:h-[400px] lg:h-[460px] relative overflow-hidden">
                  <img 
                    src="/landing-hero-hybrid-park.jpg" 
                    alt="Khavda Renewable Energy Hybrid Park, Gujarat" 
                    className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700"
                  />
                  {/* Subtle vignette gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                </div>

                {/* FLOATING GLASS TELEMETRY CARDS (Interactive Visual Overlays) */}
                
                {/* Card 1: Top-Left Inflow Telemetry */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/90 backdrop-blur-md border border-white/70 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl max-w-[170px] sm:max-w-xs animate-fade-in">
                  <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase font-bold text-slate-500 truncate">
                      Charanka 220kV Pooling
                    </span>
                  </div>
                  <div className="text-sm sm:text-lg font-black text-slate-900 font-mono">
                    184.2 MW Live
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                    <span>98.4% of Target</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 inline shrink-0" />
                  </div>
                </div>

                {/* Card 2: Top-Right CERC DSM Shield */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-md border border-white/70 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl max-w-[180px] hidden sm:block animate-fade-in">
                  <div className="flex items-center gap-1 mb-1 text-slate-500 text-[10px] font-mono uppercase font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>CERC DSM</span>
                  </div>
                  <div className="text-sm sm:text-lg font-black text-blue-700 font-mono">
                    1.24% nRMSE
                  </div>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 mt-0.5">
                    Zero Penalty Zone
                  </span>
                </div>

                {/* Card 3: Bottom BESS Autonomous Dispatch */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl shadow-2xl text-white animate-fade-in">
                  <div className="flex items-center justify-between gap-2 sm:gap-4 mb-0.5 sm:mb-1">
                    <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                      <BatteryCharging className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                      <span className="text-[11px] sm:text-xs font-bold text-slate-200 font-sans truncate">Khavda 50MWh BESS Hub</span>
                    </div>
                    <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                      94% SoC
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-xs font-semibold text-emerald-300">
                    Charging +20 MW • Midday Solar Surplus Absorption
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 hidden xs:block sm:block">
                    Secures ₹84,000 in avoided curtailment penalties for Gujarat SLDC.
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Metric Telemetry Row (Matching Control Room Benchmarks) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 max-w-7xl mx-auto pt-2" id="benchmarks">
            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1 text-left hover:border-blue-300 transition-colors">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Day-Ahead Accuracy</span>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 font-mono">97.4%</div>
              <p className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold truncate">Dual-tier XGBoost & Quantiles</p>
            </div>

            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1 text-left hover:border-blue-300 transition-colors">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">CERC DSM Band</span>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 font-mono">&lt; 10%</div>
              <p className="text-[10px] sm:text-[11px] text-blue-600 font-semibold truncate">Zero penalty compliance</p>
            </div>

            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1 text-left hover:border-blue-300 transition-colors">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inference Latency</span>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 font-mono">&lt; 850ms</div>
              <p className="text-[10px] sm:text-[11px] text-amber-600 font-semibold truncate">Sub-hourly dispatch sync</p>
            </div>

            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1 text-left hover:border-blue-300 transition-colors">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Penalties Prevented</span>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 font-mono">₹4.2 Cr</div>
              <p className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold truncate">Across Gujarat & REMCs</p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. CLEAN INFRASTRUCTURE PHOTO SHOWCASE                             */}
      {/* ------------------------------------------------------------------ */}
      <section id="showcase" className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              National Fleet Operations
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Monitored Renewable Energy Infrastructure Across India
            </h2>
            <p className="text-sm text-slate-500">
              Direct telemetry interconnections spanning utility-scale solar parks, multi-megawatt wind farms, BESS storage hubs, and State Load Despatch Centers.
            </p>
          </div>

          {/* 3 Photo Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Photo 1: Khavda Solar & Wind Park */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all space-y-4 group">
              <div className="w-full h-52 overflow-hidden relative">
                <img 
                  src="/landing-hero-hybrid-park.jpg" 
                  alt="Khavda Renewable Hybrid Hub" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs font-mono">
                  30,000 MW Fleet
                </span>
              </div>
              <div className="p-6 pt-0 space-y-2">
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Kutch, Gujarat</div>
                <h3 className="text-base font-bold text-slate-900">
                  Khavda Renewable Energy Hybrid Park
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  World's largest clean energy park. Features automated 72h quantile forecasting to manage rapid solar decay and evening coastal wind ramps.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-blue-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Dual-stage XGBoost Models</span>
                </div>
              </div>
            </div>

            {/* Photo 2: BESS Battery Storage Facility */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all space-y-4 group">
              <div className="w-full h-52 overflow-hidden relative">
                <img 
                  src="/landing-bess-storage.jpg" 
                  alt="Charanka Utility-Scale BESS Facility" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs font-mono">
                  50 MWh Storage
                </span>
              </div>
              <div className="p-6 pt-0 space-y-2">
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Patan, Gujarat</div>
                <h3 className="text-base font-bold text-slate-900">
                  Charanka BESS Absorption & Peaker Hub
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Utility-scale lithium storage buffering midday generation surplus and discharging during peak evening demand (18:00 – 21:00 IST).
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Autonomous Peak Shaving</span>
                </div>
              </div>
            </div>

            {/* Photo 3: State Load Despatch Center Control Room */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all space-y-4 group">
              <div className="w-full h-52 overflow-hidden relative">
                <img 
                  src="/landing-sldc-control-room.jpg" 
                  alt="State Electrical Load Despatch Center" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs font-mono">
                  50.00 Hz Grid Sync
                </span>
              </div>
              <div className="p-6 pt-0 space-y-2">
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Gotri, Vadodara</div>
                <h3 className="text-base font-bold text-slate-900">
                  Gujarat State Load Despatch Center (SLDC)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  24/7 Renewable Energy Management Center (REMC). Direct SCADA and API integration ensuring complete CERC DSM regulatory compliance.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-purple-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>National Grid Code Compliant</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. INTERACTIVE SIMULATOR (Live Grid Stress-Test)                   */}
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
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <button
                onClick={() => setActiveScenario('normal')}
                className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer ${
                  activeScenario === 'normal'
                    ? 'bg-white border-slate-300 text-slate-900 shadow-xs font-bold'
                    : 'bg-slate-200/60 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                Baseline Operations
              </button>
              <button
                onClick={() => setActiveScenario('cloud_shock')}
                className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeScenario === 'cloud_shock'
                    ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs font-bold'
                    : 'bg-slate-200/60 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Cloud Drift (-40% Solar)</span>
              </button>
              <button
                onClick={() => setActiveScenario('heatwave')}
                className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeScenario === 'heatwave'
                    ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-xs font-bold'
                    : 'bg-slate-200/60 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Heatwave Surge (+30 MW)</span>
              </button>
              <button
                onClick={() => setActiveScenario('wind_lull')}
                className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeScenario === 'wind_lull'
                    ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-xs font-bold'
                    : 'bg-slate-200/60 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <Wind className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Evening Wind Lull (-50%)</span>
              </button>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-xs font-bold text-slate-800 font-sans truncate">Gujarat SLDC • Kutch-Saurashtra Corridor</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500 shrink-0" />
                  <span>Solar (MW)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500 shrink-0" />
                  <span>Wind (MW)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500 shrink-0" />
                  <span className="font-semibold text-emerald-700">BESS Mitigation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500 shrink-0" />
                  <span>Grid Demand (MW)</span>
                </div>
              </div>
            </div>

            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulationData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
      {/* 5. CORE CAPABILITIES (Grid Features)                                */}
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
            From single 100 MW solar arrays to 30,000 MW hybrid parks, SURGE bridges meteorological prediction and real-time physical dispatch.
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
              <span>Instant Dispatch Directives</span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 6. CALL TO ACTION BANNER (Light Theme Enterprise Card)             */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden shadow-lg shadow-blue-500/5 bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/70 border border-slate-200/90 p-8 sm:p-12 lg:p-16 text-center">
          
          {/* Subtle Ambient Decorative Gradients & Mesh */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-200/35 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
            <img 
              src="/landing-hero-hybrid-park.jpg" 
              alt="Grid Infrastructure backdrop" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300/80 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Next-Generation Clean Energy Operating System</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Ready to Protect Your Grid from Renewable Deficit Penalties?
            </h2>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              Experience the live command center, run what-if weather simulations, and dispatch battery reserves in real time.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-3">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 cursor-pointer text-center"
              >
                <span>Enter Operational Control Room</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#simulator"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300/90 text-slate-700 hover:text-slate-900 font-semibold text-xs sm:text-sm shadow-xs hover:shadow-sm transition-all cursor-pointer text-center"
              >
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Explore Live Simulator</span>
              </a>

              <button
                type="button"
                onClick={handleDemoAccess}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-50 hover:bg-amber-100/90 border border-amber-200 text-amber-900 font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer text-center"
              >
                <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
                <span>Demo Operator Access</span>
              </button>
            </div>

            {/* Trust Micro-Indicators */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Installation Required</span>
              </div>
              <span className="hidden sm:inline text-slate-300">•</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>AES-256 SCADA Encryption</span>
              </div>
              <span className="hidden sm:inline text-slate-300">•</span>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>100% CERC DSM Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 7. MODERN LIGHT ENTERPRISE FOOTER                                   */}
      {/* ------------------------------------------------------------------ */}
      <footer className="border-t border-slate-200 bg-slate-50/90 text-slate-600 text-xs pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Top Brand & Regulatory Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-slate-200">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shrink-0 shadow-sm">
                <img src="/surge-icon.png" alt="SURGE" className="w-full h-full object-contain p-1" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-base tracking-tight font-sans">
                    SURGE
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                    v3.2 Grid OS
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-sans">National Renewable Energy Management & Dispatch Platform</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>CERC DSM 2024 Compliant</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-[11px] font-medium font-mono shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>99.98% Telemetry Uptime</span>
              </div>
            </div>
          </div>

          {/* 4-Column Structured Directory */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-xs">
            
            {/* Column 1: Grid Intelligence */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-900 block">
                Grid Intelligence
              </span>
              <ul className="space-y-2.5 text-slate-600 font-sans">
                <li>
                  <a href="#capabilities" className="hover:text-blue-600 transition-colors">72h Quantile Forecasting</a>
                </li>
                <li>
                  <a href="#capabilities" className="hover:text-blue-600 transition-colors">Sub-Hourly Ramp Detection</a>
                </li>
                <li>
                  <a href="#simulator" className="hover:text-blue-600 transition-colors">Automated BESS Dispatch</a>
                </li>
                <li>
                  <a href="#benchmarks" className="hover:text-blue-600 transition-colors">CERC DSM Penalty Mitigation</a>
                </li>
                <li>
                  <a href="#showcase" className="hover:text-blue-600 transition-colors">Real-Time Peaker Triage</a>
                </li>
              </ul>
            </div>

            {/* Column 2: Regional Interconnections */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-900 block">
                Regional Hubs
              </span>
              <ul className="space-y-2.5 text-slate-600 font-sans">
                <li>
                  <a href="#showcase" className="hover:text-blue-600 transition-colors">Gujarat SLDC Gotri (400kV)</a>
                </li>
                <li>
                  <a href="#showcase" className="hover:text-blue-600 transition-colors">Kutch Ultra Mega Renewable Park</a>
                </li>
                <li>
                  <a href="#showcase" className="hover:text-blue-600 transition-colors">Charanka Solar Park (220kV)</a>
                </li>
                <li>
                  <a href="#showcase" className="hover:text-blue-600 transition-colors">Bhadla Solar Complex (765kV)</a>
                </li>
                <li>
                  <a href="#showcase" className="hover:text-blue-600 transition-colors">Pavagada Shakti Sthala Pool</a>
                </li>
              </ul>
            </div>

            {/* Column 3: Operator Control */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-900 block">
                Control Room
              </span>
              <ul className="space-y-2.5 text-slate-600 font-sans">
                <li>
                  <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Operational Dashboard</Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-blue-600 transition-colors">Operator Sign In</Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-blue-600 transition-colors">Register Station Facility</Link>
                </li>
                <li>
                  <a href="#simulator" className="hover:text-blue-600 transition-colors">What-If Weather Simulator</a>
                </li>
                <li>
                  <button onClick={handleDemoAccess} className="text-amber-700 hover:text-amber-800 font-semibold transition-colors text-left cursor-pointer">
                    Instant Demo Dispatcher
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: System Telemetry & Security */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-900 block">
                Telemetry & Architecture
              </span>
              <ul className="space-y-2.5 text-slate-600 font-sans">
                <li className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Dual-Tier XGBoost ML Core</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Resilient Local DB Mirror</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>&lt;850ms Ingestion Latency</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>ISO 27001 & Tier 1 Security</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright & Disclaimer Row */}
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-sans text-center md:text-left">
            <div>
              &copy; {new Date().getFullYear()} SURGE Grid Technologies. Built with pride for India&apos;s National Clean Energy Transition.
            </div>
            <div className="flex items-center gap-4 font-mono text-[10px] text-slate-500">
              <span>Central Electricity Regulatory Commission (CERC)</span>
              <span>&bull;</span>
              <span>Indian Electricity Grid Code (IEGC)</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
