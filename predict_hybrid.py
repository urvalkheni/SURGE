"""
predict_hybrid.py
-----------------
Generates a synchronized 24-72h operational forecast for BOTH:
1. Bhadla Solar Park (100 MW Solar)
2. Jaisalmer Wind Park (100 MW Wind)

Calculates total combined renewable generation and executes the
Grid-Level Hybrid Power Plant (HPP) Dispatch Advisory.
"""

import os
import argparse
import pandas as pd
import numpy as np
import joblib

from src.prediction.predict import generate_forecast_features, DEFAULT_FORECAST_CSV
from src.wind.train_wind import engineer_wind_features

SOLAR_MODEL_PATH = "models/solar_forecast_best.joblib"
WIND_MODEL_PATH = "models/wind_forecast_best.joblib"
WIND_FORECAST_CSV = "data/raw/wind/wind_forecast.csv"
OUTPUT_HYBRID_CSV = "data/processed/hybrid_forecast_72h.csv"

def run_hybrid_forecast(hours: int = 72) -> pd.DataFrame:
    # 1. Solar Predictions
    solar_model = joblib.load(SOLAR_MODEL_PATH)
    solar_weather = pd.read_csv(DEFAULT_FORECAST_CSV).head(hours)
    
    import json
    with open("models/model_metadata.json", "r") as f:
        solar_meta = json.load(f)
    solar_features = generate_forecast_features(solar_weather, solar_meta["feature_columns"])
    solar_preds = np.clip(solar_model.predict(solar_features), 0.0, 100.0)
    solar_preds[solar_features["solar_elevation"] <= 0.0] = 0.0
    solar_preds = np.round(solar_preds, 2)

    # 2. Wind Predictions
    wind_model = joblib.load(WIND_MODEL_PATH)
    wind_weather = pd.read_csv(WIND_FORECAST_CSV).head(hours)
    wind_feat_df = engineer_wind_features(wind_weather)
    with open("models/wind_metadata.json", "r") as f:
        wind_meta = json.load(f)
    wind_features = wind_feat_df[wind_meta["feature_columns"]]
    wind_preds = np.clip(wind_model.predict(wind_features), 0.0, 100.0)
    wind_preds = np.round(wind_preds, 2)

    # 3. Hybrid Aggregation
    timestamps = pd.to_datetime(solar_weather["timestamp"]).dt.strftime("%Y-%m-%d %H:%M")
    total_re = np.round(solar_preds + wind_preds, 2)

    # Regional demand curve for 200 MW connected load: baseline 85 MW, day peak 125 MW, evening peak 150 MW
    hrs = pd.to_datetime(solar_weather["timestamp"]).dt.hour
    demand = 85.0 + 40.0 * np.sin(np.pi * (hrs - 6) / 12).clip(0, 1) + 45.0 * np.sin(np.pi * (hrs - 18) / 6).clip(0, 1)
    demand = np.round(demand, 1)

    delta = np.round(total_re - demand, 2)
    
    advisories = []
    statuses = []
    for d in delta:
        if d > 15.0:
            statuses.append("SURPLUS")
            advisories.append(f"Charge BESS Battery (+{d:.1f} MW) / Export to Regional Grid")
        elif d < -15.0:
            statuses.append("DEFICIT")
            advisories.append(f"Discharge BESS Battery / Ramp Fast Peaker (-{abs(d):.1f} MW)")
        else:
            statuses.append("BALANCED")
            advisories.append("Optimal Grid Balance (Within ±15 MW band)")

    hybrid_df = pd.DataFrame({
        "timestamp": timestamps,
        "solar_generation_mw": solar_preds,
        "wind_generation_mw": wind_preds,
        "total_renewable_mw": total_re,
        "grid_demand_mw": demand,
        "grid_balance_mw": delta,
        "system_status": statuses,
        "dispatch_advisory": advisories
    })

    os.makedirs(os.path.dirname(OUTPUT_HYBRID_CSV), exist_ok=True)
    hybrid_df.to_csv(OUTPUT_HYBRID_CSV, index=False)
    return hybrid_df

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Hybrid Solar + Wind Operational Forecasting")
    parser.add_argument("--hours", type=int, default=72)
    args = parser.parse_args()

    df = run_hybrid_forecast(args.hours)
    print("\n" + "="*95)
    print(f"        HYBRID RENEWABLE (SOLAR + WIND) 72-HOUR DISPATCH SCHEDULE")
    print("="*95)
    print(df.head(24)[["timestamp", "solar_generation_mw", "wind_generation_mw", "total_renewable_mw", "grid_demand_mw", "system_status"]].to_string(index=False))

    print("\n--- 72-HOUR HYBRID ENERGY TOTALS ---")
    print(f"Solar Total Energy : {df['solar_generation_mw'].sum():,.1f} MWh")
    print(f"Wind Total Energy  : {df['wind_generation_mw'].sum():,.1f} MWh")
    print(f"Total Renewable    : {df['total_renewable_mw'].sum():,.1f} MWh")
    print(f"Peak Total Output  : {df['total_renewable_mw'].max()} MW (Out of 200 MW Hybrid Capacity)")
