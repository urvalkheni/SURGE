# 25 — Phase 5 Operational Command Center (/dashboard)

> **Document:** `docs/25_PHASE_5_OPERATIONAL_COMMAND_CENTER.md`  
> **Target Release:** RenewableIQ Phase 5 Operational Command Center  
> **Status:** COMPLETE · VERIFIED  
> **Auditor & Lead Architect:** Senior Frontend Architect, UX Engineer & Energy System Designer  

---

## 1. Primary Objective

Phase 5 transforms the `/dashboard` route from an empty shell placeholder into a fully operational, industrial-grade renewable energy command center for the **Ahmedabad Solar Plant (42 MW AC / 50 MW DC)**.

The command center immediately answers five core operational questions within 10 seconds:
1. **Current Telemetry:** *What is the plant producing right now?* (32.8 MW, 78.1% utilization, nominal frequency 50.02 Hz).
2. **Predictive Horizon:** *What will it generate over the next 24 to 72 hours?* (Calibrated p10/p50/p90 quantiles with peak output at 38.6 MW).
3. **Operational Hazard Radar:** *Where will reality diverge from day-ahead expectations?* (Imminent cloud ramp cliff at 14:45–15:30 IST, dropping -8.7 MW at -0.62 MW/min).
4. **Prescriptive Action:** *What must the operator do?* (Prepare BESS Unit 1 & 2 to discharge 19.0 MW with a 15-minute response window).
5. **Economic & Grid Impact:** *What is the financial and grid stability outcome?* ($14,900 in preserved revenue, 98.4% grid compliance, zero frequency violations).

---

## 2. Dashboard Information Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ <DashboardHeader>                                                                      │
│ Ahmedabad Solar Plant · 42 MW · OPERATIONAL · SCADA SIMULATED (18ms) · Updated 12:00   │
│ Controls: [24H] [48H] [72H] · [Sync SCADA] · [Export Telemetry]                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ <DashboardKpiStrip>                                                                    │
│ Output: 32.8 MW  │ Today: 812 MWh   │ Confidence: 92.4% │ Risk: MODERATE │ Next: 14:45 │
├────────────────────────────────────────────────────┬───────────────────────────────────┤
│ <GenerationOverview> (8 cols)                      │ <CurrentCondition> (4 cols)       │
│ • Master 72-Hour Continuous Forecast Chart         │ • Current: 32.8 MW (78.1% util)   │
│ • Solid line: Historical realized telemetry        │ • Active Ramp: -0.12 MW/min       │
│ • Dashed line: Ensemble p50 forecast               │ • Grid: 50.02 Hz (In tolerance)   │
│ • Area: 80% confidence band (p10–p90)              │ • Inverters: 42/42 online (98.8%) │
│ • Vertical marker: NOW (12:00)                     │ • Battery: Available (74% SOC)    │
│ • Dynamic hover tooltip with tabular numerals      ├───────────────────────────────────┤
│ • Link: /forecast                                  │ <RiskSummary> (4 cols)            │
│                                                    │ • Risk Score: 62/100 (MODERATE)   │
│                                                    │ • Drivers: Cloud +28, Ramp +21    │
│                                                    │ • Event: 14:45–15:30 (-8.7 MW)    │
│                                                    │ • Timeline: 12:00–17:00           │
│                                                    │ • Link: /risks                    │
├────────────────────────────────────────────────────┴───────────────────────────────────┤
│ <RecommendationCard>                                                                   │
│ Prescriptive BESS Ramp Mitigation Plan · REC-4011 · HIGH PRIORITY                      │
│ Risk -> Root Cause -> Prescribed Action (Discharge 19 MW) -> Impact ($14,900 saved)    │
│ Actions: [Review & Arm Dispatch (Simulation)] · [Open All Recommendations ->]          │
├────────────────────────────────────────────────────┬───────────────────────────────────┤
│ <WeatherSummary> (5 cols)                          │ <OutlookTable> (7 cols)           │
│ • Temp 31°C · Cloud 18% · Wind 4.8m/s · GHI 812W   │ • 72-Hour Operational Schedule    │
│ • 24h Solar Resource Irradiance Outlook            │ • Columns: Time, MW, Util, Risk,  │
│ • Confidence: HIGH · Simulated Weather Data        │   Action, Model Confidence %      │
├────────────────────────────────────────────────────┴───────────────────────────────────┤
│ <ImpactSummary>                                                                        │
│ Projected Yield 812 MWh · Avoided Curtailment 23 MWh · Imbalance Exposure $18,400 ·    │
│ Preserved Savings $14,900 · Grid Compliance 98.4% · CO2 Offset 9.8 t                   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Architecture (`src/components/dashboard/`)

| Component | File Path | Operational Role |
| :--- | :--- | :--- |
| `<DashboardView />` | `src/components/dashboard/dashboard-view.tsx` | Master view controller synchronizing horizon state across workstation panels. |
| `<DashboardHeader />` | `src/components/dashboard/dashboard-header.tsx` | Operational asset header with live SCADA heartbeat, interactive sync button, and 24H/48H/72H toggles. |
| `<DashboardKpiStrip />` | `src/components/dashboard/dashboard-kpi-strip.tsx` | High-priority 5-metric command ribbon with status badges and tabular figures. |
| `<GenerationOverview />` | `src/components/dashboard/generation-overview.tsx` | Master 2/3 forecast canvas reusing the production `<ForecastChart />`. |
| `<CurrentCondition />` | `src/components/dashboard/current-condition.tsx` | Asset hardware telemetry (substation inverters, grid frequency, BESS state). |
| `<RiskSummary />` | `src/components/dashboard/risk-summary.tsx` | Operational risk module with score breakdown, driver attribution, and chronological timeline. |
| `<RecommendationCard />` | `src/components/dashboard/recommendation-card.tsx` | Control-room action card implementing the strict **Risk $\to$ Root Cause $\to$ Action $\to$ Impact** architecture. |
| `<WeatherSummary />` | `src/components/dashboard/weather-summary.tsx` | Ambient meteorological telemetry and 24-hour comparative clear-sky vs forecast GHI chart. |
| `<OutlookTable />` | `src/components/dashboard/outlook-table.tsx` | 72-hour tabular schedule with desktop table and mobile card fallback. |
| `<ImpactSummary />` | `src/components/dashboard/impact-summary.tsx` | 6-metric economic impact card detailing avoided curtailment and preserved revenues. |

---

## 4. Centralized Data Architecture (`src/data/demo-data.ts`)

All values rendered on `/dashboard` are derived deterministically from the typed `dashboardData` model:
* **Asset Specs:** 42.0 MW AC / 50.0 MW DC, GETCO 220kV interconnect node, single-axis tracking.
* **Instantaneous Output:** 32.8 MW (78.1% utilization, -0.12 MW/min ramp).
* **Grid Interconnect:** 50.02 Hz frequency, nominal operating tolerance.
* **Storage Asset:** 20 MW / 80 MWh BESS (74.0% SOC, available for ramp dispatch).
* **Upcoming Ramp Event:** Cloud-induced ramp cliff at 14:45–15:30 IST (-8.7 MW drop, -0.62 MW/min expected ramp vs. -0.40 MW/min interconnect boundary).
* **Mitigation Recommendation:** Arm BESS Unit 1 & 2 to discharge 19.0 MW starting 15 minutes before the ramp cliff.
* **Economic Assessment:** $18,400 potential imbalance penalty mitigated to save $14,900 in net PPA settlement revenue.

---

## 5. Forecast & Weather Visualizations

* **Master Generation Canvas:** Reuses `src/components/charts/forecast-chart.tsx`, rendering historical actual telemetry (`#0D4F32`), forecast curve (`#167A4A`), and p10–p90 confidence bands.
* **24-Hour Solar Resource Outlook:** Recharts `AreaChart` in `<WeatherSummary />` comparing clear-sky theoretical GHI (up to 960 W/m²) against forecast surface GHI (attenuated during cloud passage).
* **SSR Safety Guard:** Zero hydration mismatch errors through mounted state validation.

---

## 6. Responsive Workstation Layout

* **Desktop ($\ge 1280\text{px}$):** High-density control room cockpit layout with split viewports (8-col forecast chart + 4-col condition/risk stack).
* **Tablet ($768\text{px} - 1023\text{px}$):** Adapts to balanced 2-column layout with stacked cards and fluid table padding.
* **Mobile ($\le 767\text{px}$, including $390\text{px}$):** Single-column stacked layout prioritizing:
  1. Asset status and telemetry header
  2. 5-card command KPI ribbon
  3. Master forecast chart
  4. Current asset condition
  5. Operational risk summary
  6. Prescriptive recommendation card
  7. Weather outlook
  8. 72-hour outlook mobile cards
  9. Economic impact summary
* **Zero Horizontal Overflow:** Enforced across all viewports.

---

## 7. Accessibility & WCAG 2.1 AA Compliance

* **Lining Numerals:** Universal application of `font-mono tabular-nums` preventing layout jitter on value changes.
* **Color Redundancy:** Every status level combines distinct color tokens, text labels, and semantic icons (no color-alone signaling).
* **Keyboard Navigation:** Full keyboard accessibility for horizon toggles (`24H`, `48H`, `72H`), sync controls, review buttons, and route links.
* **Reduced Motion:** Fully compatible with `prefers-reduced-motion: reduce`.

---

## 8. Performance Budget Compliance

* **Dashboard First Load JS:** **242 kB** (Under the 250 kB performance ceiling).
* **Shared First Load JS:** **106 kB** (Preserved at baseline, zero regression).
* **Static Pre-rendering:** 11/11 routes pre-rendered successfully.

---

## 9. Simulation Disclosures

All telemetry feeds, weather figures, and dispatch plans on `/dashboard` are generated deterministically by local client fixtures. Transparent UI badges (`SCADA SIMULATED · 18ms`, `SIMULATED RECOMMENDATION`, `SIMULATED IMPACT`) are embedded throughout the interface to guarantee absolute operational honesty.

---

## 10. Verification Results

* `npm run lint`: **0 errors, 0 warnings**
* `npx tsc --noEmit`: **0 errors**
* `npm run build`: **Compiled successfully (11/11 static pages)**

---

## 11. Known Limitations

* **Simulated Telemetry:** Does not interface with a physical SCADA RTU or live IEC 61850 substation gateway.
* **Simulated Dispatch Handshake:** Clicking "Review & Arm Dispatch" toggles simulated armed state in client memory rather than sending live Modbus/DNP3 commands to battery inverters.

---

## 12. Next Phase Recommendation

Proceed to **Phase 6: Deep-Dive Operational Routes**:
* `/forecast` — 72-hour probabilistic forecast workbench with custom quantile toggling.
* `/risks` — Anomaly detection ledger and severity filtering.
* `/recommendations` — Automated BESS dispatch planner and manual override console.
