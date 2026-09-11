# RenewableIQ — AI Renewable Generation Forecasting & Grid Intelligence Platform

> **Mission:** Transform stochastic renewable weather volatility into dispatchable, predictable grid power and automated commercial optimization.

---

## 1. Project Overview & Commercial Thesis

Utility-scale solar and wind generation are physically constrained by atmospheric thermodynamics. Sudden weather shifts—such as marine cloud intrusions or rapid squall fronts—trigger steep ramp-down events (>30 MW/minute) that destabilize feeder frequency and trigger severe financial deviation penalties from Transmission System Operators (TSOs).

**RenewableIQ** provides continuous 24–72 hour probabilistic generation forecasts, quantifies weather uncertainty (\(P_{10} \dots P_{90}\)), identifies operational risks (ramp events, clipping, under/over-generation), and prescribes autonomous battery storage (BESS) dispatch actions.

---

## 2. Core Architecture & Tech Stack

* **Framework:** Next.js 15+ (React 19, App Router, React Server Components)
* **Language:** TypeScript 5.x (Strict Mode enabled)
* **Styling & Design System:** Tailwind CSS 3.4+ with custom industrial energy-tech tokens
* **Typography:** Manrope (Display/Headings) + Inter (UI/Body) with OpenType tabular lining numerals (`tabular-nums`)
* **Motion & Animation:** Modern Motion (`motion/react`) for UI transitions + GSAP 3.x for pinned scroll narratives
* **Charting Engine:** Recharts (composable SVG time-series visualizations)
* **Icons:** Lucide React (`strokeWidth: 1.75px`)
* **Component Primitives:** Custom accessible UI layer built on Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`)
* **Theme Management:** `next-themes` (Light-first control-room aesthetic)

---

## 3. Directory Structure

```
├── docs/                                # Master Architecture System (20 documents)
│   ├── 00_PRD.md                        # Master Product Requirements Document
│   ├── UI_UX_MASTER_PLAN.md             # Master UI/UX Architecture
│   ├── 01_PRODUCT_VISION.md             # Commercial problem framing & personas
│   ├── 02_INFORMATION_ARCHITECTURE.md   # Route topology & navigation
│   ├── 03_DESIGN_SYSTEM.md              # 4px scale, surface elevation, tokens
│   ├── 04_COLOR_SYSTEM.md               # Semantic colors & WCAG AA contrast
│   ├── 05_TYPOGRAPHY.md                 # Manrope + Inter tabular numerals
│   ├── 06_COMPONENT_ARCHITECTURE.md     # Component taxonomy
│   ├── 07_LANDING_PAGE_SPEC.md          # 11-section landing page spec
│   ├── 08_DASHBOARD_SPEC.md             # Operator control room layout
│   ├── 09_ANIMATION_SYSTEM.md           # Motion & GSAP library governance
│   ├── 10_SCROLL_EXPERIENCE.md          # 5-stage scroll storytelling
│   ├── 11_RESPONSIVE_DESIGN.md          # Breakpoint adaptation matrix
│   ├── 12_ACCESSIBILITY.md              # WCAG 2.1 AA, a11y chart fallbacks
│   ├── 13_PERFORMANCE.md                # Core Web Vitals & lazy loading
│   ├── 14_TECH_STACK.md                 # Dependency justification matrix
│   ├── 15_FRONTEND_FOLDER_STRUCTURE.md  # File organization
│   ├── 16_DEVELOPMENT_RULES.md          # 2-developer team contracts
│   ├── 17_DO_AND_DONT.md                # Design & engineering checklist
│   ├── 18_IMPLEMENTATION_ROADMAP.md     # Phased execution plan (Phases 0–15)
│   ├── 19_REPOSITORY_AUDIT.md           # Baseline technical inspection
│   └── 20_FOUNDATION_VALIDATION.md      # Phase 1 engineering verification
│
├── src/
│   ├── animations/                      # Motion & GSAP presets (`motion/react`)
│   ├── app/                             # Next.js App Router (`layout.tsx`, `page.tsx`)
│   ├── components/
│   │   ├── ui/                          # Foundational primitives (Button, Card, Badge...)
│   │   └── feedback/                    # Skeletons, empty states, error states, demo badge
│   ├── config/                          # Centralized design tokens & navigation
│   ├── data/                            # Deterministic 72h procedural demo data
│   ├── hooks/                           # Custom React hooks (e.g. useReducedMotion)
│   ├── lib/                             # Utility helpers & engineering formatters
│   ├── providers/                       # ThemeProvider & app providers
│   ├── services/                        # Typed API client & domain service layer
│   └── types/                           # Explicit TypeScript domain contracts
```

---

## 4. Getting Started & Development

### 4.1 Prerequisites
* Node.js `>= 20.0.0`
* npm `>= 10.0.0`

### 4.2 Installation
```bash
# Install justified dependencies
npm install
```

### 4.3 Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base URL for FastAPI/ML backend | `http://localhost:8000` |
| `NEXT_PUBLIC_FORCE_DEMO_MODE` | Force fallback to deterministic mock data | `false` |
| `NEXT_PUBLIC_DEFAULT_PLANT_ID` | Default plant asset for initial load | `desert-sun-04` |

### 4.4 Development Scripts
```bash
# Run local development server
npm run dev

# Run strict TypeScript validation
npx tsc --noEmit

# Run production build
npm run build

# Start production server
npm run start
```

---

## 5. Resilient Demo Mode

RenewableIQ implements an automatic zero-crash **Demo Fallback Engine**:
* All domain services (`ForecastService`, `WeatherService`, `RiskService`, `RecommendationService`, `ScenarioService`) in `src/services/` feature graceful fallbacks to high-fidelity, deterministic procedural datasets (`src/data/demo-data.ts`).
* If the external ML backend is unreachable, the UI seamlessly renders realistic diurnal generation curves, weather fronts, ramp anomalies, and BESS dispatch schedules with a visual indicator (`DEMO MODE`).

---

## 6. Current Project Status

* **Phase 0 (Architecture & Master Docs):** ✅ Complete
* **Phase 1 (PRD & Frontend Foundation):** ✅ Complete (Passing TypeScript & Next.js production builds)
* **Next Phase (Phase 2 & 3):** Global Application Shell (`<AppShell />`, `<AppHeader />`, `<AppSidebar />`) & Route Scaffolding
