# 15 — Frontend Folder Structure & File Architecture

> **Document:** `docs/15_FRONTEND_FOLDER_STRUCTURE.md`  
> **Parent Architecture:** [UI_UX_MASTER_PLAN.md](file:///home/ommistry223/DAIICT/docs/UI_UX_MASTER_PLAN.md)  
> **Status:** Approved Baseline  

---

## 1. Directory Blueprint

The RenewableIQ codebase enforces strict separation of concerns, ensuring predictability and seamless collaboration between frontend engineers and backend/ML engineers:

```
/home/ommistry223/DAIICT/
├── docs/                                # Master Architecture & Specifications (19 files)
│   ├── UI_UX_MASTER_PLAN.md
│   ├── 01_PRODUCT_VISION.md
│   ├── ...
│   └── 18_IMPLEMENTATION_ROADMAP.md
│
├── public/                              # Static Public Assets
│   ├── brand/                           # SVG brand crest, wordmark, favicon
│   ├── icons/                           # Custom SVG energy & grid icons
│   └── manifest.json                    # PWA metadata
│
├── src/
│   ├── app/                             # Next.js App Router Pages & Layouts
│   │   ├── (auth)/                      # Optional authentication grouping
│   │   │   └── sign-in/page.tsx
│   │   ├── dashboard/page.tsx           # Master Operational Overview
│   │   ├── forecast/page.tsx            # Deep 72h Time-Series Forecast Workbench
│   │   ├── risks/page.tsx               # Risk Event Ledger & Anomaly Matrix
│   │   ├── recommendations/page.tsx     # Actionable Mitigation & Dispatch Engine
│   │   ├── scenarios/page.tsx           # What-If Simulation Sandbox
│   │   ├── plant/page.tsx               # Plant Configuration & Digital Twin
│   │   ├── settings/page.tsx            # Platform Configuration & Webhooks
│   │   ├── docs/page.tsx                # Technical Documentation Viewer
│   │   ├── layout.tsx                   # Root HTML Shell (Fonts, Metadata, Lenis)
│   │   ├── page.tsx                     # Commercial Landing Page (11 Sections)
│   │   └── globals.css                  # CSS Custom Properties, Tailwind directives
│   │
│   ├── components/                      # Modular Component Architecture
│   │   ├── ui/                          # Primitive Components (Button, Card, Badge, Table)
│   │   ├── layout/                      # AppShell, AppHeader, AppSidebar, PageContainer
│   │   ├── navigation/                  # Navbar, Breadcrumbs, PlantSelector, HorizonSwitcher
│   │   ├── landing/                     # 11 Landing Page Sections
│   │   ├── dashboard/                   # Operator Dashboard Widgets (KpiGrid, AnomalyFeed)
│   │   ├── forecast/                    # Forecast Workbench Panels & Hourly Tables
│   │   ├── charts/                      # Recharts Wrappers, Confidence Bands, Tooltips
│   │   ├── risk/                        # Risk Threat Matrix, Timeline, Event Cards
│   │   ├── recommendations/             # Prescriptive Action Cards, SCADA Dispatch Modal
│   │   ├── scenarios/                   # What-If Sliders, Diff Chart, Delta Summary
│   │   ├── plant/                       # Digital Twin Forms (Inverter, BESS, Tariffs)
│   │   ├── settings/                    # Alert Threshold Sliders, Webhook Form
│   │   ├── forms/                       # Controlled Inputs, Numeric Steppers
│   │   ├── feedback/                    # Alert Banners, Loading Skeletons, Empty States
│   │   └── shared/                      # StatBlock, DeltaBadge, TelemetryHeartbeat, UtcClock
│   │
│   ├── animations/                      # Motion & Scroll Engine
│   │   ├── presets.ts                   # Framer Motion Variants (fadeUp, fadeIn, scaleIn)
│   │   ├── transitions.ts               # Page & layout spring configurations
│   │   └── hooks/                       # useScrollTrigger, useReducedMotion
│   │
│   ├── config/                          # Centralized Design & System Configuration
│   │   ├── site.ts                      # App title, description, URLs, metadata
│   │   ├── navigation.ts                # Route definitions, sidebar items, icons
│   │   ├── tokens.ts                    # Semantic color tokens, spacing, radiuses, shadows
│   │   └── design.ts                    # Typography scales, chart palettes, grid rules
│   │
│   ├── lib/                             # Utility Functions & Helpers
│   │   ├── utils.ts                     # cn() class merger (clsx + twMerge)
│   │   ├── formatters.ts                # Tabular number, currency, timestamp formatters
│   │   └── constants.ts                 # Engineering conversion factors, default coords
│   │
│   ├── hooks/                           # Custom React Hooks
│   │   ├── use-forecast.ts              # Data-fetching hook with demo fallback
│   │   ├── use-realtime-clock.ts        # Dual UTC and local operational clock
│   │   ├── use-media-query.ts           # Breakpoint listener
│   │   └── use-plant-context.ts         # Active plant state provider hook
│   │
│   ├── types/                           # API-Ready TypeScript Domain Contracts
│   │   ├── energy.ts                    # ForecastPoint, ForecastSummary, ConfidenceQuantile
│   │   ├── weather.ts                   # WeatherCondition, Irradiance, CloudCover
│   │   ├── risk.ts                      # RiskEvent, SeverityLevel, RampAnomaly
│   │   ├── recommendations.ts           # Recommendation, DispatchAction, EconomicImpact
│   │   ├── scenarios.ts                 # ScenarioParameters, ScenarioResult
│   │   ├── plant.ts                     # PlantConfiguration, InverterArray, BessSpec
│   │   └── index.ts                     # Barrel export
│   │
│   └── data/                            # Mock & Demo Data Repository
│       ├── demo-data.ts                 # 72-Hour continuous realistic forecast dataset
│       ├── demo-risks.ts                # Sample ramp events and anomaly scenarios
│       ├── demo-recommendations.ts      # Structured BESS mitigation actions
│       └── demo-plants.ts               # Solar & wind asset specifications
│
├── tailwind.config.ts                   # Tailwind configuration with design tokens
├── tsconfig.json                        # Strict TypeScript compiler options
└── package.json                         # Core dependencies
```

---

## 2. File & Component Naming Conventions

* **React Components:** Kebab-case filenames with PascalCase export (`components/ui/button.tsx` → `export function Button()`).
* **Custom Hooks:** Kebab-case prefixed with `use-` (`hooks/use-realtime-clock.ts` → `export function useRealtimeClock()`).
* **Domain Types:** Grouped by technical domain in `types/` with PascalCase interfaces (`ForecastPoint`, `RiskEvent`).
* **Utility Modules:** Kebab-case in `lib/` with named functional exports (`lib/formatters.ts`).
