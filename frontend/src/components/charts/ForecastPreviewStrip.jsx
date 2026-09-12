import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function ForecastPreviewStrip({ schedule }) {
  if (!schedule || schedule.length === 0) return null;

  const chartData = schedule.slice(0, 24).map(item => ({
    time: item.timestamp.split(" ")[1] || item.timestamp,
    Solar: item.solar_generation_mw,
    Wind: item.wind_generation_mw,
    Total: item.total_renewable_mw,
    Demand: item.grid_demand_mw,
    Balance: item.grid_balance_mw
  }));

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            LEVEL 2 • 24-HOUR GENERATION VS DEMAND TRAJECTORY
          </span>
          <h3 className="text-sm font-bold text-slate-900 font-mono">Renewable Feed Profile vs. Substation Baseline</h3>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
            <span className="text-slate-700">Solar PV</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" />
            <span className="text-slate-700">Wind Cluster</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 border-t-2 border-dashed border-rose-500 inline-block" />
            <span className="text-rose-600">Substation Demand</span>
          </div>
        </div>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSolarLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="colorWindLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} unit="MW" domain={[0, 160]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#ffffff", 
                borderColor: "#e2e8f0", 
                borderRadius: "10px", 
                fontSize: "11px", 
                color: "#0f172a",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                fontFamily: "monospace"
              }}
              formatter={(val, name) => [`${Number(val).toFixed(1)} MW`, name]}
            />
            <Area type="monotone" dataKey="Solar" stackId="1" stroke="#f59e0b" strokeWidth={1.5} fillOpacity={1} fill="url(#colorSolarLight)" />
            <Area type="monotone" dataKey="Wind" stackId="1" stroke="#2563eb" strokeWidth={1.5} fillOpacity={1} fill="url(#colorWindLight)" />
            <ReferenceLine y={85} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: "85 MW Baseline Load", fill: "#e11d48", fontSize: 9, position: "insideBottomRight" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
