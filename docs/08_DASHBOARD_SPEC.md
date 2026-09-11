# 08 — Dashboard Specification & Operational Layout

> **Document:** `docs/08_DASHBOARD_SPEC.md`  
> **Parent Architecture:** [UI_UX_MASTER_PLAN.md](file:///home/ommistry223/DAIICT/docs/UI_UX_MASTER_PLAN.md)  
> **Status:** Approved Baseline  

---

## 1. Operational Objective & Design Philosophy

The RenewableIQ Operator Dashboard (`/dashboard`) is the central nerve center for power plant operators, balancing dispatchers, and renewable asset managers. 

Unlike consumer dashboards that focus on aesthetic minimalism, this interface is engineered for **mission-critical operational density, immediate risk identification, and rapid decision execution**:
* **Animation Level:** **LOW.** Instantaneous renders. Zero gratuitous page transitions, bouncing numbers, or looping ambient effects. Number changes use subtle 150ms cross-fades.
* **Information Hierarchy:** Situational awareness is delivered in under **3 seconds**: Current Power → 72h Outlook → Active Anomaly → Prescribed Mitigation.
* **Density:** High-density, border-defined cards maximizing viewport utilization on 1440px and 1920px control room monitors.

---

## 2. Layout Wireframe & Structural Grid

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ APP HEADER: Plant Selector (Desert Sun IV) │ UTC Clock │ Telemetry: LIVE │ Horizon: 72h│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PAGE TITLE & TELEMETRY STRIP                                                           │
│ Desert Sun Solar & Storage IV · 120 MW AC · Grid Interconnect: Node PJM-WEST-14         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ KPI METRIC RIBBON (4 Columns)                                                          │
│ ┌─────────────────┬───────────────────┬───────────────────┬──────────────────────────┐ │
│ │ CURRENT OUTPUT  │ 72H EXPECTED YIELD│ PEAK FORECAST     │ ACTIVE GRID RISK INDEX   │ │
│ │ 84.2 MW         │ 3,840 MWh         │ 108.6 MW          │ MODERATE RAMP RISK       │ │
│ │ 70.1% Capacity  │ +3.4% vs Baseline │ At 13:30 Tomorrow │ -24 MW cliff in 4.5h     │ │
│ └─────────────────┴───────────────────┴───────────────────┴──────────────────────────┘ │
├───────────────────────────────────────────────────────┬────────────────────────────────┤
│ PRIMARY FORECAST VIEWPORT (8 Cols / 66% width)        │ INTELLIGENCE SIDEBAR (4 Cols)  │
│ ┌───────────────────────────────────────────────────┐ │ ┌────────────────────────────┐ │
│ │ 72-HOUR MASTER GENERATION FORECAST                │ │ │ TOP ACTION RECOMMENDATION  │ │
│ │ [ actuals | predicted | P10-P90 band | day/night] │ │ │ Pre-charge BESS Unit 2     │ │
│ │                                                   │ │ │ [Dispatch to SCADA Bus]    │ │
│ │                                                   │ │ ├────────────────────────────┤ │
│ │                                                   │ │ │ ACTIVE RISK FEED           │ │
│ │                                                   │ │ │ • Ramp-Down at 18:30 (High)│ │
│ │                                                   │ │ │ • Inverter String 4 Clip   │ │
│ │                                                   │ │ ├────────────────────────────┤ │
│ │                                                   │ │ │ ON-SITE WEATHER TELEMETRY  │ │
│ │                                                   │ │ │ GHI: 840 W/m² · Cloud: 18% │ │
│ └───────────────────────────────────────────────────┘ │ └────────────────────────────┘ │
├───────────────────────────────────────────────────────┴────────────────────────────────┤
│ SECONDARY TELEMETRY RIBBON                                                             │
│ ┌────────────────────────────────────┬───────────────────────────────────────────────┐ │
│ │ FINANCIAL IMPACT & PENALTY HEDGE   │ DISPATCH AUDIT LOG & SCADA STATUS             │ │
│ │ Real-time Savings: +$14,280        │ 14:12 UTC: BESS Standby Command Confirmed    │ │
│ └────────────────────────────────────┴───────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Section Component Specifications

### 3.1 Page Header & Telemetry Context (`<DashboardHeader />`)
* **Plant Identifier:** Asset name (`Desert Sun Farm IV`), Asset Type (`Solar PV + BESS`), Total Nameplate (`120 MW DC / 100 MW AC`).
* **Interconnect & Market Node:** `PJM-WESTERN-HUB · Node #94012`.
* **Telemetry Health Badge:** `● SCADA Online · Latency 18ms · Refresh: 60s`.
* **Action Toolbar:** `Export Forecast (CSV/JSON)`, `Toggle Dark Mode / High Contrast`, `Trigger Manual Model Sync`.

### 3.2 Master KPI Metric Ribbon (`<KpiGrid />`)
Four high-density stat cards with border containment (`bg-surface border border-border p-4 rounded-lg`):

1. **Current Power Generation:**
   - Hero Stat: `84.2 MW` (`text-3xl font-bold tabular-nums text-foreground`).
   - Context Subtitle: `70.1% of 120 MW nameplate`.
   - Secondary Indicator: Small progress bar displaying real-time capacity factor.
2. **72-Hour Expected Energy:**
   - Hero Stat: `3,840 MWh`.
   - Context Subtitle: `+3.4% above Day-Ahead Schedule`.
   - Secondary Indicator: Emerald Delta Badge (`+128 MWh`).
3. **Forecast Peak Generation:**
   - Hero Stat: `108.6 MW`.
   - Context Subtitle: `Expected at 13:45 UTC (Tomorrow)`.
   - Secondary Indicator: Confidence interval tag (`±4.1 MW at P90`).
4. **Active Grid Risk Index:**
   - Hero Stat: `MEDIUM RISK` (Pill: Amber background `#FDF6EC`, text `#8C570A`).
   - Context Subtitle: `Ramp-Down Cliff detected in 4h 20m`.
   - Secondary Indicator: Active hazard counter (`2 Active Events`).

### 3.3 72-Hour Master Forecast Card (`<DashboardForecastCard />`)
* **Header Controls:**
  - Segmented Horizon Toggle: `24h` | `48h` | `72h` (default).
  - Confidence Toggle: Switch between `Deterministic Curve` and `Quantile Corridor (P10–P90)`.
  - Layer Checkboxes: `Actuals`, `Ensemble Forecast`, `Day-Ahead Schedule`, `Day/Night Bands`.
* **Chart Canvas Details:**
  - Height: `380px` on desktop.
  - X-Axis: 72-hour continuous timeline with light vertical separators demarcating calendar midnight (00:00 UTC).
  - Day/Night Shading: Light slate vertical bands highlighting non-generation nocturnal hours.
  - Y-Axis: Power in Megawatts (`0 to 120 MW`).
  - Active Crosshair: Synchronized tooltip displaying exact UTC timestamp, Actual MW, Forecast MW, P10 lower bound, and P90 upper bound.

### 3.4 Intelligence Sidebar Components

#### A. High-Priority Action Card (`<PrimaryRecommendationCard />`)
* **Visual Style:** Soft emerald surface wash (`bg-[#F2F8F4] border border-[#BCE3CA] p-4 rounded-lg`).
* **Title:** `HIGH-CONFIDENCE ACTION RECOMMENDED` (Badge: `AUTOMATED`).
* **Prescription:** *"Pre-condition Battery Unit 2 to discharge 8.4 MW starting at 18:00 UTC."*
* **Driver:** Mitigate projected 22 MW cloud-induced ramp-down; avoid \$4,800 peak imbalance penalty.
* **Control:** Dominant dark green button: `Acknowledge & Send to SCADA Bus`.

#### B. Active Risk Feed (`<ActiveRiskWidget />`)
* **Format:** Chronological list of active operational anomalies.
* **Item Structure:**
  - Severity Icon (`AlertTriangle` in amber, `AlertOctagon` in red).
  - Hazard Headline: `Severe Ramp-Down Expected (18:30 UTC)`.
  - Metric Delta: `-28.4 MW over 30 min (Confidence: 89%)`.
  - Link: `Inspect in Risk Ledger →`.

#### C. Real-Time Meteorological Ribbon (`<WeatherRibbon />`)
* **Telemetry Chips:**
  - Global Horizontal Irradiance (GHI): `845 W/m²` (Trend: Stable).
  - Cloud Cover Index: `18%` (Forecast: Increasing to 64% by 17:00).
  - Ambient Array Temperature: `32.4°C` (Inverter derating threshold: 45°C).
  - Wind Velocity: `4.2 m/s NW`.

### 3.5 Economic & Environmental Summary Bar (`<ImpactSummaryBar />`)
* **Avoided Imbalance Penalties (Today):** `+$14,280` (Calculated against standard CAISO/ERCOT penalty formulas).
* **Equivalent Carbon Displaced:** `184.2 MT CO₂e` (Equivalent to removing 38 passenger cars daily).
* **BESS Optimization Efficiency:** `96.8%` round-trip efficiency maintained.
