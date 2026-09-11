# RenewableIQ — Phase 6: Deep-Dive Operational Intelligence
## Forecast Workbench + Risk Intelligence Ledger + Recommendation Workstation

**Status**: Production Verified  
**Canonical Asset**: Ahmedabad Solar Plant · 42 MW AC / 50 MW DC · GETCO-SARKHEJ-220KV  
**SCADA Feed**: `SCADA SIMULATED · 18ms`  
**Shared Event Anchor**: Convective Cloud Ramp Cliff (14:45–15:30 IST · -8.7 MW Drop · -0.62 MW/min vs -0.40 Limit · RSK-2026-0841 · REC-4011 19.0 MW Discharge)  

---

## 1. Executive Summary

Phase 6 transforms RenewableIQ's three core analytical routes from structural shell placeholders into industrial-grade, interactive operational workstations:

1. **The 72-Hour Forecast Workbench (`/forecast`)**: Real interactive Recharts multi-layer visualizer with dynamic layer toggles (P50 Median Forecast, P10–P90 Uncertainty Corridor, Day-Ahead Cleared Bids, Realized Telemetry up to NOW, 42 MW Capacity line), 6-metric operational summary strip, model verification scorecard, paginated hourly data ledger with ramp alert filters, day-ahead schedule comparison module, and client-side CSV export.
2. **The Risk Intelligence Ledger (`/risks`)**: Real-time risk detection ledger with functional severity and category filtering, summary metric strip, interactive row selection, deep diagnostic inspector, step-by-step physical causal chain diagram, and 72-hour chronological projection timeline.
3. **The Prescriptive Operations Workstation (`/recommendations`)**: Operator-in-the-loop decision workstation featuring hero prescription card (`REC-4011`), 5-step operational timeline roadmap, 4-strategy alternative comparison table, interactive setpoint override slider (0–20 MW) with live dynamic recalculations (resulting ramp gradient, compliance %, residual DSM exposure, battery SOC depletion), safe simulated dispatch execution with review dialog and audit state tracking, and chronological decision audit log.

---

## 2. Platform-Wide Scenario Standardization

All four analytical routes (`/dashboard`, `/forecast`, `/risks`, `/recommendations`), as well as layout headers and selectors, are standardized on the **Ahmedabad Solar Plant**:

| Parameter | Platform-Wide Canonical Specification |
| :--- | :--- |
| **Asset Name** | Ahmedabad Solar Plant |
| **AC Capacity** | 42.0 MW AC |
| **DC Capacity** | 50.0 MW DC (1.19 DC/AC Overbuild) |
| **Location** | Ahmedabad, Gujarat, India (23.0225° N, 72.5714° E) |
| **Interconnection** | GETCO 220kV Sarkhej Substation Node |
| **Telemetry State** | `SCADA SIMULATED · 18ms` |
| **Current Telemetry** | 32.8 MW Generation · 78.1% Utilization · 50.02 Hz Grid Frequency · 42/42 Inverters Online |
| **BESS System** | 20.0 MW Max Discharge · 40.0 MWh Capacity · 74.0% SOC |
| **Critical Hazard** | RSK-2026-0841 (Convective cloud ramp at 14:45–15:30 IST) |
| **Primary Action** | REC-4011 (BESS 19.0 MW ramp-smoothing pre-discharge) |
| **Economic Exposure** | ₹1,24,000 / $18,400 DSM penalty risk $\to$ $14,900 mitigated |

---

## 3. The 72-Hour Forecast Workbench (`/forecast`)

### 3.1 Information Architecture & Component Hierarchy
- **`ForecastWorkbenchHeader`**: Asset header with `SCADA SIMULATED · 18ms` pulse, horizon toggle (`[24H] [48H] [72H]`), temporal resolution toggle (`[15 min] [1 hr]`), model run timestamp tag (`Ensemble GBDT + Physics NWP v3.2 · Run: 11:45 IST`), and client-side CSV export trigger.
- **`ForecastMetricsStrip`**: 6 operational metrics:
  - Peak Forecast: `38.4 MW` (12:45 IST)
  - Day-1 Expected Energy: `284 MWh`
  - 72H Total Generation: `812 MWh`
  - Mean Absolute Error (MAE): `1.42 MW` (3.38% capacity)
  - Forecast Bias: `+0.18 MW`
  - Ensemble Spread: `±3.2 MW` (P10–P90 corridor width)
- **`ForecastChartPanel`**: Custom Recharts visualization panel:
  - Layer toggles: `P50 Forecast`, `P10–P90 Corridor`, `Day-Ahead Schedule`, `Actuals (≤NOW)`, `Cap (42 MW)`
  - Vertical `NOW (12:00 IST)` reference line
  - Highlighted red alert zone for the convective cloud ramp window (14:45–15:30 IST)
  - Hover tooltip detailing P50, P10, P90, Schedule, Delta, GHI, Cloud %, and Temperature
- **`ForecastAccuracyPanel`**: Out-of-sample benchmark scorecard detailing MAE (1.42 MW), RMSE (1.84 MW), Skill Score (+28.4% vs persistence), Ramp Capture Rate (94.2%), and constituent weighting bars (ECMWF 35%, WRF 25%, GFS 25%, Kalman 15%).
- **`HourlyForecastTable`**: Paginated data ledger supporting both 1-hour intervals (72 rows) and 15-minute intervals (96 rows), real-time search, ramp alert filter, and warning highlights.
- **`ScheduleComparison`**: Analysis of cleared day-ahead bids vs AI forecast isolating the Hour 14:45–15:30 deficit (-8.7 MW) and DSM penalty exposure ($18,400 unmitigated vs $3,500 mitigated).
- **`ForecastInsights`**: 3 structured AI analytical findings (Convective Cloud Ramp Event, Over-Generation Window, Low Uncertainty Regime) with direct action routes.

### 3.2 Client-Side CSV Export
The workbench includes a zero-dependency client-side CSV generator (`exportForecastCsv` in `src/data/demo-data.ts`) that serializes active forecast data points and triggers browser download of `renewableiq-forecast-ahmedabad-42mw-YYYY-MM-DD.csv`.

---

## 4. The Risk Intelligence Ledger (`/risks`)

### 4.1 Information Architecture & Component Hierarchy
- **`RiskHeader`**: Plant header with active risk badges (`1 HIGH · 2 MODERATE · 1 LOW`), aggregate risk score (`62/100 MODERATE`), and functional filter toolbar (Severity, Category, Horizon, Reset).
- **`RiskSummaryStrip`**: 5 operational metrics (Active Critical Hazards, Total Events, Maximum Projected Ramp, Financial Exposure at Risk, Grid Compliance Risk).
- **`RiskDiagnosticInspector`**: Dynamic diagnostic inspector panel for the selected risk event:
  - Classification, severity, and remaining lead time
  - Multi-parameter impact matrix (generation drop, ramp rate, frequency response, DSM exposure)
  - Atmospheric root cause analysis with optical depth ($\tau = 4.8$) and DNI variations
  - Prescribed mitigation callout with efficacy score and direct link to `/recommendations`
- **`RootCauseChain`**: Visual 5-step causal sequence diagram connecting atmospheric cell detection $\to$ DNI collapse $\to$ generation cliff $\to$ CERC ramp limit breach $\to$ DSM penalty assessment.
- **`RiskLedgerTable`**: Master interactive table listing all 4 chronological risk events with severity badges, category tags, time windows, and row click selection.
- **`RiskTimeline`**: 72-hour projection timeline featuring 4 clickable nodes that focus and inspect corresponding risks in the ledger.

---

## 5. The Prescriptive Operations Workstation (`/recommendations`)

### 5.1 Information Architecture & Component Hierarchy
- **`RecommendationsHeader`**: Header with plant identification, active prescriptions count (`1 Immediate · 1 Scheduled · 2 Advisory`), operator-in-the-loop badge, and SCADA write-back simulated interlock notice.
- **`PrimaryRecommendationPanel`**: Hero action card for `REC-4011`:
  - 4-part causal mental model: Trigger $\to$ Root Cause $\to$ Prescribed Action $\to$ Expected Impact
  - Target asset telemetry and battery constraints (74.0% SOC, 20 MW discharge capacity)
  - Interactive controls: `Simulate Execution`, `Modify Parameters`, `Dismiss / Defer`
  - Post-execution state: transitions to `SIMULATED DISPATCH EXECUTED` with timestamp, simulated audit tracking ID (`AUDIT-TX-8492`), and green compliance banner
- **`SimulatedExecutionDialog`**: Safety review modal verifying setpoint parameters, displaying simulation disclaimer, requiring operator authorization checkbox, and confirming simulated transmission.
- **`ActionTimelineCard`**: Visual 5-step operational roadmap detailing verification, pre-dispatch arming, active ramp smoothing, and return to standby.
- **`AlternativeActionsTable`**: Comparison table of 4 operational strategies:
  - *Option A (Recommended)*: BESS Ramp Smoothing (19 MW discharge) $\to$ 98.4% compliance, +$14,900 net saved
  - *Option B*: Inverter Pre-Curtailment $\to$ 100% compliance, -$6,800 lost energy revenue
  - *Option C*: Grid Penalty Acceptance (Do Nothing) $\to$ 42% compliance, -$18,400 DSM penalty
  - *Option D*: Bilateral Spot Market Purchase $\to$ 92% compliance, -$12,200 procurement cost
- **`OperatorOverrideSandbox`**: Interactive slider (0 to 20 MW) with live dynamic recalculations:
  - Resulting ramp gradient ($-0.62$ to $-0.18$ MW/min)
  - Grid compliance probability ($42\%$ to $98.4\%$)
  - Residual financial exposure ($\$18,400$ down to $\$3,500$)
  - Battery capacity post-dispatch ($74.0\%$ down to $61.6\%$)
  - Safe Operating Zone indicator ($14.0\text{ MW} - 20.0\text{ MW}$)
- **`ActionHistoryLogPanel`**: Immutable SCADA decision audit log displaying 5 previous operations, operator IDs, and compliance outcomes.

---

## 6. Verification & Quality Gates

1. **TypeScript**: Strict check via `npx tsc --noEmit` passed with 0 errors.
2. **ESLint**: Next.js flat config linter passed with 0 errors and 0 warnings.
3. **Production Build**: Statically compiled 11/11 routes.
4. **Performance Budgets**:
   - `/forecast`: $< 260\text{ kB}$ First Load JS
   - `/risks`: $< 230\text{ kB}$ First Load JS
   - `/recommendations`: $< 230\text{ kB}$ First Load JS
   - Shared First Load JS: $\approx 106\text{ kB}$
   - Zero added npm dependencies.
