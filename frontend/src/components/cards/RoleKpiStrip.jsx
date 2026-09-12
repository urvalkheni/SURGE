import React from "react";
import { 
  Zap, 
  BarChart2, 
  ArrowLeftRight, 
  BatteryCharging, 
  Factory, 
  TrendingDown, 
  Activity, 
  ShieldCheck, 
  Sun, 
  CloudSun, 
  Coins, 
  AlertTriangle, 
  Sliders, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Radio 
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";

export default function RoleKpiStrip({
  currentGen = 485.0,
  currentDemand = 620.0,
  currentBalance = -135.0,
  p10 = 440.0,
  p90 = 530.0,
  peakDemand = 680.0,
  peakTime = "19:30"
}) {
  const { activeRoleId, roleConfig } = useAuth();
  const { assignedPlant, forecastData } = useApp();

  // -------------------------------------------------------------
  // ROLE 1: CHIEF GRID DISPATCHER KPIS
  // -------------------------------------------------------------
  if (activeRoleId === 'chief_grid_dispatcher') {
    const isSurplus = currentBalance >= 0;
    const cards = [
      {
        title: "Current Renewable Gen",
        value: `${currentGen.toFixed(1)} MW`,
        sub: `Likely ${p10} – ${p90} MW`,
        badge: "+14 MW/h",
        badgeVariant: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: Zap,
        iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200/60"
      },
      {
        title: "Substation / Grid Demand",
        value: `${currentDemand.toFixed(1)} MW`,
        sub: `Expected ${peakTime} Peak: ${peakDemand} MW`,
        badge: "Peaking",
        badgeVariant: "bg-rose-50 text-rose-700 border-rose-200",
        icon: BarChart2,
        iconColor: "text-indigo-600 bg-indigo-50 border-indigo-200/60"
      },
      {
        title: "Net Grid Balance",
        value: `${isSurplus ? `+${currentBalance.toFixed(1)}` : currentBalance.toFixed(1)} MW`,
        sub: isSurplus ? "Feeding regional grid pool" : "Drawing from reserves / BESS",
        badge: isSurplus ? "SURPLUS" : "DEFICIT",
        badgeVariant: isSurplus ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200",
        icon: ArrowLeftRight,
        iconColor: isSurplus ? "text-emerald-600 bg-emerald-50 border-emerald-200/60" : "text-rose-600 bg-rose-50 border-rose-200/60"
      },
      {
        title: "Forecast Renewable Gen",
        value: "510.0 MW",
        sub: "Next 4 hours horizon P50",
        badge: "Hybrid ML",
        badgeVariant: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Activity,
        iconColor: "text-blue-600 bg-blue-50 border-blue-200/60"
      },
      {
        title: "Expected Deficit / Surplus",
        value: "-182.0 MW",
        sub: "18:00 – 22:00 evening peak",
        badge: "Severe Deficit",
        badgeVariant: "bg-rose-50 text-rose-700 border-rose-200",
        icon: AlertTriangle,
        iconColor: "text-rose-600 bg-rose-50 border-rose-200/60"
      },
      {
        title: "BESS State of Charge",
        value: "90 MW (78%)",
        sub: "180 MWh total pool capacity",
        badge: "Ready to Dispatch",
        badgeVariant: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: BatteryCharging,
        iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200/60"
      },
      {
        title: "Backup Requirement",
        value: "45.0 MW",
        sub: "90 MW BESS + 45 MW Thermal",
        badge: "Reserve Triage",
        badgeVariant: "bg-amber-50 text-amber-700 border-amber-200",
        icon: ShieldCheck,
        iconColor: "text-amber-600 bg-amber-50 border-amber-200/60"
      },
      {
        title: "Forecast Confidence",
        value: "94.2%",
        sub: "High multi-source agreement",
        badge: "Certified",
        badgeVariant: "bg-blue-50 text-blue-700 border-blue-200",
        icon: CheckCircle2,
        iconColor: "text-blue-600 bg-blue-50 border-blue-200/60"
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${c.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{c.title}</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${c.badgeVariant}`}>
                  {c.badge}
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-bold font-sans text-slate-900 tracking-tight">{c.value}</div>
              </div>
              <div className="text-[11px] text-slate-500 font-mono truncate">{c.sub}</div>
            </div>
          );
        })}
      </div>
    );
  }

  // -------------------------------------------------------------
  // ROLE 2: PLANT OPERATIONS ENGINEER KPIS
  // -------------------------------------------------------------
  if (activeRoleId === 'plant_operations_engineer') {
    const p = assignedPlant || {
      name: "Sanand Solar PV Cluster",
      capacityMw: 250,
      actualMw: 128.8,
      forecastMw: 140.0,
      deviationMw: -11.2,
      availabilityPct: 96.4,
      cufPct: 22.8,
      prPct: 79.8,
    };

    const cards = [
      {
        title: "Installed Capacity",
        value: `${p.capacityMw} MW`,
        sub: `${p.name} Nameplate`,
        badge: "Fixed DC/AC",
        badgeVariant: "bg-slate-100 text-slate-700 border-slate-200",
        icon: Factory,
        iconColor: "text-slate-700 bg-slate-100 border-slate-200"
      },
      {
        title: "Current Generation",
        value: `${p.actualMw.toFixed(1)} MW`,
        sub: "Live SCADA Inverter Telemetry",
        badge: "Active Injection",
        badgeVariant: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Zap,
        iconColor: "text-amber-600 bg-amber-50 border-amber-200"
      },
      {
        title: "Expected Generation",
        value: `${p.forecastMw.toFixed(1)} MW`,
        sub: "Physics PVLib Expected Curve",
        badge: "P50 Target",
        badgeVariant: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Activity,
        iconColor: "text-blue-600 bg-blue-50 border-blue-200"
      },
      {
        title: "Generation Deviation",
        value: `${p.deviationMw.toFixed(1)} MW`,
        sub: "-8.0% below expected yield",
        badge: "Underproducing",
        badgeVariant: "bg-rose-50 text-rose-700 border-rose-200",
        icon: TrendingDown,
        iconColor: "text-rose-600 bg-rose-50 border-rose-200"
      },
      {
        title: "Plant Availability",
        value: `${p.availabilityPct}%`,
        sub: "38 of 40 Inverters Online",
        badge: "Nominal",
        badgeVariant: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
        iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
      },
      {
        title: "Capacity Factor (CUF)",
        value: `${p.cufPct}%`,
        sub: "Monthly Average: 23.1%",
        badge: "Target 22.0%",
        badgeVariant: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: Sun,
        iconColor: "text-amber-600 bg-amber-50 border-amber-200"
      },
      {
        title: "Performance Ratio (PR)",
        value: `${p.prPct}%`,
        sub: "Standard IEC 61724 Benchmark",
        badge: "Good (>78%)",
        badgeVariant: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: ShieldCheck,
        iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
      },
      {
        title: "Curtailment Directive",
        value: "0.0 MW",
        sub: "No SLDC Backdown Order",
        badge: "100% Evacuation",
        badgeVariant: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: Sliders,
        iconColor: "text-blue-600 bg-blue-50 border-blue-200"
      },
      {
        title: "Weather Impact",
        value: "-8.5 MW",
        sub: "Cloud cover attenuation (28%)",
        badge: "Thermal + Cloud",
        badgeVariant: "bg-amber-50 text-amber-700 border-amber-200",
        icon: CloudSun,
        iconColor: "text-amber-600 bg-amber-50 border-amber-200"
      },
      {
        title: "Forecast Error (Holdout)",
        value: "4.2%",
        sub: "Within CERC 10% DSM tolerance",
        badge: "Compliant",
        badgeVariant: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
        iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
      }
    ];

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${c.iconColor}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 truncate">{c.title}</span>
                </div>
              </div>
              <div className="my-1.5">
                <div className="text-xl font-bold font-sans text-slate-900 tracking-tight">{c.value}</div>
              </div>
              <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500 font-mono">
                <span className="truncate">{c.sub}</span>
                <span className={`px-1 py-0.2 rounded border text-[9px] font-bold shrink-0 ${c.badgeVariant}`}>
                  {c.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // -------------------------------------------------------------
  // ROLE 3: ENERGY TRADING ANALYST KPIS
  // -------------------------------------------------------------
  if (activeRoleId === 'energy_trading_analyst') {
    const cards = [
      {
        title: "Tomorrow Forecast Gen",
        value: "2,140 MWh",
        sub: "Day-Ahead Market (DAM) Pool",
        badge: "DAM Baseline",
        badgeVariant: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: Activity,
        iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
      },
      {
        title: "Intraday Forecast Gen",
        value: "2,185 MWh",
        sub: "+45 MWh RTM trading delta",
        badge: "+2.1% Ramp",
        badgeVariant: "bg-blue-50 text-blue-700 border-blue-200",
        icon: TrendingUp,
        iconColor: "text-blue-600 bg-blue-50 border-blue-200"
      },
      {
        title: "Scheduled Energy",
        value: "1,960 MWh",
        sub: "Committed PPA delivery block",
        badge: "SLDC Obligation",
        badgeVariant: "bg-slate-100 text-slate-700 border-slate-200",
        icon: Clock,
        iconColor: "text-slate-700 bg-slate-100 border-slate-200"
      },
      {
        title: "Expected Surplus",
        value: "+180 MWh",
        sub: "Tradable volume on IEX RTM",
        badge: "Clearable",
        badgeVariant: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: Zap,
        iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
      },
      {
        title: "Expected Deficit",
        value: "0 MWh",
        sub: "Zero delivery shortfall",
        badge: "No DSM Penalty",
        badgeVariant: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: ShieldCheck,
        iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
      },
      {
        title: "Forecast Confidence",
        value: "87.0%",
        sub: "P50 commercial risk envelope",
        badge: "High Reliability",
        badgeVariant: "bg-blue-50 text-blue-700 border-blue-200",
        icon: CheckCircle2,
        iconColor: "text-blue-600 bg-blue-50 border-blue-200"
      },
      {
        title: "Expected Revenue",
        value: "₹14.8 lakh",
        sub: "₹3.95/kWh weighted average tariff",
        badge: "Target Exceeded",
        badgeVariant: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: Coins,
        iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
      },
      {
        title: "Deviation Penalty Risk",
        value: "Medium",
        sub: "Max ₹1.2L exposure in 10% band",
        badge: "CERC Regulated",
        badgeVariant: "bg-amber-50 text-amber-700 border-amber-200",
        icon: AlertTriangle,
        iconColor: "text-amber-600 bg-amber-50 border-amber-200"
      },
      {
        title: "Market Price Exposure",
        value: "₹4.2 lakh",
        sub: "Unhedged RTM clearing volume",
        badge: "Open Position",
        badgeVariant: "bg-amber-50 text-amber-700 border-amber-200",
        icon: BarChart2,
        iconColor: "text-purple-600 bg-purple-50 border-purple-200"
      },
      {
        title: "BESS Arbitrage Opp.",
        value: "₹85,000 / day",
        sub: "Spread ₹3.7/kWh (12:00 vs 18:00)",
        badge: "High Profit",
        badgeVariant: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: BatteryCharging,
        iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
      }
    ];

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${c.iconColor}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 truncate">{c.title}</span>
                </div>
              </div>
              <div className="my-1.5">
                <div className="text-xl font-bold font-sans text-slate-900 tracking-tight">{c.value}</div>
              </div>
              <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500 font-mono">
                <span className="truncate">{c.sub}</span>
                <span className={`px-1 py-0.2 rounded border text-[9px] font-bold shrink-0 ${c.badgeVariant}`}>
                  {c.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // -------------------------------------------------------------
  // ROLE 4: REMC DESK OFFICER KPIS
  // -------------------------------------------------------------
  const cards = [
    {
      title: "Total Plants Monitored",
      value: "18 Plants",
      sub: "12 Solar PV · 6 Wind Corridors",
      badge: "Regional Pool",
      badgeVariant: "bg-purple-50 text-purple-700 border-purple-200",
      icon: Factory,
      iconColor: "text-purple-600 bg-purple-50 border-purple-200"
    },
    {
      title: "Installed RE Capacity",
      value: "2.40 GW",
      sub: "1.60 GW Solar · 0.80 GW Wind",
      badge: "Western Region",
      badgeVariant: "bg-slate-100 text-slate-700 border-slate-200",
      icon: Zap,
      iconColor: "text-slate-700 bg-slate-100 border-slate-200"
    },
    {
      title: "Current RE Generation",
      value: "1.60 GW",
      sub: "66.7% current plant factor",
      badge: "Live Telemetry",
      badgeVariant: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Activity,
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
    },
    {
      title: "Forecast RE Generation",
      value: "1.72 GW",
      sub: "Aggregated regional P50 run",
      badge: "State-Wide P50",
      badgeVariant: "bg-blue-50 text-blue-700 border-blue-200",
      icon: TrendingUp,
      iconColor: "text-blue-600 bg-blue-50 border-blue-200"
    },
    {
      title: "Scheduled RE Generation",
      value: "1.68 GW",
      sub: "Declared capacity committed",
      badge: "SLDC Pool",
      badgeVariant: "bg-slate-100 text-slate-700 border-slate-200",
      icon: Clock,
      iconColor: "text-slate-700 bg-slate-100 border-slate-200"
    },
    {
      title: "Total Forecast Deviation",
      value: "-120.0 MW",
      sub: "Under-injection across 3 plants",
      badge: "Action Required",
      badgeVariant: "bg-rose-50 text-rose-700 border-rose-200",
      icon: TrendingDown,
      iconColor: "text-rose-600 bg-rose-50 border-rose-200"
    },
    {
      title: "High Risk Plants",
      value: "3 Plants",
      sub: "Jaisalmer Wind, Charanka, Kutch",
      badge: "Tolerance Exceeded",
      badgeVariant: "bg-rose-50 text-rose-700 border-rose-200",
      icon: AlertTriangle,
      iconColor: "text-rose-600 bg-rose-50 border-rose-200"
    },
    {
      title: "Regional Ramp Risk",
      value: "-135 MW / 60m",
      sub: "Kutch + Jaisalmer wind drop",
      badge: "18:00 Window",
      badgeVariant: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Radio,
      iconColor: "text-amber-600 bg-amber-50 border-amber-200"
    },
    {
      title: "Forecast Confidence",
      value: "89.0%",
      sub: "Ensemble multi-plant agreement",
      badge: "High",
      badgeVariant: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3.5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${c.iconColor}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 truncate">{c.title}</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold shrink-0 ${c.badgeVariant}`}>
                {c.badge}
              </span>
            </div>
            <div className="my-1.5">
              <div className="text-xl font-bold font-sans text-slate-900 tracking-tight">{c.value}</div>
            </div>
            <div className="text-[10px] text-slate-500 font-mono truncate">{c.sub}</div>
          </div>
        );
      })}
    </div>
  );
}
