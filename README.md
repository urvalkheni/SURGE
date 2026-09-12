# RenewableIQ — AI Renewable Generation Forecasting & Grid Intelligence Platform

> **Mission:** Transform stochastic renewable weather volatility into dispatchable, predictable grid power and automated commercial optimization.

---

## 1. Project Overview & Commercial Thesis

Utility-scale solar and wind generation are physically constrained by atmospheric thermodynamics. Sudden weather shifts—such as marine cloud intrusions or rapid squall fronts—trigger steep ramp-down events (>30 MW/minute) that destabilize feeder frequency and trigger severe financial deviation penalties from Transmission System Operators (TSOs).

**RenewableIQ** provides continuous 24–72 hour probabilistic generation forecasts, quantifies weather uncertainty (\(P_{10} \dots P_{90}\)), identifies operational risks (ramp events, clipping, under/over-generation), and prescribes autonomous battery storage (BESS) dispatch actions.

---

## 2. Core Architecture & Tech Stack

* **Framework:** Vite + React 19
* **Language:** JavaScript/JSX
* **Styling & Design System:** Tailwind CSS 4 with custom industrial energy-tech tokens
* **Typography:** Manrope (Display/Headings) + Inter (UI/Body) with OpenType tabular lining numerals (`tabular-nums`)
* **Motion & Animation:** React UI transitions with dashboard interaction components
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
├── frontend/
│   ├── src/
│   │   ├── components/                  # Dashboard, command, chart, and layout components
│   │   ├── pages/                       # React Router application pages
│   │   ├── services/                    # Frontend API client and fallback data
│   │   └── context/                     # Auth and application state providers
│   ├── package.json                     # Vite frontend scripts
│   └── .env                             # Local API and Supabase settings
├── app.py                               # FastAPI API used by the Vite frontend
├── backend/                             # Separate authenticated API service
```

---

## 4. Getting Started & Development

### 4.1 Prerequisites
* Node.js `>= 20.0.0`
* npm `>= 10.0.0`
* Python `>= 3.11`

### 4.2 Installation
```bash
# Install frontend dependencies
cd frontend
npm install
```

### 4.3 Environment Configuration
The Vite frontend reads `frontend/.env`:
```bash
cp frontend/.env.example frontend/.env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL for the FastAPI forecasting backend | `http://127.0.0.1:8000` |
| `VITE_SUPABASE_URL` | Supabase project URL | configured in `frontend/.env` |

### 4.4 Development Scripts
```bash
cd frontend
# Run the Vite development server
npm run dev

# Build the frontend
npm run build

# In another terminal, run the backend
cd ..
backend/.venv/bin/python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
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
