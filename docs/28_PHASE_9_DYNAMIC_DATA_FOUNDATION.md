# SURGE / RenewableIQ — Phase 9 Documentation
## Real Database + Email/Password Auth + Plant Onboarding + Live Weather + Dynamic Dashboard

**Phase Reference**: Phase 9  
**Status**: COMPLETE  
**Execution Date**: September 2026  
**Architecture**: Next.js 15 App Router · React 19 · TypeScript · Prisma ORM · SQLite · Open-Meteo NWP · Auth.js v5  

---

## 1. Executive Summary & Objective

Phase 9 establishes the real data foundation for SURGE (RenewableIQ), transitioning the platform from hardcoded assumptions to a fully dynamic, database-backed operational system while maintaining the highest engineering integrity:

1. **Real Database Layer**: Introduced Prisma ORM with SQLite (`dev.db`) configured for zero-dependency local execution, structured with standard relational schema ready for zero-friction migration to PostgreSQL / Supabase.
2. **Real Email & Password Authentication**: Full database-backed `/signup` and `/login` pipeline using Auth.js Credentials with `bcryptjs` password hashing (12 rounds), complexity enforcement, and account auto-initialization.
3. **8-Step Plant Onboarding Wizard (`/onboarding/plant`)**: Production-grade onboarding for operational solar plants, capturing identity, array geometry, inverter banks, system derating factors, grid interconnect nodes, and co-located BESS storage parameters.
4. **Live Meteorological Intelligence**: Ingests real-time numerical weather predictions from Open-Meteo's API using the plant's actual geographic coordinates, tilt, and azimuth to retrieve Global Tilted Irradiance (GTI), Global Horizontal Irradiance (GHI), Direct Normal Irradiance (DNI), ambient temperature, and cloud cover.
5. **Photovoltaic Physics Baseline Generation Engine**: Transparent, mathematically grounded generation baseline using standard PV equations ($T_{cell} = T_{amb} + 0.03125 \times GTI$, $F_{temp}$ temperature derating, inverter efficiency, and hard AC clipping).
6. **Rule-Based Risk & Recommendation Engines**: Deterministic risk analysis detecting ramp-rate violations and cloud surges, generating actionable BESS dispatch recommendations calculated within actual battery energy and SOC limits.
7. **Complete Data State Honesty**: All UI surfaces strictly distinguish between `WEATHER: LIVE · OPEN-METEO`, `SCADA: SIMULATED · 18ms`, `FORECAST: PHYSICS BASELINE`, and `ML: NOT CONNECTED`. No fake AI models or fabricated confidences.

---

## 2. Database Schema & Architecture

### Prisma Schema (`prisma/schema.prisma`)
The database schema supports users, authentication sessions, multi-plant ownership, plant configurations, and weather snapshots:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  passwordHash  String?
  role          String    @default("OPERATOR")
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  plants        Plant[]
}

model Plant {
  id            String    @id @default(cuid())
  ownerId       String
  name          String
  type          String    @default("solar_pv")
  country       String    @default("India")
  state         String    @default("Gujarat")
  city          String    @default("Ahmedabad")
  latitude      Float     @default(23.0225)
  longitude     Float     @default(72.5714)
  timezone      String    @default("Asia/Kolkata")
  isDemo        Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  owner         User      @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  configuration PlantConfiguration?
  weatherSnapshots WeatherSnapshot[]
}

model PlantConfiguration {
  id                      String   @id @default(cuid())
  plantId                 String   @unique
  acCapacityMw            Float    @default(42.0)
  dcCapacityMw            Float    @default(50.0)
  moduleTechnology        String   @default("TOPCon Bifacial")
  moduleCount             Int      @default(114000)
  inverterCount           Int      @default(25)
  inverterCapacityMw      Float    @default(2.0)
  panelTiltDeg            Float    @default(25.0)
  panelAzimuthDeg         Float    @default(180.0)
  trackingType            String   @default("single_axis")
  performanceRatio        Float    @default(0.82)
  tempCoefficientPct      Float    @default(-0.35)
  systemLossesPct         Float    @default(14.0)
  inverterEfficiencyPct   Float    @default(98.8)
  availabilityPct         Float    @default(99.2)
  gridOperator            String   @default("GETCO")
  gridVoltageKv           Float    @default(220.0)
  interconnectCapacityMw  Float    @default(42.0)
  gridNode                String   @default("GETCO-SARKHEJ-220KV")
  bessEnabled             Boolean  @default(true)
  bessPowerMw             Float    @default(20.0)
  bessEnergyMwh           Float    @default(40.0)
  bessSocPct              Float    @default(68.0)
  rampLimitMwPerMin       Float    @default(0.40)
  currency                String   @default("USD")
  energyPricePerMwh       Float    @default(45.0)

  plant                   Plant    @relation(fields: [plantId], references: [id], onDelete: Cascade)
}

model WeatherSnapshot {
  id                  String   @id @default(cuid())
  plantId             String
  source              String   @default("OPEN_METEO")
  fetchedAt           DateTime @default(now())
  latitude            Float
  longitude           Float
  currentTempC        Float
  currentHumidityPct  Float
  currentCloudCoverPct Float
  currentWindSpeedMs  Float
  currentGhi          Float
  currentDni          Float
  currentGti          Float
  pointsJson          String

  plant               Plant    @relation(fields: [plantId], references: [id], onDelete: Cascade)
}
```

### Seeding & Demo Fallback
- `scripts/seed-demo.mjs`: Seeds the canonical demo operator (`operator@surge.demo` / password `demo`) and creates the Ahmedabad Solar Plant (42 MW AC / 50 MW DC).
- `src/lib/demo-plant.ts`: Provides compile-time fallback constants (`DEMO_PLANT`, `DEMO_PLANT_CONFIG`) ensuring zero downtime if the database connection encounters transient errors.

---

## 3. Authentication & Operator Onboarding

### Registration (`POST /api/auth/signup`)
- Checks for duplicate email accounts (returns HTTP 409 Conflict).
- Validates password complexity: minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 numeric digit.
- Uses `bcryptjs` with 12 salt rounds for cryptographic password hashing.
- Auto-assigns the operator role and returns account metadata.

### User Flow
1. **Signup (`/signup`)**: Industrial split-screen registration form. On success, automatically logs the operator in and redirects to `/onboarding/plant`.
2. **Login (`/login`)**: Database credentials verification using Auth.js v5. Features honest "Forgot password?" dialog (*"Password recovery will be available once email delivery is configured"*), 1-click Demo Operator login, and direct links to `/signup`.
3. **Route Guards (`src/middleware.ts`)**: Protects `/dashboard`, `/forecast`, `/risks`, `/recommendations`, `/plant`, `/profile`, `/settings`, and `/onboarding/:path*`. Redirects authenticated users away from `/login` and `/signup` back to `/dashboard`.

---

## 4. Multi-Step Plant Onboarding Wizard (`/onboarding/plant`)

A comprehensive 8-step wizard guides operators through digital twin setup:
1. **Plant Identity**: Facility name and technology type.
2. **Solar Configuration**: AC capacity (MW), DC capacity (MW), module technology, total modules, inverter count, and inverter unit rating.
3. **Panel Configuration**: Tilt angle (°), azimuth orientation (°), and tracker type (Fixed / Single Axis).
4. **System Parameters**: Performance ratio (PR), temperature coefficient ($\%/^\circ\text{C}$), system losses ($\%$) and availability.
5. **Grid Interconnection**: Utility grid operator, transmission voltage (kV), interconnect limit (MW), and substation node identifier.
6. **Battery Storage (BESS)**: Enable toggle, discharge power rating (MW), energy storage (MWh), and baseline State of Charge (SOC $\%$).
7. **Geographic Coordinates**: Country, state, city, latitude, longitude, and IANA timezone.
8. **Review & Deploy**: Complete parameter summary ledger with atomic database commit via `POST /api/plants/onboarding` and immediate redirect to `/dashboard`.

---

## 5. Live Meteorological Engine (`src/services/weather/`)

Integrated with Open-Meteo's solar forecasting service (`https://api.open-meteo.com/v1/forecast`):
- **Parameters**: `latitude`, `longitude`, `timezone`, `tilt`, `azimuth`, and `forecast_days=3`.
- **Metrics Retrieved**:
  - Global Tilted Irradiance (`global_tilted_irradiance`) in $\text{W/m}^2$
  - Global Horizontal Irradiance (`shortwave_radiation`) in $\text{W/m}^2$
  - Direct Normal Irradiance (`direct_normal_irradiance`) in $\text{W/m}^2$
  - Diffuse Irradiance (`diffuse_radiation`) in $\text{W/m}^2$
  - 2-Meter Ambient Temperature (`temperature_2m`) in $^\circ\text{C}$
  - Relative Humidity (`relative_humidity_2m`) in $\%$
  - Cloud Cover (`cloud_cover`) in $\%$
  - Wind Speed (`wind_speed_10m`) in $\text{m/s}$
- **Caching Strategy**: 10-minute in-memory cache keyed by `${lat}_${lon}` to respect rate limits while maintaining high responsiveness. Manual SCADA sync triggers an immediate cache-busting refresh (`?refresh=true`).
- **Resilience**: Comprehensive deterministic procedural fallback if the network or API is unavailable.

---

## 6. Photovoltaic Physics Baseline Generation Engine (`src/services/physics/`)

Replaces artificial mock generation curves with a scientifically grounded photovoltaic calculation:

1. **Cell Temperature Calculation**:
   $$T_{cell} = T_{amb} + 0.03125 \times GTI$$
2. **Thermal Derating Factor**:
   $$F_{temp} = 1 + \left(\frac{\gamma}{100}\right) \times (T_{cell} - 25)$$
   *(where $\gamma \approx -0.35\%/^\circ\text{C}$ for modern n-type TOPCon/heterojunction cells)*
3. **DC Generation**:
   $$P_{dc} = \left(\frac{GTI}{1000}\right) \times P_{dc\_cap} \times PR \times Availability \times (1 - SystemLosses) \times F_{temp}$$
4. **AC Inverter Efficiency & Hard Clamping**:
   $$P_{ac} = \min\left(P_{dc} \times \eta_{inv}, P_{ac\_cap}\right)$$
5. **Confidence Interval Estimation**:
   - $P_{10} = \max(0, P_{ac} - \text{Uncertainty})$
   - $P_{90} = \min(P_{ac\_cap}, P_{ac} + \text{Uncertainty} \times 1.15)$
   - Uncertainty expands proportionally with cloud cover and ambient wind volatility.

---

## 7. Deterministic Risk & Prescriptive Recommendation Engines (`src/services/risk/`)

Analyzes the continuous 72-hour physics generation curve against grid compliance rules:
- **Ramp-Down Hazards**: Triggered when $\Delta MW / \Delta t > \text{Ramp Limit}$ (e.g., rapid cloud occlusion causing $> 0.40\text{ MW/min}$ drop).
- **Under-Generation Warnings**: Flags deviations where realized generation tracks below day-ahead commitment schedule.
- **Inverter Clipping / Over-Generation**: Identifies when DC array output exceeds inverter AC nameplate capacity.
- **BESS Prescriptive Action Formulation**:
  - If BESS is enabled: Sizes target discharge power ($\le \text{BESS Power}$), duration, energy demand, and verifies SOC bounds ($0\% \le \text{SOC} \le 100\%$). Calculates avoided DSM financial exposure.
  - If BESS is disabled: Recommends dynamic inverter derating, schedule rebidding, or SLDC notification.

---

## 8. Data State Honesty & UI Modernization

Every component in the application now reflects real operational state:
- **Header Badges**:
  - `WEATHER: LIVE · OPEN-METEO`
  - `SCADA: SIMULATED · 18ms`
  - `FORECAST: PHYSICS BASELINE`
  - `ML: NOT CONNECTED`
- **Dynamic Context**: `usePlant()` hook provides centralized plant specifications, live weather, physics forecast, active risks, and prescriptive recommendations to all pages.
- **Forecast Workbench (`/forecast`)**: Accuracy benchmarks display `N/A (ML Not Connected · Physics Baseline Active)` with a transparent data pipeline breakdown.
- **Settings & Profile (`/settings`, `/profile`)**: Synchronized with active operator authentication and plant digital twin specifications.

---

## 9. Verification & Quality Gates

| Verification Check | Target | Result | Status |
| :--- | :--- | :--- | :--- |
| **Prisma DB Sync** | `npx prisma db push` | SQLite schema generated & synced | **PASS** |
| **Demo Operator Seeding** | `scripts/seed-demo.mjs` | Operator and Ahmedabad plant seeded | **PASS** |
| **TypeScript Compilation** | `npx tsc --noEmit` | 0 errors | **PASS** |
| **ESLint Audit** | `npm run lint` | 0 errors, 0 warnings | **PASS** |
| **Next.js Production Build** | `npm run build` | All App Router routes compiled cleanly | **PASS** |

---

## 10. Conclusion & Handoff to Phase 10

Phase 9 successfully creates an enterprise-grade data foundation for SURGE. With real database persistence, live Open-Meteo weather feeds, sound PV physics calculations, and transparent status labeling, the application is ready for the ML team to plug in the external FastAPI model backend in Phase 10 via `NEXT_PUBLIC_API_BASE_URL`.
