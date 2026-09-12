import React, { useState, useEffect } from "react";
import { 
  Search, 
  Bell, 
  Sun, 
  MapPin, 
  Building2, 
  Layers, 
  Cpu, 
  ChevronDown, 
  CheckCircle2, 
  Leaf,
  LogOut,
  ShieldCheck,
  FileSpreadsheet,
  Zap,
  User
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import DispatchActionModal from "../command/DispatchActionModal";
import AuditTrailModal from "../command/AuditTrailModal";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { 
    selectedState, 
    setSelectedState, 
    selectedCity, 
    setSelectedCity, 
    selectedArea, 
    setSelectedArea, 
    availableStates, 
    availableCities, 
    availableAreas, 
    forecastData, 
    trainingLoading, 
    trainingStatus, 
    handleTrainLocation,
    lastUpdated,
    settings,
    activeAlertsCount,
    isLiveConnected
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentCityObj = availableCities.find(c => c.id === selectedCity);
  const currentAreaObj = availableAreas.find(a => a.id === selectedArea);
  const activeSolarPark = forecastData?.solar_park || currentCityObj?.solar_park || (selectedArea ? `${selectedArea.toUpperCase()} Clean Energy Park` : "Charanka Solar Core Grid");
  const activeAreaName = forecastData?.selected_area || currentAreaObj?.name || selectedArea || "Core Grid Zone";
  const stateName = availableStates.find(s => s.id === selectedState)?.name || "Gujarat";
  const cityName = currentCityObj?.name || "Patan";
  const totalCapMw = forecastData?.total_capacity_mw || (Number(settings?.solarCapacityMw || 100) + Number(settings?.windCapacityMw || 100));

  const weatherData = forecastData?.weather_current || {
    temperature_c: 31,
    solar_irradiance_wm2: 820,
    cloud_cover_pct: 12,
    wind_speed_ms: 6.2,
    condition: "Clear Sky"
  };

  // Format date & time strings
  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  const updatedTimeStr = lastUpdated ? new Date(lastUpdated).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }) : formattedTime;

  const lastUpdatedDateFormatted = lastUpdated ? new Date(lastUpdated).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }) : formattedDate;

  return (
    <header className="bg-white border-b border-slate-200 select-none z-30 sticky top-0 shrink-0 w-full">
      {/* Tier 1: Brand, Search, Status & Profile */}
      <div className="px-5 py-2.5 flex items-center justify-between gap-4 border-b border-slate-100">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 hover:opacity-85 transition-opacity cursor-pointer" title="Go to Overview">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
            <img src="/surge-icon.png" alt="SURGE" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-slate-900 font-sans leading-none flex items-center gap-1.5">
              <span>SURGE</span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans tracking-tight mt-0.5">
              Forecast the Grid. Before the Gap.
            </p>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search plants, locations, alerts..."
              className="w-full pl-9 pr-14 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
              ⌘ K
            </kbd>
          </div>
        </div>

        {/* Right Status, Alerts & User Profile */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Live Data Pulse */}
          <div className="hidden lg:flex flex-col items-end text-right">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <span className={`w-2 h-2 rounded-full ${isLiveConnected ? "bg-emerald-500 animate-pulse" : "bg-blue-500"}`}></span>
              <span>{isLiveConnected ? "Live Data" : "Grid Telemetry"}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Last updated: {lastUpdatedDateFormatted}, {updatedTimeStr}
            </span>
          </div>

          {/* Notification Bell with Badge */}
          <div 
            onClick={() => navigate("/alerts")}
            title={`${activeAlertsCount || 0} Active Alerts`}
            className="relative cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {activeAlertsCount > 0 && (
              <span className="absolute top-1 right-1 min-w-3.5 h-3.5 px-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {activeAlertsCount}
              </span>
            )}
          </div>

          {/* User Profile Avatar & Dropdown */}
          {isAuthenticated && user ? (
            <div className="relative">
              {(() => {
                const opName = user.name || settings?.operatorName || "Krish Patel";
                const opRole = user.role || settings?.operatorRole || "Operator";
                const initials = opName
                  .split(" ")
                  .filter(Boolean)
                  .map(n => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "OP";

                return (
                  <div 
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    title="Account & Dispatch Menu"
                    className="flex items-center gap-2.5 pl-2 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                      {initials}
                    </div>
                    <div className="hidden sm:block text-left leading-tight">
                      <div className="text-xs font-bold text-slate-900">{opName}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[110px]">{opRole}</div>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-400 -ml-1" />
                  </div>
                );
              })()}

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setProfileMenuOpen(false)} 
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1.5 animate-fade-in text-xs">
                    {/* User Header */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{user.email}</div>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-200 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{user.role}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-0.5 pt-1">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setIsDispatchModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium cursor-pointer transition-colors text-left"
                      >
                        <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Quick Dispatch Directive</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setIsAuditTrailOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium cursor-pointer transition-colors text-left"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>SLDC Audit Trail Logs</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate("/settings");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium cursor-pointer transition-colors text-left"
                      >
                        <User className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Settings & Profile</span>
                      </button>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          logout();
                          navigate("/login");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Settings / Theme Toggle Icon */}
          <div 
            onClick={() => navigate("/settings")}
            title="Open System Settings"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer transition-colors"
          >
            <Sun className="w-4 h-4 text-slate-600" />
          </div>
        </div>
      </div>

      {/* Dispatch Action Modal */}
      <DispatchActionModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        initialAction={{
          type: 'BESS_CHARGE',
          mw: 20.0,
          rationale: 'Operator manual dispatch command from control room header'
        }}
      />

      {/* Audit Trail Modal */}
      <AuditTrailModal
        isOpen={isAuditTrailOpen}
        onClose={() => setIsAuditTrailOpen(false)}
      />

      {/* Tier 2: Location, Dropdowns & Local Weather Bar */}
      <div className="px-5 py-2 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        {/* Plant Thumbnail Card */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-7 rounded-md overflow-hidden bg-slate-200 border border-slate-300 shrink-0 shadow-2xs relative">
            <svg viewBox="0 0 100 70" className="w-full h-full object-cover">
              <rect width="100" height="70" fill="#38bdf8" />
              <path d="M0 45 Q 40 30 100 45 L100 70 L0 70 Z" fill="#22c55e" />
              <polygon points="20,40 22,25 24,40" fill="#ffffff" />
              <polygon points="50,38 52,20 54,38" fill="#ffffff" />
              <polygon points="80,42 82,28 84,42" fill="#ffffff" />
              <rect x="30" y="48" width="40" height="15" rx="2" fill="#1e3a8a" opacity="0.85" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-slate-900 truncate max-w-[200px]" title={activeSolarPark}>
                {activeSolarPark}
              </h2>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                Operational
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Solar + Wind • {totalCapMw} MW
            </p>
          </div>
        </div>

        {/* Location Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* State Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-lg text-xs transition-colors shadow-2xs">
            <span className="text-[11px] text-slate-400 font-mono">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 font-sans focus:outline-none cursor-pointer pr-1"
            >
              {availableStates.map(st => (
                <option key={st.id} value={st.id} className="bg-white text-slate-900">
                  {st.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 -ml-1 pointer-events-none" />
          </div>

          {/* City Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-lg text-xs transition-colors shadow-2xs">
            <span className="text-[11px] text-slate-400 font-mono">City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 font-sans focus:outline-none cursor-pointer pr-1"
            >
              {availableCities.map(ct => (
                <option key={ct.id} value={ct.id} className="bg-white text-slate-900">
                  {ct.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 -ml-1 pointer-events-none" />
          </div>

          {/* Feeder / Zone Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-lg text-xs transition-colors shadow-2xs">
            <span className="text-[11px] text-slate-400 font-mono">Feeder / Zone:</span>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 font-sans focus:outline-none cursor-pointer max-w-[160px] truncate pr-1"
            >
              {availableAreas.map(ar => (
                <option key={ar.id} value={ar.id} className="bg-white text-slate-900">
                  {ar.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 -ml-1 pointer-events-none" />
          </div>

          {/* Retrain ML Model Button */}
          <button
            onClick={handleTrainLocation}
            disabled={trainingLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono font-semibold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            title="Retrain XGBoost for this area"
          >
            <Cpu className={`w-3 h-3 text-blue-600 ${trainingLoading ? "animate-spin" : ""}`} />
            <span>{trainingLoading ? "Training..." : "Train ML"}</span>
          </button>
        </div>

        {/* Date & Time and Weather Pill */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-800 font-sans">
              {formattedDate}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {formattedTime}
            </div>
          </div>

          <div 
            onClick={() => navigate("/weather")}
            className="flex items-center gap-2 pl-3 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
            title="View Weather Intelligence"
          >
            <Sun className="w-5 h-5 text-amber-500 fill-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900 font-sans">{weatherData.temperature_c}°C</div>
              <div className="text-[10px] text-slate-400 font-mono">{weatherData.condition}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Training Status Toast */}
      {trainingStatus && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-1.5 flex items-center justify-between text-xs font-mono text-blue-900 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>{trainingStatus}</span>
          </div>
          <span className="text-[10px] text-slate-500">XGBoost v3.0 Active</span>
        </div>
      )}
    </header>
  );
}
