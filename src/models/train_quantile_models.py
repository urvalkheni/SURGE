"""
train_quantile_models.py
------------------------
Trains site-calibrated Multi-Quantile XGBoost generation models (P10, P50, P90)
for Bhadla Solar Park and Jaisalmer Wind Park, and fits the thermodynamic Demand Forecaster.
"""

import os
import json
import time
import numpy as np
import pandas as pd
from datetime import datetime

from src.models.quantile_forecaster import SiteQuantileForecaster
from src.models.demand_forecaster import DemandForecaster
from src.prediction.predict import generate_forecast_features
from src.wind.train_wind import engineer_wind_features

SOLAR_INPUT_CSV = "data/raw/solar_generation_raw.csv"
WIND_INPUT_CSV = "data/raw/wind/wind_historical.csv"

SOLAR_FEATURE_COLS = [
    "shortwave_radiation",
    "direct_normal_irradiance",
    "diffuse_radiation",
    "temperature_2m",
    "relative_humidity_2m",
    "surface_pressure",
    "cloud_cover",
    "wind_speed_10m",
    "solar_zenith",
    "solar_azimuth",
    "solar_elevation",
    "clearsky_ghi",
    "clearness_index",
    "hour_sin",
    "hour_cos",
    "month_sin",
    "month_cos",
    "day_of_year_sin",
    "day_of_year_cos",
    "cloud_cover_rolling_3h",
    "temp_rolling_3h"
]

WIND_FEATURE_COLS = [
    "wind_speed_10m",
    "wind_speed_100m",
    "wind_gusts_10m",
    "wind_dir_sin",
    "wind_dir_cos",
    "air_density",
    "temperature_2m",
    "surface_pressure",
    "hour_sin",
    "hour_cos",
    "month_sin",
    "month_cos",
    "day_of_year_sin",
    "day_of_year_cos",
    "wind_speed_rolling_3h",
    "wind_speed_rolling_6h"
]

def pinball_loss(y_true: np.ndarray, y_pred: np.ndarray, alpha: float) -> float:
    diff = y_true - y_pred
    return float(np.mean(np.maximum(alpha * diff, (alpha - 1.0) * diff)))

def evaluate_quantiles(y_true: np.ndarray, preds: dict) -> dict:
    p10 = preds["p10"]
    p50 = preds["p50"]
    p90 = preds["p90"]

    pb10 = pinball_loss(y_true, p10, 0.10)
    pb50 = pinball_loss(y_true, p50, 0.50)
    pb90 = pinball_loss(y_true, p90, 0.90)

    # Coverage of 80% prediction interval [P10, P90]
    in_interval = (y_true >= p10) & (y_true <= p90)
    coverage_pct = round(float(np.mean(in_interval) * 100.0), 2)
    mae_median = round(float(np.mean(np.abs(y_true - p50))), 3)

    return {
        "pinball_loss_p10": round(pb10, 4),
        "pinball_loss_p50": round(pb50, 4),
        "pinball_loss_p90": round(pb90, 4),
        "p10_p90_interval_coverage_pct": coverage_pct,
        "median_p50_mae_mw": mae_median
    }

def train_all_models():
    print("=" * 70)
    print("  TRAINING SITE-CALIBRATED QUANTILE GENERATION & DEMAND MODELS")
    print("=" * 70)

    os.makedirs("models", exist_ok=True)
    metadata = {
        "training_timestamp": datetime.now().isoformat(),
        "algorithm": "Multi-Quantile XGBoost (reg:quantileerror)",
        "quantiles": [0.10, 0.50, 0.90]
    }

    # -------------------------------------------------------------------------
    # 1. SOLAR QUANTILE MODEL (Bhadla Solar Park, 100 MW)
    # -------------------------------------------------------------------------
    print("\n[1/3] Processing Solar Data & Training Quantile Forecaster...")
    t0 = time.time()
    df_solar = pd.read_csv(SOLAR_INPUT_CSV)
    df_solar["timestamp"] = pd.to_datetime(df_solar["timestamp"])

    X_solar = generate_forecast_features(df_solar, SOLAR_FEATURE_COLS)
    y_solar = df_solar["actual_generation_mw"]

    # Chronological Split: 80% Train, 20% Test
    split_idx_solar = int(len(df_solar) * 0.80)
    X_solar_train, X_solar_test = X_solar.iloc[:split_idx_solar], X_solar.iloc[split_idx_solar:]
    y_solar_train, y_solar_test = y_solar.iloc[:split_idx_solar], y_solar.iloc[split_idx_solar:]

    solar_forecaster = SiteQuantileForecaster(
        target_type="solar",
        max_capacity_mw=100.0,
        feature_columns=SOLAR_FEATURE_COLS
    )
    solar_forecaster.fit(X_solar_train, y_solar_train, verbose=True)
    solar_preds_test = solar_forecaster.predict_quantiles(X_solar_test)
    solar_metrics = evaluate_quantiles(y_solar_test.values, solar_preds_test)

    solar_model_path = "models/solar_quantile_best.joblib"
    solar_forecaster.save(solar_model_path)
    metadata["solar"] = {
        "model_file": solar_model_path,
        "features": SOLAR_FEATURE_COLS,
        "capacity_mw": 100.0,
        "train_samples": len(X_solar_train),
        "test_samples": len(X_solar_test),
        "metrics": solar_metrics,
        "train_time_sec": round(time.time() - t0, 2)
    }
    print(f"  -> Solar P10-P90 Coverage: {solar_metrics['p10_p90_interval_coverage_pct']}% (Target: ~80%)")
    print(f"  -> Solar Median MAE: {solar_metrics['median_p50_mae_mw']} MW")

    # -------------------------------------------------------------------------
    # 2. WIND QUANTILE MODEL (Jaisalmer Wind Park, 100 MW)
    # -------------------------------------------------------------------------
    print("\n[2/3] Processing Wind Data & Training Quantile Forecaster...")
    t0 = time.time()
    df_wind = pd.read_csv(WIND_INPUT_CSV)
    df_wind = engineer_wind_features(df_wind)
    X_wind = df_wind[WIND_FEATURE_COLS]
    y_wind = df_wind["actual_generation_mw"]

    split_idx_wind = int(len(df_wind) * 0.80)
    X_wind_train, X_wind_test = X_wind.iloc[:split_idx_wind], X_wind.iloc[split_idx_wind:]
    y_wind_train, y_wind_test = y_wind.iloc[:split_idx_wind], y_wind.iloc[split_idx_wind:]

    wind_forecaster = SiteQuantileForecaster(
        target_type="wind",
        max_capacity_mw=100.0,
        feature_columns=WIND_FEATURE_COLS
    )
    wind_forecaster.fit(X_wind_train, y_wind_train, verbose=True)
    wind_preds_test = wind_forecaster.predict_quantiles(X_wind_test)
    wind_metrics = evaluate_quantiles(y_wind_test.values, wind_preds_test)

    wind_model_path = "models/wind_quantile_best.joblib"
    wind_forecaster.save(wind_model_path)
    metadata["wind"] = {
        "model_file": wind_model_path,
        "features": WIND_FEATURE_COLS,
        "capacity_mw": 100.0,
        "train_samples": len(X_wind_train),
        "test_samples": len(X_wind_test),
        "metrics": wind_metrics,
        "train_time_sec": round(time.time() - t0, 2)
    }
    print(f"  -> Wind P10-P90 Coverage: {wind_metrics['p10_p90_interval_coverage_pct']}% (Target: ~80%)")
    print(f"  -> Wind Median MAE: {wind_metrics['median_p50_mae_mw']} MW")

    # -------------------------------------------------------------------------
    # 3. DEMAND MODEL (Thermodynamic & Calendar Conditioned)
    # -------------------------------------------------------------------------
    print("\n[3/3] Training Temperature & Calendar-Driven Demand Forecaster...")
    demand_forecaster = DemandForecaster(base_load_mw=85.0)
    demand_forecaster.fit(df_solar)
    demand_model_path = "models/demand_model.joblib"
    demand_forecaster.save(demand_model_path)
    metadata["demand"] = {
        "model_file": demand_model_path,
        "base_load_mw": 85.0,
        "features": demand_forecaster.feature_columns
    }
    print(f"  -> Demand Model saved successfully to {demand_model_path}")

    with open("models/quantile_metadata.json", "w") as f:
        json.dump(metadata, f, indent=4)
    print("\n[COMPLETE] All site models trained and saved to models/!")

if __name__ == "__main__":
    train_all_models()
