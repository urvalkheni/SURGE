import React from 'react';
import RecommendationCard from '../components/cards/RecommendationCard';
import { useApp } from '../context/AppContext';

export default function Recommendations() {
  const { recommendations, forecastData } = useApp();
  const activeLoc = forecastData?.selected_state || "Selected Grid";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">ACTION ENGINE & DECISION AUDIT</span>
        <h2 className="text-2xl font-bold text-white tracking-tight">AI Operational Dispatch Advisories</h2>
        <p className="text-xs text-slate-400 mt-1">
          Review, approve, or dismiss prescriptive storage and grid dispatch recommendations.
        </p>
      </div>

      <div className="space-y-6">
        {(recommendations || []).map(rec => (
          <RecommendationCard key={rec.id} recommendation={rec} />
        ))}
      </div>
    </div>
  );
}
