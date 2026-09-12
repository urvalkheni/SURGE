import React, { useState } from "react";
import { 
  Sparkles, 
  Lightbulb, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Wrench, 
  DollarSign, 
  Radio, 
  AlertTriangle, 
  Filter, 
  CheckCircle2, 
  Info,
  ExternalLink,
  Layers,
  Flame
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

export default function Recommendations() {
  const { forecastData, approvedActions, approveAction, assignedPlant } = useApp();
  const { activeRoleId, roleConfig, isDispatcher, isPlantEngineer, isTradingAnalyst, isRemcOfficer, canControl } = useAuth();

  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedRec, setSelectedRec] = useState(null);
  const [auditLog, setAuditLog] = useState([
    {
      id: "hist-1",
      title: "Armed BESS Fast Frequency Response for 50.00 Hz stability",
      role: "Chief Grid Dispatcher",
      timestamp: "10:15 IST Today",
      status: "EXECUTED"
    },
    {
      id: "hist-2",
      title: "Scheduled Module Washing for Block B Inverter strings",
      role: "Plant Operations Engineer",
      timestamp: "08:30 IST Today",
      status: "ACKNOWLEDGED"
    }
  ]);

  // Role-specific recommendation repositories
  const roleRecommendations = {
    chief_grid_dispatcher: [
      {
        id: "disp-rec-1",
        category: "Grid Balance",
        priority: "CRITICAL",
        title: "Dispatch 20 MW / 40 MWh BESS during Evening Solar Cliff",
        timeWindow: "18:30 - 20:30 IST",
        impactMw: 20.0,
        confidence: 96.4,
        rationale: "Solar generation declines at 48 MW/hr while evening residential demand spikes by 210 MW. Battery discharge eliminates deficit without calling high-tariff open-cycle gas peakers.",
        actionText: "Discharge Sanand BESS @ 20 MW rate to stabilize Vadodara GETCO ring bus.",
        modelEngine: "Surge Grid-Balance Optimizer v3.1",
        riskReduction: "Prevents -182 MW deficit penalty and 49.78 Hz frequency dip."
      },
      {
        id: "disp-rec-2",
        category: "Reserve Commitment",
        priority: "HIGH",
        title: "Synchronize 150 MW Spinning Peaker at Dhuvaran CCPP",
        timeWindow: "19:00 - 22:00 IST",
        impactMw: 150.0,
        confidence: 94.2,
        rationale: "Anticipated wind lull in Kutch corridor concurrent with sunset requires thermal spinning reserve synchronization to fulfill IEGC spinning margin.",
        actionText: "Issue warm-start sync directive to Dhuvaran combined cycle peaker unit 3.",
        modelEngine: "Surge Unit Commitment Engine",
        riskReduction: "Ensures 1,200 MW spinning reserve compliance."
      },
      {
        id: "disp-rec-3",
        category: "ADMS Defense",
        priority: "MEDIUM",
        title: "Pre-Arm Automated Demand Management (ADMS) Feeder Matrix",
        timeWindow: "Continuous Monitoring",
        impactMw: 45.0,
        confidence: 98.0,
        rationale: "If inter-regional Northern Grid HVDC import trips during peak hours, automated industrial feeder shedding will preserve Western Grid frequency at 49.85 Hz.",
        actionText: "Verify trip relay telemetry on GETCO 66kV industrial feeders 14 & 18.",
        modelEngine: "Frequency Stability Monitor",
        riskReduction: "Zero blackout risk for essential civil infrastructure."
      }
    ],

    plant_operations_engineer: [
      {
        id: "eng-rec-1",
        category: "Array Maintenance",
        priority: "HIGH",
        title: `Clean Block C Bifacial Arrays at ${assignedPlant.name}`,
        timeWindow: "Tomorrow 05:30 - 08:30 IST",
        impactMw: 3.4,
        confidence: 95.8,
        rationale: "Particulate deposition sensors register 3.4% soiling loss across 12 MWp bifacial string arrays. Washing before solar morning ramp restores +3.4 MW peak capability.",
        actionText: "Issue work order to robotic cleaning crew for Block C string trackers.",
        modelEngine: "Soiling Derate AI Classifier",
        riskReduction: "Recovers approx. 24.5 MWh daily lost generation."
      },
      {
        id: "eng-rec-2",
        category: "Electrical SCADA",
        priority: "CRITICAL",
        title: "Dispatch Field Tech to Inverter Station INV-04",
        timeWindow: "Immediate (Next 30 mins)",
        impactMw: 2.5,
        confidence: 98.5,
        rationale: "Telemetry reports IGBT gate driver thermal alarm (84°C) with intermittent ground fault tripping. Requires switchgear inspection.",
        actionText: "Lockout/tagout INV-04 DC combiner and inspect cooling blower fan fuse.",
        modelEngine: "Component Health Diagnostic AI",
        riskReduction: "Prevents permanent inverter IGBT module blowout."
      },
      {
        id: "eng-rec-3",
        category: "Tracker Optimization",
        priority: "MEDIUM",
        title: "Optimize Single-Axis Tracker Backtracking Angle",
        timeWindow: "08:15 - 09:30 IST Daily",
        impactMw: 1.8,
        confidence: 93.1,
        rationale: "Cloud cover diffuse irradiance ratio is high (0.42). Flattening trackers by 7° increases diffuse light capture compared to standard astronomical tracking.",
        actionText: "Update SCADA tracker controller setpoint with diffuse optimization curve.",
        modelEngine: "Solar Position & Diffuse Irradiance Model",
        riskReduction: "+1.8% CUF improvement in morning low-angle hours."
      }
    ],

    energy_trading_analyst: [
      {
        id: "trade-rec-1",
        category: "Commercial Arbitrage",
        priority: "HIGH",
        title: "Charge BESS @ ₹2.10 and Sell into Evening RTM @ ₹6.80",
        timeWindow: "Charge 11:30-13:45 / Discharge 19:30-21:00",
        impactMw: 15.0,
        confidence: 96.0,
        rationale: "Mid-day solar oversupply pushes DAM/RTM prices down to ₹2.10/kWh. Discharging 30 MWh during 19:30 peak deficit yields gross profit of ₹1.41 Lakhs per cycle after degradation.",
        actionText: "Commit automated bid package to IEX Power Exchange API for Block 46-52.",
        modelEngine: "IEX Spot Price Forecast Model",
        riskReduction: "Net expected commercial upside: +₹1.41 Lakhs."
      },
      {
        id: "trade-rec-2",
        category: "DSM Mitigation",
        priority: "CRITICAL",
        title: "Trim Jaisalmer Wind Schedule Rev-3 by 25 MW to Avoid Penalty",
        timeWindow: "Effective Block 38 (14:30 IST)",
        impactMw: 25.0,
        confidence: 92.4,
        rationale: "Wind telemetry forecast drops below 180 MW. Keeping original 205 MW schedule triggers CERC Deviation Settlement Mechanism (DSM) penalty at ₹4.80/kWh.",
        actionText: "Submit revised schedule requisition to WRLDC via Web-based Scheduling System.",
        modelEngine: "CERC DSM Penalty Risk Engine",
        riskReduction: "Avoids ₹1.2 Lakhs deviation penalty."
      },
      {
        id: "trade-rec-3",
        category: "Green REC Trading",
        priority: "MEDIUM",
        title: "Monetize 8,400 Green Energy Certificates (RECs)",
        timeWindow: "Next Monthly Session (Wednesday)",
        impactMw: 0.0,
        confidence: 94.7,
        rationale: "REC trading volumes on PXIL are clearing at ₹1,150/MWh certificate. Liquidating inventory captures ₹96.6 Lakhs in green premium liquidity.",
        actionText: "Queue 8,400 solar RECs for auction via Registered Trader account.",
        modelEngine: "Renewable Certificate Liquidity Model",
        riskReduction: "Captures ₹96.6 Lakhs non-tariff revenue."
      }
    ],

    remc_desk_officer: [
      {
        id: "remc-rec-1",
        category: "Ramp Coordination",
        priority: "CRITICAL",
        title: "Issue Regional Sunset Ramp Advisory to SLDC Gotri",
        timeWindow: "17:30 - 19:00 IST",
        impactMw: 135.0,
        confidence: 97.2,
        rationale: "Combined solar sunset ramp across Charanka, Sanand, and Bhadla totals -135 MW/hr. Early transmission notice enables SLDC to ramp hydro and gas reserves smoothly.",
        actionText: "Transmit official REMC Ramp Advisory Form-B to SLDC Shift Supervisor.",
        modelEngine: "Statewide Aggregated Ramp Forecaster",
        riskReduction: "Prevents regional grid frequency drop during solar ramp-down."
      },
      {
        id: "remc-rec-2",
        category: "Telemetry Sync",
        priority: "HIGH",
        title: "Request Telemetry RTU Resync with Jaisalmer Wind Substation",
        timeWindow: "Immediate (Next 15 mins)",
        impactMw: 44.0,
        confidence: 99.1,
        rationale: "Telemetry ping latency has degraded to 420ms with 4% packet drop on RVPN 220kV Amarsagar fiber terminal. Schedule compliance requires under 250ms SCADA heartbeat.",
        actionText: "Issue SCADA communication maintenance ticket to RVPN Telecommunication desk.",
        modelEngine: "REMC SCADA Heartbeat Diagnostics",
        riskReduction: "Restores sub-second operational visibility."
      },
      {
        id: "remc-rec-3",
        category: "Schedule Revision",
        priority: "MEDIUM",
        title: "Approve Schedule Revision Rev-4 for Charanka Solar Park",
        timeWindow: "Effective Block 40 (15:00 IST)",
        impactMw: 15.0,
        confidence: 94.0,
        rationale: "Plant developer submitted schedule modification citing localized cloud cover. Error margin reduces from 14.8% to 2.1% under revision.",
        actionText: "Digitally sign Rev-4 schedule in REMC Interstate Scheduling Portal.",
        modelEngine: "REMC Compliance Validation Engine",
        riskReduction: "Maintains regional schedule error below 5% norm."
      }
    ]
  };

  const currentList = roleRecommendations[activeRoleId] || roleRecommendations.chief_grid_dispatcher;

  const filteredList = currentList.filter(item => {
    if (activeFilter === "ALL") return true;
    return item.priority === activeFilter || item.category === activeFilter;
  });

  const handleApproveAction = (item) => {
    approveAction(item.id, item);
    
    // Add to audit log
    const logEntry = {
      id: `audit-${Date.now()}`,
      title: item.title,
      role: roleConfig?.name || "Authorized Operator",
      timestamp: `${new Date().toLocaleTimeString()} IST Just Now`,
      status: isDispatcher ? "EXECUTED" : isPlantEngineer ? "WORK ORDER CREATED" : isTradingAnalyst ? "TRADING STRATEGY COMMITTED" : "NOTICE TRANSMITTED"
    };

    setAuditLog([logEntry, ...auditLog]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              {isDispatcher && "GRID DESPATCH PRESCRIPTIVE AI ENGINE"}
              {isPlantEngineer && "PLANT SCADA DIAGNOSTIC & MAINTENANCE ADVISORY"}
              {isTradingAnalyst && "COMMERCIAL POWER TRADING & ARBITRAGE OPTIMIZER"}
              {isRemcOfficer && "REGIONAL RE COORDINATION & COMPLIANCE ENGINE"}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-600" /> Active AI Inference
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight font-mono mt-0.5">
            {isDispatcher && "Operational Dispatch & Reserve Recommendations"}
            {isPlantEngineer && `Asset Health & Field Maintenance: ${assignedPlant.name}`}
            {isTradingAnalyst && "Market Bidding & Financial Arbitrage Advisories"}
            {isRemcOfficer && "REMC Regional Coordination & Ramp Mitigation Directives"}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            {isDispatcher && "AI-generated recommendations for peaker dispatch, battery dispatch, and spinning reserve margins."}
            {isPlantEngineer && "Component-level maintenance, inverter fault mitigation, soiling cleaning orders, and tracker angles."}
            {isTradingAnalyst && "Commercial arbitrage windows, deviation penalty minimization, and exchange bid strategies."}
            {isRemcOfficer && "Regional ramp buffering, schedule revision authorizations, and SLDC transmission notices."}
          </p>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-mono">
          {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setActiveFilter(lvl)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeFilter === lvl
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Recommendation Cards */}
      <div className="space-y-4">
        {filteredList.map((rec) => {
          const isApproved = approvedActions.some(a => a.id === rec.id);

          return (
            <div 
              key={rec.id}
              className={`p-5 rounded-2xl bg-white border transition-all ${
                rec.priority === "CRITICAL"
                  ? "border-rose-300 shadow-xs"
                  : "border-slate-200 shadow-xs"
              } space-y-4`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    rec.priority === "CRITICAL"
                      ? "bg-rose-50 border-rose-200 text-rose-600"
                      : rec.priority === "HIGH"
                      ? "bg-amber-50 border-amber-200 text-amber-600"
                      : "bg-blue-50 border-blue-200 text-blue-600"
                  }`}>
                    {isDispatcher ? <Zap className="w-5 h-5" /> :
                     isPlantEngineer ? <Wrench className="w-5 h-5" /> :
                     isTradingAnalyst ? <DollarSign className="w-5 h-5" /> :
                     <Radio className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        rec.priority === "CRITICAL"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : rec.priority === "HIGH"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {rec.priority} PRIORITY
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">
                        {rec.category} • {rec.timeWindow}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 font-mono mt-1">
                      {rec.title}
                    </h3>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-700 block">
                    Confidence: {rec.confidence}%
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {rec.modelEngine}
                  </span>
                </div>
              </div>

              {/* Rationale & Action Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 md:col-span-2 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">AI RATIONALE & METRICS</span>
                  <p className="text-slate-700 leading-relaxed text-[11px]">{rec.rationale}</p>
                </div>
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1">
                  <span className="text-emerald-700 text-[10px] uppercase font-bold block">ESTIMATED IMPACT / BENEFIT</span>
                  <p className="text-emerald-900 font-semibold text-[11px]">{rec.riskReduction}</p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 font-mono text-xs">
                <div className="text-slate-600 text-[11px] flex items-center gap-1.5">
                  <span className="font-bold text-slate-800">Action:</span>
                  <span className="text-slate-700">{rec.actionText}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedRec(rec)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold transition-all text-xs"
                  >
                    View Audit Details
                  </button>

                  <button
                    onClick={() => handleApproveAction(rec)}
                    disabled={isApproved}
                    className={`px-4 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs shadow-xs ${
                      isApproved
                        ? "bg-emerald-600 text-white cursor-default"
                        : isDispatcher
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : isPlantEngineer
                        ? "bg-amber-600 hover:bg-amber-700 text-white"
                        : isTradingAnalyst
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    {isApproved ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Authorized & Logged</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {isDispatcher && "Approve & Execute Grid Directive"}
                          {isPlantEngineer && "Create Work Order & Dispatch"}
                          {isTradingAnalyst && "Approve Trading Bid Strategy"}
                          {isRemcOfficer && "Transmit Coordination Notice"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Decision Audit Trail Log */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 font-mono">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-800">Operational Decision Audit Log</h4>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">CERC / SLDC Immutable Compliance Record</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {auditLog.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-slate-800 block">{log.title}</span>
                <span className="text-[11px] text-slate-500">
                  Authorized by <strong className="text-slate-700">{log.role}</strong> • {log.timestamp}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Rec Details */}
      {selectedRec && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 font-mono animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase">{selectedRec.category} Detailed Diagnostics</span>
              <button onClick={() => setSelectedRec(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{selectedRec.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{selectedRec.timeWindow}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Model Engine:</span>
                <span className="font-bold text-slate-800">{selectedRec.modelEngine}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Model Confidence:</span>
                <span className="font-bold text-emerald-600">{selectedRec.confidence}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expected Power Impact:</span>
                <span className="font-bold text-blue-600">{selectedRec.impactMw} MW</span>
              </div>
            </div>

            <div className="text-xs text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block">Full Engineering Rationale:</span>
              <p className="text-[11px] leading-relaxed">{selectedRec.rationale}</p>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedRec(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold"
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
