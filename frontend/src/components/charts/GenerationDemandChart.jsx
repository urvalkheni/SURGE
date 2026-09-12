import React, { useState } from "react";
import { 
  AreaChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceArea,
  ReferenceDot
} from "recharts";
import { LineChart as ChartIcon } from "lucide-react";

export default function GenerationDemandChart({ schedule, deficitWindowStr = "18:00 – 21:00" }) {
  const [activeTab, setActiveTab] = useState("24H");

  if (!schedule || schedule.length === 0) return null;

  const hoursCount = activeTab === "24H" ? 24 : activeTab === "48H" ? 48 : 72;
  const filteredSchedule = schedule.slice(0, hoursCount);

  // Format data for chart
  const data = filteredSchedule.map(item => {
    const rawTime = item.timestamp.split(" ")[1] || item.timestamp;
    const time = rawTime.substring(0, 5);
    return {
      time,
      rawTimestamp: item.timestamp,
      renewable: item.total_renewable_mw,
      solar: item.solar_generation_mw,
      wind: item.wind_generation_mw,
      demand: item.grid_demand_mw,
      balance: item.grid_balance_mw
    };
  });

  // Find peak renewable point for the Solar Peak callout
  const peakPoint = data.reduce((max, d) => d.renewable > max.renewable ? d : max, data[0] || { renewable: 0, time: "12:00" });

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      {/* Card Header with Title, Legend & Horizon Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
            <ChartIcon className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 font-sans">
            Generation vs Demand Forecast
          </h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-sans">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-600 text-[11px]">Renewable Generation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span className="text-slate-600 text-[11px]">Demand (Estimated)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded bg-rose-100 border border-rose-300 inline-block" />
            <span className="text-rose-600 text-[11px]">Deficit Period</span>
          </div>
        </div>

        {/* Horizon Filter Tabs */}
        <div className="flex items-center bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/60">
          {["24H", "48H", "72H"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === tab 
                  ? "bg-white text-blue-600 shadow-xs" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas with Callout Badges */}
      <div className="relative h-60 w-full">
        {/* Floating Callout Badge: Solar Peak */}
        <div 
          className="absolute top-4 left-[46%] -translate-x-1/2 z-10 bg-emerald-50/95 backdrop-blur-xs border border-emerald-300 px-2.5 py-1 rounded-lg text-[10px] font-sans text-emerald-800 shadow-2xs pointer-events-none flex items-center gap-1"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span><strong>Solar Peak</strong>: 12:00 – 14:30</span>
        </div>

        {/* Floating Callout Badge: Deficit Risk */}
        <div 
          className="absolute top-8 right-[14%] z-10 bg-rose-50/95 backdrop-blur-xs border border-rose-300 px-2.5 py-1 rounded-lg text-[10px] font-sans text-rose-700 shadow-2xs pointer-events-none flex items-center gap-1"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span><strong>Deficit Risk</strong>: {deficitWindowStr}</span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 15, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="renewGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.45}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02}/>
              </linearGradient>
            </defs>

            {/* Shaded Deficit Area between 18:00 and 21:00 */}
            <ReferenceArea 
              x1="18:00" 
              x2="21:00" 
              fill="#ffe4e6" 
              fillOpacity={0.5} 
              stroke="#f43f5e"
              strokeDasharray="3 3"
              strokeWidth={1}
            />

            <XAxis 
              dataKey="time" 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              interval={2}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              unit=" MW" 
              domain={[0, 'auto']} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#ffffff", 
                borderColor: "#e2e8f0", 
                borderRadius: "12px", 
                fontSize: "11px", 
                color: "#0f172a",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
                padding: "8px 12px"
              }}
              formatter={(val, name) => [
                `${Number(val).toFixed(1)} MW`, 
                name === "renewable" ? "Renewable Generation" : "Substation Demand"
              ]}
            />
            {/* Renewable Generation Smooth Green Area */}
            <Area 
              type="monotone" 
              dataKey="renewable" 
              stroke="#22c55e" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#renewGrad)" 
            />
            {/* Demand Smooth Blue Line */}
            <Line 
              type="monotone" 
              dataKey="demand" 
              stroke="#3b82f6" 
              strokeWidth={2} 
              strokeDasharray="4 3" 
              dot={false} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
