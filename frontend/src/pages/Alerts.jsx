import React, { useState } from "react";
import { Clock, ArrowRight, AlertTriangle, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Alerts() {
  const [filter, setFilter] = useState("ALL");
  const { alerts, forecastData } = useApp();

  const activeLoc = forecastData?.selected_state || "Selected Grid";
  const filtered = (alerts || []).filter(a => filter === "ALL" || a.severity === filter);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            CHRONOLOGICAL RISK LEDGER
          </span>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight font-mono">
            Future Operational Risks & Grid Alerts
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-xl text-xs font-mono shadow-2xs">
          {["ALL", "CRITICAL", "WARNING"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === f ? "bg-blue-600 text-white font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(alert => {
          const isCritical = alert.severity === "CRITICAL";
          return (
            <div key={alert.id} className={`p-5 rounded-2xl bg-white border transition-all shadow-sm ${
              isCritical ? "border-rose-200 shadow-rose-50" : "border-amber-200"
            }`}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${
                      isCritical ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}>
                      {alert.severity} RISK
                    </span>
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {alert.timeWindow}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">{alert.title}</h3>
                </div>

                <div className="text-left md:text-right shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Uncertainty Bounds</span>
                  <div className="text-xs font-bold font-mono text-slate-800">{alert.uncertainty}</div>
                </div>
              </div>

              <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
                <div>
                  <span className="text-slate-500 font-bold">ROOT CAUSE: </span>
                  <span className="text-slate-800">{alert.cause}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-bold">RECOMMENDED MITIGATION: </span>
                  <span className="text-slate-800">{alert.recommendation}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
