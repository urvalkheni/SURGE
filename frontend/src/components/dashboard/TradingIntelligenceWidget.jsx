import React, { useState } from "react";
import { Coins, TrendingUp, BatteryCharging, ArrowRight, Download, Sliders, CheckCircle2, FileSpreadsheet } from "lucide-react";

export default function TradingIntelligenceWidget() {
  const [bessMwh, setBessMwh] = useState(35);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const lowPrice = 3.10;
  const highPrice = 6.80;
  const spread = Number((highPrice - lowPrice).toFixed(2));
  const roundTripEfficiency = 0.88; // 88% RTE
  const chargeCost = bessMwh * 1000 * lowPrice;
  const dischargeRevenue = (bessMwh * roundTripEfficiency) * 1000 * highPrice;
  const netArbitrageProfit = Math.round(dischargeRevenue - chargeCost);

  const handleExport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
            COMMERCIAL DISPATCH & ARBITRAGE
          </span>
          <h3 className="text-base font-bold text-slate-900 tracking-tight mt-1">
            Day-Ahead Price Spreads & Battery Arbitrage Intelligence
          </h3>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer shrink-0"
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Schedule Exported!</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Export DAM Schedule</span>
            </>
          )}
        </button>
      </div>

      {/* Trading Window Comparison Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Window 1: Charge Solar Trough */}
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 font-mono">12:00 MIDDAY TROUGH</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              CHARGE BESS
            </span>
          </div>
          <div className="flex items-baseline justify-between text-xs font-mono pt-1">
            <span className="text-slate-600">Expected Solar Generation:</span>
            <span className="font-bold text-slate-900">96.0 MW</span>
          </div>
          <div className="flex items-baseline justify-between text-xs font-mono">
            <span className="text-slate-600">IEX Market Clearing Price:</span>
            <span className="font-bold text-emerald-700">₹3.10 / kWh</span>
          </div>
          <p className="text-[11px] text-slate-500 pt-1 font-sans">
            Solar generation peak depresses regional exchange price. Ideal window to charge 35 MWh storage.
          </p>
        </div>

        {/* Window 2: Discharge Evening Peak */}
        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-800 font-mono">18:00 – 20:00 EVENING PEAK</span>
            <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold border border-indigo-200">
              DISCHARGE BESS
            </span>
          </div>
          <div className="flex items-baseline justify-between text-xs font-mono pt-1">
            <span className="text-slate-600">Expected Solar Generation:</span>
            <span className="font-bold text-rose-600">24.0 MW</span>
          </div>
          <div className="flex items-baseline justify-between text-xs font-mono">
            <span className="text-slate-600">IEX Market Clearing Price:</span>
            <span className="font-bold text-indigo-700">₹6.80 / kWh</span>
          </div>
          <p className="text-[11px] text-slate-500 pt-1 font-sans">
            State peak demand spikes spot market price. Discharge stored energy to capture premium and fulfill commitment.
          </p>
        </div>
      </div>

      {/* Interactive Arbitrage Simulator (Analytical - No Physical Controls) */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-900 font-sans">Arbitrage Spread Simulation</span>
          </div>
          <p className="text-xs text-slate-500">
            Simulated BESS capacity: <strong>{bessMwh} MWh</strong> | Price Spread: <strong>+₹{spread}/kWh</strong>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block uppercase">Net Profit Benefit</span>
            <span className="text-xl font-bold text-emerald-600">
              ₹{netArbitrageProfit.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
