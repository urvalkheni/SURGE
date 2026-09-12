import React, { useState } from "react";
import { 
  ShieldCheck, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Activity, 
  Cpu, 
  Filter,
  FileCheck,
  Percent
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from "recharts";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { MULTI_PLANT_DATA } from "../config/roles";

export default function Accuracy() {
  const { metrics, assignedPlant } = useApp();
  const { activeRoleId, roleConfig, isDispatcher, isPlantEngineer, isTradingAnalyst, isRemcOfficer } = useAuth();

  const [selectedHorizon, setSelectedHorizon] = useState("ALL");

  const solarMetrics = metrics?.solar_model?.evaluation_metrics || {
    "Test MAE (MW)": 0.661,
    "Test RMSE (MW)": 1.244,
    "Test nRMSE (%)": 1.24,
    "Test R²": 0.9982
  };

  const windMetrics = metrics?.wind_model?.metrics || {
    "Test MAE (MW)": 0.040,
    "Test RMSE (MW)": 0.064,
    "Test nRMSE (%)": 0.06,
    "Test R²": 0.9999
  };

  // REMC Multi-Plant Error Ranking Data
  const plantErrorComparison = [
    { name: "Bhadla Solar", nrmse: 1.84, maeMw: 4.8, status: "EXCELLENT", rank: 1, type: "Solar" },
    { name: "Pavagada Solar", nrmse: 2.12, maeMw: 8.2, status: "EXCELLENT", rank: 2, type: "Solar" },
    { name: "Sanand Hybrid", nrmse: 2.45, maeMw: 3.9, status: "GOOD", rank: 3, type: "Hybrid" },
    { name: "Charanka Solar", nrmse: 3.18, maeMw: 6.4, status: "GOOD", rank: 4, type: "Solar" },
    { name: "Kutch Wind", nrmse: 3.82, maeMw: 12.1, status: "GOOD", rank: 5, type: "Wind" },
    { name: "Jaisalmer Wind", nrmse: 7.42, maeMw: 18.5, status: "ATTENTION", rank: 6, type: "Wind" },
  ];

  // Loss waterfall for Plant Engineer
  const lossWaterfall = [
    { lossCategory: "Thermal Cell Derate", lossPct: 11.1, impactMwh: -138 },
    { lossCategory: "Array Soiling Loss", lossPct: 2.1, impactMwh: -26 },
    { lossCategory: "Inverter Clipping", lossPct: 1.4, impactMwh: -17 },
    { lossCategory: "DC Cable & Wiring", lossPct: 1.2, impactMwh: -15 },
    { lossCategory: "Transformer & Aux", lossPct: 0.8, impactMwh: -10 }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              {isDispatcher && "GRID SYSTEM RELIABILITY & FORECAST ACCURACY"}
              {isPlantEngineer && "PLANT PERFORMANCE RATIO & TECHNICAL LOSS ANALYSIS"}
              {isTradingAnalyst && "COMMERCIAL VALUE ADD & DSM PENALTY REALIZATION"}
              {isRemcOfficer && "REGIONAL MULTI-PLANT ERROR RANKING & CERC AUDIT"}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> CERC Compliant
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight font-mono mt-0.5">
            {isDispatcher && "Forecast Accuracy & Grid Reliability Metrics"}
            {isPlantEngineer && `Performance Ratio (PR) & Loss Waterfall: ${assignedPlant.name}`}
            {isTradingAnalyst && "Financial Realization & Commercial Deviation Economics"}
            {isRemcOfficer && "Statewide RE Plant Accuracy Ranking & Compliance Ledger"}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            {isDispatcher && "Evaluation of operational forecast precision, spinning reserve margin efficiency, and deficit warnings."}
            {isPlantEngineer && "Technical plant performance ratio (PR %), capacity utilization factor (CUF %), and losses."}
            {isTradingAnalyst && "Tracking deviation penalty savings, forecast value add (FVA), and price capture efficiency."}
            {isRemcOfficer && "Cross-plant comparative benchmarking under CERC regulatory guidelines across all 6 pooling nodes."}
          </p>
        </div>
      </div>

      {/* Role-Specific Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        {isDispatcher && (
          <>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Grid Forecast nRMSE</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">1.24%</div>
              <span className="text-[10px] text-slate-500">CERC Tolerance: &lt;10.0%</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Deficit Warning Precision</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">94.2%</div>
              <span className="text-[10px] text-emerald-600">Zero unannounced deficits</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Reserve Sizing Efficiency</span>
              <div className="text-lg font-bold text-blue-600 mt-0.5">98.1%</div>
              <span className="text-[10px] text-slate-500">Minimum peaker idling</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">System Security Index</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">99.94%</div>
              <span className="text-[10px] text-emerald-600">N-1 Contingency secure</span>
            </div>
          </>
        )}

        {isPlantEngineer && (
          <>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Performance Ratio (PR)</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">{assignedPlant.prPct}%</div>
              <span className="text-[10px] text-slate-500">Design baseline: 81.0%</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Capacity Factor (CUF)</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">{assignedPlant.cufPct}%</div>
              <span className="text-[10px] text-emerald-600">+1.2% above P50 budget</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Technical Loss Total</span>
              <div className="text-lg font-bold text-amber-600 mt-0.5">16.6%</div>
              <span className="text-[10px] text-slate-500">Thermal + Soiling + DC</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Inverter Fleet MTBF</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">3,240 hrs</div>
              <span className="text-[10px] text-emerald-600">99.4% availability</span>
            </div>
          </>
        )}

        {isTradingAnalyst && (
          <>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Forecast Value Add (FVA)</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">+₹4.24 <span className="text-xs font-normal text-slate-500">Lakhs/day</span></div>
              <span className="text-[10px] text-emerald-600">Over persistence baseline</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">DSM Penalties Avoided</span>
              <div className="text-lg font-bold text-blue-600 mt-0.5">₹12.80 <span className="text-xs font-normal text-slate-500">Lakhs</span></div>
              <span className="text-[10px] text-slate-500">This billing cycle</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">DAM Price Capture Rate</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">94.8%</div>
              <span className="text-[10px] text-emerald-600">Cleared vs scheduled</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Realized Tariffs</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">₹2.67 <span className="text-xs font-normal text-slate-500">/kWh</span></div>
              <span className="text-[10px] text-slate-500">Weighted average</span>
            </div>
          </>
        )}

        {isRemcOfficer && (
          <>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Pooled Fleet Error</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">2.68% nRMSE</div>
              <span className="text-[10px] text-emerald-600">Across 1,820 MW pool</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Spatial Diversity Gain</span>
              <div className="text-lg font-bold text-blue-600 mt-0.5">-42.4% Error</div>
              <span className="text-[10px] text-slate-500">Pooling smoothing effect</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">CERC Band Violations</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">0 Incidents</div>
              <span className="text-[10px] text-emerald-600">100% regulatory compliance</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Audit Ledger Status</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">Signed</div>
              <span className="text-[10px] text-slate-500">Ready for SLDC billing</span>
            </div>
          </>
        )}
      </div>

      {/* CERC Compliance Certificate Banner */}
      <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 font-mono">Central Electricity Regulatory Commission (CERC) Compliant</h3>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-xs font-bold border border-emerald-200">CERTIFIED</span>
            </div>
            <p className="text-xs text-slate-600 font-mono mt-1">
              Complies with Indian Grid Deviation Settlement Mechanism (DSM) tolerance (<strong className="text-emerald-700">&lt;10.0% nRMSE</strong>).
            </p>
          </div>
        </div>

        <div className="flex gap-4 font-mono text-xs text-right">
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <span className="text-slate-400 text-[10px]">SOLAR ERROR</span>
            <div className="text-emerald-700 font-bold text-sm">1.24% nRMSE</div>
          </div>
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <span className="text-slate-400 text-[10px]">WIND ERROR</span>
            <div className="text-emerald-700 font-bold text-sm">0.06% nRMSE</div>
          </div>
        </div>
      </div>

      {/* REMC Multi-Plant Ranking Table (for REMC & Dispatcher) */}
      {(isRemcOfficer || isDispatcher) && (
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Statewide Plant-by-Plant Error Ranking (CERC Deviation Benchmark)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated on 15-minute time-block telemetry against scheduled injection.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
              Pooled nRMSE: 2.68%
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 text-left">Rank</th>
                  <th className="py-2.5 px-3 text-left">Plant Name</th>
                  <th className="py-2.5 px-3 text-left">Resource</th>
                  <th className="py-2.5 px-right text-right">nRMSE (%)</th>
                  <th className="py-2.5 px-right text-right">MAE (MW)</th>
                  <th className="py-2.5 px-center text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {plantErrorComparison.map((p) => (
                  <tr key={p.name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">#{p.rank}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{p.name}</td>
                    <td className="py-2.5 px-3">{p.type}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{p.nrmse}%</td>
                    <td className="py-2.5 px-3 text-right">{p.maeMw} MW</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === "EXCELLENT" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : p.status === "GOOD"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Plant Operations Engineer: Loss Waterfall & PR Breakdown */}
      {isPlantEngineer && (
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Technical Generation Loss Waterfall ({assignedPlant.name})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakdown of losses preventing nominal theoretical standard test condition (STC) energy generation.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
              Net PR: {assignedPlant.prPct}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lossWaterfall} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" unit="%" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis type="category" dataKey="lossCategory" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }} />
                  <Bar dataKey="lossPct" name="Loss Percentage" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 block">Engineering Recovery Actions:</span>
              <div className="space-y-2">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Thermal Cell Cooling:</span>
                    <span className="text-[11px] text-slate-500">Backsheet ventilation optimization</span>
                  </div>
                  <span className="text-rose-600 font-bold">-11.1%</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Array Washing Recovery:</span>
                    <span className="text-[11px] text-slate-500">Robotic dry cleaning cycle scheduled</span>
                  </div>
                  <span className="text-emerald-600 font-bold">+2.1% Recoverable</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Inverter Sizing Optimization:</span>
                    <span className="text-[11px] text-slate-500">Clipping occurs only &gt; 1,020 W/m²</span>
                  </div>
                  <span className="text-slate-600 font-bold">-1.4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Benchmark Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-mono">Solar ML Holdout Evaluation</h3>
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            {Object.entries(solarMetrics).map(([k, v]) => (
              <div key={k} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block">{k}</span>
                <span className="text-base font-bold text-amber-700 mt-1 block">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-mono">Wind ML Holdout Evaluation</h3>
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            {Object.entries(windMetrics).map(([k, v]) => (
              <div key={k} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block">{k}</span>
                <span className="text-base font-bold text-blue-700 mt-1 block">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
