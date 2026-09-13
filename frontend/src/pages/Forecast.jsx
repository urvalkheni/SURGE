import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  Legend 
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Sun, 
  Coins, 
  Radio, 
  Clock, 
  Factory 
} from "lucide-react";

export default function Forecast() {
  const { forecastData, horizon, setHorizon, assignedPlant } = useApp();
  const { activeRoleId, roleConfig } = useAuth();
  const schedule = forecastData?.hourly_schedule || [];

  // Slice schedule to currently selected forecast horizon (24h, 48h, 72h)
  const activeSchedule = useMemo(() => {
    return schedule.slice(0, horizon);
  }, [schedule, horizon]);

  // Dynamically compute horizon-specific operational KPI metrics
  const kpis = useMemo(() => {
    if (!activeSchedule || activeSchedule.length === 0) {
      return {
        deficitTime: "18:00 – 22:00 IST",
        maxDeficitMw: 182.0,
        totalDeficitMwh: 450,
        surplusTime: "11:00 – 14:30 IST",
        maxSurplusMw: 64.0,
        totalSurplusMwh: 180,
        reserveReqMw: 45.0,
        maxRampMwPerHour: -38.0,
        tradableSurplusMwh: 180,
        revenuePotentialInr: "₹4.2 lakh",
        arbitrageGain: "₹1,29,500"
      };
    }

    let maxDeficit = 0;
    const deficitPoints = [];
    let maxSurplus = 0;
    const surplusPoints = [];
    let totalDeficitEnergy = 0;
    let totalSurplusEnergy = 0;
    let maxRamp = 0;

    activeSchedule.forEach((pt, i) => {
      const bal = pt.grid_balance_mw;
      if (bal < -15) {
        deficitPoints.push(pt);
        totalDeficitEnergy += Math.abs(bal);
        if (Math.abs(bal) > maxDeficit) maxDeficit = Math.abs(bal);
      } else if (bal > 15) {
        surplusPoints.push(pt);
        totalSurplusEnergy += bal;
        if (bal > maxSurplus) maxSurplus = bal;
      }

      if (i > 0) {
        const ramp = pt.total_renewable_mw - activeSchedule[i - 1].total_renewable_mw;
        if (Math.abs(ramp) > Math.abs(maxRamp)) maxRamp = ramp;
      }
    });

    const formatTime = (ts) => (ts?.split(" ")[1] || "18:00").substring(0, 5);
    const deficitTime = deficitPoints.length > 0 
      ? `${formatTime(deficitPoints[0].timestamp)} – ${formatTime(deficitPoints[deficitPoints.length - 1].timestamp)} IST`
      : "No Deficit Window";

    const surplusTime = surplusPoints.length > 0
      ? `${formatTime(surplusPoints[0].timestamp)} – ${formatTime(surplusPoints[surplusPoints.length - 1].timestamp)} IST`
      : "11:00 – 14:30 IST";

    const reserveReq = Math.max(25, Number((maxDeficit * 0.45).toFixed(1)));
    const tradableMwh = Math.round(totalSurplusEnergy * 0.8);
    const revLakh = (tradableMwh * 3.4 / 100).toFixed(1);

    return {
      deficitTime,
      maxDeficitMw: Number(maxDeficit.toFixed(1)) || 182.0,
      totalDeficitMwh: Math.round(totalDeficitEnergy),
      surplusTime,
      maxSurplusMw: Number(maxSurplus.toFixed(1)) || 64.0,
      totalSurplusMwh: Math.round(totalSurplusEnergy),
      reserveReqMw: reserveReq,
      maxRampMwPerHour: Number(maxRamp.toFixed(1)) || -38.0,
      tradableSurplusMwh: tradableMwh,
      revenuePotentialInr: `₹${revLakh} lakh`,
      arbitrageGain: `+₹${Math.round(tradableMwh * 720).toLocaleString()}`
    };
  }, [activeSchedule]);

  // -------------------------------------------------------------------------
  // 1. DATA PREPARATION PER ROLE
  // -------------------------------------------------------------------------
  const chartData = activeSchedule.map((s, idx) => {
    const timeStr = s.timestamp.replace("2026-", "");
    const hourNum = idx % 24;

    // Market price curve (₹/kWh): low midday during solar surplus (3.1), peaks in evening (6.8)
    let marketPrice = 4.2;
    if (hourNum >= 10 && hourNum <= 14) marketPrice = 3.1;
    else if (hourNum >= 18 && hourNum <= 21) marketPrice = 6.8;
    else if (hourNum >= 6 && hourNum <= 9) marketPrice = 5.2;

    // Plant-specific expected vs actual for engineer
    const plantScale = (assignedPlant?.capacityMw || 250) / 200;
    const plantExpected = Number((s.total_renewable_mw * plantScale).toFixed(1));
    const plantActual = Number((plantExpected * (idx % 3 === 0 ? 0.92 : 0.96)).toFixed(1));
    const plantClipping = plantExpected > 240 ? 240 : null;

    // Trading schedule
    const scheduledMw = Number((s.total_renewable_mw * 0.92).toFixed(1));
    const tradableDelta = Number((s.total_renewable_mw - scheduledMw).toFixed(1));
    const revenueInr = Math.round(s.total_renewable_mw * marketPrice * 1000);

    // REMC multi-cluster regional aggregation
    const regionalSolar = Number((s.solar_generation_mw * 2.4).toFixed(1));
    const regionalWind = Number((s.wind_generation_mw * 2.2).toFixed(1));
    const regionalTotal = Number((regionalSolar + regionalWind).toFixed(1));
    const regionalSchedule = Number((regionalTotal * 0.94).toFixed(1));
    const regionalDeviation = Number((regionalTotal - regionalSchedule).toFixed(1));

    return {
      time: timeStr,
      Solar: s.solar_generation_mw,
      Wind: s.wind_generation_mw,
      TotalRE: s.total_renewable_mw,
      Demand: s.grid_demand_mw,
      Delta: s.grid_balance_mw,
      // Plant engineer series
      PlantExpected: plantExpected,
      PlantActual: plantActual,
      PlantClipping: plantClipping,
      // Trading series
      MarketPrice: marketPrice,
      ScheduledMw: scheduledMw,
      TradableDelta: tradableDelta,
      RevenueInr: revenueInr,
      // REMC series
      RegionalSolar: regionalSolar,
      RegionalWind: regionalWind,
      RegionalTotal: regionalTotal,
      RegionalSchedule: regionalSchedule,
      RegionalDeviation: regionalDeviation,
      raw: s
    };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${roleConfig.badgeVariant}`}>
              {roleConfig.name} FORECAST PERSPECTIVE
            </span>
            <span className="text-xs text-slate-400 font-mono hidden md:inline">
              Scope: {roleConfig.dataScope}
            </span>
          </div>

          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight font-sans mt-1">
            {activeRoleId === 'chief_grid_dispatcher' && "Renewable Forecast vs. Grid Demand Forecast"}
            {activeRoleId === 'plant_operations_engineer' && `${assignedPlant?.name || "Sanand Solar PV"}: Forecast vs. Actual Generation`}
            {activeRoleId === 'energy_trading_analyst' && "Forecast Generation vs. Schedule vs. Market Clearing Price"}
            {activeRoleId === 'remc_desk_officer' && "Regional Aggregated Renewable Forecast & Cluster Balance"}
          </h2>

          <p className="text-xs text-slate-500 font-mono mt-0.5">
            {activeRoleId === 'chief_grid_dispatcher' && "Highlighting deficit periods, surplus energy, reserve requirements & net ramp events."}
            {activeRoleId === 'plant_operations_engineer' && "Highlighting plant forecast error, weather influence, underperformance & inverter behavior."}
            {activeRoleId === 'energy_trading_analyst' && "Highlighting tradable surplus, expected shortfalls, financial exposure & arbitrage windows."}
            {activeRoleId === 'remc_desk_officer' && "Highlighting multi-plant contribution, schedule deviation, and regional renewable ramp."}
          </p>
        </div>

        {/* Horizon selector: 24h, 48h, 72h */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-slate-50 border border-slate-200 p-1 rounded-xl flex items-center font-mono text-xs shadow-2xs">
            {[24, 48, 72].map(h => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  horizon === h 
                    ? "bg-blue-600 text-white font-bold shadow-2xs" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {h}h Forecast
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Role-Specific Highlights Banner */}
      {activeRoleId === 'chief_grid_dispatcher' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-rose-700 uppercase block">DEFICIT PERIOD ({horizon}H)</span>
            <div className="text-lg font-bold text-rose-800">{kpis.deficitTime}</div>
            <div className="text-xs text-slate-600 font-mono">-{kpis.maxDeficitMw} MW Peak Shortfall ({kpis.totalDeficitMwh} MWh total)</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">SURPLUS PERIOD ({horizon}H)</span>
            <div className="text-lg font-bold text-amber-900">{kpis.surplusTime}</div>
            <div className="text-xs text-slate-600 font-mono">+{kpis.maxSurplusMw} MW Peak Solar Excess ({kpis.totalSurplusMwh} MWh pool)</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-blue-700 uppercase block">RESERVE REQUIREMENT</span>
            <div className="text-lg font-bold text-blue-900">{kpis.reserveReqMw} MW Minimum</div>
            <div className="text-xs text-slate-600 font-mono">BESS (90 MW) + Thermal Peaker ({kpis.reserveReqMw} MW)</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase block">RAMP EVENT SPEED</span>
            <div className="text-lg font-bold text-emerald-900">{kpis.maxRampMwPerHour} MW / hour</div>
            <div className="text-xs text-slate-600 font-mono">Max generation gradient in {horizon}h horizon</div>
          </div>
        </div>
      )}

      {activeRoleId === 'plant_operations_engineer' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">PLANT FORECAST ERROR</span>
            <div className="text-lg font-bold text-amber-900">4.2% nRMSE</div>
            <div className="text-xs text-slate-600 font-mono">Within CERC 10% tolerance band ({horizon}h)</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-blue-700 uppercase block">WEATHER INFLUENCE</span>
            <div className="text-lg font-bold text-blue-900">-{(kpis.maxSurplusMw * 0.12).toFixed(1)} MW Attenuation</div>
            <div className="text-xs text-slate-600 font-mono">Scattered cloud layer during {horizon}h lookahead</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-rose-700 uppercase block">UNDERPERFORMANCE</span>
            <div className="text-lg font-bold text-rose-800">-{(kpis.maxDeficitMw * 0.08).toFixed(1)} MW Technical Delta</div>
            <div className="text-xs text-slate-600 font-mono">Inverter INV-07 combiner check</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase block">SUNRISE / SUNSET</span>
            <div className="text-lg font-bold text-emerald-900">06:12 – 18:34 IST</div>
            <div className="text-xs text-slate-600 font-mono">Active Photovoltaic Window ({horizon}h)</div>
          </div>
        </div>
      )}

      {activeRoleId === 'energy_trading_analyst' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase block">TRADABLE SURPLUS ({horizon}H)</span>
            <div className="text-lg font-bold text-emerald-900">+{kpis.tradableSurplusMwh} MWh</div>
            <div className="text-xs text-slate-600 font-mono">Available for Day-Ahead / RTM sale</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-blue-700 uppercase block">EXPECTED SHORTFALL</span>
            <div className="text-lg font-bold text-blue-900">-{kpis.maxDeficitMw} MW Deficit</div>
            <div className="text-xs text-slate-600 font-mono">Max deviation penalty exposure</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-purple-700 uppercase block">FINANCIAL EXPOSURE</span>
            <div className="text-lg font-bold text-purple-900">{kpis.revenuePotentialInr}</div>
            <div className="text-xs text-slate-600 font-mono">Unhedged RTM spot volume ({horizon}h)</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">ARBITRAGE WINDOW</span>
            <div className="text-lg font-bold text-amber-900">₹3.10 → ₹6.80 / kWh</div>
            <div className="text-xs text-slate-600 font-mono">{kpis.arbitrageGain} Estimated Net Gain</div>
          </div>
        </div>
      )}

      {activeRoleId === 'remc_desk_officer' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-purple-700 uppercase block">PLANTS POOLED</span>
            <div className="text-lg font-bold text-purple-900">18 Connected Plants</div>
            <div className="text-xs text-slate-600 font-mono">2.4 GW Total Nameplate Capacity</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-rose-700 uppercase block">SCHEDULE DEVIATION</span>
            <div className="text-lg font-bold text-rose-800">-{(kpis.maxDeficitMw * 0.65).toFixed(1)} MW Total</div>
            <div className="text-xs text-slate-600 font-mono">Regional under-injection in {horizon}h horizon</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">REGIONAL RAMP ALERT</span>
            <div className="text-lg font-bold text-amber-900">{kpis.maxRampMwPerHour} MW / 60 min</div>
            <div className="text-xs text-slate-600 font-mono">Aggregated corridor ramp gradient</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase block">FORECAST CONFIDENCE</span>
            <div className="text-lg font-bold text-emerald-900">89.0% Ensemble</div>
            <div className="text-xs text-slate-600 font-mono">Multi-hub weather radar agreement</div>
          </div>
        </div>
      )}

      {/* Main Interactive Chart Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
            {activeRoleId === 'chief_grid_dispatcher' && "Grid Generation vs Demand Forecast Profile"}
            {activeRoleId === 'plant_operations_engineer' && "Assigned Plant: Actual vs Expected Production Curve"}
            {activeRoleId === 'energy_trading_analyst' && "Generation vs Contract Schedule vs Spot Market Price (₹/kWh)"}
            {activeRoleId === 'remc_desk_officer' && "Regional Aggregated Solar + Wind Generation vs Scheduled Pool"}
          </span>
          <span className="text-xs text-slate-400 font-mono">Interactive High-Resolution Forecast Series</span>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {/* ROLE 1: CHIEF GRID DISPATCHER (Area chart with RE vs Demand) */}
            {activeRoleId === 'chief_grid_dispatcher' && (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="fcSolar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="fcWind" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} interval={horizon === 72 ? 5 : horizon === 48 ? 3 : 1} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit=" MW" domain={[0, 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", fontSize: "12px", fontFamily: "monospace" }}
                  formatter={(val, name) => [`${Number(val).toFixed(1)} MW`, name]}
                />
                <Legend />
                <Area type="monotone" dataKey="Solar" stackId="1" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#fcSolar)" name="Solar Forecast" />
                <Area type="monotone" dataKey="Wind" stackId="1" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#fcWind)" name="Wind Forecast" />
                <Area type="monotone" dataKey="Demand" stroke="#f43f5e" strokeWidth={2.5} strokeDasharray="4 4" fill="none" name="Substation Demand" />
                <ReferenceLine y={45} stroke="#f97316" strokeDasharray="3 3" label={{ value: "Reserve Minimum (45 MW)", fill: "#f97316", fontSize: 10, position: "insideBottomRight" }} />
              </AreaChart>
            )}

            {/* ROLE 2: PLANT OPERATIONS ENGINEER (Expected vs Actual Generation) */}
            {activeRoleId === 'plant_operations_engineer' && (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="peExpected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} interval={horizon === 72 ? 5 : horizon === 48 ? 3 : 1} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit=" MW" domain={[0, 260]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", fontSize: "12px", fontFamily: "monospace" }}
                  formatter={(val, name) => [`${Number(val).toFixed(1)} MW`, name]}
                />
                <Legend />
                <Area type="monotone" dataKey="PlantExpected" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#peExpected)" name="Expected Generation (P50)" />
                <Area type="monotone" dataKey="PlantActual" stroke="#10b981" strokeWidth={2.5} fill="none" name="Actual Generation (SCADA)" />
                <ReferenceLine y={assignedPlant?.capacityMw || 250} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: "Nameplate Capacity", fill: "#64748b", fontSize: 10 }} />
              </AreaChart>
            )}

            {/* ROLE 3: ENERGY TRADING ANALYST (Forecast, Schedule, and Market Clearing Price) */}
            {activeRoleId === 'energy_trading_analyst' && (
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} interval={horizon === 72 ? 5 : horizon === 48 ? 3 : 1} />
                <YAxis yAxisId="mw" stroke="#94a3b8" fontSize={11} tickLine={false} unit=" MW" domain={[0, 240]} />
                <YAxis yAxisId="price" orientation="right" stroke="#10b981" fontSize={11} tickLine={false} unit=" ₹" domain={[2, 8]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", fontSize: "12px", fontFamily: "monospace" }}
                  formatter={(val, name) => [name.includes("Price") ? `₹${Number(val).toFixed(2)}/kWh` : `${Number(val).toFixed(1)} MW`, name]}
                />
                <Legend />
                <Line yAxisId="mw" type="monotone" dataKey="TotalRE" stroke="#2563eb" strokeWidth={2.5} dot={false} name="Forecast Generation (MW)" />
                <Line yAxisId="mw" type="monotone" dataKey="ScheduledMw" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Contracted Schedule (MW)" />
                <Line yAxisId="price" type="monotone" dataKey="MarketPrice" stroke="#10b981" strokeWidth={2.5} dot={false} name="IEX Clearing Price (₹/kWh)" />
              </LineChart>
            )}

            {/* ROLE 4: REMC DESK OFFICER (Regional Aggregation) */}
            {activeRoleId === 'remc_desk_officer' && (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="regSolar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="regWind" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} interval={horizon === 72 ? 5 : horizon === 48 ? 3 : 1} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit=" MW" domain={[0, 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", fontSize: "12px", fontFamily: "monospace" }}
                  formatter={(val, name) => [`${Number(val).toFixed(1)} MW`, name]}
                />
                <Legend />
                <Area type="monotone" dataKey="RegionalSolar" stackId="1" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#regSolar)" name="Regional Solar Pool" />
                <Area type="monotone" dataKey="RegionalWind" stackId="1" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#regWind)" name="Regional Wind Pool" />
                <Area type="monotone" dataKey="RegionalSchedule" stroke="#64748b" strokeWidth={2.5} strokeDasharray="3 3" fill="none" name="State Declared Schedule" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Role-Adapted Dispatch & Operational Ledger Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
            {activeRoleId === 'chief_grid_dispatcher' && "Grid Dispatch & Reserve Balance Ledger"}
            {activeRoleId === 'plant_operations_engineer' && `${assignedPlant?.name || "Sanand Solar"}: Technical Performance Log`}
            {activeRoleId === 'energy_trading_analyst' && "Commercial Arbitrage & Schedule Settlement Log"}
            {activeRoleId === 'remc_desk_officer' && "REMC Regional Aggregation & Deviation Ledger"}
          </h3>
          <span className="text-xs text-slate-500 font-mono">Showing next {horizon} hourly intervals</span>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 sticky top-0 border-b border-slate-200">
              {/* CHIEF GRID DISPATCHER COLUMNS */}
              {activeRoleId === 'chief_grid_dispatcher' && (
                <tr>
                  <th className="p-3">TIMESTAMP</th>
                  <th className="p-3 text-amber-700">SOLAR (MW)</th>
                  <th className="p-3 text-blue-700">WIND (MW)</th>
                  <th className="p-3 text-slate-900 font-bold">TOTAL RE (MW)</th>
                  <th className="p-3 text-rose-600">DEMAND (MW)</th>
                  <th className="p-3">DELTA (MW)</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3">OPERATIONAL DIRECTIVE</th>
                </tr>
              )}

              {/* PLANT OPERATIONS ENGINEER COLUMNS */}
              {activeRoleId === 'plant_operations_engineer' && (
                <tr>
                  <th className="p-3">TIMESTAMP</th>
                  <th className="p-3 text-blue-700">EXPECTED (MW)</th>
                  <th className="p-3 text-emerald-700 font-bold">ACTUAL SCADA (MW)</th>
                  <th className="p-3 text-rose-600">DEVIATION (MW)</th>
                  <th className="p-3">EST. GHI / WIND</th>
                  <th className="p-3">MODULE TEMP</th>
                  <th className="p-3">INVERTER HEALTH</th>
                  <th className="p-3">MAINTENANCE STATUS</th>
                </tr>
              )}

              {/* ENERGY TRADING ANALYST COLUMNS */}
              {activeRoleId === 'energy_trading_analyst' && (
                <tr>
                  <th className="p-3">TIMESTAMP</th>
                  <th className="p-3 text-blue-700 font-bold">FORECAST (MW)</th>
                  <th className="p-3 text-slate-600">SCHEDULE (MW)</th>
                  <th className="p-3 text-emerald-700 font-bold">TRADABLE DELTA</th>
                  <th className="p-3 text-indigo-700">IEX PRICE (₹/kWh)</th>
                  <th className="p-3">EST. REVENUE (₹)</th>
                  <th className="p-3">COMMERCIAL ACTION</th>
                </tr>
              )}

              {/* REMC DESK OFFICER COLUMNS */}
              {activeRoleId === 'remc_desk_officer' && (
                <tr>
                  <th className="p-3">TIMESTAMP</th>
                  <th className="p-3 text-purple-700 font-bold">REGIONAL RE (MW)</th>
                  <th className="p-3 text-slate-600">DECLARED SCHED (MW)</th>
                  <th className="p-3 text-rose-600 font-bold">DEVIATION (MW)</th>
                  <th className="p-3 text-amber-700">SOLAR POOL</th>
                  <th className="p-3 text-blue-700">WIND POOL</th>
                  <th className="p-3">RAMP RATE</th>
                  <th className="p-3">COORDINATION NOTICE</th>
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-slate-100">
              {chartData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-slate-800 font-semibold">{row.time}</td>

                  {/* Dispatcher Row */}
                  {activeRoleId === 'chief_grid_dispatcher' && (
                    <>
                      <td className="p-3 text-amber-700 font-bold">{row.Solar.toFixed(1)}</td>
                      <td className="p-3 text-blue-700 font-bold">{row.Wind.toFixed(1)}</td>
                      <td className="p-3 font-bold text-slate-900">{row.TotalRE.toFixed(1)}</td>
                      <td className="p-3 text-slate-600">{row.Demand.toFixed(1)}</td>
                      <td className={`p-3 font-bold ${row.Delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {row.Delta >= 0 ? `+${row.Delta.toFixed(1)}` : row.Delta.toFixed(1)}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          row.Delta < -15 ? "bg-rose-50 text-rose-700 border-rose-200" :
                          row.Delta > 15 ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}>
                          {row.Delta < -15 ? "DEFICIT" : row.Delta > 15 ? "SURPLUS" : "BALANCED"}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700">{row.raw?.dispatch_advisory || "Monitor grid balance"}</td>
                    </>
                  )}

                  {/* Plant Engineer Row */}
                  {activeRoleId === 'plant_operations_engineer' && (
                    <>
                      <td className="p-3 text-blue-700 font-bold">{row.PlantExpected.toFixed(1)}</td>
                      <td className="p-3 text-emerald-700 font-bold">{row.PlantActual.toFixed(1)}</td>
                      <td className="p-3 text-rose-600 font-bold">{(row.PlantActual - row.PlantExpected).toFixed(1)}</td>
                      <td className="p-3 text-slate-600">{row.Solar > 10 ? "780 W/m²" : "0 W/m²"}</td>
                      <td className="p-3 text-slate-700">{row.Solar > 10 ? "46.8°C" : "28.2°C"}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          38/40 Normal
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{row.Solar > 30 ? "Auto-tracking active" : "Night standby"}</td>
                    </>
                  )}

                  {/* Trading Analyst Row */}
                  {activeRoleId === 'energy_trading_analyst' && (
                    <>
                      <td className="p-3 text-blue-700 font-bold">{row.TotalRE.toFixed(1)}</td>
                      <td className="p-3 text-slate-600">{row.ScheduledMw.toFixed(1)}</td>
                      <td className={`p-3 font-bold ${row.TradableDelta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {row.TradableDelta >= 0 ? `+${row.TradableDelta.toFixed(1)}` : row.TradableDelta.toFixed(1)} MW
                      </td>
                      <td className="p-3 font-bold text-indigo-700">₹{row.MarketPrice.toFixed(2)}</td>
                      <td className="p-3 text-slate-800">₹{row.RevenueInr.toLocaleString("en-IN")}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${row.MarketPrice <= 3.5 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : row.MarketPrice >= 6.0 ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {row.MarketPrice <= 3.5 ? "Charge BESS / Buy" : row.MarketPrice >= 6.0 ? "Discharge BESS / Sell" : "Hold Position"}
                        </span>
                      </td>
                    </>
                  )}

                  {/* REMC Desk Officer Row */}
                  {activeRoleId === 'remc_desk_officer' && (
                    <>
                      <td className="p-3 text-purple-800 font-bold">{row.RegionalTotal.toFixed(1)} MW</td>
                      <td className="p-3 text-slate-600">{row.RegionalSchedule.toFixed(1)} MW</td>
                      <td className={`p-3 font-bold ${row.RegionalDeviation < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        {row.RegionalDeviation >= 0 ? `+${row.RegionalDeviation.toFixed(1)}` : row.RegionalDeviation.toFixed(1)} MW
                      </td>
                      <td className="p-3 text-amber-700">{row.RegionalSolar.toFixed(1)}</td>
                      <td className="p-3 text-blue-700">{row.RegionalWind.toFixed(1)}</td>
                      <td className="p-3 text-slate-600">{idx % 4 === 0 ? "-24 MW/h" : "+12 MW/h"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${row.RegionalDeviation < -15 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                          {row.RegionalDeviation < -15 ? "Notify Dispatcher" : "Nominal Integration"}
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
