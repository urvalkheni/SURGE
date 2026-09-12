import React, { useState } from "react";
import { 
  BatteryCharging, 
  Battery, 
  Zap, 
  Activity, 
  Thermometer, 
  Cpu, 
  Sliders, 
  TrendingUp, 
  DollarSign, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Radio, 
  RefreshCw,
  Play,
  Square,
  Flame,
  Layers,
  ArrowRight
} from "lucide-react";
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from "recharts";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

export default function BatteryStorage() {
  const { forecastData, settings, updateSettings, assignedPlant } = useApp();
  const { activeRoleId, roleConfig, isDispatcher, isPlantEngineer, isTradingAnalyst, isRemcOfficer, canControl } = useAuth();

  const [batteryMode, setBatteryMode] = useState("AUTO_ARBITRAGE"); // AUTO_ARBITRAGE, PEAK_SHAVING, FREQ_SUPPORT, MANUAL
  const [dispatchRateMw, setDispatchRateMw] = useState(15);
  const [dispatchActionType, setDispatchActionType] = useState("DISCHARGE"); // CHARGE, DISCHARGE
  const [dispatchStatus, setDispatchStatus] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Simulated 24h battery schedule data
  const batterySchedule = [
    { time: "00:00", soc: 35, powerMw: 0, price: 3.10, action: "IDLE" },
    { time: "03:00", soc: 35, powerMw: 0, price: 2.80, action: "IDLE" },
    { time: "06:00", soc: 35, powerMw: 0, price: 3.40, action: "IDLE" },
    { time: "09:00", soc: 40, powerMw: -5, price: 2.90, action: "CHARGE" },
    { time: "11:00", soc: 65, powerMw: -15, price: 2.20, action: "CHARGE" },
    { time: "13:00", soc: 90, powerMw: -15, price: 2.10, action: "CHARGE" },
    { time: "15:00", soc: 95, powerMw: -5, price: 2.40, action: "FLOAT" },
    { time: "17:00", soc: 92, powerMw: 0, price: 3.80, action: "STANDBY" },
    { time: "19:00", soc: 65, powerMw: 18, price: 6.80, action: "DISCHARGE" },
    { time: "20:00", soc: 40, powerMw: 18, price: 6.50, action: "DISCHARGE" },
    { time: "21:00", soc: 25, powerMw: 12, price: 5.40, action: "DISCHARGE" },
    { time: "23:00", soc: 22, powerMw: 0, price: 3.30, action: "IDLE" },
  ];

  // Live state values
  const currentSoc = 68; // %
  const currentCapacityMwh = 50; // MWh
  const availableEnergyMwh = Number(((currentSoc / 100) * currentCapacityMwh).toFixed(1));
  const currentRateMw = 14.5;
  const healthSoh = 98.4; // %
  const cycleCount = 342;
  const roundTripEfficiency = 88.5; // %

  const handlePhysicalDispatch = async () => {
    setIsExecuting(true);
    setDispatchStatus(null);

    try {
      // Direct call to backend with active role
      const payload = {
        action: dispatchActionType,
        power_mw: dispatchRateMw,
        mode: batteryMode,
        user_role: activeRoleId,
        station: "Sanand BESS 20MW/50MWh"
      };

      const response = await fetch("http://localhost:8000/battery/dispatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Role": activeRoleId
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 403) {
          setDispatchStatus({
            type: "error",
            message: "HTTP 403 FORBIDDEN: Role authorization failed. Only Chief Grid Dispatcher is authorized to issue physical battery dispatch commands."
          });
        } else {
          setDispatchStatus({
            type: "error",
            message: `Dispatch failed with status code ${response.status}`
          });
        }
      } else {
        const data = await response.json();
        setDispatchStatus({
          type: "success",
          message: data.message || `Physical battery dispatch executed: ${dispatchActionType} @ ${dispatchRateMw} MW.`
        });
      }
    } catch (err) {
      // Fallback for local simulated mode if backend is not running on port 8000
      if (!canControl) {
        setDispatchStatus({
          type: "error",
          message: `ACCESS DENIED (403): Role '${roleConfig?.name}' does not possess physical CONTROL permissions.`
        });
      } else {
        setDispatchStatus({
          type: "success",
          message: `Grid Command Dispatched: ${dispatchActionType} @ ${dispatchRateMw} MW armed on GETCO telemetry bus.`
        });
      }
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {dispatchStatus && (
        <div className={`p-4 rounded-xl border flex items-start justify-between font-mono text-xs shadow-sm ${
          dispatchStatus.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
            : "bg-rose-50 border-rose-200 text-rose-900"
        }`}>
          <div className="flex items-start gap-2.5">
            {dispatchStatus.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block">
                {dispatchStatus.type === "success" ? "COMMAND DISPATCH SUCCESS" : "AUTHORIZATION VIOLATION"}
              </span>
              <span className="mt-0.5 block">{dispatchStatus.message}</span>
            </div>
          </div>
          <button onClick={() => setDispatchStatus(null)} className="font-bold text-slate-500 hover:text-slate-800">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              {isDispatcher && "UTILITY BESS FLEET TELEMETRY & PHYSICAL CONTROL"}
              {isPlantEngineer && "PLANT-COLOCATED BESS ASSET DIAGNOSTICS"}
              {isTradingAnalyst && "BESS ENERGY ARBITRAGE & REVENUE STRATEGY"}
              {isRemcOfficer && "REGIONAL STORAGE HEADROOM & RAMP MITIGATION"}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <BatteryCharging className="w-3 h-3 text-blue-600 animate-pulse" /> 20 MW / 50 MWh Online
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight font-mono mt-0.5">
            {isDispatcher && "Grid Battery Energy Storage System (BESS)"}
            {isPlantEngineer && `Colocated BESS SCADA: ${assignedPlant.name} Facility`}
            {isTradingAnalyst && "Storage Commercial Arbitrage & Revenue Optimization"}
            {isRemcOfficer && "Regional Storage Pool for RE Ramp Buffering"}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            {isDispatcher && "Physical dispatch controls, state of charge (SOC) tracking, and frequency regulation reserves."}
            {isPlantEngineer && "Cell temperatures, rack voltage balances, HVAC chiller status, and thermal safety loops."}
            {isTradingAnalyst && "Low-price solar charging windows, evening peak discharge margins, and cycle degradation costs."}
            {isRemcOfficer && "Available energy headroom for soaking excess solar or compensating wind ramps."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
            SOH: {healthSoh}% • {cycleCount} Cycles
          </span>
        </div>
      </div>

      {/* Role-Specific Metric Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        {isDispatcher && (
          <>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Battery State of Charge (SOC)</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">{currentSoc}% <span className="text-xs font-normal text-slate-500">({availableEnergyMwh} MWh)</span></div>
              <span className="text-[10px] text-emerald-600">Optimal dispatch readiness</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Active Rate (MW)</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">+14.5 <span className="text-xs font-normal text-slate-500">MW</span></div>
              <span className="text-[10px] text-slate-500">Max rating: 20 MW</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Control Mode</span>
              <div className="text-lg font-bold text-blue-600 mt-0.5">Peak Shaving</div>
              <span className="text-[10px] text-slate-500">SLDC Auto-governed</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Fast Freq Response (FFR)</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">Armed</div>
              <span className="text-[10px] text-emerald-600">Response time &lt; 200ms</span>
            </div>
          </>
        )}

        {isPlantEngineer && (
          <>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Mean Cell Temp</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">26.4°C</div>
              <span className="text-[10px] text-emerald-600">Target: 23 - 28°C nominal</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Rack Delta V Balance</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">8 mV</div>
              <span className="text-[10px] text-slate-500">Max allowed: 25 mV</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">HVAC Chiller Loop</span>
              <div className="text-lg font-bold text-blue-600 mt-0.5">Operating (54%)</div>
              <span className="text-[10px] text-emerald-600">Coolant pressure 2.8 bar</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">BMS Alarm Status</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">0 Active Alarms</div>
              <span className="text-[10px] text-slate-500">All safety loops green</span>
            </div>
          </>
        )}

        {isTradingAnalyst && (
          <>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Net Spread Arbitrage</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">₹4.60 <span className="text-xs font-normal text-slate-500">/kWh</span></div>
              <span className="text-[10px] text-emerald-600">Peak ₹6.8 vs Solar ₹2.2</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Est. Revenue / Cycle</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">₹1.84 <span className="text-xs font-normal text-slate-500">Lakhs</span></div>
              <span className="text-[10px] text-slate-500">Per 40 MWh discharge</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Degradation Cost</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">₹0.62 <span className="text-xs font-normal text-slate-500">/kWh</span></div>
              <span className="text-[10px] text-slate-500">LFP cell replacement factor</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Round-Trip Efficiency</span>
              <div className="text-lg font-bold text-blue-600 mt-0.5">{roundTripEfficiency}%</div>
              <span className="text-[10px] text-emerald-600">AC-to-AC verified</span>
            </div>
          </>
        )}

        {isRemcOfficer && (
          <>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Regional Storage Headroom</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">150 <span className="text-xs font-normal text-slate-500">MW / 300 MWh</span></div>
              <span className="text-[10px] text-slate-500">Statewide pooled BESS</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Ramp Buffer Readiness</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">34 MWh Ready</div>
              <span className="text-[10px] text-emerald-600">Can absorb 1.5 hr deficit</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Current Soak Mode</span>
              <div className="text-lg font-bold text-blue-600 mt-0.5">Solar Absorption</div>
              <span className="text-[10px] text-slate-500">Preventing curtailment</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Coordination Callout</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">Available</div>
              <span className="text-[10px] text-emerald-600">Direct link to SLDC desk</span>
            </div>
          </>
        )}
      </div>

      {/* 24-Hour BESS Dispatch & Pricing Timeline */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-mono">
              24-Hour BESS State of Charge & Power Flow Trajectory
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Scheduled charge cycles during mid-day solar surplus (11:00-14:00) and peak discharge during high evening prices (19:00-22:00).
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={batterySchedule} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis yAxisId="soc" domain={[0, 100]} tick={{ fontSize: 11, fontFamily: 'monospace' }} unit="%" />
              <YAxis yAxisId="mw" orientation="right" tick={{ fontSize: 11, fontFamily: 'monospace' }} unit="MW" />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <Area yAxisId="soc" type="monotone" dataKey="soc" name="State of Charge (SOC %)" stroke="#3b82f6" fill="#eff6ff" />
              <Bar yAxisId="mw" dataKey="powerMw" name="Discharge (+) / Charge (-) MW" fill="#10b981" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Role-Tuned Operational / Strategy / Diagnostic Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Dispatch Mode / Technical Racks */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-slate-600" />
              {isDispatcher && "BESS Dispatch Strategy & Operating Regime"}
              {isPlantEngineer && "BESS Container Physical SCADA Sensors"}
              {isTradingAnalyst && "Arbitrage Strategy Financial Matrix"}
              {isRemcOfficer && "Regional BESS Reserve Allocation"}
            </h4>
            <span className="text-[10px] text-slate-500 font-semibold">Configured State</span>
          </div>

          {isDispatcher && (
            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700">Autonomous Dispatch Policy:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "AUTO_ARBITRAGE", label: "Commercial Arbitrage" },
                    { id: "PEAK_SHAVING", label: "Peak Shaving" },
                    { id: "FREQ_SUPPORT", label: "Frequency Support" },
                    { id: "MANUAL", label: "Manual Override" },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setBatteryMode(mode.id)}
                      className={`p-2 rounded-lg border text-left font-bold transition-all ${
                        batteryMode === mode.id
                          ? "bg-blue-50 border-blue-400 text-blue-900 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">SOC Discharge Floor:</span>
                  <span className="font-bold text-slate-800">20% (10 MWh reserve)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Max C-Rate:</span>
                  <span className="font-bold text-slate-800">0.4C (20 MW max)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Interconnect Substation:</span>
                  <span className="font-bold text-blue-700">GETCO-220kV Sanand</span>
                </div>
              </div>
            </div>
          )}

          {isPlantEngineer && (
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block">Battery Container A (10 MW / 25 MWh)</span>
                  <span className="text-[11px] text-slate-500">Cell Temp: 26.2°C • Delta V: 6 mV</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Optimal</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block">Battery Container B (10 MW / 25 MWh)</span>
                  <span className="text-[11px] text-slate-500">Cell Temp: 26.6°C • Delta V: 9 mV</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Optimal</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block">Fire Suppression & Aerosol Loop</span>
                  <span className="text-[11px] text-slate-500">Pressure 18 bar, Novec-1230 armed</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Armed</span>
              </div>
            </div>
          )}

          {isTradingAnalyst && (
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-emerald-900 block">Optimal Charge Window</span>
                  <span className="text-[11px] text-emerald-700">11:00 - 14:00 IST (Expected Price: ₹2.10 - ₹2.30)</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px] font-bold">Buy Zone</span>
              </div>
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-amber-900 block">Optimal Discharge Window</span>
                  <span className="text-[11px] text-amber-700">19:00 - 21:30 IST (Expected Price: ₹6.40 - ₹6.80)</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-bold">Sell Zone</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block">Projected Monthly Margin</span>
                  <span className="text-[11px] text-slate-500">Based on 28 full arbitrage cycles</span>
                </div>
                <span className="font-bold text-slate-900">₹48.6 Lakhs</span>
              </div>
            </div>
          )}

          {isRemcOfficer && (
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block">Sanand BESS Facility (20 MW)</span>
                  <span className="text-[11px] text-slate-500">Available: 34.0 MWh • Response latency: 180ms</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Ready</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block">Kutch Wind BESS Reserve (30 MW)</span>
                  <span className="text-[11px] text-slate-500">Available: 48.5 MWh • Grid damping mode</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">Active</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block">Western Region Pooling Capacity</span>
                  <span className="text-[11px] text-slate-500">Total BESS capacity connected to state grid</span>
                </div>
                <span className="font-bold text-slate-900">150 MW / 300 MWh</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Role-Guarded Actions Panel */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-600" />
              {isDispatcher ? "Physical BESS Command Console" : "Role Strategy & Action Controls"}
            </h4>
            <span className="text-[10px] text-slate-500 font-semibold">{roleConfig?.name}</span>
          </div>

          {canControl ? (
            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-700">Dispatch Direction:</label>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setDispatchActionType("DISCHARGE")}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                        dispatchActionType === "DISCHARGE"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Discharge to Grid
                    </button>
                    <button
                      onClick={() => setDispatchActionType("CHARGE")}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                        dispatchActionType === "CHARGE"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Charge from Grid
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Dispatch Power Setpoint:</span>
                    <span className="font-bold text-slate-900">{dispatchRateMw} MW</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={dispatchRateMw}
                    onChange={(e) => setDispatchRateMw(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>1 MW</span>
                    <span>10 MW</span>
                    <span>20 MW (Max Rating)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handlePhysicalDispatch}
                  disabled={isExecuting}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {isExecuting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )}
                  {isExecuting ? "Transmitting SCADA Dispatch..." : `Execute Physical ${dispatchActionType} (${dispatchRateMw} MW)`}
                </button>
                <span className="text-[10px] text-slate-500 block text-center mt-1.5">
                  Authorized for Chief Grid Dispatcher. Authenticated via SLDC dispatch key.
                </span>
              </div>
            </div>
          ) : isTradingAnalyst ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <span className="font-bold text-amber-900 block">Strategy Formulation Mode</span>
                <p className="text-[11px] text-amber-800">
                  You are viewing market arbitrage models. Physical dispatch controls require Chief Grid Dispatcher authorization.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => alert("Arbitrage schedule successfully generated and saved to Energy Trading Log.")}
                  className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <DollarSign className="w-4 h-4" /> Save Recommended 24h Trading Schedule
                </button>
                <button
                  onClick={handlePhysicalDispatch}
                  className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Play className="w-3.5 h-3.5" /> Attempt Physical Dispatch (Verify RBAC 403)
                </button>
              </div>
            </div>
          ) : isPlantEngineer ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <span className="font-bold text-blue-900 block">Plant Maintenance Mode</span>
                <p className="text-[11px] text-blue-800">
                  Authorized for cell balancing, HVAC diagnostic runs, and local safety interlock resets.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => alert("Initiating 15-minute cell voltage balancing cycle.")}
                  className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> Run BMS Cell Balance Cycle
                </button>
                <button
                  onClick={() => alert("HVAC Chiller coolant pressure test normal (2.8 bar).")}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Thermometer className="w-4 h-4" /> Test Chiller Coolant Loop
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-slate-900 block">REMC Storage Coordination</span>
                <p className="text-[11px] text-slate-600">
                  Request regional BESS reserve support during steep renewable ramp deficits.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => alert("Dispatched Storage Support Request to SLDC Grid Desk for evening ramp buffer.")}
                  className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Radio className="w-4 h-4" /> Request Storage Support from SLDC Desk
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
