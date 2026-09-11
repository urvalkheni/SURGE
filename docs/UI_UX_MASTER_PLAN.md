# RenewableIQ — UI/UX Master Plan & Architectural Blueprint

> **Version:** 1.0.0  
> **Status:** Production Architecture Blueprint  
> **Target Platform:** Web (Desktop-first with full responsive mobile/tablet parity)  
> **Design Philosophy:** Industrial Energy-Tech + Editorial Data Visualization  

---

## 1. Executive Product Overview

### 1.1 Product Name & Identity
**RenewableIQ** is an AI-powered renewable generation forecasting and grid intelligence platform designed for commercial clean energy producers, utility dispatchers, Independent Power Producers (IPPs), and Transmission System Operators (TSOs).

### 1.2 Product Purpose
RenewableIQ transforms intermittent, volatile solar and wind generation into predictable, dispatchable, and economically optimized power. By combining high-resolution physical meteorological models, historical asset telemetry, and machine-learning predictive ensembles, the platform delivers continuous 24–72 hour generation forecasts, detects critical grid imbalances (ramp events, curtailment threats, under/over-generation), and synthesizes autonomous, actionable mitigation recommendations.

### 1.3 Target Users & Personas
1. **Renewable Plant Operations Manager (Asset Owner / IPP):**  
   *Needs:* Asset-level yield tracking, real-time inverter/turbine performance anomalies, battery energy storage system (BESS) dispatch windows, degradation prevention, and revenue capture during peak market pricing.
2. **Grid Reliability Engineer & Dispatcher (TSO / ISO):**  
   *Needs:* High-confidence day-ahead and intra-day ramp rate alerts, regional feeder congestion foresight, reserve margin requirements, and instant mitigation protocols.
3. **Energy Market Trader & Portfolio Analyst:**  
   *Needs:* Confidence interval boundaries (\(P_{10}, P_{50}, P_{90}\)), generation deviation penalties exposure, and what-if arbitrage modeling based on weather shifts.

### 1.4 The Core Industry Problem
Renewable energy assets suffer from stochastic meteorological volatility:
- Cloud banks, marine layer intrusions, and sudden wind lulls trigger steep ramp-down events exceeding **50 MW/minute**, destabilizing grid frequency.
- Inaccurate forecasts lead to severe financial penalties: under-generation forces costly peaker-plant ramp-ups, while over-generation causes negative nodal pricing and mandatory curtailment.
- Grid operators and asset managers typically juggle disconnected tools: legacy SCADA terminals, disconnected numerical weather prediction (NWP) PDFs, and raw spreadsheets.

### 1.5 The Product Promise
> **"Turn weather volatility into operational precision."**  
RenewableIQ bridges the gap between raw atmospheric science and grid dispatch decisions. It provides continuous 72-hour visibility with uncertainty bounds, flags operational risks hours before they manifest, and prescribes exact BESS charge/discharge or contractual hedging actions.

### 1.6 Primary User Journey
```mermaid
flowchart LR
    A["Weather & SCADA Ingestion"] --> B["Predictive ML Ensemble (24-72h)"]
    B --> C["Anomaly & Risk Engine"]
    C --> D["Actionable Recommendation Engine"]
    D --> E["Grid Dispatch & BESS Execution"]
    E --> F["Economic & Grid Balance Impact"]
```

1. **Observe Horizon:** User opens the platform and immediately verifies the 72-hour generation trajectory against schedule and contractual baselines.
2. **Diagnose Anomalies:** System proactively highlights an upcoming ramp-down event in Hour 18 (e.g., 34% drop over 45 minutes).
3. **Evaluate Recommendations:** The user inspects the contextual mitigation: *"Pre-condition 12 MW / 48 MWh BESS to discharge 8.4 MW starting at 17:45 UTC."*
4. **Stress-Test Scenarios:** User runs a "What-If" simulation adjusting cloud opacity by +20% to verify reserve safety margins.
5. **Execute & Audit:** Action logged to SCADA dispatch bus, with realized economic penalty savings verified in real-time.

---

## 2. Design Philosophy: Industrial Energy-Tech

### 2.1 Core Pillars
The RenewableIQ interface is designed to emulate mission-critical industrial supervisory systems combined with modern high-craft digital products:

* **Engineered & Scientific:** Visual hierarchy prioritizes unambiguous telemetry data, clear units (\(MW, MWh, Hz, W/m^2\)), and rigorous probability distributions.
* **Trustworthy & Authoritative:** Calibrated visual weight that commands respect in control rooms and executive boardrooms alike.
* **Data-Dense Yet Legible:** High information density achieved through micro-spacing, precise typography, tabular numerals, and subdued structural borders rather than heavy containers.
* **Restrained & Deliberate:** Zero extraneous decoration. Every pixel, line, and status badge serves operational situational awareness.
* **Light-First Editorial Palette:** Crisp, off-white operational canvas (`#F7F8F5`) that reduces eye strain in well-lit operational facilities while ensuring supreme contrast for complex line charts.

### 2.2 Strict Negative Constraints (What Must NEVER Be Used)
To maintain commercial credibility and prevent the UI from looking like a consumer AI toy or crypto dashboard, the following patterns are strictly banned:

| Prohibited Pattern | Reason for Rejection |
| :--- | :--- |
| **Excessive Gradients / Mesh Backgrounds** | Distracts from complex time-series data; obscures chart confidence bands. |
| **Purple / Violet "AI Neon" Palettes** | Stereotypical consumer generative-AI aesthetic; unsuited for industrial infrastructure. |
| **Glassmorphism / Heavy Backdrop Blurs** | Severely degrades CPU/GPU rendering performance during real-time canvas updates; harms legibility. |
| **Pill-shaped or Hyper-Rounded Cards (`> 12px`)** | Childish visual tone; wastes screen real estate in dense operational grids. |
| **Gratuitous 3D Objects / Floating Spheres** | Pure vanity; adds massive bundle weight without aiding dispatch decisions. |
| **Meaningless Ambient Particles / Blobs** | Visual noise that interferes with rapid risk triage during emergency conditions. |
| **Heavy Drop Shadows (`box-shadow: 0 20px ...`)** | Floats elements unanchored; disrupts the structural clarity of an industrial telemetry dashboard. |
| **Color-Only State Signifiers** | Violates accessibility; red/green colorblindness must be accommodated via icons and explicit text tags. |

---

## 3. Visual Identity Specifications

### 3.1 Color Palette
* **Canvas Background:** `#F7F8F5` — Soft engineered slate-white, eliminating harsh glare.
* **Surface / Cards:** `#FFFFFF` — Pure white for elevated data containers.
* **Primary Text:** `#17211B` — Deep forest obsidian; high-contrast legibility.
* **Secondary Text:** `#66736A` — Subdued sage grey for secondary indicators and metadata.
* **Muted Text / Guides:** `#8B968F` — Neutral line markings and axis labels.
* **Structural Borders:** `#E3E8E3` — Hairline delimiters replacing drop shadows.
* **Brand & Primary Green:** `#167A4A` — Deep industrial emerald signaling clean generation and nominal performance.
* **Dark Green:** `#0D4F32` — Deep woodland green for dominant buttons and primary metrics.
* **Light Green Tint:** `#E8F5ED` — Subtle background wash for positive status indicators.
* **Warning Amber:** `#C98216` — High-visibility amber for curtailment risk, ramp warnings, and moderate deviation.
* **Danger Crimson:** `#C94A4A` — Unambiguous red for steep ramp-down anomalies, inverter trips, and under-generation breaches.
* **Informational Cobalt:** `#3978A8` — Technical blue for meteorological overlays, atmospheric pressure, and grid sync telemetry.

### 3.2 Typography
* **Display / Headings:** **Manrope** (`font-display`) — Engineered geometric sans with humanist warmth, high legibility at large scales.
* **UI / Body / Tables:** **Inter** (`font-sans`) — Crisp, neutral grotesque with exceptional micro-scale readability.
* **Data / Numbers:** **Inter with `font-feature-settings: 'tnum', 'cv02', 'cv03', 'cv04'`** — Tabular lining numerals ensuring that numbers align strictly across columns and time increments.

### 3.3 Spatial System & Elevation
* **Base Grid:** 4px baseline grid (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`).
* **Radius Hierarchy:**
  - Badges / Micro-chips: `4px`
  - Inputs & Buttons: `6px`
  - Cards & Panels: `8px`
  - Large Page Sections / Modal dialogs: `12px`
* **Shadow Hierarchy:**
  - `shadow-none`: Default for flat inset panels.
  - `shadow-subtle`: `0 1px 2px 0 rgba(23, 33, 27, 0.04)`
  - `shadow-card`: `0 1px 3px 0 rgba(23, 33, 27, 0.06), 0 1px 2px -1px rgba(23, 33, 27, 0.04)`
  - `shadow-elevated`: `0 4px 6px -1px rgba(23, 33, 27, 0.06), 0 2px 4px -2px rgba(23, 33, 27, 0.04)`
  - `shadow-modal`: `0 12px 24px -4px rgba(23, 33, 27, 0.10)`

---

## 4. Comprehensive Page Architectures

```
├── / (Landing Page)                -> Public high-craft commercial overview & interactive intelligence story
├── /dashboard                      -> Master operational overview (KPIs, active 72h curve, active triage)
├── /forecast                       -> Deep 72h time-series workbench (P10/P50/P90, actual vs forecast, weather)
├── /risks                          -> Risk event ledger & anomaly intelligence matrix
├── /recommendations                -> Contextual action engine (BESS dispatch, contractual bids, curtailment)
├── /scenarios                      -> Interactive What-If simulation laboratory
├── /plant                          -> Digital twin configuration (inverters, solar tilt, BESS, tariffs)
├── /settings                       -> Alert thresholds, API webhooks, user RBAC, SCADA endpoints
└── /docs                           -> Platform documentation & API reference
```

### Page 1: Landing Page (`/`)
* **Purpose:** Convert commercial clean power executives and utility leaders by demonstrating deep technical authority and showcasing the live product interface.
* **Primary Audience:** Chief Operating Officers, VP of Asset Management, Grid Operations Directors.
* **Information Hierarchy:**
  1. Sticky Engineered Navigation Bar with live telemetry ticker snippet.
  2. Hero Section: Headline *"Make renewable generation predictable."* + Custom 72h interactive preview chart.
  3. Proof & Trust Strip: Multi-gigawatt utility logos, ISO grid partners, telemetry certifications.
  4. The Intermittency Problem: The real financial and stability cost of unpredicted ramp events.
  5. The Intelligence Pipeline: Interactive 5-step horizontal/vertical story (*Weather → Forecast → Risk → Action → Impact*).
  6. Core Capabilities Grid: High-density preview cards showing the 72h Horizon, Anomaly Detection, BESS Automation, and Financial Hedge.
  7. Interactive What-If Teaser: A mini interactive slider demonstrating how a 20% cloud cover spike recalculates dispatch advice.
  8. Economic & Environmental Value Metric Cards: Quantified reduction in reserve gas peaker run-hours and penalty avoidance.
  9. Final Technical CTA with direct link to live interactive demo.
  10. Technical Editorial Footer with system status indicator and architecture links.
* **Animation Level:** High on storytelling sections (smooth GSAP scroll pinned sequences), crisp Motion micro-transitions on interactive chart elements. Zero continuous looping ambient motion.

### Page 2: Dashboard Overview (`/dashboard`)
* **Purpose:** Single-pane-of-glass situational awareness for active shifts.
* **Primary Audience:** Plant Operators, Shift Dispatchers.
* **Hierarchy:**
  1. Header: Active Plant Selector, Generation Mode Badge (Grid-connected / Islanded), Real-time Sync Timestamp, Refresh Interval.
  2. Top Metric Ribbon (4 Key KPIs):
     - Total Plant Capacity vs Current Realized Power (\(MW / %\))
     - 72h Expected Net Generation (\(MWh\) with variance indicator)
     - Forecasted Peak Generation (\(MW\) with exact time window)
     - Active Grid Risk Index (Low / Medium / High / Critical with pulse token)
  3. Primary Viewport (2/3 width): 72-Hour Continuous Generation Forecast Chart with toggles for \(P_{10} / P_{50} / P_{90}\) confidence envelopes and day/night bands.
  4. Intelligence Sidebar (1/3 width):
     - High-Priority Action Card (e.g., *"BESS Pre-Charge Recommended before 16:00"* with 1-click acknowledge).
     - Active Anomaly Alert Feed (Ramp-rate warnings, cloud occlusion probability).
     - Local Meteorological Conditions Ribbon (DNI, GHI, ambient temp, wind velocity).
  5. Bottom Telemetry Grid: Economic impact summary, environmental offset equivalent, and recent automated dispatch log.
* **Animation Level:** Low. Instant data rendering with 150ms subtle value-change fades to guarantee rapid decision-making.

### Page 3: Deep Forecast Workbench (`/forecast`)
* **Purpose:** Comprehensive time-series exploration across 24h, 48h, and 72h horizons.
* **Primary Audience:** Quantitative Analysts, Forecasting Engineers.
* **Hierarchy:**
  1. Horizon Switcher: `24h` | `48h` | `72h` | `Custom Interval`.
  2. Multi-Layer Canvas:
     - Primary Series: Real-time Actuals (solid emerald) vs Predicted Model Ensemble (dashed dark green).
     - Uncertainty Envelope: Semi-transparent \(P_{10}-P_{90}\) confidence corridor.
     - Secondary Synchronized Pane: Atmospheric Overlays (Global Horizontal Irradiance, Cloud Coverage %, Temperature, Wind Speed).
  3. Metric Summary Bar: Mean Absolute Percentage Error (MAPE), Root Mean Square Error (RMSE), Peak Influx, Ramp-up max rate, Ramp-down max rate.
  4. Granular Hourly Data Table with export capability (`CSV`, `JSON`, `SCADA-compatible XML`).
* **Animation Level:** Low. Smooth chart tooltips and crosshairs.

### Page 4: Risk & Anomaly Intelligence (`/risks`)
* **Purpose:** Real-time and forward-looking hazard management.
* **Categories:**
  - `RAMP_DOWN`: Rapid loss of generation (>20% within 30 min).
  - `RAMP_UP`: Sudden generation spike risking feeder overvoltage.
  - `UNDER_GENERATION`: Output trending below day-ahead committed schedule.
  - `OVER_GENERATION`: Output exceeding schedule risking curtailment or negative LMP.
  - `WEATHER_EXTREME`: Hail, severe gusts, or heavy atmospheric inversion.
* **Hierarchy:**
  1. Risk Threat Matrix: Summary of active events segmented by Severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
  2. Timeline Horizon Bar: Temporal distribution of risks across the upcoming 72 hours.
  3. Detailed Risk Event Cards:
     - Event Type, Timestamp Window, Magnitude (\(\Delta MW\)), Confidence Score.
     - Root Cause Breakdown (e.g., Cold front squall line impacting western array).
     - Recommended Mitigation Action link.
* **Animation Level:** Moderate. Smooth filter transitions when filtering by severity.

### Page 5: Actionable Recommendations (`/recommendations`)
* **Purpose:** Prescriptive decision-support bridge connecting forecasts to physical grid assets.
* **Structure:**
  - Cards follow the strict **Risk → Root Cause → Action → Impact** mental model:
    - *Risk:* 14.2 MW Under-generation penalty risk between 18:15 and 19:30 UTC.
    - *Root Cause:* Convective cloud formation reducing solar irradiance by 62%.
    - *Action:* Discharge Battery Energy Storage System (BESS-Unit 1 & 2) at 7.1 MW each.
    - *Impact:* Saves an estimated \$14,800 in grid imbalance penalties; preserves feeder frequency stability.
  - Action Controls: "Acknowledge", "Dispatch to SCADA Bus", "Simulate in What-If".
* **Animation Level:** Low. Explicit state changes with immediate audit log feedback.

### Page 6: Scenario / What-If Analysis (`/scenarios`)
* **Purpose:** Sandboxed predictive simulation to test asset resilience against weather anomalies and equipment outages.
* **Interactive Parameters:**
  - Solar Irradiance Delta (\(-50\% \dots +20\%\))
  - Cloud Cover Onset Shift (\(-3\text{h} \dots +3\text{h}\))
  - Inverter Bank Availability (\(50\% \dots 100\%\))
  - Battery Storage State of Charge (\(0\% \dots 100\%\))
  - Grid Electricity Clearing Price (\$/MWh)
* **Output Display:**
  - Synchronized Diff Chart: Baseline Curve vs Simulated Scenario Curve.
  - Delta Metrics: Net Energy Change (\(\Delta MWh\)), Financial Exposure Delta (\(\pm \$\)), Ramp Stress Factor.
  - Auto-generated Adjusted Dispatch Strategy.
* **Animation Level:** Moderate. Interactive parameter sliders with reactive chart morphing.

### Page 7: Plant Configuration & Digital Twin (`/plant`)
* **Purpose:** Asset parameterization, technical hardware specifications, and grid interconnection limits.
* **Form Sections:**
  - General: Asset Name, Site ID, Geographic Coordinates (Lat/Long), Grid Node ID.
  - Generation Array: Photovoltaic Capacity (MW DC/AC), Module Spec, Inverter Count, Fixed Tilt / Single-Axis Tracker angles, Azimuth.
  - Storage (BESS): Nameplate Capacity (MWh), Maximum C-Rate, Round-Trip Efficiency %, Min/Max State of Charge thresholds.
  - Market & Tariffs: Day-Ahead PPA rate, Imbalance Penalty Rate, Regional TSO Interconnect Capacity.
* **Animation Level:** Low. Professional input validation, tabbed category navigation.

### Page 8: Platform Settings (`/settings`)
* **Purpose:** Security, alert webhooks, role-based access, and model configuration.
* **Sections:**
  - Notification Channels: Email, SMS, Webhook (Slack / PagerDuty / SCADA REST gateway).
  - Risk Threshold Sliders: Customize trigger sensitivities for Ramp Warnings.
  - Forecasting Model Preferences: Ensemble weighting (Physics-based vs Deep Neural Network).
  - API Credentials & SCADA Telemetry Ingestion status.
* **Animation Level:** Low.

---

## 5. Architectural Quality Bar & Validation Gates

1. **Information Accessibility:** Every mission-critical metric (MW, Risk Level, Battery State) must be decipherable within **3 seconds** of page load.
2. **Deterministic UI State:** If live network feeds disconnect, the application must effortlessly degrade to the deterministic **Demo / Fallback Mode** without unhandled crashes or empty blank states.
3. **No Decorative Bloat:** Any graphic, animation, or visual flourish that does not actively accelerate comprehension or decision-making is omitted.
