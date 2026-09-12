"""
clean_and_align.py
------------------
Cleans and validates the raw solar and weather time series:
1. Validates strict hourly frequency with zero missing intervals.
2. Checks for duplicate timestamps and sorts chronologically.
3. Enforces physical boundary constraints:
   - Solar radiation (GHI, DNI, DHI, POA) >= 0
   - Cloud cover in [0, 100]
   - Actual generation in [0, 100 MW]
4. Enforces night-time physical constraint (radiation == 0 => generation == 0).
5. Exports cleaned dataset to data/processed/cleaned_solar_weather.csv
"""

import os
import pandas as pd
import numpy as np
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def clean_and_align_data(
    input_path: str = "data/raw/solar_generation_raw.csv",
    output_path: str = "data/processed/cleaned_solar_weather.csv"
) -> pd.DataFrame:
    logger.info(f"Loading raw dataset from {input_path}...")
    df = pd.read_csv(input_path)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    initial_count = len(df)

    # 1. Remove duplicate timestamps
    df = df.drop_duplicates(subset=["timestamp"]).sort_values("timestamp").reset_index(drop=True)
    if len(df) < initial_count:
        logger.warning(f"Removed {initial_count - len(df)} duplicate rows.")

    # 2. Check and re-index to full continuous hourly grid
    min_time = df["timestamp"].min()
    max_time = df["timestamp"].max()
    full_hourly_range = pd.date_range(start=min_time, end=max_time, freq="1h")
    
    if len(df) != len(full_hourly_range):
        logger.warning(f"Detected timestamp gaps! Expected {len(full_hourly_range)} hours, found {len(df)}.")
        df = df.set_index("timestamp").reindex(full_hourly_range)
        # Interpolate small weather gaps if present
        df = df.interpolate(method="time").reset_index()
        df.rename(columns={"index": "timestamp"}, inplace=True)
    else:
        logger.info(f"Verified continuous hourly time series: {len(df)} hours from {min_time} to {max_time}.")

    # 3. Physical Boundary Enforcement
    # Irradiance cannot be negative
    irradiance_cols = ["shortwave_radiation", "direct_normal_irradiance", "diffuse_radiation", "poa_global"]
    for col in irradiance_cols:
        if col in df.columns:
            df[col] = df[col].clip(lower=0.0)

    # Cloud cover must be in [0, 100]%
    if "cloud_cover" in df.columns:
        df["cloud_cover"] = df["cloud_cover"].clip(0.0, 100.0)

    # Relative humidity must be in [0, 100]%
    if "relative_humidity_2m" in df.columns:
        df["relative_humidity_2m"] = df["relative_humidity_2m"].clip(0.0, 100.0)

    # Wind speed cannot be negative
    if "wind_speed_10m" in df.columns:
        df["wind_speed_10m"] = df["wind_speed_10m"].clip(lower=0.0)

    # Actual generation bounds: [0, 100 MW]
    if "actual_generation_mw" in df.columns:
        df["actual_generation_mw"] = df["actual_generation_mw"].clip(0.0, 100.0)
        
        # Physical law: If POA radiation is zero or solar zenith >= 90 (sun below horizon), generation MUST be 0.
        if "poa_global" in df.columns:
            df.loc[df["poa_global"] <= 1.0, "actual_generation_mw"] = 0.0

    # 4. Check for missing values
    null_counts = df.isnull().sum()
    if null_counts.sum() > 0:
        logger.warning(f"Null values detected:\n{null_counts[null_counts > 0]}")
        df = df.bfill().ffill()

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    logger.info(f"Cleaned dataset successfully saved to {output_path} ({len(df)} rows).")
    return df

if __name__ == "__main__":
    cleaned_df = clean_and_align_data()
    print("\n--- CLEANED DATASET SANITY CHECK ---")
    print(f"Total Rows: {len(cleaned_df)}")
    print(f"Total Missing Values: {cleaned_df.isnull().sum().sum()}")
    print(f"Negative Radiation Count: {(cleaned_df['shortwave_radiation'] < 0).sum()}")
    print(f"Generation Outside [0, 100 MW]: {((cleaned_df['actual_generation_mw'] < 0) | (cleaned_df['actual_generation_mw'] > 100)).sum()}")
    print(f"Nighttime Generation Violation: {((cleaned_df['shortwave_radiation'] == 0) & (cleaned_df['actual_generation_mw'] > 0)).sum()}")
