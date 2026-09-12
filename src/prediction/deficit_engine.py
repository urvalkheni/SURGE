"""
deficit_engine.py
-----------------
Forward-Looking Probabilistic Renewable Deficit Engine with Confidence Intervals.
Calculates Deficit = Demand - Generation across P10, P50, and P90 quantiles,
providing genuine numerical uncertainty bounds and BESS battery dispatch advisories.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional


def compute_probabilistic_deficit(
    weather_forecast_df: pd.DataFrame,
    solar_model: Any,
    wind_model: Any,
    demand_model: Any,
    ensemble_weather_df: Optional[pd.DataFrame] = None
) -> Dict[str, Any]:
    """
    Computes forward-looking deficit schedule and P10-P90 confidence intervals.
    """
    df = weather_forecast_df.copy()
    if len(df) == 0:
        raise ValueError("Weather forecast dataframe is empty.")

    # 1. Predict Generation Quantiles (MW)
    solar_quantiles = solar_model.predict_quantiles(df)
    wind_quantiles = wind_model.predict_quantiles(df)

    sol_p10 = solar_quantiles["p10"]
    sol_p50 = solar_quantiles["p50"]
    sol_p90 = solar_quantiles["p90"]

    wnd_p10 = wind_quantiles["p10"]
    wnd_p50 = wind_quantiles["p50"]
    wnd_p90 = wind_quantiles["p90"]

    # Total Hybrid Generation
    gen_p10 = np.round(sol_p10 + wnd_p10, 2)
    gen_p50 = np.round(sol_p50 + wnd_p50, 2)
    gen_p90 = np.round(sol_p90 + wnd_p90, 2)

    # 2. Predict Load Demand (MW) using calendar + temperature model
    demand_pred = demand_model.predict(df)

    # 3. Compute Deficit Quantiles (MW)
    # Deficit = Demand - Generation.
    # Note inversion:
    # - Highest Deficit (P90) occurs when Generation is at lowest (P10)
    # - Lowest Deficit (P10) occurs when Generation is at highest (P90)
    deficit_p10 = np.round(demand_pred - gen_p90, 2)
    deficit_p50 = np.round(demand_pred - gen_p50, 2)
    deficit_p90 = np.round(demand_pred - gen_p10, 2)

    # Confidence bandwidth (MW spread between best and worst case)
    bandwidth = np.round(deficit_p90 - deficit_p10, 2)

    # 4. Optional Ensemble Meteorological Spread (if Open-Meteo Ensemble was queried)
    ensemble_std = None
    if ensemble_weather_df is not None and not ensemble_weather_df.empty:
        ghi_cols = [c for c in ensemble_weather_df.columns if "shortwave_radiation" in c and "member" in c]
        if ghi_cols:
            ensemble_std = np.round(ensemble_weather_df[ghi_cols].std(axis=1).values, 2).tolist()

    # 5. Build Hourly Schedule
    timestamps = pd.to_datetime(df["timestamp"]).dt.strftime("%Y-%m-%d %H:%M").tolist()
    records: List[Dict[str, Any]] = []

    for i in range(len(timestamps)):
        t = timestamps[i]
        d_p50 = float(deficit_p50[i])
        d_p10 = float(deficit_p10[i])
        d_p90 = float(deficit_p90[i])
        bw = float(bandwidth[i])
        dem = float(demand_pred[i])
        tot_gen = float(gen_p50[i])

        # Operational status and dispatch recommendation
        if d_p50 > 15.0:
            status = "DEFICIT"
            advisory = f"Discharge BESS (+{d_p50:.1f} MW). Peak deficit risk: {d_p90:.1f} MW"
        elif d_p50 < -15.0:
            status = "SURPLUS"
            advisory = f"Charge BESS ({-d_p50:.1f} MW) / Export to regional grid"
        else:
            status = "BALANCED"
            advisory = f"Optimal grid balance (Within ±15 MW buffer)"

        uncertainty_flag = "HIGH_SPREAD" if bw > 25.0 else "NORMAL_SPREAD"

        records.append({
            "timestamp": t,
            "grid_demand_mw": dem,
            "total_renewable_mw": tot_gen,
            "solar_generation_mw": float(sol_p50[i]),
            "wind_generation_mw": float(wnd_p50[i]),
            "generation_bounds": {
                "p10_pessimistic_mw": float(gen_p10[i]),
                "p50_expected_mw": tot_gen,
                "p90_optimistic_mw": float(gen_p90[i])
            },
            "deficit_bounds": {
                "p10_optimistic_mw": d_p10,
                "p50_expected_mw": d_p50,
                "p90_worst_case_mw": d_p90,
                "bandwidth_mw": bw
            },
            "system_status": status,
            "uncertainty_status": uncertainty_flag,
            "dispatch_advisory": advisory,
            "ensemble_weather_std": ensemble_std[i] if ensemble_std and i < len(ensemble_std) else None
        })

    max_deficit_p50 = float(np.max(deficit_p50))
    max_deficit_p90 = float(np.max(deficit_p90))
    critical_deficit_hours = [r["timestamp"] for r in records if r["deficit_bounds"]["p50_expected_mw"] > 15.0]

    return {
        "summary": {
            "forecast_hours": len(records),
            "max_expected_deficit_mw": max_deficit_p50,
            "peak_risk_p90_deficit_mw": max_deficit_p90,
            "critical_deficit_hours_count": len(critical_deficit_hours),
            "critical_deficit_hours": critical_deficit_hours,
            "average_confidence_bandwidth_mw": round(float(np.mean(bandwidth)), 2)
        },
        "hourly_schedule": records
    }


def slice_forward_window(
    df_features: pd.DataFrame,
    start_hour: int,
    end_hour: int,
    reference_dt: Optional[datetime] = None
) -> pd.DataFrame:
    """
    Slices a forward-looking hourly window (e.g. 18:00 to 22:00 ahead from 14:00).
    If the requested window for today has already passed, targets tomorrow's window.
    """
    now = reference_dt or datetime.now()
    today = now.date()

    start_ts = pd.to_datetime(f"{today} {start_hour:02d}:00:00")
    end_ts = pd.to_datetime(f"{today} {end_hour:02d}:00:00")

    # If the window is in the past relative to reference time, look at tomorrow
    if end_ts <= pd.to_datetime(now):
        start_ts += timedelta(days=1)
        end_ts += timedelta(days=1)

    df = df_features.copy()
    ts_col = pd.to_datetime(df["timestamp"])
    mask = (ts_col >= start_ts) & (ts_col <= end_ts)
    sliced = df.loc[mask].copy().reset_index(drop=True)

    # Fallback if specific date is not present in mock/cached dataset: slice by hour of day
    if len(sliced) == 0:
        hour_col = ts_col.dt.hour
        if start_hour <= end_hour:
            h_mask = (hour_col >= start_hour) & (hour_col <= end_hour)
        else:
            h_mask = (hour_col >= start_hour) | (hour_col <= end_hour)
        sliced = df.loc[h_mask].copy().head(end_hour - start_hour + 1).reset_index(drop=True)

    return sliced
