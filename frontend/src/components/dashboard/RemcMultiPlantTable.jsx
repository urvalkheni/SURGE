import React, { useState } from "react";
import { MULTI_PLANT_DATA } from "../../config/roles";
import { Factory, AlertTriangle, CheckCircle2, ChevronRight, X, ExternalLink, Activity, ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function RemcMultiPlantTable({ onSelectPlant }) {
  const [selectedPlant, setSelectedPlant] = useState(null);

  const totalCapacity = MULTI_PLANT_DATA.reduce((sum, p) => sum + p.capacityMw, 0);
  const totalActual = MULTI_PLANT_DATA.reduce((sum, p) => sum + p.actualMw, 0);
  const totalForecast = MULTI_PLANT_DATA.reduce((sum, p) => sum + p.forecastMw, 0);
  const totalSchedule = MULTI_PLANT_DATA.reduce((sum, p) => sum + p.scheduleMw, 0);
  const totalDeviation = Number((totalActual - totalSchedule).toFixed(1));

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
              STATEWIDE MULTI-PLANT REGISTRY
            </span>
            <span className="text-xs text-slate-500 font-mono">6 Connected Key Assets</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight font-sans mt-1">
            REMC Regional Monitoring & Deviation Ledger
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">NET DEVIATION</span>
            <span className={`font-bold ${totalDeviation < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {totalDeviation} MW
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-50/80 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
            <tr>
              <th className="p-3.5 pl-5">Plant Name</th>
              <th className="p-3.5">Type</th>
              <th className="p-3.5 text-right font-mono">Actual</th>
              <th className="p-3.5 text-right font-mono">Forecast</th>
              <th className="p-3.5 text-right font-mono">Schedule</th>
              <th className="p-3.5 text-right font-mono">Deviation</th>
              <th className="p-3.5 text-center">Risk Level</th>
              <th className="p-3.5 text-right pr-5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MULTI_PLANT_DATA.map((plant) => {
              const isNeg = plant.deviationMw < 0;
              const riskColor = plant.riskLevel === 'High' 
                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                : plant.riskLevel === 'Medium' 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200';

              return (
                <tr 
                  key={plant.id}
                  onClick={() => setSelectedPlant(plant)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="p-3.5 pl-5">
                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                      <Factory className="w-3.5 h-3.5 text-slate-400" />
                      <span>{plant.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{plant.location}</div>
                  </td>
                  <td className="p-3.5">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${plant.type.includes('Solar') ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                      {plant.type}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                    {plant.actualMw.toFixed(1)} MW
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-600">
                    {plant.forecastMw.toFixed(1)} MW
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-600">
                    {plant.scheduleMw.toFixed(1)} MW
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold">
                    <span className={`inline-flex items-center gap-0.5 ${isNeg ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isNeg ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      {plant.deviationMw > 0 ? `+${plant.deviationMw}` : plant.deviationMw} MW
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${riskColor}`}>
                      {plant.riskLevel}
                    </span>
                  </td>
                  <td className="p-3.5 text-right pr-5">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlant(plant);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      <span>Drill Down</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Drill-down Modal */}
      {selectedPlant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-lg w-full space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-purple-700 font-bold px-2 py-0.5 rounded bg-purple-50 border border-purple-200">
                  REMC ASSET DRILL DOWN
                </span>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1">{selectedPlant.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedPlant.location} · {selectedPlant.gridNode}</p>
              </div>
              <button 
                onClick={() => setSelectedPlant(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs py-2 border-y border-slate-100">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block">INSTALLED CAPACITY</span>
                <span className="text-lg font-bold text-slate-900">{selectedPlant.capacityMw} MW</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block">REAL-TIME INJECTION</span>
                <span className="text-lg font-bold text-emerald-600">{selectedPlant.actualMw} MW</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block">DISPATCH DEVIATION</span>
                <span className={`text-lg font-bold ${selectedPlant.deviationMw < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {selectedPlant.deviationMw} MW
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block">AVAILABILITY</span>
                <span className="text-lg font-bold text-blue-600">{selectedPlant.availabilityPct}%</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Inverters / Turbines Online:</span>
                <span className="font-semibold text-slate-800">{selectedPlant.invertersOnline}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Weather Impact On Output:</span>
                <span className="font-semibold text-rose-600">{selectedPlant.weatherImpactMw} MW</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Predicted Capacity Factor (CUF):</span>
                <span className="font-semibold text-slate-800">{selectedPlant.cufPct}%</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedPlant(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
