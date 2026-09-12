import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  TrendingUp, 
  AlertTriangle, 
  Factory, 
  Zap, 
  BatteryCharging, 
  Sparkles, 
  CloudSun, 
  BarChart3, 
  Settings,
  Shield,
  Radio,
  Sliders,
  TrendingDown,
  X
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ isMobile = false, onClose }) {
  const { 
    activeAlertsCount, 
    availableStates, 
    selectedState, 
    selectedCity,
    availableCities,
    forecastData,
    recommendations 
  } = useApp();

  const { roleConfig, activeRoleId } = useAuth();

  const stateName = availableStates.find(s => s.id === selectedState)?.name || "Gujarat";
  const cityName = availableCities.find(c => c.id === selectedCity)?.name || "";

  // Dynamic telemetry status
  const schedule = forecastData?.hourly_schedule || [];
  const activePoint = schedule.length > 0 ? (schedule.find(s => s.solar_generation_mw > 20) || schedule[0]) : null;
  const gridStatus = activePoint?.system_status; // "SURPLUS" | "DEFICIT" | "BALANCED"

  const navLabels = roleConfig?.navLabels || {
    dashboard: "Command Center",
    forecast: "Forecast",
    alerts: "Risk & Alerts",
    plants: "Plants",
    grid: "Grid & Demand",
    battery: "Battery & Storage",
    recommendations: "AI Advisory",
    weather: "Weather",
    accuracy: "Analytics",
    settings: "Settings",
  };

  const navItems = [
    { id: "dashboard", to: "/dashboard", label: navLabels.dashboard, icon: LayoutDashboard },
    { id: "forecast", to: "/forecast", label: navLabels.forecast, icon: TrendingUp },
    { 
      id: "alerts",
      to: "/alerts", 
      label: navLabels.alerts, 
      icon: AlertTriangle, 
      badge: activeAlertsCount > 0 ? String(activeAlertsCount) : undefined,
      badgeStyle: "bg-rose-50 text-rose-600 border-rose-200"
    },
    { 
      id: "plants",
      to: "/plants", 
      label: navLabels.plants, 
      icon: Factory,
      badge: forecastData?.total_capacity_mw ? `${forecastData.total_capacity_mw}MW` : undefined,
      badgeStyle: "bg-slate-100 text-slate-700 border-slate-200"
    },
    { 
      id: "grid",
      to: "/grid", 
      label: navLabels.grid, 
      icon: Zap,
      badge: gridStatus ? (gridStatus === "BALANCED" ? "Optimal" : gridStatus === "SURPLUS" ? "Surplus" : "Deficit") : undefined,
      badgeStyle: gridStatus === "SURPLUS" 
        ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
        : gridStatus === "DEFICIT" 
        ? "bg-amber-50 text-amber-600 border-amber-200" 
        : "bg-blue-50 text-blue-600 border-blue-200"
    },
    { id: "battery", to: "/battery", label: navLabels.battery, icon: BatteryCharging },
    { 
      id: "recommendations",
      to: "/recommendations", 
      label: navLabels.recommendations, 
      icon: Sparkles,
      badge: recommendations?.length > 0 ? String(recommendations.length) : undefined,
      badgeStyle: "bg-purple-50 text-purple-600 border-purple-200"
    },
    { id: "weather", to: "/weather", label: navLabels.weather, icon: CloudSun },
    { id: "accuracy", to: "/analytics", label: navLabels.accuracy, icon: BarChart3 },
    { id: "settings", to: "/settings", label: navLabels.settings, icon: Settings },
  ];

  // Only display modules that the current role is authorized to access (hide restricted modules)
  const visibleNavItems = navItems.filter((item) => {
    const access = roleConfig?.moduleAccess?.[item.id];
    return access !== "HIDDEN";
  });

  return (
    <aside className={`${isMobile ? "w-full" : "w-56"} bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none h-full overflow-hidden`}>
      {/* Role Profile Badge in Sidebar Header */}
      <div className="p-3 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Active Role
            </span>
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-200/70 text-slate-500 transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 truncate" title={roleConfig?.name}>
            {roleConfig?.name || "Chief Grid Dispatcher"}
          </span>
        </div>
        <div className="mt-0.5 text-[10px] text-slate-500 truncate" title={roleConfig?.primaryQuestion}>
          {roleConfig?.roleTag || "Operations Intelligence"}
        </div>
      </div>

      {/* Nav items */}
      <div className="p-3 space-y-1 overflow-y-auto min-h-0 flex-1">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label + item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              onClick={() => { if (isMobile && onClose) onClose(); }}
              className={({ isActive }) => `
                flex items-center justify-between px-3 py-2 rounded-xl text-xs font-sans font-medium transition-all
                ${isActive 
                  ? "bg-blue-50 text-blue-600 font-semibold shadow-2xs" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }
              `}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border shrink-0 ${item.badgeStyle || "bg-rose-50 text-rose-600 border-rose-200"}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Context Card */}
      <div className="p-3 shrink-0">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
          <div className="flex items-end justify-between gap-1">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900 leading-snug">
                Powering a<br />Greener {stateName}
              </h4>
              <p className="text-[10px] text-slate-500 leading-tight">
                {cityName ? `${cityName} Hub • ` : ""}Sustainable grid intelligence.
              </p>
            </div>
            <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mb-0.5 shadow-2xs">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" stroke="currentColor" strokeWidth="1.5">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
