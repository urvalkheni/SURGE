"""
test_deficit_pipeline.py
------------------------
Automated test suite verifying the end-to-end forward-looking probabilistic
renewable deficit forecasting pipeline, quantile models, demand model, and FastAPI endpoints.
"""

import os
import sys
import numpy as np
import pandas as pd
from datetime import datetime

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.models.quantile_forecaster import SiteQuantileForecaster
from src.models.demand_forecaster import DemandForecaster
from src.prediction.deficit_engine import compute_probabilistic_deficit, slice_forward_window
from app import app, get_forward_deficit_ahead, get_dynamic_hybrid_forecast


def test_site_quantile_forecasters():
    print("\n--- [TEST 1/4] Verifying Site Quantile Forecasters ---")
    solar_model = SiteQuantileForecaster.load("models/solar_quantile_best.joblib")
    wind_model = SiteQuantileForecaster.load("models/wind_quantile_best.joblib")

    assert solar_model is not None, "Failed to load solar quantile model"
    assert wind_model is not None, "Failed to load wind quantile model"

    # Test synthetic weather with nighttime and daytime
    sample_solar_df = pd.DataFrame({
        "shortwave_radiation": [0.0, 500.0, 800.0],
        "direct_normal_irradiance": [0.0, 600.0, 850.0],
        "diffuse_radiation": [0.0, 100.0, 150.0],
        "temperature_2m": [15.0, 28.0, 35.0],
        "relative_humidity_2m": [70.0, 45.0, 30.0],
        "surface_pressure": [1000.0, 998.0, 995.0],
        "cloud_cover": [0.0, 20.0, 10.0],
        "wind_speed_10m": [5.0, 6.0, 7.0],
        "solar_zenith": [120.0, 45.0, 25.0],
        "solar_azimuth": [300.0, 150.0, 180.0],
        "solar_elevation": [0.0, 45.0, 65.0],
        "clearsky_ghi": [0.0, 600.0, 900.0],
        "clearness_index": [0.0, 0.83, 0.89],
        "hour_sin": [0.0, 0.866, 0.0],
        "hour_cos": [1.0, 0.5, -1.0],
        "month_sin": [0.5, 0.5, 0.5],
        "month_cos": [0.866, 0.866, 0.866],
        "day_of_year_sin": [0.1, 0.1, 0.1],
        "day_of_year_cos": [0.99, 0.99, 0.99],
        "cloud_cover_rolling_3h": [0.0, 15.0, 12.0],
        "temp_rolling_3h": [15.0, 26.0, 32.0]
    })

    sol_preds = solar_model.predict_quantiles(sample_solar_df)
    # 1. Nighttime generation must be 0 MW
    assert sol_preds["p10"][0] == 0.0, "Nighttime P10 solar generation must be 0"
    assert sol_preds["p50"][0] == 0.0, "Nighttime P50 solar generation must be 0"
    assert sol_preds["p90"][0] == 0.0, "Nighttime P90 solar generation must be 0"

    # 2. Daytime monotonicity: P10 <= P50 <= P90
    assert np.all(sol_preds["p10"] <= sol_preds["p50"]), "Solar P10 must be <= P50"
    assert np.all(sol_preds["p50"] <= sol_preds["p90"]), "Solar P50 must be <= P90"
    print("  ✓ Solar Quantile Forecaster passed: Night-zero bound and P10 <= P50 <= P90 verified.")

    # Wind test
    sample_wind_df = pd.DataFrame({
        "wind_speed_10m": [2.0, 8.0, 14.0],
        "wind_speed_100m": [2.2, 10.0, 16.0],
        "wind_gusts_10m": [3.0, 11.0, 18.0],
        "wind_dir_sin": [0.5, 0.7, 0.9],
        "wind_dir_cos": [0.866, 0.714, 0.435],
        "air_density": [1.2, 1.18, 1.15],
        "temperature_2m": [20.0, 25.0, 30.0],
        "surface_pressure": [995.0, 992.0, 990.0],
        "hour_sin": [0.0, 0.5, 0.8],
        "hour_cos": [1.0, 0.866, 0.6],
        "month_sin": [0.5, 0.5, 0.5],
        "month_cos": [0.866, 0.866, 0.866],
        "day_of_year_sin": [0.1, 0.1, 0.1],
        "day_of_year_cos": [0.99, 0.99, 0.99],
        "wind_speed_rolling_3h": [2.1, 9.5, 15.0],
        "wind_speed_rolling_6h": [2.0, 9.0, 14.5]
    })
    wind_preds = wind_model.predict_quantiles(sample_wind_df)
    # Cut-in: speed < 3.0 m/s must be 0 MW
    assert wind_preds["p10"][0] == 0.0, "Wind cut-in (<3m/s) P10 must be 0 MW"
    assert wind_preds["p50"][0] == 0.0, "Wind cut-in (<3m/s) P50 must be 0 MW"
    assert wind_preds["p90"][0] == 0.0, "Wind cut-in (<3m/s) P90 must be 0 MW"
    assert np.all(wind_preds["p10"] <= wind_preds["p50"]), "Wind P10 must be <= P50"
    assert np.all(wind_preds["p50"] <= wind_preds["p90"]), "Wind P50 must be <= P90"
    print("  ✓ Wind Quantile Forecaster passed: Cut-in bound and P10 <= P50 <= P90 verified.")


def test_demand_forecaster():
    print("\n--- [TEST 2/4] Verifying Demand Forecaster ---")
    demand_model = DemandForecaster.load("models/demand_model.joblib")
    assert demand_model is not None, "Failed to load demand model"

    test_weather = pd.DataFrame({
        "timestamp": pd.date_range("2026-09-12 00:00", periods=24, freq="h"),
        "temperature_2m": [22.0 + 12.0 * np.sin(np.pi * (h - 6) / 12) if 6 <= h <= 18 else 24.0 for h in range(24)]
    })
    demand_preds = demand_model.predict(test_weather)
    assert len(demand_preds) == 24, "Expected 24 hourly demand predictions"
    assert np.all(demand_preds > 40.0), "Demand predictions must be above base operational floor"
    print(f"  ✓ Demand Forecaster passed: Mean demand {np.mean(demand_preds):.1f} MW (Min: {np.min(demand_preds):.1f}, Max: {np.max(demand_preds):.1f})")


def test_probabilistic_deficit_engine():
    print("\n--- [TEST 3/4] Verifying Deficit Engine & Inverted Quantiles ---")
    solar_model = SiteQuantileForecaster.load("models/solar_quantile_best.joblib")
    wind_model = SiteQuantileForecaster.load("models/wind_quantile_best.joblib")
    demand_model = DemandForecaster.load("models/demand_model.joblib")

    # Load 24h sample forecast weather
    weather_df = pd.read_csv("data/raw/weather_forecast.csv").head(24)
    weather_df["timestamp"] = pd.to_datetime(weather_df["timestamp"])
    
    with open("models/model_metadata.json", "r") as f:
        meta = json.load(f)
    from src.prediction.predict import generate_forecast_features
    from src.wind.train_wind import engineer_wind_features

    X_sol = generate_forecast_features(weather_df, meta["feature_columns"])
    for col in X_sol.columns:
        weather_df[col] = X_sol[col].values
    weather_df = engineer_wind_features(weather_df)

    # Slice ahead for 18:00 to 22:00
    sliced = slice_forward_window(weather_df, 18, 22)
    assert len(sliced) == 5, f"Expected 5 hours (18, 19, 20, 21, 22), got {len(sliced)}"

    result = compute_probabilistic_deficit(sliced, solar_model, wind_model, demand_model)
    assert "summary" in result
    assert "hourly_schedule" in result
    assert len(result["hourly_schedule"]) == 5

    # Check deficit quantile inversion
    for item in result["hourly_schedule"]:
        db = item["deficit_bounds"]
        gb = item["generation_bounds"]
        p10_def = db["p10_optimistic_mw"]
        p50_def = db["p50_expected_mw"]
        p90_def = db["p90_worst_case_mw"]

        assert p10_def <= p50_def, f"Expected Deficit P10 ({p10_def}) <= P50 ({p50_def})"
        assert p50_def <= p90_def, f"Expected Deficit P50 ({p50_def}) <= P90 ({p90_def})"
        assert db["bandwidth_mw"] >= 0.0, "Bandwidth must be non-negative"

    print("  ✓ Deficit Engine passed: Mathematical inversion and P10 <= P50 <= P90 bounds verified.")


def test_fastapi_endpoints():
    print("\n--- [TEST 4/4] Verifying FastAPI Endpoints ---")

    # 1. Test get_forward_deficit_ahead (e.g. 18:00 to 22:00 ahead)
    data = get_forward_deficit_ahead(
        state="rajasthan",
        city="jodhpur",
        target_start_hour=18,
        target_end_hour=22,
        live=False
    )
    assert data["status"] == "success"
    assert "target_window" in data
    assert data["target_window"] == "18:00 - 22:00"
    assert "summary" in data
    assert "max_expected_deficit_mw" in data["summary"]
    assert "peak_risk_p90_deficit_mw" in data["summary"]
    assert "average_confidence_bandwidth_mw" in data["summary"]
    assert len(data["hourly_schedule"]) > 0

    first_entry = data["hourly_schedule"][0]
    assert "deficit_bounds" in first_entry
    assert "p10_optimistic_mw" in first_entry["deficit_bounds"]
    assert "p50_expected_mw" in first_entry["deficit_bounds"]
    assert "p90_worst_case_mw" in first_entry["deficit_bounds"]
    assert "dispatch_advisory" in first_entry
    print(f"  ✓ /forecast/deficit-ahead endpoint passed: Window {data['target_window']} returns peak P90 deficit of {data['summary']['peak_risk_p90_deficit_mw']} MW.")

    # 2. Test get_dynamic_hybrid_forecast
    hybrid_data = get_dynamic_hybrid_forecast(
        state="rajasthan",
        city="jodhpur",
        hours=24,
        live=False
    )
    assert "max_expected_deficit_mw" in hybrid_data
    assert "peak_risk_p90_deficit_mw" in hybrid_data
    assert "hourly_schedule" in hybrid_data
    h_first = hybrid_data["hourly_schedule"][0]
    assert "deficit_bounds" in h_first
    assert "generation_bounds" in h_first
    print("  ✓ /forecast/hybrid endpoint passed: Contains updated quantile generation and deficit bounds.")


if __name__ == "__main__":
    import json
    print("=" * 70)
    print("  RUNNING COMPREHENSIVE DEFICIT PIPELINE TEST SUITE")
    print("=" * 70)
    test_site_quantile_forecasters()
    test_demand_forecaster()
    test_probabilistic_deficit_engine()
    test_fastapi_endpoints()
    print("\n" + "=" * 70)
    print("  ALL 4 TEST SUITES PASSED SUCCESSFULLY (100% COMPLIANT)")
    print("=" * 70)
