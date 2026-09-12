import React, { useState } from "react";
import { 
  Zap, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  Gauge, 
  Cpu, 
  Radio, 
  DollarSign, 
  CheckCircle2, 
  ArrowUpRight, 
  Sliders, 
  Layers,
  Building2,
  RefreshCw
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

export default function GridDemand() {
  const { forecastData, selectedState, assignedPlant } = useApp();
  const { activeRoleId, isDispatcher, isPlantEngineer, isTradingAnalyst, isRemcOfficer, canControl } = useAuth();

  const [simulatedAction, setSimulatedAction] = useState(null);
  const [selectedHorizon, setSelectedHorizon] = useState("24h");

  const schedule = forecastData?.hourly_schedule || [];
  
  // Format hourly grid data
  const chartData = schedule.slice(0, selectedHorizon === "24h" ? 24 : 48).map((item, idx) => {
    const demand = item.demand_mw || Math.round(180 + Math.sin((idx / 24) * Math.PI * 2) * 50 + (idx >= 18 && idx <= 22 ? 60 : 0));
    const reGen = Math.round(item.total_generation_mw || (item.solar_generation_mw || 0) + (item.wind_generation_mw || 0));
    const netDemand = Math.max(0, demand - reGen);
    const price = Number((item.price_per_kwh || (3.2 + (netDemand > 120 ? 3.4 : netDemand > 80 ? 1.8 : 0.4))).toFixed(2));
    const reShare = demand > 0 ? Math.min(100, Math.round((reGen / demand) * 100)) : 0;
    
    // Frequency simulation (centered at 50.00 Hz)
    const freq = Number((50.0 + (reGen > demand ? 0.04 : -0.05 * (netDemand / 100))).toFixed(2));
    
    return {
      time: item.time ? item.time.split("T")[1]?.slice(0, 5) || `${String(idx).padStart(2, '0')}:00` : `${String(idx).padStart(2, '0')}:00`,
      demand,
      reGen,
      netDemand,
      price,
      reShare,
      freq,
      busVoltage: Number((220.0 + (Math.sin(idx) * 1.5)).toFixed(1))
    };
  });

  const handleAction = (actionName) => {
    setSimulatedAction(`Triggered: ${actionName}. Dispatched to SLDC Telemetry Node.`);
    setTimeout(() => setSimulatedAction(null), 4500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {simulatedAction && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl flex items-center justify-between font-mono text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>{simulatedAction}</span>
          </div>
          <button onClick={() => setSimulatedAction(null)} className="text-blue-500 font-bold">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              {isDispatcher && "SLDC TRANSMISSION GRID DESPATCH & BALANCE"}
              {isPlantEngineer && "LOCAL SUBSTATION & GRID INTERCONNECT"}
              {isTradingAnalyst && "GRID DEMAND & POWER EXCHANGE ARBITRAGE"}
              {isRemcOfficer && "REGIONAL RE INTEGRATION & PENETRATION"}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-500 animate-pulse" /> 50.02 Hz Stable
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight font-mono mt-0.5">
            {isDispatcher && "State Load Despatch & Renewable Supply Dynamics"}
            {isPlantEngineer && `Local Grid Interconnect: ${assignedPlant.gridNode}`}
            {isTradingAnalyst && "Demand Trajectory & Peak Price Drivers"}
            {isRemcOfficer && "Statewide RE Penetration & Schedule Adherence"}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            {isDispatcher && "Balancing aggregate demand, spinning reserves, and physical transmission constraints."}
            {isPlantEngineer && "Monitoring local feeder voltage, bus stability, and SLDC curtailment signals."}
            {isTradingAnalyst && "Evaluating market clearing prices, peak deficit periods, and commercial procurement strategies."}
            {isRemcOfficer && "Tracking state RE share, net load ramp rates, and inter-state exchange quotas."}
          </p>
        </div>

        {/* Horizon toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-mono">
          {["24h", "48h"].map((h) => (
            <button
              key={h}
              onClick={() => setSelectedHorizon(h)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                selectedHorizon === h
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Next {h}
            </button>
          ))}
        </div>
      </div>

      {/* Role-Specific Metric Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        {isDispatcher && (
          <>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Current Grid Demand</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">18,450 <span className="text-xs font-normal text-slate-500">MW</span></div>
              <span className="text-[10px] text-emerald-600">Peak expected at 19:30 IST</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">RE Generation</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">6,310 <span className="text-xs font-normal text-slate-500">MW</span></div>
              <span className="text-[10px] text-slate-500">34.2% RE penetration</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Spinning Reserves</span>
              <div className="text-lg font-bold text-blue-600 mt-0.5">1,240 <span className="text-xs font-normal text-slate-500">MW</span></div>
              <span className="text-[10px] text-emerald-600">Compliant with IEGC norm</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">System Frequency</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">50.02 <span className="text-xs font-normal text-slate-500">Hz</span></div>
              <span className="text-[10px] text-emerald-600">Band: 49.90 - 50.05 Hz</span>
            </div>
          </>
        )}

        {isPlantEngineer && (
          <>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Substation Bus Voltage</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">221.4 <span className="text-xs font-normal text-slate-500">kV</span></div>
              <span className="text-[10px] text-emerald-600">Nominal 220 kV (±1.5%)</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Local Grid Frequency</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">50.02 <span className="text-xs font-normal text-slate-500">Hz</span></div>
              <span className="text-[10px] text-emerald-600">Inverter PLL synchronized</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">SLDC Curtailment Order</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">NONE (0 MW)</div>
              <span className="text-[10px] text-slate-500">Unrestricted injection</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Grid Compliance Score</span>
              <div className="text-lg font-bold text-blue-600 mt-0.5">99.8%</div>
              <span className="text-[10px] text-emerald-600">Zero harmonic infractions</span>
            </div>
          </>
        )}

        {isTradingAnalyst && (
          <>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Peak Clearing Demand</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">21,200 <span className="text-xs font-normal text-slate-500">MW</span></div>
              <span className="text-[10px] text-amber-600">High evening deficit</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">IEX Peak Spot Price</span>
              <div className="text-lg font-bold text-amber-600 mt-0.5">₹6.80 <span className="text-xs font-normal text-slate-500">/kWh</span></div>
              <span className="text-[10px] text-slate-500">Base: ₹3.20 /kWh</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Merchant Arbitrage Gap</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">+₹3.60 <span className="text-xs font-normal text-slate-500">/kWh</span></div>
              <span className="text-[10px] text-emerald-600">Optimal battery discharge window</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Commercial Deviation Risk</span>
              <div className="text-lg font-bold text-rose-600 mt-0.5">High</div>
              <span className="text-[10px] text-rose-600">₹4.2 Lakhs potential penalty</span>
            </div>
          </>
        )}

        {isRemcOfficer && (
          <>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">State RE Penetration</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">34.2%</div>
              <span className="text-[10px] text-slate-500">Target: 35.0% for today</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Net Load Ramp Rate</span>
              <div className="text-lg font-bold text-amber-600 mt-0.5">+48 <span className="text-xs font-normal text-slate-500">MW/min</span></div>
              <span className="text-[10px] text-amber-600">Sunset ramp active</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Pooled RE Deviation</span>
              <div className="text-lg font-bold text-rose-600 mt-0.5">-86.0 <span className="text-xs font-normal text-slate-500">MW</span></div>
              <span className="text-[10px] text-rose-600">Under-generation in North corridor</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Inter-State RE Flow</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">1,420 <span className="text-xs font-normal text-slate-500">MW</span></div>
              <span className="text-[10px] text-emerald-600">Exporting to Western Grid</span>
            </div>
          </>
        )}
      </div>

      {/* Role-Specific Primary Chart */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-mono">
              {isDispatcher && "State Load Curve vs Renewable Generation & Net Deficit"}
              {isPlantEngineer && "Local Substation Interconnect Voltage (kV) & System Frequency (Hz)"}
              {isTradingAnalyst && "Net Demand Deficit vs IEX Market Spot Price (₹/kWh)"}
              {isRemcOfficer && "Statewide RE Share % & Renewable Ramp Dynamics"}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {isDispatcher && "Hourly projection of baseline grid demand against pooled solar and wind feed-in."}
              {isPlantEngineer && "Bus voltage stability at GETCO 220kV interconnect compared against PLL lock frequency."}
              {isTradingAnalyst && "Correlation between renewable deficit and peak clearing prices on energy exchanges."}
              {isRemcOfficer && "Hourly proportion of renewable energy in the total state energy mix."}
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {isDispatcher ? (
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis yAxisId="mw" tick={{ fontSize: 11, fontFamily: 'monospace' }} unit="MW" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Area yAxisId="mw" type="monotone" dataKey="demand" name="Total Grid Demand" stroke="#64748b" fill="#f8fafc" />
                <Area yAxisId="mw" type="monotone" dataKey="reGen" name="Total RE Supply" stroke="#10b981" fill="#ecfdf5" />
                <Line yAxisId="mw" type="monotone" dataKey="netDemand" name="Net Deficit (Thermal / Imports)" stroke="#ef4444" strokeWidth={2} dot={false} />
              </ComposedChart>
            ) : isPlantEngineer ? (
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis yAxisId="v" domain={[215, 225]} tick={{ fontSize: 11, fontFamily: 'monospace' }} unit="kV" />
                <YAxis yAxisId="f" orientation="right" domain={[49.85, 50.15]} tick={{ fontSize: 11, fontFamily: 'monospace' }} unit="Hz" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Line yAxisId="v" type="monotone" dataKey="busVoltage" name="220kV Bus Voltage" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line yAxisId="f" type="monotone" dataKey="freq" name="Grid Frequency" stroke="#10b981" strokeWidth={2} dot={false} />
              </ComposedChart>
            ) : isTradingAnalyst ? (
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis yAxisId="mw" tick={{ fontSize: 11, fontFamily: 'monospace' }} unit="MW" />
                <YAxis yAxisId="price" orientation="right" tick={{ fontSize: 11, fontFamily: 'monospace' }} unit="₹" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Bar yAxisId="mw" dataKey="netDemand" name="Commercial Deficit (MW)" fill="#cbd5e1" />
                <Line yAxisId="price" type="monotone" dataKey="price" name="IEX Spot Price (₹/kWh)" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            ) : (
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis yAxisId="pct" domain={[0, 100]} tick={{ fontSize: 11, fontFamily: 'monospace' }} unit="%" />
                <YAxis yAxisId="mw" orientation="right" tick={{ fontSize: 11, fontFamily: 'monospace' }} unit="MW" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Area yAxisId="pct" type="monotone" dataKey="reShare" name="RE Penetration Share %" stroke="#059669" fill="#d1fae5" />
                <Line yAxisId="mw" type="monotone" dataKey="reGen" name="Pooled RE Generation (MW)" stroke="#0284c7" strokeWidth={2} dot={false} />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Role-Specific Action & Diagnostic Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: Operational Directives / Substation Health */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-600" />
              {isDispatcher && "Active SLDC Grid Despatch Protocols"}
              {isPlantEngineer && "Local Substation Feeder & Breaker Matrix"}
              {isTradingAnalyst && "Market Settlement & Demand Bid Windows"}
              {isRemcOfficer && "Regional RE Coordination Directives"}
            </h4>
            <span className="text-[10px] text-slate-500 font-semibold">Real-Time State</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {isDispatcher && (
              <>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block">Spinning Reserve Margin</span>
                    <span className="text-[11px] text-slate-500">1,240 MW synchronized across thermal peakers & hydro</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Compliant</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block">Inter-Regional Corridors</span>
                    <span className="text-[11px] text-slate-500">Western to Northern Grid Import: 450 MW available</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">Clear</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block">Automatic Demand Management (ADMS)</span>
                    <span className="text-[11px] text-slate-500">Armed for frequency drops below 49.70 Hz</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">Armed</span>
                </div>
              </>
            )}

            {isPlantEngineer && (
              <>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block">GETCO 220kV Main Bus 1</span>
                    <span className="text-[11px] text-slate-500">Feeder 220-1 Closed / Nominal (Current: 382 A)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Closed</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block">GETCO 220kV Transfer Bus 2</span>
                    <span className="text-[11px] text-slate-500">Feeder 220-2 Standby / Synchronized</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">Standby</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block">Lightning Arrester & Earth Switch</span>
                    <span className="text-[11px] text-slate-500">Leakage current normal (&lt; 150 µA)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Healthy</span>
                </div>
              </>
            )}

            {isTradingAnalyst && (
              <>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block">IEX DAM Gate Closure</span>
                    <span className="text-[11px] text-slate-500">Day-Ahead bidding window closes 12:00 IST</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">Upcoming</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block">RTM Block 44 Arbitrage</span>
                    <span className="text-[11px] text-slate-500">Spread: ₹2.25/kWh over baseline cost</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">+18% ROI</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block">G-DAM Green Power Premium</span>
                    <span className="text-[11px] text-slate-500">Trading at ₹0.40 premium over conventional DAM</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">Active</span>
                </div>
              </>
            )}

            {isRemcOfficer && (
              <>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block">North Corridor Wind Ramp Down</span>
                    <span className="text-[11px] text-slate-500">Jaisalmer generation drops by 44 MW over 30 mins</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">Action Needed</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block">Charanka Solar Mid-Day Peak</span>
                    <span className="text-[11px] text-slate-500">Forecast matching schedule within 1.4% margin</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Compliant</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block">CERC Band Tolerance Violation</span>
                    <span className="text-[11px] text-slate-500">0 of 6 pooling stations exceeding 15% band</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Zero Penalties</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Card: Authorized Control Actions */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-600" />
              Role Authorized Actions
            </h4>
            <span className="text-[10px] text-slate-500 font-semibold">{roleConfig?.name}</span>
          </div>

          <div className="space-y-3 text-xs">
            {canControl ? (
              <>
                <p className="text-slate-600 text-[11px]">
                  Authorized for physical grid dispatch directives and reserve scheduling.
                </p>
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => handleAction("Spinning Peaker Ramp-Up (150 MW)")}
                    className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Zap className="w-4 h-4" /> Despatch Quick Peaker Reserve (150 MW)
                  </button>
                  <button
                    onClick={() => handleAction("Deploy Automated BESS Fast Frequency Response")}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Activity className="w-4 h-4" /> Arm BESS Fast Frequency Response (FFR)
                  </button>
                  <button
                    onClick={() => handleAction("Issue State-Wide Voluntary Load Curtailment Notice")}
                    className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Transmit SLDC Demand Alert
                  </button>
                </div>
              </>
            ) : isPlantEngineer ? (
              <>
                <p className="text-slate-600 text-[11px]">
                  Authorized for plant-level breaker controls, reactive power adjustment, and local SCADA telemetry sync.
                </p>
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => handleAction("Sync Local Inverter PLL with GETCO Bus")}
                    className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <RefreshCw className="w-4 h-4" /> Resynchronize Plant PLL Telemetry
                  </button>
                  <button
                    onClick={() => handleAction("Adjust Inverter Power Factor to 0.98 Lagging")}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Cpu className="w-4 h-4" /> Adjust Reactive Power (Q / VAR)
                  </button>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-500">
                    ℹ️ SLDC dispatch commands are read-only. Physical grid breaker actions require SLDC code approval.
                  </div>
                </div>
              </>
            ) : isTradingAnalyst ? (
              <>
                <p className="text-slate-600 text-[11px]">
                  Commercial simulation & power purchase portfolio adjustments.
                </p>
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => handleAction("Export Day-Ahead Schedule to IEX DAM Portal")}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <DollarSign className="w-4 h-4" /> Commit DAM Bid Package (₹4.2 Cr)
                  </button>
                  <button
                    onClick={() => handleAction("Simulate 20 MW Merchant Battery Dispatch ROI")}
                    className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <TrendingUp className="w-4 h-4" /> Run RTM Price Arbitrage Model
                  </button>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-500">
                    🔒 Physical grid dispatch commands are restricted to Grid Dispatchers.
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-slate-600 text-[11px]">
                  REMC desk coordination and inter-agency notification dispatch.
                </p>
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => handleAction("Issue Deviation Warning to Jaisalmer Wind Desk")}
                    className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <AlertTriangle className="w-4 h-4" /> Transmit Deviation Warning Notice
                  </button>
                  <button
                    onClick={() => handleAction("Publish Regional RE Schedule Revision (Rev-4)")}
                    className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Radio className="w-4 h-4" /> Publish RE Schedule Revision (Rev-4)
                  </button>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-500">
                    ℹ️ REMC acts as coordinator with SLDC and Regional Load Despatch Centres (RLDC).
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
