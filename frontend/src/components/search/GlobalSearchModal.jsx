import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  Factory,
  Zap,
  BatteryCharging,
  Sparkles,
  CloudSun,
  BarChart3,
  Settings as SettingsIcon,
  MapPin,
  Shield,
  ArrowRight,
  Sun,
  Wind,
  CheckCircle2,
  Database,
  Radio,
  ExternalLink,
  ChevronRight,
  CornerDownLeft,
  Globe
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { MULTI_PLANT_DATA } from "../../config/roles";

export default function GlobalSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { setAssignedPlantId, setSelectedState, setSelectedCity, setSelectedArea } = useApp();
  const { switchRole, activeRoleId } = useAuth();

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL"); // ALL, MODULES, PLANTS, LOCATIONS, ALERTS, ROLES
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
      setActiveCategory("ALL");
    }
  }, [isOpen]);

  // Search items database
  const allItems = useMemo(() => [
    // 1. Modules & Routes
    {
      id: "mod-dashboard",
      type: "MODULES",
      title: "Command Center",
      description: "Statewide dispatch overview, frequency balance, and peaker status",
      route: "/dashboard",
      icon: LayoutDashboard,
      iconColor: "text-blue-600 bg-blue-50",
      badge: "Module",
      keywords: ["command", "center", "dashboard", "dispatch", "home", "main"]
    },
    {
      id: "mod-forecast",
      type: "MODULES",
      title: "Renewable Forecast",
      description: "24-96h solar irradiance, wind power, and net load deficit envelopes",
      route: "/forecast",
      icon: TrendingUp,
      iconColor: "text-emerald-600 bg-emerald-50",
      badge: "Module",
      keywords: ["forecast", "prediction", "solar", "wind", "p50", "p90", "horizon"]
    },
    {
      id: "mod-alerts",
      type: "MODULES",
      title: "Risk & Alerts",
      description: "Active grid deficit alerts, inverter trips, and DSM penalty warnings",
      route: "/alerts",
      icon: AlertTriangle,
      iconColor: "text-rose-600 bg-rose-50",
      badge: "Module",
      keywords: ["alerts", "alarms", "risk", "warnings", "trips", "deficit"]
    },
    {
      id: "mod-plants",
      type: "MODULES",
      title: "Plants & Assets",
      description: "1,820 MW generation fleet SCADA, inverters, and performance ratios",
      route: "/plants",
      icon: Factory,
      iconColor: "text-amber-600 bg-amber-50",
      badge: "Module",
      keywords: ["plants", "solar", "wind", "assets", "fleet", "scada", "generation"]
    },
    {
      id: "mod-grid",
      type: "MODULES",
      title: "Grid & Demand",
      description: "Substation bus voltages, 50.00 Hz frequency telemetry & load curves",
      route: "/grid",
      icon: Zap,
      iconColor: "text-indigo-600 bg-indigo-50",
      badge: "Module",
      keywords: ["grid", "demand", "frequency", "bus", "voltage", "load", "substation"]
    },
    {
      id: "mod-battery",
      type: "MODULES",
      title: "Battery & Storage (BESS)",
      description: "Physical BESS charge/discharge directives, SoC % and arbitrage",
      route: "/battery",
      icon: BatteryCharging,
      iconColor: "text-teal-600 bg-teal-50",
      badge: "Module",
      keywords: ["battery", "bess", "storage", "discharge", "charge", "soc", "arbitrage"]
    },
    {
      id: "mod-recommendations",
      type: "MODULES",
      title: "AI Advisory & Recommendations",
      description: "Automated peaker dispatch, reserve sync, and curtailment reversal",
      route: "/recommendations",
      icon: Sparkles,
      iconColor: "text-purple-600 bg-purple-50",
      badge: "Module",
      keywords: ["ai", "recommendations", "advisory", "peaker", "optimization", "advice"]
    },
    {
      id: "mod-weather",
      type: "MODULES",
      title: "Weather Radar & Telemetry",
      description: "High-resolution satellite cloud radar, GHI, DNI, wind speed & fronts",
      route: "/weather",
      icon: CloudSun,
      iconColor: "text-sky-600 bg-sky-50",
      badge: "Module",
      keywords: ["weather", "radar", "satellite", "ghi", "dni", "clouds", "irradiance", "wind speed"]
    },
    {
      id: "mod-analytics",
      type: "MODULES",
      title: "Analytics & Accuracy Audits",
      description: "CERC compliance, Forecast Value Add (FVA), CUF %, PR % benchmarks",
      route: "/analytics",
      icon: BarChart3,
      iconColor: "text-cyan-600 bg-cyan-50",
      badge: "Module",
      keywords: ["analytics", "accuracy", "audit", "cerc", "fva", "cuf", "metrics"]
    },
    {
      id: "mod-settings",
      type: "MODULES",
      title: "Operator Settings & Profile",
      description: "Station affiliation, SLDC credentials, CERC tolerance bands",
      route: "/settings",
      icon: SettingsIcon,
      iconColor: "text-slate-600 bg-slate-100",
      badge: "Module",
      keywords: ["settings", "profile", "configuration", "preferences", "account"]
    },
    {
      id: "mod-landing",
      type: "MODULES",
      title: "Product Landing Page",
      description: "Interactive 72h simulator, system capabilities, architecture & CERC benchmarks",
      route: "/",
      icon: Globe,
      iconColor: "text-emerald-600 bg-emerald-50",
      badge: "Overview",
      keywords: ["landing", "home", "marketing", "simulator", "product", "public", "overview"]
    },

    // 2. Power Plants & Fleets
    ...MULTI_PLANT_DATA.map(plant => ({
      id: `plant-${plant.id}`,
      type: "PLANTS",
      title: plant.name,
      description: `${plant.capacityMw} MW ${plant.type} · ${plant.location} · Current: ${plant.actualMw} MW`,
      plantId: plant.id,
      icon: plant.type.includes("Wind") ? Wind : Sun,
      iconColor: plant.type.includes("Wind") ? "text-cyan-600 bg-cyan-50" : "text-amber-600 bg-amber-50",
      badge: `${plant.capacityMw} MW`,
      keywords: [plant.name.toLowerCase(), plant.id, plant.type.toLowerCase(), plant.location.toLowerCase(), "plant", "mw"]
    })),

    // Additional Grid Assets
    {
      id: "asset-sanand-bess",
      type: "PLANTS",
      title: "Sanand BESS 20MW/50MWh",
      description: "Grid-scale battery storage unit · 220kV Substation · Peak Shaving Mode",
      route: "/battery",
      icon: BatteryCharging,
      iconColor: "text-teal-600 bg-teal-50",
      badge: "20 MW / 50 MWh",
      keywords: ["sanand", "bess", "battery", "storage", "50mwh"]
    },
    {
      id: "asset-dhuvaran-peaker",
      type: "PLANTS",
      title: "Dhuvaran CCPP Peaker Unit",
      description: "Fast-start gas peaker for evening solar cliff ramping · 50 MW Ready",
      route: "/recommendations",
      icon: Zap,
      iconColor: "text-orange-600 bg-orange-50",
      badge: "50 MW Peaker",
      keywords: ["dhuvaran", "peaker", "gas", "ccpp", "thermal", "spinning reserve"]
    },

    // 3. Locations & Weather Nodes
    {
      id: "loc-sanand",
      type: "LOCATIONS",
      title: "Sanand, Ahmedabad (Gujarat)",
      description: "SLDC Gotri command jurisdiction · High solar & industrial load density",
      state: "gujarat",
      city: "ahmedabad",
      area: "sanand",
      icon: MapPin,
      iconColor: "text-emerald-600 bg-emerald-50",
      badge: "Gujarat SLDC",
      keywords: ["sanand", "ahmedabad", "gujarat", "gotri", "vadodara"]
    },
    {
      id: "loc-kutch",
      type: "LOCATIONS",
      title: "Kutch & Khavda Renewable Corridor",
      description: "30 GW ultra-mega solar and wind park · GETCO Nakhatrana 400kV",
      state: "gujarat",
      city: "kutch",
      area: "khavda",
      icon: MapPin,
      iconColor: "text-emerald-600 bg-emerald-50",
      badge: "Mega Park",
      keywords: ["kutch", "khavda", "bhuj", "nakhatrana", "gujarat"]
    },
    {
      id: "loc-bhadla",
      type: "LOCATIONS",
      title: "Bhadla Solar Park (Rajasthan)",
      description: "2,245 MW world's largest solar complex · PGCIL 765kV Pooling",
      state: "rajasthan",
      city: "jodhpur",
      area: "bhadla",
      icon: MapPin,
      iconColor: "text-amber-600 bg-amber-50",
      badge: "Rajasthan",
      keywords: ["bhadla", "jodhpur", "rajasthan", "solar park"]
    },
    {
      id: "loc-jaisalmer",
      type: "LOCATIONS",
      title: "Jaisalmer Wind Belt (Rajasthan)",
      description: "1,064 MW desert wind corridor · High nocturnal wind yield",
      state: "rajasthan",
      city: "jaisalmer",
      area: "jaisalmer",
      icon: MapPin,
      iconColor: "text-cyan-600 bg-cyan-50",
      badge: "Wind Corridor",
      keywords: ["jaisalmer", "rajasthan", "wind"]
    },
    {
      id: "loc-pavagada",
      type: "LOCATIONS",
      title: "Pavagada Solar Park (Karnataka)",
      description: "2,050 MW Shakti Sthala solar park · KPTCL 400kV interconnect",
      state: "karnataka",
      city: "tumkur",
      area: "pavagada",
      icon: MapPin,
      iconColor: "text-indigo-600 bg-indigo-50",
      badge: "Karnataka",
      keywords: ["pavagada", "karnataka", "tumkur", "shakti sthala"]
    },

    // 4. Critical Alerts & Alarms
    {
      id: "alert-grid-deficit",
      type: "ALERTS",
      title: "Grid Deficit: -182 MW Evening Peak",
      description: "Solar ramp-down cliff with 680 MW demand surge at 18:30 IST",
      route: "/alerts",
      icon: AlertTriangle,
      iconColor: "text-rose-600 bg-rose-50",
      badge: "Critical",
      keywords: ["deficit", "evening", "peak", "cliff", "shortfall", "-182mw"]
    },
    {
      id: "alert-inverter-overheat",
      type: "ALERTS",
      title: "Inverter Trip Risk: 68°C Cell Temp",
      description: "Sanand Sector 4 Inverter Block B thermal derate advisory",
      route: "/alerts",
      icon: AlertTriangle,
      iconColor: "text-amber-600 bg-amber-50",
      badge: "Warning",
      keywords: ["inverter", "overheat", "derate", "trip", "temperature", "68c"]
    },
    {
      id: "alert-dsm-penalty",
      type: "ALERTS",
      title: "DSM Penalty Exposure: High Merchant Spread",
      description: "Deviation settlement mechanism risk exceeding ₹1.42 Lakhs",
      route: "/alerts",
      icon: AlertTriangle,
      iconColor: "text-amber-600 bg-amber-50",
      badge: "Commercial",
      keywords: ["dsm", "penalty", "settlement", "merchant", "iex", "commercial"]
    },

    // 5. Quick Cloud DB Inspection
    {
      id: "quick-db-inspect",
      type: "MODULES",
      title: "Supabase Database Live Health",
      description: "Inspect Supabase PostgreSQL connection, profiles table & dispatch audit logs",
      action: () => {
        window.open("/api/db/inspect", "_blank");
      },
      icon: Database,
      iconColor: "text-emerald-600 bg-emerald-50",
      badge: "Cloud DB",
      keywords: ["supabase", "db", "database", "postgres", "inspect", "health", "connection"]
    }
  ], []);

  // Filter items based on active category and query
  const filteredItems = useMemo(() => {
    let list = allItems;

    if (activeCategory !== "ALL") {
      list = list.filter(item => item.type === activeCategory);
    }

    if (!query.trim()) {
      return list;
    }

    const q = query.trim().toLowerCase();
    return list.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchBadge = item.badge?.toLowerCase().includes(q);
      const matchKeywords = item.keywords?.some(k => k.includes(q));
      return matchTitle || matchDesc || matchBadge || matchKeywords;
    });
  }, [allItems, activeCategory, query]);

  // Ensure selectedIndex is always within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  // Execute selected item
  const handleSelect = (item) => {
    if (!item) return;

    onClose();

    if (item.action) {
      item.action();
      return;
    }

    if (item.roleId) {
      switchRole(item.roleId);
      return;
    }

    if (item.plantId) {
      setAssignedPlantId(item.plantId);
      navigate("/plants");
      return;
    }

    if (item.state && item.city && item.area) {
      setSelectedState(item.state);
      setSelectedCity(item.city);
      setSelectedArea(item.area);
      navigate("/weather");
      return;
    }

    if (item.route) {
      navigate(item.route);
    }
  };

  // Keyboard navigation inside modal
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      scrollSelectedIntoView(selectedIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      scrollSelectedIntoView(selectedIndex - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  const scrollSelectedIntoView = (index) => {
    if (listRef.current) {
      const elements = listRef.current.querySelectorAll("[data-search-item]");
      if (elements[index]) {
        elements[index].scrollIntoView({ block: "nearest" });
      }
    }
  };

  if (!isOpen) return null;

  const categories = [
    { id: "ALL", label: "All Items" },
    { id: "MODULES", label: "Modules" },
    { id: "PLANTS", label: "Plants & Assets" },
    { id: "LOCATIONS", label: "Locations" },
    { id: "ALERTS", label: "Alerts" }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 relative">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plants, forecasts, alerts, locations, modules..."
            className="w-full text-sm md:text-base font-medium text-slate-800 placeholder-slate-400 bg-transparent border-none outline-none focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div 
          ref={listRef}
          className="overflow-y-auto p-2 divide-y divide-slate-50 flex-1"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No matching results found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for "Bhadla", "Forecast", "Alerts", "Sanand", or "Dispatcher"
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const IconComponent = item.icon || LayoutDashboard;

              return (
                <div
                  key={item.id}
                  data-search-item
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected 
                      ? "bg-blue-50/80 border border-blue-200/80 shadow-2xs" 
                      : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.iconColor || 'text-slate-600 bg-slate-100'}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs md:text-sm font-bold text-slate-900 truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            item.badge === "Critical" 
                              ? "bg-rose-100 text-rose-700" 
                              : item.badge === "Full Control"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                        <span>Select</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? "translate-x-0.5 text-blue-600" : ""}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Keyboard Shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs font-mono text-[10px]">↑</kbd>
              <kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs font-mono text-[10px]">↓</kbd>
              <span className="text-slate-400">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs font-mono text-[10px]">↵</kbd>
              <span className="text-slate-400">Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs font-mono text-[10px]">ESC</kbd>
              <span className="text-slate-400">Close</span>
            </span>
          </div>
          <div className="text-slate-400 font-mono text-[10px]">
            {filteredItems.length} items available
          </div>
        </div>
      </div>
    </div>
  );
}
