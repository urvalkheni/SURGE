import React from 'react';
import { Sun, Wind, BatteryCharging, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SituationCard({ currentPoint }) {
  if (!currentPoint) return null;

  const {
    solar_generation_mw = 0,
    wind_generation_mw = 0,
    total_renewable_mw = 0,
    grid_demand_mw = 0,
    grid_balance_mw = 0,
    system_status = 'BALANCED'
  } = currentPoint;

  const isSurplus = system_status === 'SURPLUS';
  const isDeficit = system_status === 'DEFICIT';

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">CURRENT OPERATING SITUATION</span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Generation vs. Grid Demand</h2>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold font-mono border ${
          isDeficit 
            ? 'bg-rose-50 text-rose-700 border-rose-200' 
            : isSurplus 
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          {isDeficit ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{isDeficit ? 'DEFICIT RISK' : isSurplus ? 'EXCESS SURPLUS' : 'BALANCED GRID'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        {/* Total Renewable Generation */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-between font-medium">
            <span>Renewable Power</span>
            <div className="flex gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <Wind className="w-3.5 h-3.5 text-cyan-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {total_renewable_mw.toFixed(1)} <span className="text-sm font-sans text-slate-500 font-normal">MW</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex justify-between font-mono">
            <span className="text-amber-700 font-semibold">☀️ Solar: {solar_generation_mw.toFixed(1)}</span>
            <span className="text-cyan-700 font-semibold">💨 Wind: {wind_generation_mw.toFixed(1)}</span>
          </div>
        </div>

        {/* Expected Demand */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-xs text-slate-500 mb-1 font-medium">Expected Demand</div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {grid_demand_mw.toFixed(1)} <span className="text-sm font-sans text-slate-500 font-normal">MW</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Rajasthan Discom Scheduled Load</p>
        </div>

        {/* Net Grid Balance */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-xs text-slate-500 mb-1 font-medium">Net Power Delta</div>
          <div className={`text-2xl font-bold font-mono ${grid_balance_mw >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {grid_balance_mw >= 0 ? `+${grid_balance_mw.toFixed(1)}` : grid_balance_mw.toFixed(1)}{' '}
            <span className="text-sm font-sans text-slate-500 font-normal">MW</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {grid_balance_mw >= 0 ? 'Available for Storage/Export' : 'Shortfall Requiring Discharge'}
          </p>
        </div>

        {/* Hybrid Capacity Utilization */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-xs text-slate-500 mb-1 font-medium">Capacity Utilization</div>
          <div className="text-2xl font-bold text-blue-600 font-mono">
            {((total_renewable_mw / 200.0) * 100).toFixed(1)}%
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (total_renewable_mw / 200.0) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
