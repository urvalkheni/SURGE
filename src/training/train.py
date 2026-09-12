"""
train.py
--------
Trains and benchmarks multiple Machine Learning models for solar power forecasting:
1. Baseline: Clear-Sky Physical Persistence Baseline
2. Linear Regression (L2 Ridge)
3. Random Forest Regressor
4. HistGradientBoosting Regressor (Fast LightGBM-style histogram boosting)
5. XGBoost Regressor (Extreme Gradient Boosting)

Validation Protocol:
- Chronological Time-Series Split (70% Train, 15% Validation, 15% Test)
- NO random shuffling (strictly prevents future-to-past data leakage)

Evaluation Metrics:
- MAE (Mean Absolute Error, in MW)
- RMSE (Root Mean Squared Error, in MW)
- R² (Coefficient of Determination)
- Normalized RMSE (nRMSE = RMSE / Plant_Capacity * 100%)

Saves:
- Best performing model to models/solar_forecast_best.joblib
- Model metadata & feature names to models/model_metadata.json
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

# Explicit feature list available both in historical training and in future NWP weather forecasts
FEATURE_COLUMNS = [
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

TARGET_COLUMN = "actual_generation_mw"

class BaselineModel:
    """
    Physical baseline: scales theoretical Clear-Sky GHI by overall seasonal ratio.
    """
    def __init__(self):
        self.scale_factor = 1.0

    def fit(self, X: pd.DataFrame, y: pd.Series):
        clearsky_sum = X["clearsky_ghi"].sum()
        if clearsky_sum > 0:
            self.scale_factor = y.sum() / clearsky_sum
        else:
            self.scale_factor = 0.1

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        preds = X["clearsky_ghi"].values * self.scale_factor
        preds[X["solar_elevation"] <= 0.0] = 0.0
        return np.clip(preds, 0.0, PLANT_CAPACITY_MW)

def evaluate_predictions(y_true: np.ndarray, y_pred: np.ndarray, capacity: float = PLANT_CAPACITY_MW):
    # Enforce physical post-processing: power cannot be negative or exceed capacity
    y_pred = np.clip(y_pred, 0.0, capacity)
    
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    nrmse = (rmse / capacity) * 100.0  # Percentage of plant capacity
    return round(mae, 3), round(rmse, 3), round(r2, 4), round(nrmse, 2)

def train_and_evaluate(
    feature_csv_path: str = "data/processed/features_training.csv",
    output_model_dir: str = "models"
):
    logger.info(f"Loading feature dataset from {feature_csv_path}...")
    df = pd.read_csv(feature_csv_path)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp").reset_index(drop=True)

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    # --- CHRONOLOGICAL TIME-SERIES SPLIT ---
    # 70% Train, 15% Validation, 15% Test
    n = len(df)
    train_end = int(0.70 * n)
    val_end = int(0.85 * n)

    X_train, y_train = X.iloc[:train_end], y.iloc[:train_end]
    X_val, y_val = X.iloc[train_end:val_end], y.iloc[train_end:val_end]
    X_test, y_test = X.iloc[val_end:], y.iloc[val_end:]

    train_dates = (df["timestamp"].iloc[0].strftime("%Y-%m-%d"), df["timestamp"].iloc[train_end - 1].strftime("%Y-%m-%d"))
    val_dates = (df["timestamp"].iloc[train_end].strftime("%Y-%m-%d"), df["timestamp"].iloc[val_end - 1].strftime("%Y-%m-%d"))
    test_dates = (df["timestamp"].iloc[val_end].strftime("%Y-%m-%d"), df["timestamp"].iloc[-1].strftime("%Y-%m-%d"))

    print("\n" + "="*70)
    print("        CHRONOLOGICAL TIME-SERIES PARTITION")
    print("="*70)
    print(f"Training set   : {len(X_train):>5} hours ({train_dates[0]} to {train_dates[1]}) [70%]")
    print(f"Validation set : {len(X_val):>5} hours ({val_dates[0]} to {val_dates[1]}) [15%]")
    print(f"Test set (Hold): {len(X_test):>5} hours ({test_dates[0]} to {test_dates[1]}) [15%]")

    # Candidate models
    models = {
        "Clear-Sky Baseline": BaselineModel(),
        "Ridge Linear Regression": Ridge(alpha=10.0),
        "Random Forest": RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1),
        "HistGradientBoosting": HistGradientBoostingRegressor(max_iter=150, max_depth=8, learning_rate=0.08, random_state=42),
        "XGBoost Regressor": XGBRegressor(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.85,
            colsample_bytree=0.85,
            random_state=42,
            n_jobs=-1
        )
    }

    results = []
    trained_objects = {}

    print("\n" + "="*70)
    print("                  MODEL TRAINING & BENCHMARKING")
    print("="*70)

    for name, model in models.items():
        logger.info(f"Training {name}...")
        start_t = time.time()
        model.fit(X_train, y_train)
        train_duration = round(time.time() - start_t, 2)
        trained_objects[name] = model

        # Evaluate on Validation set
        val_pred = model.predict(X_val)
        val_mae, val_rmse, val_r2, val_nrmse = evaluate_predictions(y_val.values, val_pred)

        # Evaluate on Out-of-Sample Test set
        test_pred = model.predict(X_test)
        test_mae, test_rmse, test_r2, test_nrmse = evaluate_predictions(y_test.values, test_pred)

        results.append({
            "Model": name,
            "Val MAE (MW)": val_mae,
            "Val RMSE (MW)": val_rmse,
            "Val R²": val_r2,
            "Test MAE (MW)": test_mae,
            "Test RMSE (MW)": test_rmse,
            "Test nRMSE (%)": test_nrmse,
            "Test R²": test_r2,
            "Train Time (s)": train_duration
        })

    results_df = pd.DataFrame(results)
    print("\n" + results_df.to_string(index=False))

    # Identify best model based on Test RMSE
    best_row = results_df.loc[results_df["Test RMSE (MW)"].idxmin()]
    best_model_name = best_row["Model"]
    best_model = trained_objects[best_model_name]

    print(f"\n[WINNING MODEL]: {best_model_name}")
    print(f"Test MAE: {best_row['Test MAE (MW)']} MW | Test RMSE: {best_row['Test RMSE (MW)']} MW | Test R²: {best_row['Test R²']}")

    # Save best model and metadata
    os.makedirs(output_model_dir, exist_ok=True)
    best_model_path = os.path.join(output_model_dir, "solar_forecast_best.joblib")
    metadata_path = os.path.join(output_model_dir, "model_metadata.json")

    joblib.dump(best_model, best_model_path)
    logger.info(f"Saved winning model to {best_model_path}")

    # Feature importances if available
    feature_importance = {}
    if hasattr(best_model, "feature_importances_"):
        importances = best_model.feature_importances_
        sorted_idx = np.argsort(importances)[::-1]
        for idx in sorted_idx:
            feature_importance[FEATURE_COLUMNS[idx]] = round(float(importances[idx]), 4)
        
        print("\n--- TOP 10 MOST INFLUENTIAL FEATURES ---")
        for i, (f, imp) in enumerate(list(feature_importance.items())[:10], 1):
            print(f" {i:>2}. {f:<26} : {imp*100:>5.2f}%")

    metadata = {
        "best_model_name": best_model_name,
        "training_date": time.strftime("%Y-%m-%d %H:%M:%S"),
        "plant_capacity_mw": PLANT_CAPACITY_MW,
        "feature_columns": FEATURE_COLUMNS,
        "evaluation_metrics": best_row.to_dict(),
        "feature_importance": feature_importance
    }

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=4)
    logger.info(f"Saved model metadata to {metadata_path}")

    return results_df

if __name__ == "__main__":
    train_and_evaluate()
