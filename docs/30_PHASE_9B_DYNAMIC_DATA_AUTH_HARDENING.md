# SURGE / RenewableIQ — Phase 9B Documentation
## Full Dynamic Data + Authentication + Open-Meteo Integration + Data Consistency Hardening

**Phase Reference**: Phase 9B  
**Status**: COMPLETE  
**Execution Date**: September 2026  
**Architecture**: Next.js 15 App Router · React 19 · TypeScript · Prisma ORM · SQLite · Open-Meteo NWP · Auth.js v5  

---

## 1. Executive Summary & Objective

Phase 9B completes the rigorous hardening of SURGE (RenewableIQ) by removing legacy demo fixtures, eliminating simulated telemetry masquerading as real measurements, establishing a canonical single source of truth across all operational screens, and enforcing strict data honesty throughout the user experience.

### Core Deliverables Achieved:
1. **Zero Fake Telemetry / Zero Fabricated ML**: Completely eliminated fabricated SCADA telemetry curves, fake financial penalties ($18,400 / ₹1,24,000), invented CERC regulatory limits, and synthetic ML confidence scores.
2. **Single Source of Truth**: Unified dashboard and analytical values via `PlantContext`. The Current Output KPI, the forecast chart cursor point, the forecast table active row, and the plant capacity utilization percentage are calculated from identical physics data points matching the current timestamp.
3. **Hardened Authentication Pipeline**: Stripped demo operator bypass credentials from Auth.js; logins strictly authenticate against SQLite database hashes via `bcrypt.compare`. Cleaned up client-side redirects using full-page navigation to eliminate Next.js router cache and cookie race conditions.
4. **Streamlined Onboarding Flow**: Replaced the unwieldy 8-step wizard with a streamlined 4-field essential onboarding form (`Plant Name`, `Capacity AC MW`, `Latitude`, `Longitude`) with collapsible advanced parameters, automatically initializing an operational plant.
5. **Open-Meteo Live NWP & Deterministic Physics**: Integrated live meteorological irradiance (GTI, GHI, DNI, ambient temperature, cloud cover) fetched from Open-Meteo and modeled through standard mathematical PV equations:
   $$T_{\text{cell}} = T_{\text{amb}} + 0.03125 \times GTI$$
   $$P_{\text{dc}} = \text{Capacity}_{\text{dc}} \times \left(\frac{GTI}{1000}\right) \times [1 + \gamma (T_{\text{cell}} - 25)] \times \eta_{\text{derate}}$$
   $$P_{\text{ac}} = \min(P_{\text{dc}} \times \eta_{\text{inv}}, \text{Capacity}_{\text{ac}})$$
6. **Dynamic Operational Modules**:
   - `/dashboard`: Unified KPI strip, live physics forecast chart with current-time vertical marker, deterministic risk summaries, and economic impact metrics.
   - `/forecast`: 24h / 48h / 72h horizon workbench slicing real dynamic hourly physics points with table views and export capability.
   - `/risks`: Dynamic rule-based ramp-rate and cloud surge detection with an empty state when operating within nominal tolerances.
   - `/recommendations`: Battery dispatch and curtailment advisory bound to actual plant configuration and BESS availability.
   - `/scenarios`: Interactive parametric stress-testing engine with real-time shock sliders (Cloud Cover Shift, Inverter Availability, BESS SOC) rendering dual-series comparison curves labeled `DETERMINISTIC PHYSICS (NOT AI / ML)`.
   - `/plant`: Hardware configuration and calibration portal directly persisting adjustments via `PATCH /api/plants/current`.

---

## 2. Authentication & Persistence Architecture

### Strict Database Verification
- **Provider Configuration (`src/auth.ts`)**: The demo operator mock authorization block was purged. Authentication now executes solely through the `credentials` provider by querying Prisma for the user's `email`, followed by constant-time verification using `bcrypt.compare(password, user.passwordHash)`.
- **Session Integrity**: JWT session callbacks attach the user ID, role (`OPERATOR`), and email. Unauthenticated requests to protected endpoints return proper HTTP 401 Unauthorized responses.
- **Cache Invalidation**: Form submissions on `/login` and `/signup` utilize `window.location.href` rather than `router.push` upon authentication success to flush the Next.js App Router client cache and prevent stale cookie 401s on initial dashboard load.

---

## 3. Canonical Single Source of Truth (`PlantContext`)

To prevent discrepancies across different cards and screens, `src/contexts/plant-context.tsx` serves as the centralized operational store:

```typescript
interface PlantContextType {
  plant: PlantSummary | null;
  configuration: PlantConfiguration | null;
  weather: WeatherData | null;
  forecastPoints: ForecastDataPoint[];
  risks: RiskLedgerEvent[];
  recommendations: Recommendation[];
  currentOutputMw: number;
  currentPointTimestamp: string | null;
  utilizationPercent: number;
  isLoading: boolean;
  error: string | null;
  refreshPlant: () => Promise<void>;
}
```

### Consistency Guarantees:
- **Timestamp Matching**: At runtime, `currentOutputMw` is derived by scanning `forecastPoints` for the point closest to the client's current UTC hour.
- **Unified Utilization**:
  $$\text{Utilization} \% = \left(\frac{\text{currentOutputMw}}{\text{plant.capacityMw}}\right) \times 100$$
  This value is identical across the KPI strip, the overview header, and the plant twin summary.
- **Chart Reference**: The primary forecast chart places a vertical reference line precisely at `currentPointTimestamp`, aligning the visual curve with the KPI strip value.

---

## 4. Truth in Labeling & Data Transparency

The application explicitly displays the origin and status of all operational intelligence:

| Domain | UI Indicator | Description |
| :--- | :--- | :--- |
| **Meteorology** | `WEATHER: LIVE · OPEN-METEO` | Real-time numerical weather prediction data retrieved using plant coordinates. |
| **Physics Model** | `PHYSICS BASELINE · ACTIVE` | Deterministic PV equations using irradiance, tilt, azimuth, and temperature derating. |
| **Telemetry** | `SCADA: NOT CONNECTED` | Honest notification that live RTU/Modbus field sensors are pending commissioning. |
| **Machine Learning**| `ML: NOT CONNECTED` | Clearly communicates that statistical/ML post-processing models are not yet deployed. |
| **Tariffs & Financials**| `Tariff unconfigured` / `PHYSICS ESTIMATE` | Computes revenue values from configured PPA tariffs without inventing numbers. |

---

## 5. Verification & Quality Gates

The codebase conforms to the strictest quality standards:

1. **Static Type Safety**:
   ```bash
   npx tsc --noEmit
   # Exit code: 0 (Zero type errors)
   ```
2. **Linting & Code Style**:
   ```bash
   npm run lint
   # Exit code: 0 (Zero warnings, zero errors across all components)
   ```
3. **Production Compilation**:
   ```bash
   npm run build
   # Exit code: 0 (All 20 Next.js routes compiled and statically optimized)
   ```

---

## 6. Next Steps (Phase 10: ML & SCADA Integration)

When the external ML / FastAPI service becomes available:
1. Connect the ML forecast endpoint to ingest features from `weather` and historical physics baselines.
2. In `src/types/energy.ts`, toggle `modelStatus` from `'not_connected'` to `'connected'`.
3. Provide model ensemble weights and uncertainty intervals ($P_{10}$, $P_{50}$, $P_{90}$).
4. Connect real SCADA telemetry via OPC-UA / MQTT to populate `actualMw` with live inverter readings.
