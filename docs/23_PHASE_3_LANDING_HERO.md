# 23 — Phase 3 Production Landing Page Hero & Interactive 72-Hour Forecast Visualizer

> **Document:** `docs/23_PHASE_3_LANDING_HERO.md`  
> **Target Release:** RenewableIQ Phase 3 Production Marketing & Visualizer Experience  
> **Status:** COMPLETE · VERIFIED  
> **Auditor & Lead Architect:** Senior Frontend Architect & Design System Engineer  

---

## 1. Executive Summary

Phase 3 transitions the RenewableIQ platform from a foundational design system into a production-grade industrial energy intelligence marketing and product demonstration experience. 

The landing page (`src/app/page.tsx`) has been transformed into an authoritative, light-first control room interface featuring:
1. A dual-column **Hero Section** communicating immediate mission clarity (*"Forecast renewable generation. Act before the grid reacts."*).
2. A custom-engineered, interactive **72-Hour Renewable Energy Forecast Visualizer** for the **Ahmedabad Solar Plant (42 MW)**, complete with historical telemetry, ensemble predicted outputs, quantile confidence bands (p10–p90), a dynamic "NOW" time marker, and daytime/night solar irradiance shading.
3. A **5-Stage Operational Intelligence Pipeline** (*Weather → Forecast → Risk → Action → Impact*).
4. An interactive **72-Hour Forecasting Workbench** with dynamic horizon switching (`24H`, `48H`, `72H`), reactive summary KPI indicators (Expected Energy MWh, Peak Output MW, Uncertainty %, Risk Events count), and physical weather telemetry.
5. A concrete **Risk-to-Action Operational Section** detailing real-world grid hazard mitigation (e.g. 38.4 MW cloud ramp cliff leading to prescriptive 19 MW BESS discharge and $18,400 in avoided imbalance penalties).
6. A restrained **Closing Technical Call to Action** and **Operational Route Directory** linking to all 7 application control shells.

---

## 2. Visual Architecture & Design Direction

### 2.1 Industrial Light-First Energy Tech Palette
* **Canvas (`#F7F8F5`):** Soft, non-glare engineered slate canvas that prevents eye fatigue in multi-monitor operational environments.
* **Surface Panels (`#FFFFFF`):** High-density pure white cards framed with 1px hairline delimiters (`#E3E8E3`).
* **High-Contrast Typography:** Deep forest obsidian (`#17211B`) for display titles and body copy (WCAG AAA contrast 15.2:1).
* **Industrial Brand Greens:**
  - `#167A4A` (Primary nominal emerald for forecast curves and positive metrics).
  - `#0D4F32` (Deep authoritative dark green for primary CTAs and historical actual telemetry).
* **Multi-Channel Alert Accents:**
  - Warning / Ramp Hazard: `#C98216` (Amber).
  - Critical / Under-Gen Risk: `#C94A4A` (Crimson).
  - Telemetry / Informational: `#3978A8` (Steel Blue).

### 2.2 Prohibited Anti-Patterns Enforced
* **Zero Glassmorphism / Frosted Glowing Cards:** Dropped in favor of precision 1px border cards.
* **Zero Purple / AI Neon Gradients:** Eliminated in favor of calm, engineered monochrome and industrial emerald accents.
* **Zero Heavy 3D or Lottie Runtimes:** Replaced with SVG Recharts data density and Motion micro-interactions.

---

## 3. Component Architecture (`src/components/`)

### 3.1 Component Inventory
| Component | Path | Responsibility |
| :--- | :--- | :--- |
| `<ForecastChart />` | `src/components/charts/forecast-chart.tsx` | Recharts-based multi-series analytical chart with actuals, forecast, confidence area, NOW marker, day/night shading, and tabular tooltip. |
| `<LandingHeader />` | `src/components/landing/landing-header.tsx` | Sticky marketing header with wordmark, section anchors, demo telemetry badge, and platform entrance CTA. |
| `<HeroSection />` | `src/components/landing/hero-section.tsx` | Two-column hero with staggered Motion entrance, value proposition, action buttons, and visualizer container. |
| `<HeroForecastVisualizer />` | `src/components/landing/hero-forecast-visualizer.tsx` | Interactive hero panel displaying Ahmedabad Solar Plant 42 MW forecast, 24/48/72h toggle, and integrated KPI strip. |
| `<ForecastKpiStrip />` | `src/components/landing/forecast-kpi-strip.tsx` | High-density 4-metric strip (Horizon, Capacity, Uncertainty, Confidence) with simulated telemetry disclosure. |
| `<IntelligenceFlow />` | `src/components/landing/intelligence-flow.tsx` | 5-stage closed-loop pipeline (*Weather → Forecast → Risk → Action → Impact*) with desktop directional chevrons. |
| `<ForecastSection />` | `src/components/landing/forecast-section.tsx` | Dedicated forecasting intelligence workbench with dynamic KPI cards, continuous horizon simulation, and NWP model metadata. |
| `<WeatherContextStrip />` | `src/components/landing/weather-context-strip.tsx` | Meteorological telemetry bar displaying Ambient Temp (31°C), Cloud Cover (18%), Wind Speed (4.8 m/s), GHI (812 W/m²), and Humidity (42%). |
| `<ImpactSection />` | `src/components/landing/impact-section.tsx` | Explains the physical link between forecast anomalies and grid mitigation ($142k/yr avoided penalty, 98.4% compliance). |
| `<FinalCta />` | `src/components/landing/final-cta.tsx` | Restrained technical closing banner linking to `/dashboard` and `/forecast`. |

---

## 4. Forecasting Data Architecture (`src/data/demo-data.ts`)

### 4.1 Ahmedabad Solar Plant (42 MW) Model
The dataset is deterministically generated across 72 continuous hourly intervals (`2026-09-14T00:00:00Z` to `2026-09-17T00:00:00Z`):
* **Plant Rating:** 42.0 MW AC nameplate capacity (50 MW DC array).
* **Diurnal Elevation Curve:** Active sunrise at 06:00 UTC, peaking at solar noon (12:30 UTC), and sunset at 19:00 UTC.
* **Temporal Marker ("NOW"):** Fixed at Hour 12 (`2026-09-14T12:00:00Z`).
* **Historical Realized Telemetry (`actualMw`):** Provided for Hours 0 through 12, reflecting realized string telemetry with calibrated sensor noise.
* **Ensemble Forecast (`predictedMw`):** Full 72-hour curve with Day 2 convective cloud front simulation (Hours 36 to 42, causing a 55% irradiance drop and ramp alert at Hour 38).
* **Quantile Confidence Envelopes:**
  - `p10Mw`: 10th percentile generation lower boundary.
  - `p90Mw`: 90th percentile generation upper boundary.
  - Tighter dispersion during clear sky conditions (±2.4 MW), expanding during cloud fronts (±5.8 MW).
* **Meteorological Context:**
  - Global Horizontal Irradiance (`ghi`: 0 to 880 W/m²).
  - Cloud Cover (`cloudCoverPercent`: 15% clear to 64% during storm).
  - Ambient Array Temperature (`temperatureC`: 24°C to 33°C).
  - Hub Wind Speed (`windSpeedMs`: 4.2 to 5.4 m/s).
  - Relative Humidity (`humidityPercent`: 28% to 42%).

### 4.2 Dynamic Horizon Metrics Table
| Horizon | Expected Energy | Peak Output | Forecast Uncertainty | Risk Events | Model Confidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **24H** | 614 MWh | 38.6 MW | ±6.4% | 1 event | 96.1% |
| **48H** | 1,228 MWh | 38.6 MW | ±7.2% | 1 event | 95.2% |
| **72H** | 1,842 MWh | 38.6 MW | ±7.8% | 2 events | 94.2% |

---

## 5. Chart Mechanics & Recharts Customization

### 5.1 Multi-Layered Visual Composition
The `<ForecastChart />` coordinates six distinct graphical layers:
1. **Solar Context (Night Bands):** `<ReferenceArea>` blocks with subtle `#17211B` fill at 3.5% opacity, distinguishing night periods from daytime irradiance windows without visual clutter.
2. **Confidence Envelope:** `<Area dataKey="confidenceRange" />` with subtle `#167A4A` fill at 12% opacity, communicating probabilistic dispersion.
3. **Ensemble Forecast Curve:** `<Line dataKey="predictedMw" />` styled with a dashed stroke (`#167A4A`, strokeWidth: 2, dash: 4 4).
4. **Realized Historical Telemetry:** `<Line dataKey="actualMw" />` styled with a solid deep emerald stroke (`#0D4F32`, strokeWidth: 2.5).
5. **Temporal "NOW" Boundary:** `<ReferenceLine>` at Hour 12 with a high-contrast label (`NOW (12:00)`), clearly separating history from prediction.
6. **Analytical Tooltip:** Custom React tooltip styled with tabular figures (`font-mono tabular-nums`), showing timestamp, realized MW, ensemble p50 MW, p10–p90 range, cloud cover %, GHI, temp, and ramp hazard status.

### 5.2 SSR & Hydration Resilience
To guarantee zero hydration mismatch errors in Next.js 15 App Router:
* An internal `mounted` state guard delays SVG rendering until client mount.
* During initial server render, a clean pulse loading placeholder is rendered matching exact target dimensions (`height={320}` / `height={380}`).

---

## 6. Micro-Interactions & Accessibility

### 6.1 Restrained Motion Architecture (`motion/react`)
* **Staggered Entrance:** Hero eyebrow, headline, paragraph, and CTAs stagger smoothly with `0.08s` delay and clean ease-out curves.
* **Scale Reveal:** The visualizer panel scales subtly from `0.98` to `1.0` with opacity fade.
* **Accessibility Compliance:** Built-in `useReducedMotion()` listener disables translateY offsets and scaling when `prefers-reduced-motion: reduce` is enabled in the user's OS.

### 6.2 Responsive Behavior Matrix
* **Desktop (`1440px+` / `1280px`):** 2-column hero (5 cols left content, 7 cols right visualizer), 5-step horizontal pipeline, 4-column KPI cards.
* **Tablet (`1024px` / `768px`):** Smooth transition to single-column vertical stack with full-width visualizer, collapsible mobile navigation drawer, and 2-column KPI cards.
* **Mobile Phone (`390px`):** Zero horizontal scroll overflow. Chart X-axis tick interval adjusts dynamically (tick every 8 hours on 72h horizon). Touch targets meet 44px minimum.

---

## 7. Quality Gates & Verification Proofs

### 7.1 Lint Validation
```bash
$ npm run lint
> renewableiq@1.0.0 lint
> eslint .

# Output: 0 errors, 0 warnings (Exit code 0)
```

### 7.2 TypeScript Validation
```bash
$ npx tsc --noEmit

# Output: Clean (Exit code 0)
```

### 7.3 Next.js Production Build
```bash
$ npm run build
   ▲ Next.js 15.1.7

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types     ✓ Linting and checking validity of types 
   Collecting page data     ✓ Collecting page data 
 ✓ Generating static pages (11/11)
   Collecting build traces     ✓ Collecting build traces 
   Finalizing page optimization     ✓ Finalizing page optimization 

Route (app)                              Size     First Load JS
┌ ○ /                                    154 kB          273 kB
├ ○ /_not-found                          986 B           107 kB
├ ○ /dashboard                           138 B           124 kB
├ ○ /forecast                            138 B           124 kB
├ ○ /plant                               138 B           124 kB
├ ○ /recommendations                     138 B           124 kB
├ ○ /risks                               138 B           124 kB
├ ○ /scenarios                           138 B           124 kB
└ ○ /settings                            139 B           124 kB
+ First Load JS shared by all            106 kB
  ├ chunks/4bd1b696-cec1d383fd1f4db9.js  53 kB
  ├ chunks/517-05712e400c97fe01.js       50.7 kB
  └ other shared chunks (total)          1.96 kB

○  (Static)  prerendered as static content
# Exit code: 0
```
* **Static Generation:** 11/11 routes successfully pre-rendered.
* **Shared First Load JS:** 106 kB (well within performance guidelines).
* **Zero Warnings / Zero Errors:** Clean compilation across the entire project.

---

## 8. Simulation Transparency Disclaimer

All generation telemetry, confidence quantiles, and weather readings presented on the landing page represent **deterministic mathematical simulations** engineered for product evaluation, demonstration, and interface testing. Transparent disclosure badges (`SIMULATED FORECAST · DETERMINISTIC DEMO TELEMETRY`) are visibly embedded in the UI to maintain absolute operational integrity.
