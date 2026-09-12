"""
train_wind.py
-------------
Trains and evaluates ML models for Jaisalmer Wind Park generation forecasting.
Features engineered:
- Wind speed at 10m and 100m (hub height)
- Wind directional vectors (sin/cos of direction degrees)
- Air density (fluid dynamic drag calculated from temp and pressure)
- Gust factor and atmospheric wind momentum (rolling 3h and 6h stats)
- Cyclical diurnal and seasonal time features

Saves:
- models/wind_forecast_best.joblib
- models/wind_metadata.json
"""

import os
import json
import time
import pandas as pd
import numpy as np
import joblib
import logging

from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

PLANT_CAPACITY_MW = 100.0

WIND_FEATURES = [
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

def engineer_wind_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    
    # Directional trigonometry
    rad = np.deg2rad(df["wind_direction_100m"].values)
    df["wind_dir_sin"] = np.round(np.sin(rad), 4)
    df["wind_dir_cos"] = np.round(np.cos(rad), 4)

    # Compute air density if not present
    if "air_density" not in df.columns:
        temp_k = df["temperature_2m"].values + 273.15
        p_pa = df["surface_pressure"].values * 100.0
        df["air_density"] = np.round(p_pa / (287.058 * temp_k), 3)

    # Cyclical time
    hour = df["timestamp"].dt.hour
    df["hour_sin"] = np.round(np.sin(2 * np.pi * hour / 24.0), 4)
    df["hour_cos"] = np.round(np.cos(2 * np.pi * hour / 24.0), 4)

    month = df["timestamp"].dt.month
    df["month_sin"] = np.round(np.sin(2 * np.pi * month / 12.0), 4)
    df["month_cos"] = np.round(np.cos(2 * np.pi * month / 12.0), 4)

    day = df["timestamp"].dt.dayofyear
    df["day_of_year_sin"] = np.round(np.sin(2 * np.pi * day / 365.25), 4)
    df["day_of_year_cos"] = np.round(np.cos(2 * np.pi * day / 365.25), 4)

    # Wind atmospheric momentum
    df["wind_speed_rolling_3h"] = np.round(df["wind_speed_100m"].rolling(3, min_periods=1).mean(), 2)
    df["wind_speed_rolling_6h"] = np.round(df["wind_speed_100m"].rolling(6, min_periods=1).mean(), 2)

    return df

def train_wind_models(
    input_path: str = "data/raw/wind/wind_historical.csv",
    output_dir: str = "models"
):
    logger.info(f"Loading raw wind data from {input_path}...")
    df = pd.read_csv(input_path)
    df = engineer_wind_features(df)
    
    os.makedirs("data/processed/wind", exist_ok=True)
    df.to_csv("data/processed/wind/wind_features_training.csv", index=False)

    X = df[WIND_FEATURES]
    y = df["actual_generation_mw"]

    # Chronological Split (70% Train, 15% Val, 15% Holdout Test)
    n = len(df)
    train_end = int(0.70 * n)
    val_end = int(0.85 * n)

    X_train, y_train = X.iloc[:train_end], y.iloc[:train_end]
    X_val, y_val = X.iloc[train_end:val_end], y.iloc[train_end:val_end]
    X_test, y_test = X.iloc[val_end:], y.iloc[val_end:]

    models = {
        "Ridge Linear Regression": Ridge(alpha=10.0),
        "Random Forest Regressor": RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1),
        "HistGradientBoosting": HistGradientBoostingRegressor(max_iter=150, max_depth=8, learning_rate=0.08, random_state=42),
        "XGBoost Regressor": XGBRegressor(n_estimators=200, max_depth=6, learning_rate=0.05, random_state=42, n_jobs=-1)
    }

    results = []
    trained = {}

    print("\n" + "="*70)
    print("            JAISALMER WIND PARK - MODEL BENCHMARKING")
    print("="*70)

    for name, model in models.items():
        t0 = time.time()
        model.fit(X_train, y_train)
        duration = round(time.time() - t0, 2)
        trained[name] = model

        # Test evaluation
        preds = np.clip(model.predict(X_test), 0.0, PLANT_CAPACITY_MW)
        mae = mean_absolute_error(y_test, preds)
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        r2 = r2_score(y_test, preds)
        nrmse = (rmse / PLANT_CAPACITY_MW) * 100.0

        results.append({
            "Model": name,
            "Test MAE (MW)": round(mae, 3),
            "Test RMSE (MW)": round(rmse, 3),
            "Test nRMSE (%)": round(nrmse, 2),
            "Test R²": round(r2, 4),
            "Train Time (s)": duration
        })

    res_df = pd.DataFrame(results)
    print(res_df.to_string(index=False))

    best_row = res_df.loc[res_df["Test RMSE (MW)"].idxmin()]
    best_name = best_row["Model"]
    best_model = trained[best_name]

    print(f"\n[WINNING WIND MODEL]: {best_name}")
    print(f"Test RMSE: {best_row['Test RMSE (MW)']} MW | Test nRMSE: {best_row['Test nRMSE (%)']}% | R²: {best_row['Test R²']}")

    # Save
    joblib.dump(best_model, os.path.join(output_dir, "wind_forecast_best.joblib"))
    with open(os.path.join(output_dir, "wind_metadata.json"), "w") as f:
        json.dump({
            "best_model_name": best_name,
            "plant_capacity_mw": PLANT_CAPACITY_MW,
            "feature_columns": WIND_FEATURES,
            "metrics": best_row.to_dict()
        }, f, indent=4)
    
    logger.info(f"Wind model and metadata saved successfully to {output_dir}/")
    return res_df

if __name__ == "__main__":
    train_wind_models()
