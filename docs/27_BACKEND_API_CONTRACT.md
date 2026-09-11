# RenewableIQ — Backend API & ML Service Contract

## Document Reference: `docs/27_BACKEND_API_CONTRACT.md`
**Author:** Lead Frontend Architect & Systems Engineer  
**Target Backend:** FastAPI / Python ML Inference Service  
**Version:** 1.0.0-PROD  
**Status:** Canonical Interface Specification  

---

## 1. Executive Summary

This document specifies the exact REST API contract between the **RenewableIQ Next.js 15 Frontend** and the **External ML / FastAPI Backend Service** developed by the machine learning engineering team.

### Architectural Decoupling Principles
1. **Frontend Model-Agnosticism**: The frontend never assumes specific ML frameworks (e.g., XGBoost, LightGBM, LSTM, or Transformer-specific tensors). It consumes standardized quantile predictions (`P10`, `P50`, `P90`), confidence scores, accuracy metrics, identified operational risks, and prescriptive battery dispatch setpoints.
2. **Dual-Mode Graceful Fallback**: The frontend service layer (`src/services/api/`) queries `process.env.NEXT_PUBLIC_API_BASE_URL`. If this variable is absent, or if the backend service returns an HTTP error or times out (>4000ms), the frontend automatically returns canonical deterministic demo data tagged with `DEMO FALLBACK` and renders a retryable status banner.
3. **Control Room Transparency**: Telemetry sourced from the live API displays `API LIVE · {latency}ms`. Telemetry served from fallback or demo mode displays `DEMO DATA` or `DEMO FALLBACK` with simulated latency (18ms).

---

## 2. Global Request & Response Standards

- **Base URL**: `http://localhost:8000` (development) or configured production URI via `NEXT_PUBLIC_API_BASE_URL`.
- **Content-Type**: `application/json; charset=utf-8`
- **Authentication**: Bearer Token or SCADA Gateway mTLS header (`Authorization: Bearer <token>` or `X-SCADA-Client-Id: renewableiq-cr-01`).
- **Timestamp Standard**: All timestamps must be ISO 8601 UTC strings (`YYYY-MM-DDTHH:mm:ssZ`).

---

## 3. API Endpoints

### 3.1 Health & Subsystem Readiness
```http
GET /api/v1/health
```
Checks service liveness, NWP weather assimilation daemon status, and model inference worker status.

#### Response: `200 OK`
```json
{
  "status": "ok",
  "version": "3.2.0",
  "timestamp": "2026-09-14T12:00:00Z",
  "services": {
    "scada_bus": "online",
    "nwp_assimilation": "online",
    "inference_worker": "online"
  }
}
```

---

### 3.2 72-Hour Renewable Generation Forecast
```http
POST /api/v1/forecast
```
Generates 24, 48, or 72-hour probabilistic generation forecasts at 15-minute or 1-hour resolution with quantile uncertainty boundaries ($P_{10}, P_{50}, P_{90}$).

#### Request Body
```json
{
  "plant_id": "ahmedabad-solar-01",
  "horizon_hours": 72,
  "resolution": "15m",
  "latitude": 23.0225,
  "longitude": 72.5714,
  "capacity_mw": 42.0
}
```

#### Response: `200 OK`
```json
{
  "plant_id": "ahmedabad-solar-01",
  "model": "Ensemble GBDT + Physics NWP v3.2",
  "generated_at": "2026-09-14T11:45:00Z",
  "horizon_hours": 72,
  "resolution": "15m",
  "forecast": [
    {
      "timestamp": "2026-09-14T12:00:00Z",
      "actual_mw": 32.8,
      "predicted_mw": 32.8,
      "p10_mw": 30.4,
      "p90_mw": 35.2,
      "day_ahead_mw": 34.0,
      "ghi": 780,
      "cloud_cover_percent": 18,
      "temperature_c": 31.4,
      "ramp_rate_mw_per_min": 0.08,
      "is_ramp_alert": false
    },
    {
      "timestamp": "2026-09-14T14:45:00Z",
      "actual_mw": null,
      "predicted_mw": 14.1,
      "p10_mw": 8.3,
      "p90_mw": 20.2,
      "day_ahead_mw": 26.5,
      "ghi": 290,
      "cloud_cover_percent": 84,
      "temperature_c": 28.2,
      "ramp_rate_mw_per_min": -0.62,
      "is_ramp_alert": true
    }
  ],
  "metrics": {
    "mae_mw": 1.42,
    "rmse_mw": 1.84,
    "skill_score_percent": 28.4,
    "ramp_capture_rate_percent": 94.2,
    "bias_mw": 0.18
  },
  "confidence": 91.0
}
```

---

### 3.3 Risk Intelligence & Ramp Anomaly Detection
```http
POST /api/v1/risks
```
Scans forecasted generation against grid code compliance limits (e.g., CERC $\pm 0.40\text{ MW/min}$ ramp limits, over-generation curtailment exposure, Deviation Settlement Mechanism penalties).

#### Request Body
```json
{
  "plant_id": "ahmedabad-solar-01",
  "horizon_hours": 72
}
```

#### Response: `200 OK`
```json
{
  "plant_id": "ahmedabad-solar-01",
  "active_risk_count": 1,
  "total_events": 4,
  "composite_risk_score": 62,
  "max_projected_ramp": "-0.62 MW/min",
  "identified_at": "2026-09-14T11:45:00Z",
  "risks": [
    {
      "id": "RSK-2026-0841",
      "category": "RAMP RATE",
      "severity": "HIGH",
      "headline": "Convective Cloud Ramp Event (Ramp Rate Breach)",
      "description": "Rapid convective cloud cluster with 84% optical depth causes -8.7 MW drop in 15 min (-0.62 MW/min vs -0.40 limit), violating CERC Regulation 5.2.",
      "time_window": "Day 1 · 14:45–15:30 IST",
      "lead_time_minutes": 15,
      "magnitude": "-8.7 MW in 15m",
      "grid_impact": "-0.62 MW/min ramp vs -0.40 limit (CERC Sec 5.2 breach)",
      "action_id": "REC-4011",
      "status": "ACTIVE",
      "root_cause": "Localized convective cloud cluster (optical depth tau=4.8) attenuating DNI by 75% (840 to 210 W/m²).",
      "penalty_exposure_inr": "₹1,24,000 / 15-min block"
    }
  ]
}
```

---

### 3.4 Prescriptive Recommendation Workstation
```http
POST /api/v1/recommendations
```
Calculates optimal battery energy storage system (BESS) charge/discharge schedules or inverter active power curtailment to smooth ramps and avoid imbalance penalties.

#### Request Body
```json
{
  "plant_id": "ahmedabad-solar-01",
  "risk_id": "RSK-2026-0841"
}
```

#### Response: `200 OK`
```json
{
  "plant_id": "ahmedabad-solar-01",
  "generated_at": "2026-09-14T11:45:00Z",
  "recommendations": [
    {
      "id": "REC-4011",
      "target_risk_id": "RSK-2026-0841",
      "priority": "HIGH",
      "title": "BESS Pre-Emptive Ramp Smoothing Discharge",
      "prescribed_action": "Discharge 19.0 MW from BESS Inverter Units 1 & 2 for 45 minutes starting at 14:45 IST.",
      "target_asset": "BESS Bank 1 & 2",
      "setpoint_mw": 19.0,
      "target_window": "14:45 – 15:30 IST (45 min)",
      "dispatch_duration_minutes": 45,
      "net_effect": "Attenuates net grid ramp from -0.62 MW/min to -0.18 MW/min (safe compliance buffer).",
      "confidence_percent": 91,
      "financial_impact": "Prevents ₹1,24,000 ($14,900) DSM penal imbalance charge.",
      "status": "pending"
    }
  ]
}
```

---

## 4. Error Code Standards

When an error occurs, the backend must return a standard error JSON response:

```json
{
  "success": false,
  "error": {
    "code": "MODEL_TIMEOUT",
    "message": "Ensemble NWP inference took longer than 4000ms threshold.",
    "detail": { "worker_id": "inf-node-03", "plant_id": "ahmedabad-solar-01" }
  },
  "timestamp": "2026-09-14T12:00:01Z"
}
```

Standard error codes:
- `400 Bad Request`: `INVALID_PARAMETERS`
- `401 Unauthorized`: `AUTH_TOKEN_MISSING` / `INVALID_TOKEN`
- `404 Not Found`: `PLANT_NOT_FOUND`
- `500 Internal Server Error`: `MODEL_INFERENCE_FAILED`
- `503 Service Unavailable`: `MODEL_SERVICE_UNAVAILABLE`

---

## 5. Summary of Frontend Integration Readiness

The frontend is already configured with:
1. `src/services/api/client.ts` — HTTP client with abort signals and timeout wrapping.
2. `src/services/api/forecast.service.ts` — Dual-mode provider for 72-hour generation forecasting.
3. `src/services/api/risks.service.ts` — Dual-mode provider for grid risk intelligence.
4. `src/services/api/recommendations.service.ts` — Dual-mode provider for battery dispatch prescriptions.
5. `src/components/feedback/api-status-banner.tsx` — Reusable retryable error banners and telemetry indicators.

When the ML team is ready to connect the backend:
1. Start the FastAPI server on `http://localhost:8000`.
2. Add `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` to `.env.local`.
3. The platform will automatically transition from `DEMO DATA` to `API LIVE` without any frontend code changes!
