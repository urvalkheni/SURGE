import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, Radio, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function DataFreshnessBadge() {
  const { lastUpdated, isLiveConnected, loading, loadData } = useApp();
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (lastUpdated) {
        const diff = Math.floor((new Date() - new Date(lastUpdated)) / 1000);
        setSecondsAgo(Math.max(0, diff));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  const isStale = secondsAgo > 900; // > 15 mins

  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono select-none shadow-2xs">
      {/* Live Pulsing Radar Beacon */}
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isStale ? 'bg-amber-500' : isLiveConnected ? 'bg-emerald-500' : 'bg-blue-500'
          }`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            isStale ? 'bg-amber-600' : isLiveConnected ? 'bg-emerald-600' : 'bg-blue-600'
          }`}></span>
        </span>
        <span className={`font-bold tracking-wider uppercase text-[11px] ${
          isStale ? 'text-amber-700' : isLiveConnected ? 'text-emerald-700' : 'text-blue-700'
        }`}>
          {isStale ? 'STALE' : isLiveConnected ? 'LIVE' : 'SIMULATED'}
        </span>
      </div>

      <span className="text-slate-300">|</span>

      {/* Timestamp */}
      <div className="hidden sm:flex items-center gap-1 text-slate-600 text-[11px]">
        <Clock className="w-3 h-3 text-slate-400" />
        <span>{lastUpdated ? new Date(lastUpdated).toLocaleTimeString('en-US', { hour12: false }) : '--:--:--'}</span>
        <span className="text-slate-400 text-[10px]">({secondsAgo}s ago)</span>
      </div>

      {/* Manual Refresh Button */}
      <button 
        onClick={() => loadData()}
        disabled={loading}
        title="Force telemetry sync"
        className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-all cursor-pointer disabled:opacity-50"
      >
        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-blue-600' : ''}`} />
      </button>
    </div>
  );
}
