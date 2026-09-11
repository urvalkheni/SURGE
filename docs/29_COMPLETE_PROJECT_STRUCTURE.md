# RenewableIQ — Complete Current Repository Structure

## Technical Metadata & Architecture Summary

- **Framework & Runtime**: Next.js `15.1.7` (App Router) · React `19.0.0` · Node.js `v20+` · TypeScript `5.7.3`
- **Core Technologies**:
  - **Styling**: Tailwind CSS `3.4.17`, PostCSS `8.5.3`, Autoprefixer `10.5.6`
  - **Animation & Motion**: Motion `12.4.7` (`motion/react`), GSAP `3.12.7`, `@gsap/react` `2.1.1`
  - **Visualization**: Recharts `2.15.1` (Responsive SVG charts, quantile bands, multi-layer overlays)
  - **Primitive Components**: Radix UI (`@radix-ui/react-dialog` `1.1.6`, `@radix-ui/react-dropdown-menu` `2.1.6`)
  - **Icons & Typography**: Lucide React `0.475.0`, Inter (Sans-serif), Manrope (Display)
- **Authentication Architecture**:
  - **Auth.js / NextAuth v5 Beta** (`next-auth@5.0.0-beta.32`)
  - **Provider 1 (Primary)**: Google OAuth 2.0 / OpenID Connect (via `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`)
  - **Provider 2 (Evaluator Fallback)**: 1-Click Demo Operator Session (`credentials` provider for `Om Mistry · Lead Operations Engineer`)
  - **Edge Protection**: Decoupled `src/auth.config.ts` running in Edge Middleware ([`src/middleware.ts`](file:///home/ommistry223/DAIICT/src/middleware.ts)) to protect `/dashboard`, `/forecast`, `/risks`, `/recommendations`, `/scenarios`, `/plant`, `/settings`, and `/profile` with zero Node.js compression warnings
- **API Architecture**:
  - Decoupled client-service architecture in `src/services/api/`
  - Centralized HTTP client (`client.ts`) with 4-second timeout, `AbortController`, and structured `ApiError` hierarchy
  - Typed request & response contracts ([`src/services/api/types.ts`](file:///home/ommistry223/DAIICT/src/services/api/types.ts))
- **Current Demo / ML Fallback Architecture**:
  - **Dual-Mode Provider Pattern**: Services check `NEXT_PUBLIC_API_BASE_URL`. If configured and reachable, queries live FastAPI endpoints (`/api/v1/forecast`, `/api/v1/risks`, `/api/v1/recommendations`).
  - **Deterministic Demo Fallback**: If `NEXT_PUBLIC_API_BASE_URL` is omitted, offline, or returns an error, services return authoritative deterministic generation curves and risk events.
  - **Telemetry Transparency**: Explicit badges show `API LIVE` vs `DEMO DATA` / `DEMO FALLBACK`. Never presents synthetic data as live SCADA feeds.
- **Current Canonical Plant**:
  - **Asset Name**: **Ahmedabad Solar Plant**
  - **Capacity**: **42 MW AC / 50 MW DC** (DC/AC overbuild ratio: 1.19×)
  - **Grid Interconnection**: **GETCO 220kV Substation (Sarkhej)** · Node ID: `GETCO-SARKHEJ-220KV`
  - **Coordinates**: `23.0225° N, 72.5714° E` (Gujarat, India)
  - **SCADA Telemetry**: `SCADA SIMULATED · 18ms latency`

---

## 1. Full Folder Tree

```
DAIICT/
├── .env.example
├── .gitignore
├── README.md
├── eslint.config.mjs
├── next.config.mjs
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── docs/
│   ├── 00_PRD.md
│   ├── 01_PRODUCT_VISION.md
│   ├── 02_INFORMATION_ARCHITECTURE.md
│   ├── 03_DESIGN_SYSTEM.md
│   ├── 04_COLOR_SYSTEM.md
│   ├── 05_TYPOGRAPHY.md
│   ├── 06_COMPONENT_ARCHITECTURE.md
│   ├── 07_LANDING_PAGE_SPEC.md
│   ├── 08_DASHBOARD_SPEC.md
│   ├── 09_ANIMATION_SYSTEM.md
│   ├── 10_SCROLL_EXPERIENCE.md
│   ├── 11_RESPONSIVE_DESIGN.md
│   ├── 12_ACCESSIBILITY.md
│   ├── 13_PERFORMANCE.md
│   ├── 14_TECH_STACK.md
│   ├── 15_FRONTEND_FOLDER_STRUCTURE.md
│   ├── 16_DEVELOPMENT_RULES.md
│   ├── 17_DO_AND_DONT.md
│   ├── 18_IMPLEMENTATION_ROADMAP.md
│   ├── 19_REPOSITORY_AUDIT.md
│   ├── 21_DESIGN_SYSTEM_IMPLEMENTATION.md
│   ├── 22_PHASE_2_5_FOUNDATION_AUDIT.md
│   ├── 23_PHASE_3_LANDING_HERO.md
│   ├── 24_PHASE_4_OPERATIONAL_SCROLL_STORY.md
│   ├── 25_PHASE_5_OPERATIONAL_COMMAND_CENTER.md
│   ├── 26_PHASE_6_DEEP_DIVE_OPERATIONAL_INTELLIGENCE.md
│   ├── 27_BACKEND_API_CONTRACT.md
│   ├── 28_PHASE_7_PLATFORM_COMPLETION.md
│   ├── 29_COMPLETE_PROJECT_STRUCTURE.md
│   └── UI_UX_MASTER_PLAN.md
└── src/
    ├── auth.config.ts
    ├── auth.ts
    ├── middleware.ts
    ├── animations/
    │   ├── gsap.ts
    │   ├── motion.ts
    │   └── presets.ts
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── api/
    │   │   └── auth/
    │   │       └── [...nextauth]/
    │   │           └── route.ts
    │   ├── dashboard/
    │   │   └── page.tsx
    │   ├── forecast/
    │   │   └── page.tsx
    │   ├── login/
    │   │   └── page.tsx
    │   ├── plant/
    │   │   └── page.tsx
    │   ├── profile/
    │   │   └── page.tsx
    │   ├── recommendations/
    │   │   └── page.tsx
    │   ├── risks/
    │   │   └── page.tsx
    │   ├── scenarios/
    │   │   └── page.tsx
    │   └── settings/
    │       └── page.tsx
    ├── components/
    │   ├── charts/
    │   │   └── forecast-chart.tsx
    │   ├── dashboard/
    │   │   ├── current-condition.tsx
    │   │   ├── dashboard-header.tsx
    │   │   ├── dashboard-kpi-strip.tsx
    │   │   ├── dashboard-view.tsx
    │   │   ├── generation-overview.tsx
    │   │   ├── impact-summary.tsx
    │   │   ├── outlook-table.tsx
    │   │   ├── recommendation-card.tsx
    │   │   ├── risk-summary.tsx
    │   │   └── weather-summary.tsx
    │   ├── feedback/
    │   │   ├── api-status-banner.tsx
    │   │   ├── demo-badge.tsx
    │   │   ├── empty-state.tsx
    │   │   ├── error-state.tsx
    │   │   ├── index.ts
    │   │   └── loading-skeleton.tsx
    │   ├── forecast/
    │   │   ├── forecast-accuracy-panel.tsx
    │   │   ├── forecast-chart-panel.tsx
    │   │   ├── forecast-insights.tsx
    │   │   ├── forecast-metrics-strip.tsx
    │   │   ├── forecast-workbench-header.tsx
    │   │   ├── hourly-forecast-table.tsx
    │   │   └── schedule-comparison.tsx
    │   ├── landing/
    │   │   ├── action-intelligence.tsx
    │   │   ├── final-cta.tsx
    │   │   ├── forecast-kpi-strip.tsx
    │   │   ├── forecast-section.tsx
    │   │   ├── forecast-transition.tsx
    │   │   ├── hero-forecast-visualizer.tsx
    │   │   ├── hero-section.tsx
    │   │   ├── impact-intelligence.tsx
    │   │   ├── impact-section.tsx
    │   │   ├── intelligence-flow.tsx
    │   │   ├── landing-header.tsx
    │   │   ├── risk-intelligence.tsx
    │   │   ├── weather-context-strip.tsx
    │   │   ├── weather-intelligence.tsx
    │   │   └── scroll/
    │   │       └── operational-scroll-story.tsx
    │   ├── layout/
    │   │   ├── account-menu.tsx
    │   │   ├── app-header.tsx
    │   │   ├── app-shell.tsx
    │   │   ├── app-sidebar.tsx
    │   │   ├── breadcrumbs.tsx
    │   │   ├── index.ts
    │   │   ├── mobile-nav.tsx
    │   │   ├── page-container.tsx
    │   │   └── page-header.tsx
    │   ├── recommendations/
    │   │   ├── action-history-log.tsx
    │   │   ├── action-timeline-card.tsx
    │   │   ├── alternative-actions-table.tsx
    │   │   ├── operator-override-sandbox.tsx
    │   │   ├── primary-recommendation-panel.tsx
    │   │   ├── recommendations-header.tsx
    │   │   └── simulated-execution-dialog.tsx
    │   ├── risks/
    │   │   ├── risk-diagnostic-inspector.tsx
    │   │   ├── risk-header.tsx
    │   │   ├── risk-ledger-table.tsx
    │   │   ├── risk-summary-strip.tsx
    │   │   ├── risk-timeline.tsx
    │   │   └── root-cause-chain.tsx
    │   └── ui/
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── dialog.tsx
    │       ├── dropdown-menu.tsx
    │       ├── index.ts
    │       ├── input.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── table.tsx
    │       ├── tabs.tsx
    │       └── tooltip.tsx
    ├── config/
    │   ├── design.ts
    │   ├── navigation.ts
    │   ├── site.ts
    │   └── tokens.ts
    ├── data/
    │   └── demo-data.ts
    ├── hooks/
    │   └── use-reduced-motion.ts
    ├── lib/
    │   ├── formatters.ts
    │   └── utils.ts
    ├── providers/
    │   ├── providers.tsx
    │   ├── session-provider.tsx
    │   └── theme-provider.tsx
    ├── services/
    │   ├── index.ts
    │   ├── api/
    │   │   ├── client.ts
    │   │   ├── forecast.service.ts
    │   │   ├── index.ts
    │   │   ├── recommendations.service.ts
    │   │   ├── risks.service.ts
    │   │   └── types.ts
    │   ├── forecast/
    │   │   └── forecast-service.ts
    │   ├── recommendations/
    │   │   └── recommendation-service.ts
    │   ├── risk/
    │   │   └── risk-service.ts
    │   ├── scenarios/
    │   │   └── scenario-service.ts
    │   └── weather/
    │       └── weather-service.ts
    └── types/
        ├── energy.ts
        ├── index.ts
        ├── plant.ts
        ├── recommendations.ts
        ├── risk.ts
        ├── scenarios.ts
        └── weather.ts
```

---

## 2. Every Important File by Architectural Category

### Category A: Configuration & Build Setup
| Exact File Path | One-Line Purpose |
| :--- | :--- |
| [`package.json`](file:///home/ommistry223/DAIICT/package.json) | Declares production dependencies, dev tooling, build scripts, and engine constraints. |
| [`package-lock.json`](file:///home/ommistry223/DAIICT/package-lock.json) | Deterministic lockfile pinning exact dependency versions. |
| [`tsconfig.json`](file:///home/ommistry223/DAIICT/tsconfig.json) | TypeScript compiler options with strict type checking and path aliases (`@/*`). |
| [`next.config.mjs`](file:///home/ommistry223/DAIICT/next.config.mjs) | Next.js configuration enabling React strict mode and production compiler options. |
| [`tailwind.config.ts`](file:///home/ommistry223/DAIICT/tailwind.config.ts) | Tailwind theme extension with industrial energy color tokens, fonts, and box shadows. |
| [`postcss.config.js`](file:///home/ommistry223/DAIICT/postcss.config.js) | PostCSS pipeline integrating Tailwind CSS and Autoprefixer. |
| [`eslint.config.mjs`](file:///home/ommistry223/DAIICT/eslint.config.mjs) | ESLint configuration for Next.js 15, TypeScript rules, and import hygiene. |
| [`.env.example`](file:///home/ommistry223/DAIICT/.env.example) | Public environment variable blueprint containing variable names without credentials. |
| [`.gitignore`](file:///home/ommistry223/DAIICT/.gitignore) | Git ignore patterns preventing `.env*`, `node_modules`, and build traces from being committed. |
| [`README.md`](file:///home/ommistry223/DAIICT/README.md) | Platform overview, quickstart instructions, tech stack summary, and developer workflows. |

---

### Category B: Authentication & Security
| Exact File Path | One-Line Purpose |
| :--- | :--- |
| [`src/auth.config.ts`](file:///home/ommistry223/DAIICT/src/auth.config.ts) | Lightweight Edge-compatible NextAuth configuration containing route authorization logic. |
| [`src/auth.ts`](file:///home/ommistry223/DAIICT/src/auth.ts) | Node.js Auth.js initialization configuring Google OAuth and Demo Operator providers. |
| [`src/middleware.ts`](file:///home/ommistry223/DAIICT/src/middleware.ts) | Edge middleware enforcing authentication across protected routes and redirecting to `/login`. |
| [`src/app/api/auth/[...nextauth]/route.ts`](file:///home/ommistry223/DAIICT/src/app/api/auth/[...nextauth]/route.ts) | Next.js API route handler exposing Auth.js authentication and session endpoints. |
| [`src/providers/session-provider.tsx`](file:///home/ommistry223/DAIICT/src/providers/session-provider.tsx) | Client component wrapping Auth.js `SessionProvider` for reactive session states. |

---

### Category C: Routes & Page Controllers (`src/app/`)
| Exact File Path | One-Line Purpose |
| :--- | :--- |
| [`src/app/layout.tsx`](file:///home/ommistry223/DAIICT/src/app/layout.tsx) | Root application layout loading Inter & Manrope fonts, metadata, and global providers. |
| [`src/app/globals.css`](file:///home/ommistry223/DAIICT/src/app/globals.css) | Global Tailwind CSS styles, design tokens, focus rings, and dark/light variables. |
| [`src/app/page.tsx`](file:///home/ommistry223/DAIICT/src/app/page.tsx) | Public landing page featuring interactive 72-hour forecast visualizer and scroll story. |
| [`src/app/login/page.tsx`](file:///home/ommistry223/DAIICT/src/app/login/page.tsx) | Industrial energy-tech login page with Google OAuth, 1-click Demo Operator, and error states. |
| [`src/app/dashboard/page.tsx`](file:///home/ommistry223/DAIICT/src/app/dashboard/page.tsx) | Operational Command Center presenting live KPIs, generation curves, risks, and dispatches. |
| [`src/app/forecast/page.tsx`](file:///home/ommistry223/DAIICT/src/app/forecast/page.tsx) | 72-Hour Forecast Workbench with horizon toggles, Recharts quantile layer toggles, and CSV export. |
| [`src/app/risks/page.tsx`](file:///home/ommistry223/DAIICT/src/app/risks/page.tsx) | Risk Intelligence Ledger with interactive event inspection and visual causal root cause chain. |
| [`src/app/recommendations/page.tsx`](file:///home/ommistry223/DAIICT/src/app/recommendations/page.tsx) | Prescriptive Operations Workstation with REC-4011 execution, alternative options, and sandbox slider. |
| [`src/app/scenarios/page.tsx`](file:///home/ommistry223/DAIICT/src/app/scenarios/page.tsx) | Scenario Analysis Sandbox for stress-testing generation under cloud shocks and heatwaves. |
| [`src/app/plant/page.tsx`](file:///home/ommistry223/DAIICT/src/app/plant/page.tsx) | Plant Digital Twin configuration showing hardware parametrization and inverter blocks. |
| [`src/app/profile/page.tsx`](file:///home/ommistry223/DAIICT/src/app/profile/page.tsx) | Operator profile workstation displaying authenticated identity, credentials, and asset assignment. |
| [`src/app/settings/page.tsx`](file:///home/ommistry223/DAIICT/src/app/settings/page.tsx) | Platform settings covering Account, Plant twin, local notification filters, and ML API status. |

---

### Category D: API Service Layer & ML Backend Boundary
| Exact File Path | One-Line Purpose |
| :--- | :--- |
| [`src/services/api/client.ts`](file:///home/ommistry223/DAIICT/src/services/api/client.ts) | Base HTTP client reading `NEXT_PUBLIC_API_BASE_URL` with timeouts, aborts, and error mapping. |
| [`src/services/api/types.ts`](file:///home/ommistry223/DAIICT/src/services/api/types.ts) | Canonical TypeScript request and response interfaces for external ML/FastAPI services. |
| [`src/services/api/forecast.service.ts`](file:///home/ommistry223/DAIICT/src/services/api/forecast.service.ts) | Dual-mode 72-hour forecast service consuming live ML predictions or demo fallback. |
| [`src/services/api/risks.service.ts`](file:///home/ommistry223/DAIICT/src/services/api/risks.service.ts) | Dual-mode risk intelligence service consuming live anomaly detection or demo fallback. |
| [`src/services/api/recommendations.service.ts`](file:///home/ommistry223/DAIICT/src/services/api/recommendations.service.ts) | Dual-mode dispatch service calculating BESS discharge setpoints or demo fallback. |
| [`src/services/api/index.ts`](file:///home/ommistry223/DAIICT/src/services/api/index.ts) | Barrel export for centralized API services and contract types. |
| [`src/components/feedback/api-status-banner.tsx`](file:///home/ommistry223/DAIICT/src/components/feedback/api-status-banner.tsx) | Reusable error banner and status indicator showing `API LIVE` vs `DEMO DATA` / `DEMO FALLBACK`. |
| [`src/components/feedback/loading-skeleton.tsx`](file:///home/ommistry223/DAIICT/src/components/feedback/loading-skeleton.tsx) | Reusable design-system skeleton loaders for metrics, charts, and tables without giant spinners. |

---

### Category E: Canonical Demo Data & Legacy Service Layers
| Exact File Path | One-Line Purpose |
| :--- | :--- |
| [`src/data/demo-data.ts`](file:///home/ommistry223/DAIICT/src/data/demo-data.ts) | Authoritative deterministic data fixtures for Ahmedabad Solar Plant (42 MW AC / 50 MW DC). |
| [`src/services/forecast/forecast-service.ts`](file:///home/ommistry223/DAIICT/src/services/forecast/forecast-service.ts) | Client domain service providing forecast summaries and generation point queries. |
| [`src/services/risk/risk-service.ts`](file:///home/ommistry223/DAIICT/src/services/risk/risk-service.ts) | Client domain service providing active risk events and severity-filtered queries. |
| [`src/services/recommendations/recommendation-service.ts`](file:///home/ommistry223/DAIICT/src/services/recommendations/recommendation-service.ts) | Client domain service providing dispatch recommendations and simulation execution. |
| [`src/services/scenarios/scenario-service.ts`](file:///home/ommistry223/DAIICT/src/services/scenarios/scenario-service.ts) | Client domain service providing scenario parameters and stress-test calculations. |
| [`src/services/weather/weather-service.ts`](file:///home/ommistry223/DAIICT/src/services/weather/weather-service.ts) | Client domain service providing DNI, GHI, temperature, and cloud cover weather feeds. |
| [`src/services/index.ts`](file:///home/ommistry223/DAIICT/src/services/index.ts) | Barrel export re-exporting all domain services and API services. |

---

### Category F: Component Architecture (`src/components/`)

#### 1. Layout Shell (`src/components/layout/`)
| Exact File Path | One-Line Purpose |
| :--- | :--- |
| [`src/components/layout/app-shell.tsx`](file:///home/ommistry223/DAIICT/src/components/layout/app-shell.tsx) | Master responsive application shell coordinating sidebar, header, mobile drawer, and main content. |
| [`src/components/layout/app-header.tsx`](file:///home/ommistry223/DAIICT/src/components/layout/app-header.tsx) | Control room header with asset selector, operational clocks, SCADA heartbeat, and account dropdown. |
| [`src/components/layout/app-sidebar.tsx`](file:///home/ommistry223/DAIICT/src/components/layout/app-sidebar.tsx) | Desktop navigation sidebar with categorized routes, active indicators, and GETCO-220KV node badge. |
| [`src/components/layout/mobile-nav.tsx`](file:///home/ommistry223/DAIICT/src/components/layout/mobile-nav.tsx) | Slide-out mobile navigation drawer with 44px touch targets and dedicated sign-out strip. |
| [`src/components/layout/account-menu.tsx`](file:///home/ommistry223/DAIICT/src/components/layout/account-menu.tsx) | Radix DropdownMenu trigger displaying operator avatar, profile link, settings link, and sign-out. |
| [`src/components/layout/page-container.tsx`](file:///home/ommistry223/DAIICT/src/components/layout/page-container.tsx) | Responsive bounded layout container with standard padding for all inner workstations. |
| [`src/components/layout/page-header.tsx`](file:///home/ommistry223/DAIICT/src/components/layout/page-header.tsx) | Unified workstation title bar with breadcrumbs, descriptions, and operational action buttons. |
| [`src/components/layout/breadcrumbs.tsx`](file:///home/ommistry223/DAIICT/src/components/layout/breadcrumbs.tsx) | Accessible navigational breadcrumb trail for deep-dive workstation hierarchy. |
| [`src/components/layout/index.ts`](file:///home/ommistry223/DAIICT/src/components/layout/index.ts) | Barrel export for layout shell components. |

#### 2. Design System Primitives (`src/components/ui/`)
| Exact File Path | One-Line Purpose |
| :--- | :--- |
| [`src/components/ui/badge.tsx`](file:///home/ommistry223/DAIICT/src/components/ui/badge.tsx) | Semantic status badges (`nominal`, `warning`, `critical`, `info`, `outline`). |
| [`src/components/ui/button.tsx`](file:///home/ommistry223/DAIICT/src/components/ui/button.tsx) | CVA-styled accessible button supporting primary, secondary, outline, ghost, and danger variants. |
| [`src/components/ui/card.tsx`](file:///home/ommistry223/DAIICT/src/components/ui/card.tsx) | Structural card container with header, title, description, content, and footer primitives. |
| [`src/components/ui/dialog.tsx`](file:///home/ommistry223/DAIICT/src/components/ui/dialog.tsx) | Radix UI accessible modal dialog with backdrop blur and keyboard trap. |
| [`src/components/ui/dropdown-menu.tsx`](file:///home/ommistry223/DAIICT/src/components/ui/dropdown-menu.tsx) | Radix UI accessible dropdown menu with items, groups, labels, and separators. |
| [`src/components/ui/input.tsx`](file:///home/ommistry223/DAIICT/src/components/ui/input.tsx) | Styled accessible form input field with focus ring. |
| [`src/components/ui/select.tsx`](file:///home/ommistry223/DAIICT/src/components/ui/select.tsx) | Styled HTML native select dropdown with ChevronDown adornment. |
| [`src/components/ui/separator.tsx`](file:///home/ommistry223/DAIICT/src/components/ui/separator.tsx) | Accessible horizontal or vertical structural divider line. |
| [`src/components/ui/table.tsx`](file:///home/ommistry223/DAIICT/src/components/ui/table.tsx) | Accessible HTML table primitives (`TableHeader`, `TableBody`, `TableRow`, `TableCell`). |
| [`src/components/ui/tabs.tsx`](file:///home/ommistry223/DAIICT/src/components/ui/tabs.tsx) | Tab switching navigation primitives for multi-section workstations. |
| [`src/components/ui/tooltip.tsx`](file:///home/ommistry223/DAIICT/src/components/ui/tooltip.tsx) | Accessible hover tooltip component with positioning offsets. |
| [`src/components/ui/index.ts`](file:///home/ommistry223/DAIICT/src/components/ui/index.ts) | Barrel export for design system UI primitives. |

#### 3. Operational Dashboard (`src/components/dashboard/`)
| Exact File Path | One-Line Purpose |
| :--- | :--- |
| [`src/components/dashboard/dashboard-view.tsx`](file:///home/ommistry223/DAIICT/src/components/dashboard/dashboard-view.tsx) | Root view orchestrating all panels on `/dashboard`. |
| [`src/components/dashboard/dashboard-header.tsx`](file:///home/ommistry223/DAIICT/src/components/dashboard/dashboard-header.tsx) | Plant identity header with live SCADA badge and quick action buttons. |
| [`src/components/dashboard/dashboard-kpi-strip.tsx`](file:///home/ommistry223/DAIICT/src/components/dashboard/dashboard-kpi-strip.tsx) | 4 key telemetry KPI cards (Current Power, 72h Energy, Active Risk, Model Accuracy). |
| [`src/components/dashboard/generation-overview.tsx`](file:///home/ommistry223/DAIICT/src/components/dashboard/generation-overview.tsx) | Generation chart panel displaying forecasted curve vs day-ahead schedule. |
| [`src/components/dashboard/current-condition.tsx`](file:///home/ommistry223/DAIICT/src/components/dashboard/current-condition.tsx) | Atmospheric conditions card (GHI, DNI, Ambient Temp, Wind Speed). |
| [`src/components/dashboard/risk-summary.tsx`](file:///home/ommistry223/DAIICT/src/components/dashboard/risk-summary.tsx) | Active risk alert card highlighting the convective cloud ramp rate breach. |
| [`src/components/dashboard/recommendation-card.tsx`](file:///home/ommistry223/DAIICT/src/components/dashboard/recommendation-card.tsx) | Prescriptive recommendation card linking to REC-4011 BESS dispatch. |
| [`src/components/dashboard/outlook-table.tsx`](file:///home/ommistry223/DAIICT/src/components/dashboard/outlook-table.tsx) | 3-day operational outlook table summarizing generation and risk windows. |
| [`src/components/dashboard/impact-summary.tsx`](file:///home/ommistry223/DAIICT/src/components/dashboard/impact-summary.tsx) | Financial savings and avoided curtailment impact scorecard. |
| [`src/components/dashboard/weather-summary.tsx`](file:///home/ommistry223/DAIICT/src/components/dashboard/weather-summary.tsx) | Meteorological satellite and radar synopsis card. |

#### 4. Forecast Workbench (`src/components/forecast/`)
| Exact File Path | One-Line Purpose |
| :--- | :--- |
| [`src/components/forecast/forecast-workbench-header.tsx`](file:///home/ommistry223/DAIICT/src/components/forecast/forecast-workbench-header.tsx) | Horizon (`24H/48H/72H`), resolution (`15m/1h`), model run tag, and CSV export. |
| [`src/components/forecast/forecast-metrics-strip.tsx`](file:///home/ommistry223/DAIICT/src/components/forecast/forecast-metrics-strip.tsx) | 6-metric summary strip (Peak Forecast, Day-1 Energy, 72H Total, MAE, Bias, Spread). |
| [`src/components/forecast/forecast-chart-panel.tsx`](file:///home/ommistry223/DAIICT/src/components/forecast/forecast-chart-panel.tsx) | Interactive Recharts panel with layer toggle checkboxes (P50, P10-P90, Schedule, Actuals). |
| [`src/components/forecast/forecast-accuracy-panel.tsx`](file:///home/ommistry223/DAIICT/src/components/forecast/forecast-accuracy-panel.tsx) | Accuracy benchmark card (MAE 1.42 MW, RMSE 1.84 MW) and ensemble constituent weights. |
| [`src/components/forecast/hourly-forecast-table.tsx`](file:///home/ommistry223/DAIICT/src/components/forecast/hourly-forecast-table.tsx) | Paginated, searchable tabular forecast with row-level ramp warning highlights. |
| [`src/components/forecast/schedule-comparison.tsx`](file:///home/ommistry223/DAIICT/src/components/forecast/schedule-comparison.tsx) | Detailed schedule deviation analysis analyzing the Hour 14–15 under-generation deficit. |
| [`src/components/forecast/forecast-insights.tsx`](file:///home/ommistry223/DAIICT/src/components/forecast/forecast-insights.tsx) | Structured AI analytical findings explaining meteorological phenomena and ramp risks. |

#### 5. Risk Intelligence Ledger (`src/components/risks/`)
| Exact File Path | One-Line Purpose |
| :--- | :--- |
| [`src/components/risks/risk-header.tsx`](file:///home/ommistry223/DAIICT/src/components/risks/risk-header.tsx) | Header with active risk badges, composite risk score (62/100), and filter controls. |
| [`src/components/risks/risk-summary-strip.tsx`](file:///home/ommistry223/DAIICT/src/components/risks/risk-summary-strip.tsx) | Operational risk KPI cards (Active High Risks, Total Events, Max Ramp, Financial Exposure). |
| [`src/components/risks/risk-ledger-table.tsx`](file:///home/ommistry223/DAIICT/src/components/risks/risk-ledger-table.tsx) | Interactive ledger table with row selection focusing the diagnostic inspector. |
| [`src/components/risks/risk-diagnostic-inspector.tsx`](file:///home/ommistry223/DAIICT/src/components/risks/risk-diagnostic-inspector.tsx) | Deep diagnostic panel showing atmospheric parameters ($\tau=4.8$, DNI collapse) and impact. |
| [`src/components/risks/root-cause-chain.tsx`](file:///home/ommistry223/DAIICT/src/components/risks/root-cause-chain.tsx) | Step-by-step visual causal sequence flow from cloud front to financial penalty. |
| [`src/components/risks/risk-timeline.tsx`](file:///home/ommistry223/DAIICT/src/components/risks/risk-timeline.tsx) | 72-hour chronological projection timeline with clickable nodes. |

#### 6. Prescriptive Operations Workstation (`src/components/recommendations/`)
| Exact File Path | One-Line Purpose |
| :--- | :--- |
| [`src/components/recommendations/recommendations-header.tsx`](file:///home/ommistry223/DAIICT/src/components/recommendations/recommendations-header.tsx) | Header with active prescription count and SCADA simulated safety interlock notice. |
| [`src/components/recommendations/primary-recommendation-panel.tsx`](file:///home/ommistry223/DAIICT/src/components/recommendations/primary-recommendation-panel.tsx) | Hero action card for REC-4011 BESS discharge with simulated execution state management. |
| [`src/components/recommendations/simulated-execution-dialog.tsx`](file:///home/ommistry223/DAIICT/src/components/recommendations/simulated-execution-dialog.tsx) | Confirmation modal requiring operator verification before dispatch execution. |
| [`src/components/recommendations/action-timeline-card.tsx`](file:///home/ommistry223/DAIICT/src/components/recommendations/action-timeline-card.tsx) | 5-step operational dispatch procedure from SOC verification to standby return. |
| [`src/components/recommendations/alternative-actions-table.tsx`](file:///home/ommistry223/DAIICT/src/components/recommendations/alternative-actions-table.tsx) | Comparison matrix of 4 operational strategies (BESS, Curtailment, Penalties, Spot Market). |
| [`src/components/recommendations/operator-override-sandbox.tsx`](file:///home/ommistry223/DAIICT/src/components/recommendations/operator-override-sandbox.tsx) | Interactive setpoint slider (0–20 MW) recalculating ramp rate, compliance, and penalties. |
| [`src/components/recommendations/action-history-log.tsx`](file:///home/ommistry223/DAIICT/src/components/recommendations/action-history-log.tsx) | SCADA simulated execution audit trail of past operational decisions. |

#### 7. Landing Page Experience (`src/components/landing/`)
| Exact File Path | One-Line Purpose |
| :--- | :--- |
| [`src/components/landing/landing-header.tsx`](file:///home/ommistry223/DAIICT/src/components/landing/landing-header.tsx) | Public marketing header with brand logo, product links, and login gateway button. |
| [`src/components/landing/hero-section.tsx`](file:///home/ommistry223/DAIICT/src/components/landing/hero-section.tsx) | Marketing hero section introducing RenewableIQ generation forecasting. |
| [`src/components/landing/hero-forecast-visualizer.tsx`](file:///home/ommistry223/DAIICT/src/components/landing/hero-forecast-visualizer.tsx) | Interactive SVG/Recharts 72-hour forecast visualizer with hover inspection. |
| [`src/components/landing/forecast-kpi-strip.tsx`](file:///home/ommistry223/DAIICT/src/components/landing/forecast-kpi-strip.tsx) | 4-metric highlight strip below the landing hero visualizer. |
| [`src/components/landing/forecast-transition.tsx`](file:///home/ommistry223/DAIICT/src/components/landing/forecast-transition.tsx) | Narrative transition block connecting hero visualizer to operational scroll story. |
| [`src/components/landing/intelligence-flow.tsx`](file:///home/ommistry223/DAIICT/src/components/landing/intelligence-flow.tsx) | Visual pipeline flow: Weather $\to$ Forecast $\to$ Risk $\to$ Action $\to$ Impact. |
| [`src/components/landing/weather-intelligence.tsx`](file:///home/ommistry223/DAIICT/src/components/landing/weather-intelligence.tsx) | Scroll story section 1: Atmospheric telemetry and convective cell tracking. |
| [`src/components/landing/weather-context-strip.tsx`](file:///home/ommistry223/DAIICT/src/components/landing/weather-context-strip.tsx) | Ambient weather metric ribbon accompanying the weather section. |
| [`src/components/landing/forecast-section.tsx`](file:///home/ommistry223/DAIICT/src/components/landing/forecast-section.tsx) | Scroll story section 2: Probabilistic generation forecasting and quantile bounds. |
| [`src/components/landing/risk-intelligence.tsx`](file:///home/ommistry223/DAIICT/src/components/landing/risk-intelligence.tsx) | Scroll story section 3: Operational ramp breaches and grid compliance risks. |
| [`src/components/landing/action-intelligence.tsx`](file:///home/ommistry223/DAIICT/src/components/landing/action-intelligence.tsx) | Scroll story section 4: Prescriptive BESS battery ramp-smoothing dispatches. |
| [`src/components/landing/impact-section.tsx`](file:///home/ommistry223/DAIICT/src/components/landing/impact-section.tsx) | Scroll story section 5: Avoided financial penalties and carbon mitigation scorecard. |
| [`src/components/landing/impact-intelligence.tsx`](file:///home/ommistry223/DAIICT/src/components/landing/impact-intelligence.tsx) | Detailed impact matrix comparing unmitigated vs mitigated generation outcomes. |
| [`src/components/landing/final-cta.tsx`](file:///home/ommistry223/DAIICT/src/components/landing/final-cta.tsx) | Conversion call-to-action directing users into the operational command center. |
| [`src/components/landing/scroll/operational-scroll-story.tsx`](file:///home/ommistry223/DAIICT/src/components/landing/scroll/operational-scroll-story.tsx) | Master orchestrator coordinating smooth scroll progression through the five stages. |

#### 8. Charts & Feedback Primitives (`src/components/charts/`, `src/components/feedback/`)
| Exact File Path | One-Line Purpose |
| :--- | :--- |
| [`src/components/charts/forecast-chart.tsx`](file:///home/ommistry223/DAIICT/src/components/charts/forecast-chart.tsx) | Core reusable Recharts forecast visualizer component with uncertainty bands. |
| [`src/components/feedback/demo-badge.tsx`](file:///home/ommistry223/DAIICT/src/components/feedback/demo-badge.tsx) | Header badge communicating `DEMO SCENARIO` or `SIMULATED` operational mode. |
| [`src/components/feedback/empty-state.tsx`](file:///home/ommistry223/DAIICT/src/components/feedback/empty-state.tsx) | Empty data placeholder card with actionable icon and message. |
| [`src/components/feedback/error-state.tsx`](file:///home/ommistry223/DAIICT/src/components/feedback/error-state.tsx) | Error boundary placeholder card with error details and retry button. |
| [`src/components/feedback/index.ts`](file:///home/ommistry223/DAIICT/src/components/feedback/index.ts) | Barrel export for feedback UI components. |

---

### Category G: Core Library, Hooks, Providers, & Types

#### 1. Configuration & Libs (`src/config/`, `src/lib/`, `src/hooks/`)
| Exact File Path | One-Line Purpose |
| :--- | :--- |
| [`src/config/site.ts`](file:///home/ommistry223/DAIICT/src/config/site.ts) | Site metadata, navigation links, and operational platform specifications. |
| [`src/config/tokens.ts`](file:///home/ommistry223/DAIICT/src/config/tokens.ts) | Design system color hex constants, typography scales, and spacing tokens. |
| [`src/config/design.ts`](file:///home/ommistry223/DAIICT/src/config/design.ts) | Design system layout constants, border radii, and visual styling guidelines. |
| [`src/config/navigation.ts`](file:///home/ommistry223/DAIICT/src/config/navigation.ts) | Main navigation structure definitions and icon assignments. |
| [`src/lib/utils.ts`](file:///home/ommistry223/DAIICT/src/lib/utils.ts) | Class name merger utility (`cn`) combining `clsx` and `tailwind-merge`. |
| [`src/lib/formatters.ts`](file:///home/ommistry223/DAIICT/src/lib/formatters.ts) | Numerical and date formatting functions (power MW, energy MWh, currency USD/INR, time). |
| [`src/hooks/use-reduced-motion.ts`](file:///home/ommistry223/DAIICT/src/hooks/use-reduced-motion.ts) | Media query hook detecting `prefers-reduced-motion` for accessibility compliance. |

#### 2. Animation Engine (`src/animations/`)
| Exact File Path | One-Line Purpose |
| :--- | :--- |
| [`src/animations/motion.ts`](file:///home/ommistry223/DAIICT/src/animations/motion.ts) | Motion/react animation variants (fade-in, slide-up, stagger containers). |
| [`src/animations/gsap.ts`](file:///home/ommistry223/DAIICT/src/animations/gsap.ts) | GSAP scroll trigger utilities and timeline animation orchestrators. |
| [`src/animations/presets.ts`](file:///home/ommistry223/DAIICT/src/animations/presets.ts) | Standardized transition durations, easings, and animation timing curves. |

#### 3. Context Providers (`src/providers/`)
| Exact File Path | One-Line Purpose |
| :--- | :--- |
| [`src/providers/providers.tsx`](file:///home/ommistry223/DAIICT/src/providers/providers.tsx) | Master client wrapper combining `AuthSessionProvider` and `ThemeProvider`. |
| [`src/providers/theme-provider.tsx`](file:///home/ommistry223/DAIICT/src/providers/theme-provider.tsx) | Light/dark theme provider wrapping `next-themes` (configured light-first). |

#### 4. TypeScript Domain Models (`src/types/`)
| Exact File Path | One-Line Purpose |
| :--- | :--- |
| [`src/types/energy.ts`](file:///home/ommistry223/DAIICT/src/types/energy.ts) | Types for generation forecasts, time-series points, and generation metrics. |
| [`src/types/plant.ts`](file:///home/ommistry223/DAIICT/src/types/plant.ts) | Types for generation assets, solar PV arrays, inverters, and grid nodes. |
| [`src/types/risk.ts`](file:///home/ommistry223/DAIICT/src/types/risk.ts) | Types for risk events, ramp alerts, CERC violations, and severities. |
| [`src/types/recommendations.ts`](file:///home/ommistry223/DAIICT/src/types/recommendations.ts) | Types for prescriptive dispatches, BESS battery setpoints, and impact estimates. |
| [`src/types/weather.ts`](file:///home/ommistry223/DAIICT/src/types/weather.ts) | Types for solar irradiance (GHI, DNI), cloud optical depth, and ambient weather. |
| [`src/types/scenarios.ts`](file:///home/ommistry223/DAIICT/src/types/scenarios.ts) | Types for predictive scenario variables and sensitivity simulations. |
| [`src/types/index.ts`](file:///home/ommistry223/DAIICT/src/types/index.ts) | Central barrel export for all domain types. |

---

### Category H: Complete Documentation Suite (`docs/`)
| Exact File Path | One-Line Purpose |
| :--- | :--- |
| [`docs/00_PRD.md`](file:///home/ommistry223/DAIICT/docs/00_PRD.md) | Product Requirements Document outlining the core mission and persona requirements. |
| [`docs/01_PRODUCT_VISION.md`](file:///home/ommistry223/DAIICT/docs/01_PRODUCT_VISION.md) | High-level product thesis and strategic value proposition for grid operators. |
| [`docs/02_INFORMATION_ARCHITECTURE.md`](file:///home/ommistry223/DAIICT/docs/02_INFORMATION_ARCHITECTURE.md) | Information architecture blueprint and page hierarchy mapping. |
| [`docs/03_DESIGN_SYSTEM.md`](file:///home/ommistry223/DAIICT/docs/03_DESIGN_SYSTEM.md) | Foundational industrial energy-tech design system principles and layout rules. |
| [`docs/04_COLOR_SYSTEM.md`](file:///home/ommistry223/DAIICT/docs/04_COLOR_SYSTEM.md) | Color palette tokens, contrast ratios, and semantic role specifications. |
| [`docs/05_TYPOGRAPHY.md`](file:///home/ommistry223/DAIICT/docs/05_TYPOGRAPHY.md) | Font hierarchy (Inter + Manrope), scale definitions, and tabular lining rules. |
| [`docs/06_COMPONENT_ARCHITECTURE.md`](file:///home/ommistry223/DAIICT/docs/06_COMPONENT_ARCHITECTURE.md) | Component hierarchy, container patterns, and state conventions. |
| [`docs/07_LANDING_PAGE_SPEC.md`](file:///home/ommistry223/DAIICT/docs/07_LANDING_PAGE_SPEC.md) | Detailed functional and visual specification for the marketing landing page. |
| [`docs/08_DASHBOARD_SPEC.md`](file:///home/ommistry223/DAIICT/docs/08_DASHBOARD_SPEC.md) | Operational Command Center layout and data presentation specifications. |
| [`docs/09_ANIMATION_SYSTEM.md`](file:///home/ommistry223/DAIICT/docs/09_ANIMATION_SYSTEM.md) | Micro-interactions, spring mechanics, and reduced-motion guidelines. |
| [`docs/10_SCROLL_EXPERIENCE.md`](file:///home/ommistry223/DAIICT/docs/10_SCROLL_EXPERIENCE.md) | Scroll-driven storytelling architecture for the operational intelligence narrative. |
| [`docs/11_RESPONSIVE_DESIGN.md`](file:///home/ommistry223/DAIICT/docs/11_RESPONSIVE_DESIGN.md) | Breakpoint strategies and fluid scaling guidelines from mobile to 4K displays. |
| [`docs/12_ACCESSIBILITY.md`](file:///home/ommistry223/DAIICT/docs/12_ACCESSIBILITY.md) | WCAG 2.1 AA checklist, keyboard focus management, and ARIA attributes. |
| [`docs/13_PERFORMANCE.md`](file:///home/ommistry223/DAIICT/docs/13_PERFORMANCE.md) | First Load JS performance budgets, Core Web Vitals targets, and code splitting. |
| [`docs/14_TECH_STACK.md`](file:///home/ommistry223/DAIICT/docs/14_TECH_STACK.md) | Selected libraries, justification, and disallowed dependencies (no Three.js/Spline). |
| [`docs/15_FRONTEND_FOLDER_STRUCTURE.md`](file:///home/ommistry223/DAIICT/docs/15_FRONTEND_FOLDER_STRUCTURE.md) | Initial architectural blueprint for repository directory layout. |
| [`docs/16_DEVELOPMENT_RULES.md`](file:///home/ommistry223/DAIICT/docs/16_DEVELOPMENT_RULES.md) | Engineering standards, lint rules, and type discipline principles. |
| [`docs/17_DO_AND_DONT.md`](file:///home/ommistry223/DAIICT/docs/17_DO_AND_DONT.md) | Explicit constraints preventing common AI-generated code antipatterns. |
| [`docs/18_IMPLEMENTATION_ROADMAP.md`](file:///home/ommistry223/DAIICT/docs/18_IMPLEMENTATION_ROADMAP.md) | Step-by-step phased execution roadmap from foundation to platform completion. |
| [`docs/19_REPOSITORY_AUDIT.md`](file:///home/ommistry223/DAIICT/docs/19_REPOSITORY_AUDIT.md) | Baseline audit report evaluating initial repository status. |
| [`docs/21_DESIGN_SYSTEM_IMPLEMENTATION.md`](file:///home/ommistry223/DAIICT/docs/21_DESIGN_SYSTEM_IMPLEMENTATION.md) | Phase 2 delivery report documenting application shell and UI primitives. |
| [`docs/22_PHASE_2_5_FOUNDATION_AUDIT.md`](file:///home/ommistry223/DAIICT/docs/22_PHASE_2_5_FOUNDATION_AUDIT.md) | Phase 2.5 audit and hardening pass report. |
| [`docs/23_PHASE_3_LANDING_HERO.md`](file:///home/ommistry223/DAIICT/docs/23_PHASE_3_LANDING_HERO.md) | Phase 3 delivery report for the landing hero and 72-hour forecast visualizer. |
| [`docs/24_PHASE_4_OPERATIONAL_SCROLL_STORY.md`](file:///home/ommistry223/DAIICT/docs/24_PHASE_4_OPERATIONAL_SCROLL_STORY.md) | Phase 4 delivery report for the Weather $\to$ Forecast $\to$ Risk $\to$ Action $\to$ Impact narrative. |
| [`docs/25_PHASE_5_OPERATIONAL_COMMAND_CENTER.md`](file:///home/ommistry223/DAIICT/docs/25_PHASE_5_OPERATIONAL_COMMAND_CENTER.md) | Phase 5 delivery report for the `/dashboard` operational command center. |
| [`docs/26_PHASE_6_DEEP_DIVE_OPERATIONAL_INTELLIGENCE.md`](file:///home/ommistry223/DAIICT/docs/26_PHASE_6_DEEP_DIVE_OPERATIONAL_INTELLIGENCE.md) | Phase 6 delivery report for `/forecast`, `/risks`, and `/recommendations` workstations. |
| [`docs/27_BACKEND_API_CONTRACT.md`](file:///home/ommistry223/DAIICT/docs/27_BACKEND_API_CONTRACT.md) | Complete REST API contract specifying endpoints, JSON schemas, and error codes for FastAPI. |
| [`docs/28_PHASE_7_PLATFORM_COMPLETION.md`](file:///home/ommistry223/DAIICT/docs/28_PHASE_7_PLATFORM_COMPLETION.md) | Phase 7 delivery report covering Auth.js, Google OAuth, Profile, Settings, and API boundary. |
| [`docs/29_COMPLETE_PROJECT_STRUCTURE.md`](file:///home/ommistry223/DAIICT/docs/29_COMPLETE_PROJECT_STRUCTURE.md) | This document: canonical reference of actual repository structure and file roles. |
| [`docs/UI_UX_MASTER_PLAN.md`](file:///home/ommistry223/DAIICT/docs/UI_UX_MASTER_PLAN.md) | Comprehensive master plan synthesizing product vision, design system, and UX blueprints. |
