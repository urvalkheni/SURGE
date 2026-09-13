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
  User,
  Shield,
  Factory,
  Globe,
  Menu
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import DispatchActionModal from "../command/DispatchActionModal";
import AuditTrailModal from "../command/AuditTrailModal";
import GlobalSearchModal from "../search/GlobalSearchModal";

export default function Header() {
  const navigate = useNavigate();
  const { 
    user, 
    logout, 
    isAuthenticated, 
    activeRoleId, 
    roleConfig, 
    switchRole, 
    canControl 
  } = useAuth();
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
    isLiveConnected,
    assignedPlantId,
    setAssignedPlantId,
    assignedPlant,
    toggleMobileSidebar
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Global ⌘K / Ctrl+K keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key?.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
      <div className="px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 sm:gap-4 border-b border-slate-100">
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Sidebar Hamburger Toggle */}
          <button
            type="button"
            onClick={toggleMobileSidebar}
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
            title="Toggle navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Logo & Name */}
          <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0 hover:opacity-85 transition-opacity cursor-pointer" title="Go to Command Center">
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
        </div>

        {/* Search Bar (Global Command Palette) */}
        <div 
          onClick={() => setIsSearchOpen(true)}
          className="hidden md:flex items-center flex-1 max-w-sm mx-4 cursor-pointer group"
          title="Open Global Search (⌘K)"
        >
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" />
            <input 
              type="text"
              readOnly
              onClick={() => setIsSearchOpen(true)}
              placeholder="Search plants, locations, alerts... (⌘K)"
              className="w-full pl-9 pr-14 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-lg border border-slate-200 group-hover:border-blue-400 focus:outline-none transition-all cursor-pointer"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs group-hover:text-slate-600 group-hover:border-slate-300">
              ⌘ K
            </kbd>
          </div>
        </div>

        {/* Mobile Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Search (⌘K)"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>



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
                const opName = user.name || roleConfig?.defaultUser || "Grid Operator";
                const opRole = roleConfig?.name || user.role || "Operator";
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
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">{opRole}</div>
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
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1.5 animate-fade-in text-xs">
                    {/* User Header */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <div className="font-bold text-slate-900">{user.name || roleConfig?.defaultUser}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{user.email || roleConfig?.defaultEmail}</div>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border mt-1 ${roleConfig?.badgeVariant || "bg-blue-50 text-blue-700 border-blue-200"}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{roleConfig?.name || user.role}</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5 italic">
                        {roleConfig?.primaryQuestion}
                      </div>
                    </div>

                    {/* Quick Role Switcher Inside Profile */}
                    <div className="p-2 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">SWITCH ROLE VIEW</span>
                      <div className="grid grid-cols-2 gap-1 pt-0.5">
                        <button
                          onClick={() => { switchRole('chief_grid_dispatcher'); setProfileMenuOpen(false); }}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-bold text-left transition-colors cursor-pointer ${activeRoleId === 'chief_grid_dispatcher' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'}`}
                        >
                          Dispatcher
                        </button>
                        <button
                          onClick={() => { switchRole('plant_operations_engineer'); setProfileMenuOpen(false); }}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-bold text-left transition-colors cursor-pointer ${activeRoleId === 'plant_operations_engineer' ? 'bg-amber-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'}`}
                        >
                          Plant Eng.
                        </button>
                        <button
                          onClick={() => { switchRole('energy_trading_analyst'); setProfileMenuOpen(false); }}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-bold text-left transition-colors cursor-pointer ${activeRoleId === 'energy_trading_analyst' ? 'bg-emerald-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'}`}
                        >
                          Trading
                        </button>
                        <button
                          onClick={() => { switchRole('remc_desk_officer'); setProfileMenuOpen(false); }}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-bold text-left transition-colors cursor-pointer ${activeRoleId === 'remc_desk_officer' ? 'bg-purple-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'}`}
                        >
                          REMC Desk
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-0.5 pt-1">
                      {canControl() ? (
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
                      ) : (
                        <div 
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 bg-slate-50/50 text-[11px] font-medium text-left cursor-not-allowed"
                          title="Operational dispatch restricted to Chief Grid Dispatcher"
                        >
                          <div className="flex items-center gap-2.5">
                            <Zap className="w-4 h-4 text-slate-300 shrink-0" />
                            <span>Quick Dispatch Directive</span>
                          </div>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">Restricted</span>
                        </div>
                      )}

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

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate("/");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium cursor-pointer transition-colors text-left"
                      >
                        <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Product Landing Page</span>
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
              <h2 className="text-xs font-bold text-slate-900 truncate max-w-[200px]" title={activeRoleId === 'plant_operations_engineer' ? assignedPlant?.name : activeSolarPark}>
                {activeRoleId === 'plant_operations_engineer' ? assignedPlant?.name : activeSolarPark}
              </h2>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                {activeRoleId === 'plant_operations_engineer' ? 'Assigned' : 'Operational'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              {activeRoleId === 'plant_operations_engineer' ? `${assignedPlant?.type} • ${assignedPlant?.capacityMw} MW` : `Solar + Wind • ${totalCapMw} MW`}
            </p>
          </div>
        </div>

        {/* Location Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {activeRoleId === 'plant_operations_engineer' && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-xs shadow-2xs">
              <Factory className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="text-[11px] font-mono font-bold text-amber-900">Plant Scope:</span>
              <select
                value={assignedPlantId}
                onChange={(e) => setAssignedPlantId(e.target.value)}
                className="bg-transparent text-xs font-bold text-amber-950 font-sans focus:outline-none cursor-pointer pr-1"
              >
                <option value="sanand-solar">Sanand Solar PV Cluster (250 MW)</option>
                <option value="bhadla-solar">Bhadla Solar Park (300 MW)</option>
              </select>
            </div>
          )}

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

      {/* Global Interactive Search Modal */}
      <GlobalSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </header>
  );
}
