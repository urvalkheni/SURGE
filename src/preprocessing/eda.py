"""
eda.py
------
Performs Exploratory Data Analysis (EDA) on the solar feature dataset:
1. Missing value and outlier audit.
2. Pearson correlation analysis with actual_generation_mw.
3. Diurnal generation profile (generation by hour of day).
4. Generation vs. Solar Irradiance (GHI) and Cloud Cover.
5. Monthly seasonal generation breakdown.
6. Saves multi-panel publication-ready visualization to data/processed/eda_analysis.png.
"""

import os
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for headless terminal execution
import matplotlib.pyplot as plt
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def run_eda(
    input_path: str = "data/processed/features_training.csv",
    output_plot_path: str = "data/processed/eda_analysis.png"
):
    logger.info(f"Loading feature matrix from {input_path}...")
    df = pd.read_csv(input_path)
    df["timestamp"] = pd.to_datetime(df["timestamp"])

    print("\n" + "="*50)
    print("       EXPLORATORY DATA ANALYSIS (EDA) REPORT")
    print("="*50)

    # 1. Dataset Dimensions & Basic Health
    print(f"Total Observations: {len(df):,} hours")
    print(f"Date Range: {df['timestamp'].min()} to {df['timestamp'].max()}")
    print(f"Missing Values: {df.isnull().sum().sum()}")
    print(f"Duplicates: {df.duplicated(subset=['timestamp']).sum()}")

    # 2. Key Statistical Summaries
    key_cols = ["actual_generation_mw", "shortwave_radiation", "direct_normal_irradiance", "cloud_cover", "temperature_2m", "cell_temperature"]
    print("\n--- KEY VARIABLES DESCRIPTIVE STATISTICS ---")
    print(df[key_cols].describe().round(2).to_string())

    # 3. Pearson Correlation with Target (actual_generation_mw)
    numeric_df = df.select_dtypes(include=[np.number])
    correlations = numeric_df.corr()["actual_generation_mw"].sort_values(ascending=False)
    print("\n--- TOP CORRELATIONS WITH ACTUAL GENERATION (MW) ---")
    for feat, val in correlations.items():
        if feat != "actual_generation_mw":
            print(f"  {feat:<26} : {val:+.4f}")

    # 4. Generate Comprehensive Visualizations
    logger.info("Generating multi-panel EDA charts...")
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    fig.suptitle("Solar Generation & Atmospheric EDA - Bhadla Solar Park (100 MW)", fontsize=16, fontweight="bold")

    # Chart 1: Diurnal Generation Profile by Hour of Day
    hourly_stats = df.groupby("hour")["actual_generation_mw"].agg(["mean", "std", "max"])
    axes[0, 0].plot(hourly_stats.index, hourly_stats["mean"], color="#d95f02", lw=2.5, marker="o", label="Mean Output (MW)")
    axes[0, 0].fill_between(
        hourly_stats.index,
        np.maximum(0, hourly_stats["mean"] - hourly_stats["std"]),
        hourly_stats["mean"] + hourly_stats["std"],
        color="#d95f02", alpha=0.25, label="±1 Std Dev"
    )
    axes[0, 0].plot(hourly_stats.index, hourly_stats["max"], color="#7570b3", linestyle="--", label="Max Recorded (MW)")
    axes[0, 0].set_title("1. Diurnal Generation Curve (Average Day Profile)", fontsize=12, fontweight="bold")
    axes[0, 0].set_xlabel("Hour of Day (IST)")
    axes[0, 0].set_ylabel("Power Output (MW)")
    axes[0, 0].set_xticks(range(0, 24, 2))
    axes[0, 0].grid(True, alpha=0.3)
    axes[0, 0].legend()

    # Chart 2: Scatter - Solar Irradiance (GHI) vs Generation
    daytime = df[df["is_daytime"] == 1]
    scatter = axes[0, 1].scatter(
        daytime["shortwave_radiation"],
        daytime["actual_generation_mw"],
        c=daytime["temperature_2m"],
        cmap="plasma", alpha=0.5, s=12
    )
    cbar = plt.colorbar(scatter, ax=axes[0, 1])
    cbar.set_label("Ambient Temp (°C)")
    axes[0, 1].set_title("2. Generation vs. Global Horizontal Irradiance (GHI)", fontsize=12, fontweight="bold")
    axes[0, 1].set_xlabel("GHI Shortwave Radiation (W/m²)")
    axes[0, 1].set_ylabel("Actual Generation (MW)")
    axes[0, 1].grid(True, alpha=0.3)

    # Chart 3: Monthly Seasonality & Energy Yield
    monthly_gen = df.groupby("month")["actual_generation_mw"].sum() / 1000.0  # GWh
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    bars = axes[1, 0].bar(monthly_gen.index, monthly_gen.values, color="#1b9e77", edgecolor="black", alpha=0.85)
    axes[1, 0].set_title("3. Monthly Generation Breakdown (Seasonal Yield)", fontsize=12, fontweight="bold")
    axes[1, 0].set_xlabel("Month")
    axes[1, 0].set_ylabel("Total Generation (GWh)")
    axes[1, 0].set_xticks(range(1, 13))
    axes[1, 0].set_xticklabels(month_names)
    axes[1, 0].grid(axis="y", alpha=0.3)
    for bar in bars:
        h = bar.get_height()
        axes[1, 0].text(bar.get_x() + bar.get_width()/2., h + 0.2, f"{h:.1f}", ha="center", va="bottom", fontsize=9)

    # Chart 4: Cloud Cover Impact on Solar Clearness Index (kt)
    axes[1, 1].scatter(daytime["cloud_cover"], daytime["clearness_index"], color="#386cb0", alpha=0.3, s=10)
    # Moving average trend
    cloud_bins = pd.cut(daytime["cloud_cover"], bins=np.linspace(0, 100, 11))
    trend = daytime.groupby(cloud_bins, observed=False)["clearness_index"].mean()
    bin_centers = np.linspace(5, 95, 10)
    axes[1, 1].plot(bin_centers, trend.values, color="red", lw=2.5, marker="s", label="Mean Clearness Index (kt)")
    axes[1, 1].set_title("4. Atmospheric Cloud Extinction Effect", fontsize=12, fontweight="bold")
    axes[1, 1].set_xlabel("Total Cloud Cover (%)")
    axes[1, 1].set_ylabel("Clearness Index kt (GHI / Clearsky GHI)")
    axes[1, 1].grid(True, alpha=0.3)
    axes[1, 1].legend()

    plt.tight_layout()
    os.makedirs(os.path.dirname(output_plot_path), exist_ok=True)
    plt.savefig(output_plot_path, dpi=180)
    plt.close()
    logger.info(f"EDA plot saved to {output_plot_path}")
    print(f"\n[SUCCESS] EDA plot successfully saved to: {output_plot_path}")

if __name__ == "__main__":
    run_eda()
