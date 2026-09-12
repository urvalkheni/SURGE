import React from "react";
import { ArrowRight } from "lucide-react";

export default function Next12HoursTimeline({ schedule, onViewAll }) {
  // Extract key milestone checkpoints from schedule or fallback smoothly
  const pointNow = schedule?.[0] || {};
  const point12 = schedule?.find(s => s.timestamp?.includes("12:00")) || schedule?.[12] || {};
  const point15 = schedule?.find(s => s.timestamp?.includes("15:00")) || schedule?.[15] || {};
  const point18 = schedule?.find(s => s.timestamp?.includes("18:00")) || schedule?.[18] || {};
  const point21 = schedule?.find(s => s.timestamp?.includes("21:00")) || schedule?.[21] || {};

  const items = [
    {
      time: "Now",
      label: "Stable Generation",
      mw: pointNow.total_renewable_mw?.toFixed(0) || "149",
      dotColor: "bg-emerald-500 ring-emerald-100",
      textColor: "text-slate-800",
      highlight: false
    },
    {
      time: "12:00",
      label: "Midday Solar Peak (+28%)",
      mw: point12.total_renewable_mw?.toFixed(0) || "164",
      dotColor: "bg-emerald-500 ring-emerald-100",
      textColor: "text-slate-800",
      highlight: false
    },
    {
      time: "15:00",
      label: "Afternoon Transition",
      mw: point15.total_renewable_mw?.toFixed(0) || "146",
      dotColor: "bg-blue-400 ring-blue-100",
      textColor: "text-slate-800",
      highlight: false
    },
    {
      time: "18:00",
      label: "Deficit Risk Begins",
      mw: point18.total_renewable_mw?.toFixed(0) || "12",
      dotColor: "bg-rose-500 ring-rose-100",
      textColor: "text-rose-600 font-semibold",
      highlight: true
    },
    {
      time: "21:00",
      label: "System Stabilizes",
      mw: point21.total_renewable_mw?.toFixed(0) || "88",
      dotColor: "bg-blue-500 ring-blue-100",
      textColor: "text-slate-800",
      highlight: false
    }
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 font-sans">
          Next 12 Hours
        </h3>
        <button 
          onClick={onViewAll}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Vertical Timeline */}
      <div className="relative py-2 space-y-4">
        {/* Continuous vertical connecting line */}
        <div className="absolute left-[54px] top-3 bottom-3 w-px bg-slate-200" />

        {items.map((item, idx) => (
          <div key={idx} className="relative flex items-center justify-between text-xs">
            {/* Time Column */}
            <span className="w-10 text-[11px] font-mono text-slate-400 text-right pr-2">
              {item.time}
            </span>

            {/* Node Dot */}
            <div className="relative z-10 mx-2">
              <div className={`w-2.5 h-2.5 rounded-full ring-4 ${item.dotColor}`} />
            </div>

            {/* Label and MW */}
            <div className="flex-1 flex items-center justify-between pl-1">
              <span className={`text-xs ${item.textColor}`}>
                {item.label}
              </span>
              <span className="text-xs font-mono font-bold text-slate-700 pl-2">
                {item.mw} MW
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
