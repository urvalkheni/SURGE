import React, { useState } from "react";
import { 
  Search,
  Sun, 
  Wind, 
  MapPin, 
  Building2, 
  Zap, 
  Cpu, 
  Compass, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Radio, 
  FileText, 
  Wrench, 
  Thermometer, 
  Gauge,
  Sliders,
  ChevronDown,
  ChevronUp,
  PhoneCall
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { MULTI_PLANT_DATA } from "../config/roles";

export default function Plants() {
  const { forecastData, assignedPlantId, setAssignedPlantId, assignedPlant } = useApp();
  const { activeRoleId, roleConfig, isDispatcher, isPlantEngineer, isTradingAnalyst, isRemcOfficer } = useAuth();

  const [resourceFilter, setResourceFilter] = useState("ALL"); // ALL, Solar, Wind
  const [plantSearch, setPlantSearch] = useState("");
  const [showOtherPlants, setShowOtherPlants] = useState(false);
  const [coordinationNotice, setCoordinationNotice] = useState(null);

  // Plant commercial tariffs & contracts metadata
  const commercialMetadata = {
    'sanand-solar': { ppaTariff: 2.65, contractType: '25-Yr SECI PPA', merchantExposurePct: 15, forecastReliability: 'A+', revenueTodayLakhs: 4.82, dsmRiskLakhs: 0.24 },
    'bhadla-solar': { ppaTariff: 2.44, contractType: '25-Yr NTPC PPA', merchantExposurePct: 10, forecastReliability: 'A', revenueTodayLakhs: 6.95, dsmRiskLakhs: 0.15 },
    'jaisalmer-wind': { ppaTariff: 2.82, contractType: 'State DISCOM Bilateral', merchantExposurePct: 35, forecastReliability: 'B', revenueTodayLakhs: 4.96, dsmRiskLakhs: 1.42 },
    'kutch-wind': { ppaTariff: 2.78, contractType: '25-Yr SECI PPA', merchantExposurePct: 20, forecastReliability: 'A', revenueTodayLakhs: 8.62, dsmRiskLakhs: 0.48 },
    'charanka-solar': { ppaTariff: 3.15, contractType: 'GPCL Feed-in Tariff', merchantExposurePct: 5, forecastReliability: 'A-', revenueTodayLakhs: 6.14, dsmRiskLakhs: 0.52 },
    'pavagada-solar': { ppaTariff: 2.51, contractType: '25-Yr KREDL PPA', merchantExposurePct: 12, forecastReliability: 'A+', revenueTodayLakhs: 10.67, dsmRiskLakhs: 0.08 }
  };

  // Plant technical SCADA metadata for Engineer
  const scadaMetadata = {
    'sanand-solar': {
      soilingLossPct: 2.1,
      dcAcRatio: 1.25,
      stringsOnlinePct: 99.4,
      transformerOilTempC: 58.2,
      substationBusKv: 221.4,
      gridFreqHz: 50.02,
      activeAlarms: 1,
      lastWashingDate: '3 days ago',
      workOrders: 'Block C inverter module clean-up scheduled 06:00 IST'
    },
    'bhadla-solar': {
      soilingLossPct: 3.4,
      dcAcRatio: 1.30,
      stringsOnlinePct: 99.8,
      transformerOilTempC: 62.0,
      substationBusKv: 401.8,
      gridFreqHz: 50.01,
      activeAlarms: 0,
      lastWashingDate: '1 day ago',
      workOrders: 'Routine SCADA optical link inspection'
    },
    'jaisalmer-wind': {
      soilingLossPct: 0.8,
      dcAcRatio: 1.0,
      stringsOnlinePct: 92.0,
      transformerOilTempC: 54.1,
      substationBusKv: 219.8,
      gridFreqHz: 49.98,
      activeAlarms: 3,
      lastWashingDate: 'N/A (Wind)',
      workOrders: 'WTG-08 gearbox vibration check, WTG-14 yaw sensor recalibration'
    },
    'kutch-wind': {
      soilingLossPct: 0.5,
      dcAcRatio: 1.0,
      stringsOnlinePct: 97.1,
      transformerOilTempC: 56.4,
      substationBusKv: 399.5,
      gridFreqHz: 50.00,
      activeAlarms: 1,
      lastWashingDate: 'N/A (Wind)',
      workOrders: 'Turbine 42 blade tip pitch actuator inspection'
    },
    'charanka-solar': {
      soilingLossPct: 2.8,
      dcAcRatio: 1.20,
      stringsOnlinePct: 96.2,
      transformerOilTempC: 61.5,
      substationBusKv: 402.1,
      gridFreqHz: 50.03,
      activeAlarms: 2,
      lastWashingDate: '5 days ago',
      workOrders: 'Inverter 14 IGBT thermal gate driver replacement'
    },
    'pavagada-solar': {
      soilingLossPct: 1.9,
      dcAcRatio: 1.28,
      stringsOnlinePct: 100.0,
      transformerOilTempC: 57.0,
      substationBusKv: 400.9,
      gridFreqHz: 50.02,
      activeAlarms: 0,
      lastWashingDate: '2 days ago',
      workOrders: 'All systems operating at nominal rating'
    }
  };

  // Filter plants
  const filteredPlants = MULTI_PLANT_DATA.filter(p => {
    if (resourceFilter === "Solar" && !p.type.includes("Solar")) return false;
    if (resourceFilter === "Wind" && !p.type.includes("Wind")) return false;
    if (plantSearch.trim()) {
      const q = plantSearch.trim().toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchLoc = p.location?.toLowerCase().includes(q);
      const matchNode = p.gridNode?.toLowerCase().includes(q);
      const matchType = p.type?.toLowerCase().includes(q);
      const matchCap = String(p.capacityMw).includes(q);
      if (!matchName && !matchLoc && !matchNode && !matchType && !matchCap) {
        return false;
      }
    }
    return true;
  });

  const handleSendNotice = (plantName) => {
    setCoordinationNotice(`Advisory dispatched to ${plantName} shift engineer. Acknowledged via SCADA.`);
    setTimeout(() => setCoordinationNotice(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {coordinationNotice && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl flex items-center justify-between shadow-sm animate-fade-in font-mono text-xs">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>{coordinationNotice}</span>
          </div>
          <button onClick={() => setCoordinationNotice(null)} className="text-blue-500 hover:text-blue-800 font-bold">✕</button>
        </div>
      )}

      {/* Role-Tuned Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              {isDispatcher && "FLEET-WIDE GENERATION ASSETS & INTERCONNECT"}
              {isPlantEngineer && "ASSIGNED GENERATION JURISDICTION"}
              {isTradingAnalyst && "COMMERCIAL GENERATION ASSET PORTFOLIO"}
              {isRemcOfficer && "REGIONAL MULTI-PLANT COORDINATION POOL"}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {MULTI_PLANT_DATA.length} Assets Registered
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight font-mono mt-0.5">
            {isDispatcher && "Regional RE Generation & Grid Interconnects"}
            {isPlantEngineer && `Plant SCADA & Asset Health: ${assignedPlant.name}`}
            {isTradingAnalyst && "Portfolio Capacity, PPA Tariffs & Revenue Tracking"}
            {isRemcOfficer && "REMC Pooled Plants & Live Schedule Compliance"}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            {isDispatcher && "Monitoring 1,820 MW aggregate renewable capacity, substation interconnects, and transmission bottlenecks."}
            {isPlantEngineer && "Detailed component-level telemetry, inverter health, DC/AC ratios, and string operational status."}
            {isTradingAnalyst && "Contract structures, PPA rates, deviation penalty exposures, and day-ahead forecast revenue."}
            {isRemcOfficer && "Statewide renewable pooling, live telemetry pings, and schedule adherence oversight."}
          </p>
        </div>

        {/* Filter Controls & In-Page Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* In-page Plant Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={plantSearch}
              onChange={(e) => setPlantSearch(e.target.value)}
              placeholder="Search plants, locations..."
              className="pl-8 pr-6 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-36 sm:w-48 shadow-2xs transition-all"
            />
            {plantSearch && (
              <button
                onClick={() => setPlantSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                title="Clear plant search"
              >
                ✕
              </button>
            )}
          </div>

          {isPlantEngineer && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-mono">
              <span className="text-amber-700 font-semibold">Active Plant:</span>
              <select
                value={assignedPlantId}
                onChange={(e) => setAssignedPlantId(e.target.value)}
                className="bg-white border border-amber-300 rounded px-2 py-1 text-xs font-bold text-slate-800"
              >
                {MULTI_PLANT_DATA.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-mono">
            {["ALL", "Solar", "Wind"].map((filter) => (
              <button
                key={filter}
                onClick={() => setResourceFilter(filter)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  resourceFilter === filter
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Role-Specific Metric Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        {isDispatcher && (
          <>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Fleet Online Capacity</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">1,570.0 <span className="text-xs font-normal text-slate-500">/ 1,820 MW</span></div>
              <span className="text-[10px] text-emerald-600">86.3% of fleet nameplate active</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Aggregate Deviation</span>
              <div className="text-lg font-bold text-rose-600 mt-0.5">-86.0 <span className="text-xs font-normal text-slate-500">MW</span></div>
              <span className="text-[10px] text-rose-600">Deficit vs grid schedule</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Interconnect Availability</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">97.8%</div>
              <span className="text-[10px] text-slate-500">6/6 Substation Bays Healthy</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Transmission Curtailment</span>
              <div className="text-lg font-bold text-blue-600 mt-0.5">0.0 MW</div>
              <span className="text-[10px] text-emerald-600">All corridors clear</span>
            </div>
          </>
        )}

        {isPlantEngineer && (
          <>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Active Inverters / Turbines</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">{assignedPlant.invertersOnline}</div>
              <span className="text-[10px] text-emerald-600 font-bold">{assignedPlant.availabilityPct}% availability</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Performance Ratio (PR)</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">{assignedPlant.prPct}%</div>
              <span className="text-[10px] text-slate-500">Target: 81.0%</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Soiling / Array Loss</span>
              <div className="text-lg font-bold text-amber-600 mt-0.5">{scadaMetadata[assignedPlant.id]?.soilingLossPct || 2.1}%</div>
              <span className="text-[10px] text-amber-600">Washing in 2 days</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Substation Frequency / Bus</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">{scadaMetadata[assignedPlant.id]?.gridFreqHz} Hz</div>
              <span className="text-[10px] text-slate-500">{scadaMetadata[assignedPlant.id]?.substationBusKv} kV Bus</span>
            </div>
          </>
        )}

        {isTradingAnalyst && (
          <>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Portfolio MWh Today</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">14,280 <span className="text-xs font-normal text-slate-500">MWh</span></div>
              <span className="text-[10px] text-emerald-600">₹37.2 Lakhs revenue</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Weighted Avg PPA</span>
              <div className="text-lg font-bold text-blue-600 mt-0.5">₹2.67 <span className="text-xs font-normal text-slate-500">/kWh</span></div>
              <span className="text-[10px] text-slate-500">Long-term guaranteed</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">DSM Penalty Risk</span>
              <div className="text-lg font-bold text-rose-600 mt-0.5">₹2.89 <span className="text-xs font-normal text-slate-500">Lakhs</span></div>
              <span className="text-[10px] text-rose-600">Due to Jaisalmer wind ramp</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Merchant Spread Potential</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">+₹1.85 <span className="text-xs font-normal text-slate-500">/kWh</span></div>
              <span className="text-[10px] text-emerald-600">RTM Peak Arbitrage</span>
            </div>
          </>
        )}

        {isRemcOfficer && (
          <>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">REMC Pooled Capacity</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">1,820 <span className="text-xs font-normal text-slate-500">MW</span></div>
              <span className="text-[10px] text-slate-500">Across 6 designated nodes</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Schedule Compliance</span>
              <div className="text-lg font-bold text-amber-600 mt-0.5">83.3%</div>
              <span className="text-[10px] text-amber-600">5 of 6 compliant</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Highest Deviator</span>
              <div className="text-lg font-bold text-rose-600 mt-0.5">Jaisalmer Wind</div>
              <span className="text-[10px] text-rose-600">-44 MW (-21.5%)</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Telemetry Heartbeat</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">100% Active</div>
              <span className="text-[10px] text-emerald-600">Avg latency 180ms</span>
            </div>
          </>
        )}
      </div>

      {/* PLANT OPERATIONS ENGINEER: Prominently feature assigned plant SCADA */}
      {isPlantEngineer && (
        <div className="p-6 bg-amber-50/40 border-2 border-amber-300 rounded-2xl shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md">
                {assignedPlant.type.includes("Solar") ? <Sun className="w-6 h-6" /> : <Wind className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-amber-500 text-white rounded text-[10px] font-mono font-bold uppercase">
                    Assigned Jurisdiction
                  </span>
                  <span className="text-xs font-mono text-amber-800 font-bold">
                    {assignedPlant.location}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-mono mt-0.5">{assignedPlant.name}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-slate-800">
                Capacity: {assignedPlant.capacityMw} MW Nameplate
              </span>
              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-mono font-bold">
                SCADA Connected
              </span>
            </div>
          </div>

          {/* Deep SCADA Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            {/* Electrical Inverter / String Status */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-600" /> Inverter & Array Topology
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Nominal</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Inverters Online:</span>
                  <span className="font-bold text-slate-900">{assignedPlant.invertersOnline}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Active Strings:</span>
                  <span className="font-bold text-emerald-600">{scadaMetadata[assignedPlant.id]?.stringsOnlinePct}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">DC/AC Overpanelling:</span>
                  <span className="font-bold text-slate-900">{scadaMetadata[assignedPlant.id]?.dcAcRatio}x</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Soiling Loss:</span>
                  <span className="font-bold text-amber-600">-{scadaMetadata[assignedPlant.id]?.soilingLossPct}%</span>
                </div>
              </div>
            </div>

            {/* Substation & Grid Interface */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600" /> Substation Interconnect
                </span>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">50 Hz Synchronized</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Interconnect Node:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[150px]">{assignedPlant.gridNode}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Bus Voltage:</span>
                  <span className="font-bold text-slate-900">{scadaMetadata[assignedPlant.id]?.substationBusKv} kV</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Transformer Oil Temp:</span>
                  <span className="font-bold text-slate-900">{scadaMetadata[assignedPlant.id]?.transformerOilTempC}°C</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Grid Frequency:</span>
                  <span className="font-bold text-emerald-600">{scadaMetadata[assignedPlant.id]?.gridFreqHz} Hz</span>
                </div>
              </div>
            </div>

            {/* Maintenance & Maintenance Queue */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-emerald-600" /> Operational Log
                </span>
                <span className="text-[10px] text-slate-500 font-bold">Updated Just Now</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">CURRENT WORK ORDER:</span>
                  <p className="text-slate-800 font-medium mt-0.5 bg-slate-50 p-2 rounded border border-slate-200 text-[11px]">
                    {scadaMetadata[assignedPlant.id]?.workOrders}
                  </p>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Last Array Wash:</span>
                  <span className="font-bold text-slate-700">{scadaMetadata[assignedPlant.id]?.lastWashingDate}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Active Work Alarms:</span>
                  <span className={`font-bold ${scadaMetadata[assignedPlant.id]?.activeAlarms > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                    {scadaMetadata[assignedPlant.id]?.activeAlarms} Pending
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Multi-Plant Asset Grid */}
      <div className="space-y-4">
        {isPlantEngineer && (
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">
              Other Regional Generation Assets ({filteredPlants.filter(p => p.id !== assignedPlant.id).length})
            </span>
            <button
              onClick={() => setShowOtherPlants(!showOtherPlants)}
              className="text-xs font-mono text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {showOtherPlants ? "Collapse Other Plants" : "Show All Regional Plants (Read-Only)"}
              {showOtherPlants ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {(!isPlantEngineer || showOtherPlants) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPlants.map((p) => {
              const Icon = p.type.includes("Solar") ? Sun : Wind;
              const isAssigned = p.id === assignedPlant.id;
              const comm = commercialMetadata[p.id] || {};
              const scada = scadaMetadata[p.id] || {};
              const isHighRisk = p.riskLevel === "High";

              return (
                <div 
                  key={p.id} 
                  className={`p-6 rounded-2xl bg-white border transition-all ${
                    isAssigned && isPlantEngineer 
                      ? "border-amber-400 ring-2 ring-amber-100 shadow-md" 
                      : isHighRisk 
                      ? "border-rose-200 shadow-sm" 
                      : "border-slate-200 shadow-sm"
                  } space-y-4`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                        p.type.includes("Solar") 
                          ? "bg-amber-50 border-amber-200 text-amber-600" 
                          : "bg-blue-50 border-blue-200 text-blue-600"
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 font-mono">{p.name}</h3>
                          {isAssigned && isPlantEngineer && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              Assigned
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-mono">{p.type} • {p.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200 block">
                        {p.capacityMw} MW
                      </span>
                      <span className={`text-[10px] font-mono font-semibold mt-1 inline-block ${
                        p.riskLevel === 'High' ? 'text-rose-600' : p.riskLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        ● {p.riskLevel} Risk
                      </span>
                    </div>
                  </div>

                  {/* Operational Telemetry Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 border-y border-slate-100 font-mono text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px]">ACTUAL MW</span>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">{p.actualMw.toFixed(1)}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">SCHEDULE MW</span>
                      <div className="font-semibold text-slate-700 text-sm mt-0.5">{p.scheduleMw.toFixed(1)}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">DEVIATION</span>
                      <div className={`font-bold text-sm mt-0.5 ${p.deviationMw < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        {p.deviationMw > 0 ? `+${p.deviationMw.toFixed(1)}` : p.deviationMw.toFixed(1)} MW
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">AVAILABILITY</span>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">{p.availabilityPct}%</div>
                    </div>
                  </div>

                  {/* Role-Tuned Specific Information */}
                  {isDispatcher && (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200">
                        <span className="text-slate-500">Transmission Grid Node:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[200px]">{p.gridNode}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200">
                        <span className="text-slate-500">Weather Impact:</span>
                        <span className={`font-semibold ${p.weatherImpactMw < -10 ? "text-rose-600" : "text-slate-700"}`}>
                          {p.weatherImpactMw} MW
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200">
                        <span className="text-slate-500">Grid Discom Operator:</span>
                        <span className="font-semibold text-slate-800">State SLDC / GETCO</span>
                      </div>
                    </div>
                  )}

                  {isTradingAnalyst && (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded bg-blue-50/50 border border-blue-200">
                          <span className="text-slate-400 text-[10px] block">PPA TARIFF</span>
                          <span className="font-bold text-blue-800 text-xs">₹{comm.ppaTariff || 2.50} /kWh</span>
                        </div>
                        <div className="p-2 rounded bg-emerald-50/50 border border-emerald-200">
                          <span className="text-slate-400 text-[10px] block">REVENUE TODAY</span>
                          <span className="font-bold text-emerald-800 text-xs">₹{comm.revenueTodayLakhs || 4.5} L</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200">
                        <span className="text-slate-500">Contract Structure:</span>
                        <span className="font-semibold text-slate-800">{comm.contractType}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200">
                        <span className="text-slate-500">DSM Penalty Exposure:</span>
                        <span className={`font-semibold ${comm.dsmRiskLakhs > 0.5 ? "text-rose-600" : "text-slate-700"}`}>
                          ₹{comm.dsmRiskLakhs} Lakhs
                        </span>
                      </div>
                    </div>
                  )}

                  {isRemcOfficer && (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200">
                        <span className="text-slate-500">Interconnect Pooling:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[200px]">{p.gridNode}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200">
                        <span className="text-slate-500">Telemetry Status:</span>
                        <span className="font-semibold text-emerald-600 flex items-center gap-1">
                          <Radio className="w-3 h-3 text-emerald-500" /> Active (140ms)
                        </span>
                      </div>
                      <div className="pt-1 flex items-center gap-2">
                        <button
                          onClick={() => handleSendNotice(p.name)}
                          className="flex-1 py-1.5 px-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" /> Dispatch Advisory
                        </button>
                        <button
                          onClick={() => alert(`Connecting hotline to ${p.name} Control Desk...`)}
                          className="py-1.5 px-3 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold text-xs flex items-center gap-1"
                        >
                          <PhoneCall className="w-3.5 h-3.5" /> Hotlink
                        </button>
                      </div>
                    </div>
                  )}

                  {isPlantEngineer && !isAssigned && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center font-mono">
                      <span className="text-[11px] text-slate-500 block">Out of Assigned Operational Scope</span>
                      <button
                        onClick={() => setAssignedPlantId(p.id)}
                        className="mt-1.5 text-xs text-amber-700 hover:text-amber-900 font-bold underline"
                      >
                        Switch active assignment to this plant →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
