import React, { useState } from "react";
import { Search, Clock, ArrowRight, AlertTriangle, ShieldAlert, CheckCircle2, Factory, Zap, Coins, Radio, Filter } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

export default function Alerts() {
  const [filter, setFilter] = useState("ALL");
  const [alertSearch, setAlertSearch] = useState("");
  const [ackedAlerts, setAckedAlerts] = useState({});
  const { forecastData } = useApp();
  const { activeRoleId, roleConfig, hasPermission } = useAuth();

  const handleAcknowledge = (id) => {
    setAckedAlerts(prev => ({ ...prev, [id]: true }));
  };

  // -------------------------------------------------------------------------
  // ROLE-SPECIFIC ALERTS DATA
  // -------------------------------------------------------------------------
  let roleAlerts = [];

  if (activeRoleId === 'chief_grid_dispatcher') {
    roleAlerts = [
      {
        id: "dsp-alert-1",
        severity: "CRITICAL",
        timeWindow: "18:00 – 22:00 IST",
        title: "Grid Deficit: -182 MW Expected Evening Shortfall",
        category: "Grid Deficit",
        uncertainty: "155 – 210 MW Range",
        cause: "Solar generation ramps to 0 MW past 18:30 while evening grid demand peaks at 680 MW. Wind output tapering by -45 MW.",
        recommendation: "Approve 90 MW BESS battery discharge and synchronize 45 MW thermal spinning reserve to prevent grid under-frequency trip.",
        actionBtn: "Dispatch Reserves"
      },
      {
        id: "dsp-alert-2",
        severity: "CRITICAL",
        timeWindow: "19:00 – 20:30 IST",
        title: "Backup Requirement: 45 MW Thermal Reserve Call Triggered",
        category: "Backup Requirement",
        uncertainty: "Strict Reserve Margin",
        cause: "Remaining deficit exceeds available battery discharge envelope. Spinning reserve dispatch mandated under SLDC operating code.",
        recommendation: "Activate Wanakbori Gas/Thermal Peaker Unit-3 (45 MW fast-sync mode).",
        actionBtn: "Synchronize Peaker"
      },
      {
        id: "dsp-alert-3",
        severity: "WARNING",
        timeWindow: "17:30 – 19:00 IST",
        title: "Renewable Ramp: Net RE Ramp-Down Exceeds -38 MW/h",
        category: "Renewable Ramp",
        uncertainty: "±8.5 MW Ramp Rate",
        cause: "Steep photovoltaic sunset gradient combined with western wind corridor slowdown.",
        recommendation: "Issue ramp advisory to regional distribution utilities; prime BESS automatic frequency response.",
        actionBtn: "Acknowledge"
      },
      {
        id: "dsp-alert-4",
        severity: "WARNING",
        timeWindow: "21:30 – 23:00 IST",
        title: "Low Battery Reserve: BESS SOC Projected to Drop Below 20%",
        category: "Low Battery Reserve",
        uncertainty: "Depth of Discharge Warning",
        cause: "Continuous 90 MW discharge over 3 hours depleting available 180 MWh storage pool.",
        recommendation: "Taper BESS discharge rate to 40 MW past 21:30 and transition load to baseload thermal.",
        actionBtn: "Set SOC Floor"
      },
      {
        id: "dsp-alert-5",
        severity: "WARNING",
        timeWindow: "11:00 – 14:00 IST",
        title: "Grid Surplus: Solar PV Generation Over-Injection (+64 MW)",
        category: "Grid Surplus",
        uncertainty: "+45 to +75 MW",
        cause: "High midday irradiance coinciding with minimum industrial feeder demand.",
        recommendation: "Charge BESS storage at 20 MW; ramp down thermal units to technical minimum to avoid curtailment.",
        actionBtn: "Absorb Surplus"
      }
    ];
  } else if (activeRoleId === 'plant_operations_engineer') {
    roleAlerts = [
      {
        id: "pe-alert-1",
        severity: "CRITICAL",
        timeWindow: "Today 16:30 – 18:30 IST",
        title: "Plant Underproduction: -18.6 MW Predicted Output Deficit",
        category: "Underproduction",
        uncertainty: "14 – 22.5 MW Delta",
        cause: "Localized stratus cloud layer passing over Sanand Sector 4 pyranometers and PV strings.",
        recommendation: "Verify auto-tilt tracking compensation; inspect string combiner telemetry.",
        actionBtn: "Inspect Strings"
      },
      {
        id: "pe-alert-2",
        severity: "WARNING",
        timeWindow: "Current Telemetry",
        title: "Equipment Anomaly: Combiner Box INV-07 Elevated Temp (48.6°C)",
        category: "Equipment Anomaly",
        uncertainty: "Inverter Block B",
        cause: "High contact resistance on DC fuse block causing thermal derating of Inverter 7 (-4.2 MW yield loss).",
        recommendation: "Log technician dispatch for IR thermal imaging and torque check on terminal lugs.",
        actionBtn: "Log Ticket"
      },
      {
        id: "pe-alert-3",
        severity: "WARNING",
        timeWindow: "Next 6 Hours",
        title: "Forecast Deviation: Site SCADA Generation -8.0% Below P50",
        category: "Forecast Deviation",
        uncertainty: "nRMSE 4.2%",
        cause: "Atmospheric aerosol and dust deposition on bifacial rear panels reducing albedo gain.",
        recommendation: "Schedule automated dry-brush robotic panel cleaning cycle tonight at 21:00.",
        actionBtn: "Schedule Cleaning"
      },
      {
        id: "pe-alert-4",
        severity: "WARNING",
        timeWindow: "16:00 – 17:30 IST",
        title: "Weather Risk: Cloud Front Moving North-Northwest at 18 km/h",
        category: "Weather Risk",
        uncertainty: "Satellite Radar Confirmed",
        cause: "Cloud shadow transition will cause rapid GHI drops from 820 W/m² to 210 W/m² within 12 minutes.",
        recommendation: "Lock tracker pitch angle to 15° to capture diffuse irradiance during cloud passage.",
        actionBtn: "Optimize Tilt"
      },
      {
        id: "pe-alert-5",
        severity: "INFO",
        timeWindow: "12:00 – 13:30 IST",
        title: "Curtailment Watch: Feeder Interconnection Voltage at 223.8 kV",
        category: "Curtailment",
        uncertainty: "Within 220kV ±5% Limit",
        cause: "High reverse power flow toward SLDC substation during peak midday solar injection.",
        recommendation: "Configure inverters for Q(V) reactive power absorption to stabilize bus voltage.",
        actionBtn: "Enable Q-Mode"
      }
    ];
  } else if (activeRoleId === 'energy_trading_analyst') {
    roleAlerts = [
      {
        id: "tr-alert-1",
        severity: "CRITICAL",
        timeWindow: "19:00 – 20:00 IST",
        title: "Trading Deficit Exposure: 56 MWh Delivery Gap at Peak Price",
        category: "Trading Deficit",
        uncertainty: "DAM Contract Commitment",
        cause: "Day-Ahead commitment of 80 MW exceeds direct forecast solar generation (24 MW) past sunset.",
        recommendation: "Fulfill commitment via stored BESS discharge or execute buy order on Real-Time Market (RTM) before 18:00 cutoff.",
        actionBtn: "Hedge RTM"
      },
      {
        id: "tr-alert-2",
        severity: "WARNING",
        timeWindow: "Tomorrow DAM Session",
        title: "Deviation Penalty Risk: Hourly Deviation Approaching 8.5%",
        category: "Deviation Penalty",
        uncertainty: "CERC 10% Band Limit",
        cause: "Wind variance across Kutch hub increases risk of DSM penalty charges (₹1.2 lakh estimated exposure).",
        recommendation: "Revise schedule declaration in gate closure session to align with latest hybrid forecast.",
        actionBtn: "Re-declare Schedule"
      },
      {
        id: "tr-alert-3",
        severity: "WARNING",
        timeWindow: "18:00 – 20:00 IST",
        title: "Market Clearing Price Spike: IEX Projected at ₹6.80 / kWh",
        category: "Price Spike",
        uncertainty: "High Demand Peak",
        cause: "Regional generation deficit driving spot market clearing prices to ceiling.",
        recommendation: "Discharge 35 MWh BESS during 18:30–20:30 window to capture maximum revenue premium.",
        actionBtn: "Simulate Arbitrage"
      },
      {
        id: "tr-alert-4",
        severity: "INFO",
        timeWindow: "11:30 – 14:00 IST",
        title: "Missed Arbitrage Risk: Midday Solar Power Clearing at ₹3.10 / kWh",
        category: "Arbitrage Window",
        uncertainty: "Low Spot Price Window",
        cause: "Depressed exchange price provides ₹3.70/kWh spread against evening discharge.",
        recommendation: "Ensure 35 MWh battery charging is scheduled to lock in ₹1,29,500 expected net profit.",
        actionBtn: "Lock Arbitrage"
      }
    ];
  } else if (activeRoleId === 'remc_desk_officer') {
    roleAlerts = [
      {
        id: "remc-alert-1",
        severity: "CRITICAL",
        timeWindow: "Real-Time Telemetry",
        title: "Regional RE Deviation: Statewide Pool -120 MW Below Schedule",
        category: "Regional RE Deviation",
        uncertainty: "Aggregated 18 Plants",
        cause: "Simultaneous under-injection across Jaisalmer Wind (-44 MW), Charanka Solar (-15 MW), and Kutch Wind (-15 MW).",
        recommendation: "Notify SLDC Chief Grid Dispatcher of regional under-injection and coordinate reserve dispatch.",
        actionBtn: "Notify SLDC"
      },
      {
        id: "remc-alert-2",
        severity: "CRITICAL",
        timeWindow: "17:45 – 19:00 IST",
        title: "Regional Ramp Warning: -135 MW Wind Ramp-Down in 60 Minutes",
        category: "Regional Ramp",
        uncertainty: "82% Forecast Confidence",
        cause: "Boundary layer wind shear decaying across Thar and Kutch corridors from 11.2 m/s to 6.4 m/s.",
        recommendation: "Alert regional dispatchers; verify spinning thermal reserves and battery readiness.",
        actionBtn: "Issue Ramp Notice"
      },
      {
        id: "remc-alert-3",
        severity: "CRITICAL",
        timeWindow: "Current Interval",
        title: "High-Risk Plant: Jaisalmer Wind Park Deviating -44 MW (-20.0%)",
        category: "High-Risk Plant",
        uncertainty: "Exceeds CERC Tolerance",
        cause: "Turbine fleet availability dropped to 92% combined with local wind speed lull.",
        recommendation: "Issue deviation warning notice to Jaisalmer park operator; request updated schedule.",
        actionBtn: "Issue Warning"
      },
      {
        id: "remc-alert-4",
        severity: "WARNING",
        timeWindow: "12:00 – 14:00 IST",
        title: "Plant Underperformance: Charanka Solar Park -15 MW Deficit",
        category: "Plant Underperformance",
        uncertainty: "Medium Risk",
        cause: "Localized cloud band moving over Patan district reducing solar pool injection to 195 MW.",
        recommendation: "Monitor neighboring Banaskantha solar plants for progressive cloud shadowing.",
        actionBtn: "Monitor Corridor"
      }
    ];
  }

  const filtered = roleAlerts.filter(a => {
    if (filter !== "ALL" && a.severity !== filter) return false;
    if (alertSearch.trim()) {
      const q = alertSearch.trim().toLowerCase();
      const matchTitle = a.title?.toLowerCase().includes(q);
      const matchCategory = a.category?.toLowerCase().includes(q);
      const matchCause = a.cause?.toLowerCase().includes(q);
      const matchRec = a.recommendation?.toLowerCase().includes(q);
      const matchTime = a.timeWindow?.toLowerCase().includes(q);
      if (!matchTitle && !matchCategory && !matchCause && !matchRec && !matchTime) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${roleConfig.badgeVariant}`}>
              {roleConfig.name} RISK STREAM
            </span>
            <span className="text-xs text-slate-400 font-mono hidden md:inline">
              Scope: {roleConfig.dataScope}
            </span>
          </div>

          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight font-sans mt-1">
            {activeRoleId === 'chief_grid_dispatcher' && "Grid Stability, Deficit & Operational Risk Ledger"}
            {activeRoleId === 'plant_operations_engineer' && `${forecastData?.selected_area || "Plant"} Asset Performance & Technical Risk Ledger`}
            {activeRoleId === 'energy_trading_analyst' && "Commercial Trading Deficits, Penalties & Price Risks"}
            {activeRoleId === 'remc_desk_officer' && "REMC Regional Renewable Deviation & Multi-Plant Ramp Stream"}
          </h2>

          <p className="text-xs text-slate-500 font-mono mt-0.5">
            {activeRoleId === 'chief_grid_dispatcher' && "Monitoring grid deficits, reserve requirements, demand spikes & storage depletion."}
            {activeRoleId === 'plant_operations_engineer' && "Monitoring technical underproduction, inverter anomalies, weather impacts & sensor faults."}
            {activeRoleId === 'energy_trading_analyst' && "Monitoring contract shortfalls, deviation penalties, price volatility & arbitrage windows."}
            {activeRoleId === 'remc_desk_officer' && "Monitoring multi-plant deviations, high-risk renewable plants & regional ramp events."}
          </p>
        </div>

        {/* Filter & In-Page Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Alerts Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={alertSearch}
              onChange={(e) => setAlertSearch(e.target.value)}
              placeholder="Filter alerts..."
              className="pl-8 pr-6 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-36 sm:w-44 transition-all"
            />
            {alertSearch && (
              <button
                onClick={() => setAlertSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                title="Clear filter"
              >
                ✕
              </button>
            )}
          </div>

          {/* Severity Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl text-xs font-mono shadow-2xs shrink-0">
            {["ALL", "CRITICAL", "WARNING"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filter === f ? "bg-blue-600 text-white font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {f} ({roleAlerts.filter(a => f === "ALL" || a.severity === f).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        {filtered.map(alert => {
          const isCritical = alert.severity === "CRITICAL";
          const isAcked = ackedAlerts[alert.id];

          return (
            <div 
              key={alert.id} 
              className={`p-5 rounded-2xl bg-white border transition-all shadow-sm ${
                isAcked 
                  ? "opacity-60 border-slate-200 bg-slate-50/40" 
                  : isCritical 
                  ? "border-rose-200 shadow-rose-50" 
                  : "border-amber-200 shadow-amber-50"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${
                      isCritical ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}>
                      {alert.severity} RISK
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {alert.category}
                    </span>
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {alert.timeWindow}
                    </span>
                    {isAcked && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        ACKNOWLEDGED
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight font-sans pt-0.5">{alert.title}</h3>
                </div>

                <div className="text-left md:text-right shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Uncertainty Bounds</span>
                  <div className="text-xs font-bold font-mono text-slate-800">{alert.uncertainty}</div>
                </div>
              </div>

              {/* Cause and Mitigation Box */}
              <div className="mt-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2 text-xs font-mono">
                <div>
                  <span className="text-slate-500 font-bold">IDENTIFIED ROOT CAUSE: </span>
                  <span className="text-slate-800 font-sans">{alert.cause}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-bold">RECOMMENDED ACTION: </span>
                  <span className="text-slate-800 font-sans">{alert.recommendation}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {roleConfig.name} Protocol Authorized
                </span>

                <div className="flex items-center gap-2">
                  {!isAcked ? (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Acknowledge Alert</span>
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-emerald-600 font-bold">
                      ✓ Logged in SLDC Audit Ledger
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
