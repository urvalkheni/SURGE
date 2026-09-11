# 06 — Component Architecture & Taxonomy

> **Document:** `docs/06_COMPONENT_ARCHITECTURE.md`  
> **Parent Architecture:** [UI_UX_MASTER_PLAN.md](file:///home/ommistry223/DAIICT/docs/UI_UX_MASTER_PLAN.md)  
> **Status:** Approved Baseline  

---

## 1. Architectural Philosophy

RenewableIQ follows a modular, atomic component hierarchy separating:
1. **Presentational / Primitive Components** (Stateless, purely styled, token-driven).
2. **Domain-Specific Composite Components** (Structured cards, data tables, parameter controls).
3. **Interactive Visualizations & State Containers** (Canvas charts, What-If simulation orchestrators).

```
src/components/
├── ui/              -> Low-level primitives (Button, Card, Input, Tabs, Dialog, Table)
├── layout/          -> AppShell, AppHeader, AppSidebar, ViewportContainer, Grid
├── navigation/      -> GlobalNavbar, BreadcrumbBar, PlantSelector, HorizonTabs
├── landing/         -> Modular landing page sections (Hero, Story, Visualizer, CTA)
├── dashboard/       -> Operator dashboard widgets (KpiGrid, AnomalyFeed, ActionSummary)
├── forecast/        -> Deep time-series inspection tools & hourly tabular breakdown
├── charts/          -> Recharts wrappers, custom SVG crosshairs, confidence bands
├── risk/            -> Risk event ledger, threat matrix, severity badges
├── recommendations/ -> Prescriptive action cards, dispatch modal, impact estimates
├── scenarios/       -> What-If parameter sliders, simulation diff charts
├── plant/           -> Digital twin forms (PV array, BESS, inverter parameters)
├── settings/        -> Alert thresholds, notification webhooks, model weighting
├── forms/           -> Controlled form fields, unit inputs, numeric steppers
├── feedback/        -> Status banners, loading skeletons, empty states
└── shared/          -> Reusable micro-elements (StatBlock, DeltaPill, UtcClock)
```

---

## 2. Directory Breakdown & Responsibility Mapping

### 2.1 `components/ui/` (Primitives)
* Built upon **Radix UI** primitives and styled using **Tailwind CSS** with `class-variance-authority` (cva).
* **Components:**
  - `button.tsx`: Variants (`primary`, `secondary`, `outline`, `ghost`, `danger`).
  - `card.tsx`: Base surface container (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`).
  - `badge.tsx`: Semantic status indicator tags with mandatory icons.
  - `dialog.tsx`: Accessible modal dialogue for SCADA dispatch confirmations.
  - `tabs.tsx`: Accessible horizontal tab panels for horizon switching and sub-page views.
  - `table.tsx`: Clean tabular markup with row hover states and sticky header support.
  - `slider.tsx`: Precision range input for What-If scenario manipulation.
  - `tooltip.tsx`: Micro-hover context for technical definitions and acronyms.
  - `select.tsx`: Controlled dropdown for plant selection and filter menus.

### 2.2 `components/layout/`
* Organizes the primary responsive layout scaffolding.
* **Components:**
  - `app-shell.tsx`: Orchestrates the fixed sidebar, sticky header, and main viewport scroll container.
  - `app-header.tsx`: Global top bar hosting plant selector, UTC clock, and system sync pulse.
  - `app-sidebar.tsx`: Collapsible left navigation rail with route indicators and badge counts.
  - `page-container.tsx`: Standardized padding and max-width boundaries across pages.

### 2.3 `components/landing/`
* Self-contained, isolated narrative sections designed for high visual polish and storytelling.
* **Components:**
  - `landing-navbar.tsx`: Transparent-to-solid sticky navigation bar.
  - `hero-section.tsx`: Product promise headline + CTA buttons.
  - `hero-forecast-visual.tsx`: Custom interactive 72-hour preview chart.
  - `proof-strip.tsx`: Multi-GW utility trust proof and grid standard certifications.
  - `pipeline-story.tsx`: 5-step pinned scroll narrative (*Weather → Forecast → Risk → Action → Impact*).
  - `capabilities-grid.tsx`: 4 high-density capability feature cards.
  - `what-if-teaser.tsx`: Lightweight interactive mini-slider simulation.
  - `impact-metrics.tsx`: Realized economic and environmental ROI counters.
  - `cta-banner.tsx`: Direct conversion trigger to live platform demo.
  - `landing-footer.tsx`: Technical sitemap and system architecture reference.

### 2.4 `components/dashboard/`
* **Components:**
  - `kpi-grid.tsx`: 4 core metrics (Plant Capacity, 72h Yield, Peak MW, Active Risk Index).
  - `dashboard-forecast-card.tsx`: Master 72h overview chart with confidence toggle.
  - `active-risk-widget.tsx`: Chronological feed of active ramp warnings.
  - `primary-recommendation-card.tsx`: High-priority BESS/curtailment action card.
  - `weather-ribbon.tsx`: Real-time on-site atmospheric conditions (GHI, temp, cloud cover).
  - `recent-dispatch-log.tsx`: Audit trail of operator acknowledgments and SCADA dispatches.

### 2.5 `components/forecast/`
* **Components:**
  - `forecast-workbench.tsx`: Container coordinating multi-series charts and tables.
  - `horizon-toolbar.tsx`: Quick interval selector (`24h`, `48h`, `72h`, `Custom`).
  - `confidence-toggle.tsx`: Segmented control for \(P_{10} \dots P_{90}\) display.
  - `weather-overlay-panel.tsx`: Synchronized secondary chart for solar GHI, cloud cover %, and ambient temp.
  - `forecast-scorecard.tsx`: Model accuracy metrics (MAPE %, RMSE, Forecast Bias).
  - `hourly-data-table.tsx`: Granular tabular data view with CSV export.

### 2.6 `components/charts/`
* Standardized Recharts wrappers enforcing the RenewableIQ color tokens and typography.
* **Components:**
  - `energy-line-chart.tsx`: Robust responsive SVG chart wrapper with customized crosshairs.
  - `confidence-area.tsx`: Semi-transparent shaded envelope rendering for quantile boundaries.
  - `custom-chart-tooltip.tsx`: High-density tooltip rendering tabular MW figures, timestamps, and confidence ranges.
  - `chart-annotation.tsx`: Vertical event marker highlighting ramp anomalies or cloud onset.

### 2.7 `components/risk/`
* **Components:**
  - `risk-threat-matrix.tsx`: Severity-grouped summary cards (Critical, High, Medium, Low).
  - `risk-timeline-bar.tsx`: 72-hour horizontal Gantt-style hazard distribution bar.
  - `risk-event-card.tsx`: Detailed event card with delta MW, lead time, and root cause.
  - `risk-filter-toolbar.tsx`: Multi-category filter pills.

### 2.8 `components/recommendations/`
* **Components:**
  - `recommendation-card.tsx`: Structural **Risk → Root Cause → Action → Impact** card.
  - `action-dispatch-modal.tsx`: 2-step verification dialog for sending dispatches to SCADA bus.
  - `impact-summary-badge.tsx`: Visual tag highlighting monetary penalty savings.

### 2.9 `components/scenarios/`
* **Components:**
  - `what-if-controls.tsx`: Sliders for solar irradiance, cloud cover shift, BESS SOC, and energy price.
  - `scenario-diff-chart.tsx`: Dual-series chart showing baseline vs simulated curve.
  - `scenario-delta-summary.tsx`: Real-time readout of net energy loss/gain and financial variance.

### 2.10 `components/plant/`
* **Components:**
  - `plant-overview-card.tsx`: High-level digital twin summary with geographical map snippet.
  - `pv-array-form.tsx`: Inverter bank and PV module parameter configuration.
  - `bess-config-form.tsx`: Battery storage specs, C-rate, SOC limits.
  - `tariff-config-form.tsx`: PPA rates and imbalance penalty schedules.

### 2.11 `components/shared/`
* **Components:**
  - `stat-block.tsx`: Standardized stat display (Title, Tabular Value, Unit, Delta Pill).
  - `delta-badge.tsx`: Positive/negative variance pill (`+4.2%`, `-12 MW`).
  - `utc-clock.tsx`: Live dual-time ticker (UTC and Local).
  - `telemetry-heartbeat.tsx`: Pulsing connectivity badge (SCADA Online / Simulated Fallback).

---

## 3. Component Architecture Rules

1. **Strict TypeScript Interfaces:** Every component must export its props interface (e.g., `export interface KpiGridProps { ... }`). `any` types are prohibited.
2. **Server vs Client Component Boundaries:**
   - Mark files with `'use client'` **only** when they use React hooks (`useState`, `useEffect`, `useSearchParams`), event listeners, or client animation libraries (`motion/react`, `gsap`, `recharts`).
   - Keep layout shells, page containers, and static text wrappers as Next.js Server Components for maximum performance and instant server rendering.
3. **Container / Presentational Decoupling:**
   - Data-fetching and URL query orchestration occur at the page or container level.
   - Child components receive typed data props, ensuring effortless swapping between live API feeds and mock demo datasets.
