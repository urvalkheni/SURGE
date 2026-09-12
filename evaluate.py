"""
evaluate.py
-----------
Evaluates the trained forecasting model on the out-of-sample holdout test set:
1. Computes MAE, RMSE, R², and Normalized RMSE (nRMSE).
2. Computes daytime-only metrics (excluding zero-generation night hours).
3. Evaluates error distribution (residuals = Actual - Predicted).
4. Plots Actual vs. Predicted time-series curves and scatter plot.
5. Saves evaluation plot to data/processed/test_evaluation_plot.png.
"""

import os
import json
import pandas as pd
import numpy as np
import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import logging
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

MODEL_PATH = "models/solar_forecast_best.joblib"
METADATA_PATH = "models/model_metadata.json"
DATA_PATH = "data/processed/features_training.csv"
OUTPUT_PLOT_PATH = "data/processed/test_evaluation_plot.png"

def evaluate_test_set():
    logger.info(f"Loading best model from {MODEL_PATH}...")
    model = joblib.load(MODEL_PATH)

    with open(METADATA_PATH, "r") as f:
        metadata = json.load(f)
    feature_cols = metadata["feature_columns"]
    plant_cap = metadata["plant_capacity_mw"]

    df = pd.read_csv(DATA_PATH)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp").reset_index(drop=True)

    # Recreate the exact 15% out-of-sample test set (final 1,314 hours of the year)
    n = len(df)
    test_start = int(0.85 * n)
    test_df = df.iloc[test_start:].copy().reset_index(drop=True)

    X_test = test_df[feature_cols]
    y_test = test_df["actual_generation_mw"].values

    # Predict
    raw_preds = model.predict(X_test)
    y_pred = np.clip(raw_preds, 0.0, plant_cap)
    y_pred[test_df["solar_elevation"] <= 0.0] = 0.0
    y_pred = np.round(y_pred, 2)
    test_df["predicted_generation_mw"] = y_pred
    test_df["residual_error"] = y_test - y_pred

    # Overall Metrics
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    nrmse = (rmse / plant_cap) * 100.0

    # Daytime-Only Metrics (where actual or predicted > 0)
    daytime_mask = (y_test > 0) | (y_pred > 0)
    day_mae = mean_absolute_error(y_test[daytime_mask], y_pred[daytime_mask])
    day_rmse = np.sqrt(mean_squared_error(y_test[daytime_mask], y_pred[daytime_mask]))
    day_r2 = r2_score(y_test[daytime_mask], y_pred[daytime_mask])

    print("\n" + "="*70)
    print("         HOLDOUT TEST SET EVALUATION REPORT (1,314 HOURS)")
    print("="*70)
    print(f"Test Period             : {test_df['timestamp'].iloc[0]} to {test_df['timestamp'].iloc[-1]}")
    print(f"Plant Rated Capacity    : {plant_cap} MW")
    print(f"Overall MAE             : {mae:.3f} MW")
    print(f"Overall RMSE            : {rmse:.3f} MW")
    print(f"Overall Normalized RMSE : {nrmse:.2f}% of capacity")
    print(f"Overall R² Score        : {r2:.4f}")
    print("-"*70)
    print(f"Daytime-Only MAE        : {day_mae:.3f} MW")
    print(f"Daytime-Only RMSE       : {day_rmse:.3f} MW")
    print(f"Daytime-Only R² Score   : {day_r2:.4f}")

    # Plotting Evaluation Charts
    logger.info("Generating evaluation diagnostic plots...")
    fig, axes = plt.subplots(2, 1, figsize=(15, 10))
    fig.suptitle("Out-of-Sample Test Set Forecast Evaluation - Bhadla Solar Park", fontsize=15, fontweight="bold")

    # Plot 1: 7-Day Zoomed Actual vs Predicted Time-Series
    sample_7days = test_df.iloc[200:200+168]  # 7 continuous days (168 hours)
    axes[0].plot(sample_7days["timestamp"], sample_7days["actual_generation_mw"], label="Actual Generation (MW)", color="#1b9e77", lw=2.2)
    axes[0].plot(sample_7days["timestamp"], sample_7days["predicted_generation_mw"], label="Model Forecast (MW)", color="#d95f02", lw=2.0, linestyle="--")
    axes[0].set_title("1. Seven-Day Continuous Forecast vs. Actual Generation Profile", fontsize=12, fontweight="bold")
    axes[0].set_ylabel("Power Generation (MW)")
    axes[0].grid(True, alpha=0.3)
    axes[0].legend(loc="upper right")

    # Plot 2: Scatter Plot of Actual vs Predicted (Daytime)
    axes[1].scatter(y_test[daytime_mask], y_pred[daytime_mask], color="#386cb0", alpha=0.5, s=15, label="Hourly Predictions")
    max_val = max(y_test.max(), y_pred.max())
    axes[1].plot([0, max_val], [0, max_val], color="red", linestyle="--", lw=2, label="Perfect Forecast (1:1)")
    axes[1].set_title(f"2. Actual vs. Predicted Parity (R² = {r2:.4f}, Daytime RMSE = {day_rmse:.2f} MW)", fontsize=12, fontweight="bold")
    axes[1].set_xlabel("Actual Generation (MW)")
    axes[1].set_ylabel("Predicted Generation (MW)")
    axes[1].grid(True, alpha=0.3)
    axes[1].legend(loc="upper left")

    plt.tight_layout()
    os.makedirs(os.path.dirname(OUTPUT_PLOT_PATH), exist_ok=True)
    plt.savefig(OUTPUT_PLOT_PATH, dpi=180)
    plt.close()
    logger.info(f"Saved evaluation plot to {OUTPUT_PLOT_PATH}")
    print(f"\n[SUCCESS] Evaluation plot saved to: {OUTPUT_PLOT_PATH}")

if __name__ == "__main__":
    evaluate_test_set()
