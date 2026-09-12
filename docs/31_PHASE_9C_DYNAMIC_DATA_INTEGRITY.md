# RenewableIQ / SURGE — Phase 9C: Dynamic Data Integrity & Verification Report

## Executive Summary

Phase 9C establishes uncompromising data integrity, dynamic plant twin propagation, dual-temporal resolution with mathematical energy conservation, complete Indian Rupee (₹ / INR) localization, risk-recommendation cross-route synchronicity, and honest operational status labeling across the RenewableIQ / SURGE platform.

No simulated SCADA curves or fake ML models are presented as live. Every figure displayed on the dashboard, forecast workbench, risk console, and recommendation panel originates from a single, deterministic source of truth rooted in photovoltaic physics and live Open-Meteo meteorological data.

---

## 1. Core Architectural Deliverables

### 1.1 Plant Digital Twin Propagation & Cache Invalidation
- **Single Source of Truth (`PlantContext`)**:
  - `PlantContext` (`src/contexts/plant-context.tsx`) manages the canonical operational state for active plant parameters, live weather snapshots, physics-based forecast series (both 15-minute and 1-hour), evaluated risks, active recommendations, and UI badge counts.
  - Changes made on the Plant Digital Twin configuration page (`/plant`) are submitted via `PATCH /api/plants/current` and directly reflected in `PlantContext` via `updateConfiguration` without requiring browser refreshes.
- **Cache Invalidation (`clearWeatherCache`)**:
  - `src/services/weather/open-meteo.service.ts` maintains an in-memory forecast cache keyed by `${lat}_${lon}_${tilt}_${azimuth}`.
  - When plant coordinates or array geometries are modified, `clearWeatherCache(lat, lon)` purges stale entries, ensuring immediate re-querying and physics re-computation for the updated geospatial coordinates.

### 1.2 Time-Resolution Engine & Energy Conservation
- **Granular Temporal Modes**:
  - **15-Minute High-Resolution**: 288 intervals for 72h, 192 intervals for 48h, 96 intervals for 24h.
  - **1-Hour Standard**: 72 intervals for 72h, 48 intervals for 48h, 24 intervals for 24h.
- **Strict Mathematical Energy Conservation**:
  - To prevent rounding error or integration drift, hourly forecast points are computed as the exact arithmetic mean of their four constituent 15-minute intervals:
    $$\bar{P}_{1h} = \frac{1}{4} \sum_{i=1}^{4} P_{15m, i}$$
  - The total integrated energy across any horizon satisfies:
    $$\text{Energy}_{\text{MWh}} = \sum P_{15m} \times 0.25 = \sum P_{1h} \times 1.0$$
  - Automated verification test proves $\Delta < 0.05 \text{ MWh}$ across the entire 72-hour forecast horizon.

### 1.3 100% Currency Localization (INR / ₹)
- **Centralized Formatter (`formatINR`)**:
  - Located in `src/lib/formatters.ts`.
  - Implements the Indian numbering grouping system (`en-IN`: Lakhs, Crores) and outputs the authentic `₹` currency symbol.
  - Supports compact engineering units: `formatINR(1200000, true)` yields `₹12.00 L`, `formatINR(25000000, true)` yields `₹2.50 Cr`.
  - Gracefully handles null, undefined, and zero values with `₹0`.
- **Elimination of USD**:
  - All occurrences of `$`, `USD`, `CAISO`, and `PJM` across marketing landing sections, dashboard KPI strips, plant twin settings, forecast schedule comparisons, risk exposure ribbons, and recommendation dispatch sandboxes have been converted to INR (`₹`) and Grid DSM settlement terminology.

### 1.4 Traceable Risks & 5-Part Recommendation Model
- **Cross-Route Synchronicity**:
  - Active risks and actionable recommendations share identical evaluation cycles in `src/services/risk/risk-rules.ts`.
  - Sidebar badges in `src/components/layout/app-sidebar.tsx` dynamically bind to `riskCount` and `recommendationCount` from `PlantContext`.
- **Zero-State Operational Envelopes**:
  - When nominal generation produces 0 risks and 0 recommendations, both `/risks` and `/recommendations` display structured Operational Posture Checklists verifying that Ramp Slew-Rate, Inverter Thermal Headroom, Grid Curtailment, and BESS Reserve Headroom remain within configured tolerances.
- **Deterministic Traceability**:
  - Every `RiskEvent` exposes: `trigger`, `threshold`, `observedValue`, `unit`, `source`.
  - Every `Recommendation` implements the 5-part explanation model:
    1. **Why**: Operational root cause and threshold breach context.
    2. **Action**: Explicit physical command (e.g. BESS discharge setpoint or inverter slew-rate limiting).
    3. **Expected Effect**: Target compliance slope and schedule deviation containment.
    4. **Constraint**: Asset capability boundaries (inverter capacity, battery SOC).
    5. **Source**: Computation origin (`PHYSICS_BASELINE`).
- **BESS Hardware Awareness**:
  - When BESS is enabled and has charge, recommendations prioritize battery ramp smoothing.
  - When BESS is unassigned or disabled, recommendations automatically adapt to inverter slew-rate limiting and pre-curtailment without recommending battery discharge.

### 1.5 Truth in Labeling & Data Provenance
- **SCADA Telemetry**:
  - Explicitly labeled `SCADA: NOT CONNECTED`.
  - `actualMw` is strictly `null` across all forecast points. No fake sinusoids or synthetic actuals are rendered.
- **Machine Learning Inference**:
  - Explicitly labeled `ML: NOT CONNECTED` / `PHYSICS BASELINE`.
  - All predictions and confidence bounds are derived from open physical equations (NOCT cell temperature derating, irradiance transposition, and inverter clipping).
- **Dynamic CSV Export**:
  - Generates filenames matching active plant slugs: `surge-forecast-[plant]-[resolution]-[date].csv`.
  - Embeds explicit provenance columns: `Resolution`, `Weather Source` (`OPEN_METEO_LIVE`), and `Forecast Source` (`PHYSICS_BASELINE`).

---

## 2. Automated Verification Results

The test suite (`tests/phase-9c-verification.test.ts`) executes all 12 operational scenarios using Node's native test runner with custom ESM resolver:

| # | Scenario | Acceptance Criterion | Result |
|---|----------|----------------------|--------|
| 1 | **Location Propagation** | Coordinates change, weather cache invalidates, and latitude-specific generation estimates compute. | **PASS** |
| 2 | **Capacity Propagation** | 30 MW plant peak generation strictly caps at 30.0 MW via inverter clipping. | **PASS** |
| 3 | **Inverter Efficiency** | Efficiency reduction (98.4% → 90.0%) reduces AC output proportionally ($\approx 91.5\%$). | **PASS** |
| 4 | **Time Resolution Counts** | 72h = 288 (15m) / 72 (1h); 48h = 192 / 48; 24h = 96 / 24. | **PASS** |
| 5 | **Energy Conservation** | Constant 10 MW for 4x15m = 10 MWh; $\lvert \sum P_{15m}\times 0.25 - \sum P_{1h}\times 1.0 \rvert < 0.05$ MWh. | **PASS** |
| 6 | **Risk & Rec Consistency** | 0 risks = 0 recs (nominal zero-state); Injected breach produces traceable risk and recommendation. | **PASS** |
| 7 | **BESS Recommendation** | BESS enabled → BESS discharge; BESS disabled → Inverter slew-rate limiting only. | **PASS** |
| 8 | **Currency Localization** | `formatINR` generates `₹` with Indian grouping (`L`, `Cr`); no `$` or `NaN`. | **PASS** |
| 9 | **SCADA Telemetry State** | `actualMw` is strictly `null` (no fabricated SCADA telemetry). | **PASS** |
| 10 | **Single Source of Truth** | Unified `ForecastPoint` contract consumed identically across dashboard, forecast, and risk engine. | **PASS** |
| 11 | **Plant Persistence** | Plant model and hardware configuration persist and reload via Prisma SQLite database. | **PASS** |
| 12 | **Weather Error Handling** | Network/API failure gracefully returns `source: 'UNAVAILABLE'` without fabricating weather. | **PASS** |

---

## 3. Production Quality Gate Summary

- **TypeScript Typecheck (`npx tsc --noEmit`)**: 0 errors.
- **ESLint Code Quality (`npm run lint`)**: 0 errors, 0 warnings.
- **Automated Verification (`node --test`)**: 12/12 test scenarios passed.
- **Production Next.js Build (`npm run build`)**: Successfully compiled and optimized all 20 routes.
