import React from "react";
import { useApp } from "../context/AppContext";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function Forecast() {
  const { forecastData, horizon, setHorizon } = useApp();
  const schedule = forecastData?.hourly_schedule || [];

  const chartData = schedule.map(s => ({
    time: s.timestamp.replace("2026-", ""),
    Solar: s.solar_generation_mw,
    Wind: s.wind_generation_mw,
    TotalRE: s.total_renewable_mw,
    Demand: s.grid_demand_mw,
    Delta: s.grid_balance_mw
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            HIGH-RESOLUTION TIME SERIES
          </span>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight font-mono">
            Solar + Wind Generation vs. Demand
          </h2>
        </div>

        {/* Horizon selector: 24h, 48h, 72h */}
        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-200 p-1 rounded-xl flex items-center font-mono text-xs shadow-2xs">
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
                {h} Hours
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Chart */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
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
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} interval={horizon === 72 ? 5 : 2} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit=" MW" domain={[0, 180]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#ffffff", 
                  borderColor: "#e2e8f0", 
                  borderRadius: "12px", 
                  fontSize: "12px", 
                  color: "#0f172a", 
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  fontFamily: "monospace"
                }}
                formatter={(val, name) => [`${Number(val).toFixed(1)} MW`, name]}
              />
              <Area type="monotone" dataKey="Solar" stackId="1" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#fcSolar)" />
              <Area type="monotone" dataKey="Wind" stackId="1" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#fcWind)" />
              <Area type="monotone" dataKey="Demand" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dispatch Schedule Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
            Operational Hourly Dispatch Ledger
          </h3>
          <span className="text-xs text-slate-500 font-mono">Showing next {horizon} hourly intervals</span>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 sticky top-0 border-b border-slate-200">
              <tr>
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3 text-amber-700">SOLAR (MW)</th>
                <th className="p-3 text-blue-700">WIND (MW)</th>
                <th className="p-3 text-slate-900">TOTAL RE (MW)</th>
                <th className="p-3 text-rose-600">DEMAND (MW)</th>
                <th className="p-3">DELTA (MW)</th>
                <th className="p-3">STATUS</th>
                <th className="p-3">RECOMMENDED DISPATCH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedule.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-slate-800 font-semibold">{row.timestamp}</td>
                  <td className="p-3 text-amber-700 font-bold">{row.solar_generation_mw.toFixed(1)}</td>
                  <td className="p-3 text-blue-700 font-bold">{row.wind_generation_mw.toFixed(1)}</td>
                  <td className="p-3 font-bold text-slate-900">{row.total_renewable_mw.toFixed(1)}</td>
                  <td className="p-3 text-slate-600">{row.grid_demand_mw.toFixed(1)}</td>
                  <td className={`p-3 font-bold ${row.grid_balance_mw >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {row.grid_balance_mw >= 0 ? `+${row.grid_balance_mw.toFixed(1)}` : row.grid_balance_mw.toFixed(1)}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      row.system_status === "DEFICIT" ? "bg-rose-50 text-rose-700 border-rose-200" :
                      row.system_status === "SURPLUS" ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    }`}>
                      {row.system_status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700">{row.dispatch_advisory}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
