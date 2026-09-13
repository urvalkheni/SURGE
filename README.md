# ⚡ SURGE (RenewableIQ)
### Next-Gen AI-Powered Renewable Generation Forecasting & Autonomous Grid Intelligence Platform

> **Transforming stochastic solar and wind atmospheric dynamics into dispatchable, predictable grid power and automated commercial optimization.**

---

## 📌 1. Executive Summary & Grid Problem Framing

Utility-scale solar and wind generation are physically constrained by atmospheric thermodynamics. Rapid weather fluctuations—such as marine cloud intrusions, convective dust storms, or sudden squall fronts—trigger steep ramp-down events (**>30 MW/minute**) that jeopardize feeder frequency and induce grid instability.

### The Operational Challenge:
* **The "Duck Curve" Dilemma**: Solar generation drops to zero during evening hours exactly when regional electricity demand surges to its daily peak (18:00–22:00).
* **Grid Code Compliance**: Regulatory bodies like the **Central Electricity Regulatory Commission (CERC - India)** enforce the **Deviation Settlement Mechanism (DSM)**, imposing severe financial penalties on generators and distribution utilities (DISCOMs) when deviations exceed the **10.0% nRMSE** tolerance threshold.
* **Storage Inefficiency**: Without forward-looking generation and deficit forecasts, Battery Energy Storage Systems (BESS) are often undercharged during peak solar surplus or exhausted before evening peak demand.

### The SURGE Solution:
**SURGE** is an end-to-end industrial forecasting and grid advisory platform that combines **physics-based solar/wind modeling (pvlib)**, **gradient boosted machine learning (XGBoost)**, and **probabilistic quantile regression ($P_{10} \dots P_{90}$)** across a **24-state Pan-India renewable registry**. SURGE forecasts net generation 24–72 hours in advance, predicts forward supply deficits, and automates BESS storage dispatch and market trading strategies.

---

## 🏛️ 2. Platform Architecture & Tech Stack

```
                                  ┌────────────────────────┐
                                  │   Open-Meteo & ERA5    │
                                  │ Live Weather & Archive │
                                  └───────────┬────────────┘
                                              │ (Hourly NWP)
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               FASTAPI BACKEND & ML ENGINE                               │
│                                                                                         │
│  ┌──────────────────────┐   ┌───────────────────────┐   ┌────────────────────────────┐  │
│  │   Pan-India Registry │   │ Physical Feature Eng. │   │     Inference Hierarchy    │  │
│  │  24 States, 120 Cities│──▶│ pvlib (POA, DNI, GHI) ├──▶│ Area -> City -> State ->   │  │
│  │  240+ Substations    │   │ Wind shear & roughness│   │ Universal Pan-India Models │  │
│  └──────────────────────┘   └───────────────────────┘   └─────────────┬──────────────┘  │
│                                                                       │                 │
│  ┌──────────────────────┐   ┌───────────────────────┐                 │                 │
│  │   Dual Persistence   │   │ Probabilistic Deficit │                 ▼                 │
│  │ PostgreSQL(Supabase) │◀──│ Demand Forecaster     │◀───[ Solar & Wind Quantiles ]     │
│  │ + SQLite / JSON Cache│   │ (P10 / P50 / P90)     │     (P10 Pessimistic, P50, P90)   │
│  └──────────────────────┘   └───────────┬───────────┘                                   │
└─────────────────────────────────────────┼───────────────────────────────────────────────┘
                                          │ REST API / JSON
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               VITE + REACT 19 FRONTEND                                  │
│                                                                                         │
│  ┌──────────────────────┐   ┌───────────────────────┐   ┌────────────────────────────┐  │
│  │ 4 Operational Roles  │   │ Interactive Analytics │   │   Autonomous BESS Engine   │  │
│  │ • Chief Dispatcher   │   │ • 72h Quantile Bounds │   │ • Midday Solar Absorption  │  │
│  │ • Plant Engineer     │   │ • Real-time Ramp Track│   │ • Peak Evening Shaving     │  │
│  │ • Trading Analyst    │   │ • Plant Health & Loss │   │ • Market Arbitrage Sim     │  │
│  │ • REMC Desk Officer  │   │ • Weather Doppler View│   │ • RBAC Dispatch Controls   │  │
│  └──────────────────────┘   └───────────────────────┘   └────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Core Technologies:
* **Frontend**: React 19, Vite 8, React Router v7, Tailwind CSS 4, Recharts, Lucide React, Next Themes.
* **Backend**: FastAPI, Uvicorn, Pydantic, Python 3.11+.
* **Machine Learning & Physics**:
  * `XGBoost Regressor` for non-linear power generation mapping.
  * `pvlib-python` for high-precision solar position, clear-sky irradiance (Ineichen/Perez), and plane-of-array (POA) transposition.
  * `SiteQuantileForecaster` for calibrated $P_{10}$, $P_{50}$, and $P_{90}$ uncertainty bounds.
  * `DemandForecaster` for temperature-sensitive diurnal load regression.
* **Data Sources**: Open-Meteo Hourly Global Forecasting API & ERA5 Historical Reanalysis (with automated fallback microclimate synthesizer).
* **Database & Persistence**: Supabase PostgreSQL + Local SQLite Resilience Mirror (`data/renewai.db`).

---

## 🚀 3. Key Capabilities & Innovations

### 1. 🌐 Universal Pan-India Renewable Registry
Built-in geographic, electrical, and topological metadata for **24 Indian States**, covering **120+ major renewable hubs** and **240+ key pooling substations and feeders**, including:
* **Bhadla Phase IV** (Rajasthan — 2,245 MW)
* **Khavda Hybrid Renewable Park** (Gujarat — 30,000 MW)
* **Pavagada Shakti Sthala** (Karnataka — 2,050 MW)
* **Muppandal Wind Pass** (Tamil Nadu — India's largest wind corridor)
* **Rewa Ultra Mega Solar** (Madhya Pradesh — 750 MW)
* **Kurnool Ultra Mega Solar** (Andhra Pradesh — 1,000 MW)
* **Ramagundam Floating Solar** (Telangana — 100 MW)

### 2. 🔮 Probabilistic Quantile Forecasting ($P_{10} \dots P_{90}$)
Instead of brittle single-point estimates, SURGE generates **three simultaneous forecast curves**:
* **$P_{10}$ (Pessimistic / Lower Bound)**: 90% probability generation will exceed this baseline; used for conservative grid commitment and spinning reserve calculations.
* **$P_{50}$ (Expected Value / Baseline)**: The optimal expected generation trajectory for day-ahead scheduling.
* **$P_{90}$ (Optimistic / Upper Bound)**: 10% probability generation exceeds this level; used for assessing curtailment risk and battery charge capacity.

### 3. ⏱️ Forward Deficit-Ahead Engine (`/forecast/deficit-ahead`)
Predicts forward-looking generation deficits for specific critical windows (e.g., querying at 14:00 to predict the **18:00–22:00 evening peak**). Calculates:
* **Expected Deficit ($P_{50}$)**
* **Worst-Case Deficit ($P_{90}$)**
* **Confidence Bandwidth (MW Spread)**
* **Automated BESS Discharge & Peaker Recommendations**

### 4. 🔋 BESS Battery Storage Dispatch & Energy Arbitrage
* **Automated Arbitrage**: Absorbs excess solar generation during midday price troughs (₹3.10/kWh) and injects stored energy during evening demand peaks (₹6.80/kWh).
* **Grid Frequency Stabilization**: Triggers immediate discharge when net grid balance drops below -15 MW.
* **Role-Gated Physical Control**: Dispatches are strictly protected by Role-Based Access Control (RBAC).

### 5. ⚡ On-The-Fly Model Training (`POST /train`)
Allows operators to dynamically trigger custom XGBoost model training for any selected state, city, and area in India using historical ERA5 reanalysis data.

---

## 👥 4. Role-Based Access Control (RBAC) & Personas

SURGE provides specialized, real-time control room experiences tailored to four mission-critical energy personas:

| Persona | Primary Operational Question | Key Views & Actions | Access Scope |
| :--- | :--- | :--- | :--- |
| 🛡️ **Chief Grid Dispatcher** | *"Can I keep supply and demand balanced without grid tripping?"* | Net Grid Balance, Deficit Triage, Reserve Allocation, **Physical BESS Control**, Peak Shaving | **Full Grid Control** |
| 🔧 **Plant Operations Engineer** | *"Is my plant producing what it should, and if not, why?"* | Inverter Health (SCADA), Performance Ratio (PR), Capacity Utilization (CUF), String & Soiling Losses | **Assigned Plant Asset** |
| 📈 **Energy Trading Analyst** | *"What should we buy, sell, or schedule to maximize commercial profit?"* | Day-Ahead vs Intraday Schedules, IEX/PXIL Clearing Spreads, BESS Arbitrage ROI, DSM Penalty Avoidance | **Commercial & Market Desk** |
| 📡 **REMC Desk Officer** | *"Which plants or regions are deviating from schedule across the state?"* | Multi-Plant Regional Aggregation, Feeder Ramp Alerts (>30 MW/h), SLDC Coordination Logs | **Regional Multi-Plant** |

---

## 📊 5. Machine Learning Benchmarks & CERC Compliance

Evaluated on chronologically split out-of-sample holdout datasets ($1,314\text{ hours}$):

| Generation Asset | Capacity | Primary Model | Test MAE | Test RMSE | Test nRMSE (% of Cap) | Test $R^2$ | CERC Grid Compliance |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| ☀️ **Solar Power (Bhadla Park)** | 100 MW | **XGBoost + pvlib POA** | **0.661 MW** | **1.244 MW** | **1.24%** | **0.9982** | **COMPLIANT** (< 10% standard) |
| 💨 **Wind Power (Jaisalmer Park)** | 100 MW | **XGBoost + Roughness** | **0.040 MW** | **0.064 MW** | **0.06%** | **0.9999** | **COMPLIANT** (< 10% standard) |
| 🔋 **Hybrid (Solar + Wind + BESS)** | 200 MW | **Dual Quantile Ensemble** | **0.701 MW** | **1.308 MW** | **0.65%** | **0.9988** | **COMPLIANT** (< 10% standard) |

---

## 🔌 6. API Reference (FastAPI Backend)

Interactive Swagger documentation is available live at `http://127.0.0.1:8000/docs`.

### Platform Metadata & Registry
* `GET /` — Health status and available platform states.
* `GET /states` — List of all 24 Indian states and associated grid operators.
* `GET /cities?state={state}` — List of renewable cities/hubs for a given state.
* `GET /areas?state={state}&city={city}` — List of substations, solar parks, and coordinates for a city.

### Forecasting & Analytics
* `GET /forecast/hybrid?state={state}&city={city}&area={area}&hours=72&live=true` — Multi-horizon 24–72h hybrid forecast with solar, wind, demand, net balance, and $P_{10}/P_{50}/P_{90}$ quantile bands.
* `GET /forecast/deficit-ahead?state={state}&city={city}&area={area}&target_start_hour=18&target_end_hour=22` — Forward deficit forecast for targeted evening or morning demand windows.
* `GET /metrics?state={state}` — Model evaluation metrics, holdout test scores, and CERC compliance validation.
* `POST /train?state={state}&city={city}&area={area}` — Train an on-the-fly custom XGBoost model for any specific area using ERA5 reanalysis data.

### Authentication, Profile & Grid Control
* `POST /auth/signup` — Register a new grid operator.
* `POST /auth/login` — Authenticate an operator account.
* `POST /auth/google` — Authenticate using Google OAuth 2.0.
* `GET /auth/profile?email={email}` — Retrieve operator profile and assigned station.
* `POST /auth/profile` — Update operator details, station, or operational role.
* `GET /dispatch/history` — Audit trail of executed BESS actions and grid interventions.
* `POST /dispatch/execute` — Execute and log a manual or automated dispatch action (RBAC protected).
* `POST /battery/dispatch` — Execute physical battery charge or discharge commands with power setpoint (MW).
* `GET /api/db/inspect` — Database introspection report for SQLite / Supabase tables.

---

## 🖥️ 7. Frontend Application Navigation

The frontend application provides 11 dedicated, responsive control room modules:

1. 🚀 **Landing Page (`/`)** — Interactive platform showcase, architecture breakdown, live demo widgets, and commercial value calculator.
2. 🎛️ **Command Center (`/dashboard`)** — Dynamic role-specific operational dashboard (Grid Dispatch, Plant Performance, Trading Desk, or REMC Regional view).
3. 📈 **Forecast Explorer (`/forecast`)** — 72-hour interactive generation curves, quantile uncertainty bands ($P_{10} \dots P_{90}$), and state/city/area selector.
4. ⚠️ **Risk & Alerts (`/alerts`)** — Real-time ramp alert detection, severe weather warnings, and frequency deviation alarms.
5. 💡 **AI Recommendations (`/recommendations`)** — Prescriptive dispatch directives, BESS battery schedules, and peaker ramping plans.
6. 🏭 **Plant Fleet (`/plants`)** — Detailed asset overview covering inverters, solar tracking, wind turbine status, CUF, and PR metrics.
7. ⚡ **Grid & Demand (`/grid`)** — Regional load curves, baseline subtraction, and net deficit projections.
8. 🔋 **Battery Storage (`/battery`)** — BESS State of Charge (SOC), live thermal telemetry, arbitrage simulation, and manual dispatch console.
9. 🎯 **Model Accuracy (`/accuracy`)** — CERC compliance audit, MAE/RMSE benchmarks, residual distributions, and feature importance rankings.
10. 🌦️ **Weather Intelligence (`/weather`)** — Hyperlocal GHI, DNI, wind speed at 100m, temperature, and cloud cover radar.
11. ⚙️ **Settings & Security (`/settings`)** — Operator profile management, Supabase sync status, and instant live role switcher.

---

## 🛠️ 8. Getting Started & Local Development

### Prerequisites
* **Python**: `>= 3.11` (Python 3.11, 3.12, 3.13, 3.14 supported)
* **Node.js**: `>= 20.0.0`
* **npm**: `>= 10.0.0`

---

### Step 1: Clone and Set Up Virtual Environment

```bash
# Clone the repository
git clone https://github.com/your-org/SURGE.git
cd SURGE

# Create and activate Python virtual environment
# Windows (PowerShell):
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Linux / macOS:
python3 -m venv .venv
source .venv/bin/activate
```

---

### Step 2: Install Backend Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

### Step 3: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

### Step 4: Environment Configuration (Optional)

SURGE is designed to run completely **out-of-the-box in resilient zero-crash demo mode** without requiring third-party credentials.

To enable Supabase persistence and Google OAuth:
```bash
# In the frontend directory:
cp frontend/.env.example frontend/.env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL for FastAPI backend | `http://127.0.0.1:8000` |
| `VITE_SUPABASE_URL` | Supabase project API URL | `Optional` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous public key | `Optional` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 Web Client ID | `Optional` |

---

### Step 5: Start the Development Servers

#### Terminal 1 — Start FastAPI Backend:
```bash
# From the project root (with .venv activated):
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```
* Backend API: `http://127.0.0.1:8000`
* Swagger OpenAPI Docs: `http://127.0.0.1:8000/docs`

#### Terminal 2 — Start React Frontend:
```bash
# From the frontend directory:
cd frontend
npm run dev
```
* Frontend Application: `http://localhost:5173`

---

## 📂 9. Project Directory Structure

```
SURGE/
├── app.py                         # Master FastAPI server & REST routing layer
├── db.py                          # Supabase PostgreSQL + SQLite dual persistence layer
├── requirements.txt               # Backend Python dependencies
├── README.md                      # Master platform documentation
├── ML_README.md                   # ML pipeline benchmark report
├── data/                          # SQLite mirror database & user audit logs
├── docs/                          # Architecture & PRD specifications
│   ├── 00_PRD.md                  # Master Product Requirements Document
│   └── UI_UX_MASTER_PLAN.md       # UI/UX Design System Specification
├── models/                        # Pre-trained models & benchmark metadata
│   ├── pan_india_solar_model.joblib
│   ├── pan_india_wind_model.joblib
│   ├── solar_forecast_best.joblib
│   ├── wind_forecast_best.joblib
│   ├── solar_quantile_best.joblib
│   ├── wind_quantile_best.joblib
│   ├── demand_model.joblib
│   └── state_metrics.json
├── src/                           # Core Python data science & pipeline packages
│   ├── models/                    # Quantile & demand regression models
│   ├── prediction/                # Slicing & probabilistic deficit calculations
│   ├── registry/                  # 24-State Pan-India geographic registry
│   └── wind/                      # Wind feature engineering & physics models
└── frontend/                      # Vite + React 19 Frontend
    ├── package.json               # Node packages and build scripts
    ├── vite.config.js             # Vite development server and API proxies
    └── src/
        ├── App.jsx                # Application routing & protected routes
        ├── main.jsx               # React entry point
        ├── config/
        │   └── roles.js           # RBAC rules, permissions & persona definitions
        ├── context/
        │   ├── AuthContext.jsx    # Authentication & active role state
        │   └── AppContext.jsx    # Global forecast & location state
        ├── pages/                 # Control room application pages
        │   ├── LandingPage.jsx
        │   ├── CommandCenter.jsx
        │   ├── Forecast.jsx
        │   ├── Alerts.jsx
        │   ├── Recommendations.jsx
        │   ├── Plants.jsx
        │   ├── GridDemand.jsx
        │   ├── BatteryStorage.jsx
        │   ├── Accuracy.jsx
        │   ├── Weather.jsx
        │   └── Settings.jsx
        ├── components/            # Reusable UI widgets, charts & headers
        └── services/              # API connectors & resilient demo fallback datasets
```

---

## 🛡️ 10. Resilience & Offline Fallback Guarantee

SURGE features an **automatic zero-crash fallback engine**:
* If external weather APIs (Open-Meteo) or cloud databases (Supabase) experience connectivity interruptions, SURGE automatically falls back to **hyperlocal physics-based procedural synthesis** and **local SQLite caching**.
* The user interface will maintain full interactive functionality without throwing unhandled exceptions, displaying visual indicators to inform the operator.

---

## 📜 11. License

This project is licensed under the **Apache 2.0 License**.

---

<div align="center">
  <sub>Built with ⚡ for resilient, clean, and dispatchable grid energy systems.</sub>
</div>
