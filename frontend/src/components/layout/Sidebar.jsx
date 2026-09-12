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
  Settings
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function Sidebar() {
  const { 
    activeAlertsCount, 
    availableStates, 
    selectedState, 
    selectedCity,
    availableCities,
    forecastData,
    recommendations 
  } = useApp();

  const stateName = availableStates.find(s => s.id === selectedState)?.name || "Gujarat";
  const cityName = availableCities.find(c => c.id === selectedCity)?.name || "";

  // Dynamic telemetry status
  const schedule = forecastData?.hourly_schedule || [];
  const activePoint = schedule.length > 0 ? (schedule.find(s => s.solar_generation_mw > 20) || schedule[0]) : null;
  const gridStatus = activePoint?.system_status; // "SURPLUS" | "DEFICIT" | "BALANCED"

  const navItems = [
    { to: "/dashboard", label: "Command Center", icon: LayoutDashboard },
    { to: "/forecast", label: "Forecast", icon: TrendingUp },
    { 
      to: "/alerts", 
      label: "Risk & Alerts", 
      icon: AlertTriangle, 
      badge: activeAlertsCount > 0 ? String(activeAlertsCount) : undefined,
      badgeStyle: "bg-rose-50 text-rose-600 border-rose-200"
    },
    { 
      to: "/plants", 
      label: "Plants", 
      icon: Factory,
      badge: forecastData?.total_capacity_mw ? `${forecastData.total_capacity_mw}MW` : undefined,
      badgeStyle: "bg-slate-100 text-slate-700 border-slate-200"
    },
    { 
      to: "/forecast?tab=grid", 
      label: "Grid & Demand", 
      icon: Zap,
      badge: gridStatus ? (gridStatus === "BALANCED" ? "Optimal" : gridStatus === "SURPLUS" ? "Surplus" : "Deficit") : undefined,
      badgeStyle: gridStatus === "SURPLUS" 
        ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
        : gridStatus === "DEFICIT" 
        ? "bg-amber-50 text-amber-600 border-amber-200" 
        : "bg-blue-50 text-blue-600 border-blue-200"
    },
    { to: "/recommendations?tab=bess", label: "Battery & Storage", icon: BatteryCharging },
    { 
      to: "/recommendations", 
      label: "AI Advisory", 
      icon: Sparkles,
      badge: recommendations?.length > 0 ? String(recommendations.length) : undefined,
      badgeStyle: "bg-purple-50 text-purple-600 border-purple-200"
    },
    { to: "/weather", label: "Weather", icon: CloudSun },
    { to: "/accuracy", label: "Analytics", icon: BarChart3 },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none h-full overflow-hidden">
      <div className="p-3 space-y-1 overflow-y-auto min-h-0 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) => `
                flex items-center justify-between px-3 py-2 rounded-xl text-xs font-sans font-medium transition-all
                ${isActive 
                  ? "bg-blue-50 text-blue-600 font-semibold shadow-2xs" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }
              `}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${item.badgeStyle || "bg-rose-50 text-rose-600 border-rose-200"}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Promo Card: "Powering a Greener [State]" */}
      <div className="p-3 shrink-0">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
          {/* Text and Leaf Icon */}
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
