import React from "react";
import { Sparkles, Lightbulb, ArrowRight, Check } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function RecommendationCard({ recommendation, onViewDetails, onApprove }) {
  const { approvedActions, approveAction } = useApp();

  if (!recommendation) return null;

  const isApproved = approvedActions.some(a => a.id === recommendation.id);

  const handleApprove = () => {
    approveAction(recommendation.id, recommendation);
    onApprove?.();
  };

  const actionTitle = recommendation.actionText 
    ? recommendation.actionText.replace(/^[^\w]+/, "").split("(")[0].trim() 
    : "Charge battery during solar peak";
  const timeSubtext = recommendation.timeWindow ? `${recommendation.timeWindow} | +20 MW` : "12:00 – 14:30 IST | +20 MW";

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-600">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-slate-800 font-sans">
            AI Operations Advisory
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
          High Priority
        </span>
      </div>

      {/* Main Content with Lightbulb */}
      <div className="flex items-center gap-3 py-2">
        <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-500 shrink-0">
          <Lightbulb className="w-5 h-5 fill-amber-400 text-amber-500" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-900 leading-snug">
            {actionTitle}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            {timeSubtext}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <button
          onClick={onViewDetails}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleApprove}
          disabled={isApproved}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 ${
            isApproved 
              ? "bg-emerald-600 text-white cursor-default" 
              : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xs"
          }`}
        >
          {isApproved ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Approved</span>
            </>
          ) : (
            <span>Review & Approve</span>
          )}
        </button>
      </div>
    </div>
  );
}
