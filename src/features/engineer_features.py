"""
engineer_features.py
--------------------
Constructs predictive ML features from cleaned weather and temporal series:
1. Solar Astronomical Geometry (Zenith, Elevation, Azimuth).
2. Theoretical Clear-Sky Irradiance & Clearness Index (kt).
3. Cyclical Temporal Encodings (sine/cosine transforms for hour, month, day-of-year).
4. Atmospheric Dynamics (rolling averages for cloud cover & temperature).
5. Target Variable separation (actual_generation_mw).
6. Prevents Data Leakage (no future weather or target leakage used).
"""

import os
import pandas as pd
import numpy as np
import pvlib
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def generate_features(
    input_path: str = "data/processed/cleaned_solar_weather.csv",
    output_path: str = "data/processed/features_training.csv",
    is_inference: bool = False
) -> pd.DataFrame:
    """
    Constructs all ML features. Works for both training and future forecast inference.
    """
    logger.info(f"Generating features from {input_path} (is_inference={is_inference})...")
    df = pd.read_csv(input_path)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    
    lat = df["latitude"].iloc[0] if "latitude" in df.columns else 27.5398
    lon = df["longitude"].iloc[0] if "longitude" in df.columns else 71.9153

    # Datetime index in IST
    times = pd.DatetimeIndex(df["timestamp"]).tz_localize("Asia/Kolkata")

    # 1. Solar Astronomical Geometry
    logger.info("Computing solar geometry (Zenith, Elevation, Azimuth)...")
    solpos = pvlib.solarposition.get_solarposition(times, lat, lon)
    zenith = np.asarray(solpos["apparent_zenith"])
    azimuth = np.asarray(solpos["azimuth"])
    elevation = np.maximum(0.0, 90.0 - zenith)

    df["solar_zenith"] = np.round(zenith, 2)
    df["solar_azimuth"] = np.round(azimuth, 2)
    df["solar_elevation"] = np.round(elevation, 2)
    df["is_daytime"] = (zenith < 89.0).astype(int)

    # 2. Clear-Sky Irradiance & Clearness Index (kt)
    logger.info("Computing Ineichen clear-sky model & clearness index...")
    loc = pvlib.location.Location(lat, lon, tz="Asia/Kolkata")
    clearsky = loc.get_clearsky(times, model="ineichen")
    clearsky_ghi = np.maximum(0.0, np.asarray(clearsky["ghi"]))
    df["clearsky_ghi"] = np.round(clearsky_ghi, 2)

    # Clearness index: kt = GHI / Clearsky_GHI (clipped in [0, 1.2])
    # When sun is down or clearsky < 10, kt is 0.
    valid_sun = clearsky_ghi > 10.0
    kt = np.zeros(len(df))
    kt[valid_sun] = df["shortwave_radiation"].values[valid_sun] / clearsky_ghi[valid_sun]
    df["clearness_index"] = np.round(np.clip(kt, 0.0, 1.2), 3)

    # 3. Cyclical Temporal Encodings (Sine & Cosine)
    # Why? Hour 23 and Hour 0 are adjacent in time, but numerically far (23 vs 0).
    # Sin/Cos transforms map time smoothly onto a continuous circle.
    hour = df["timestamp"].dt.hour
    df["hour"] = hour
    df["hour_sin"] = np.round(np.sin(2 * np.pi * hour / 24.0), 4)
    df["hour_cos"] = np.round(np.cos(2 * np.pi * hour / 24.0), 4)

    month = df["timestamp"].dt.month
    df["month"] = month
    df["month_sin"] = np.round(np.sin(2 * np.pi * month / 12.0), 4)
    df["month_cos"] = np.round(np.cos(2 * np.pi * month / 12.0), 4)

    day_of_year = df["timestamp"].dt.dayofyear
    df["day_of_year"] = day_of_year
    df["day_of_year_sin"] = np.round(np.sin(2 * np.pi * day_of_year / 365.25), 4)
    df["day_of_year_cos"] = np.round(np.cos(2 * np.pi * day_of_year / 365.25), 4)

    # 4. Atmospheric Dynamics (Rolling Averages)
    # Clouds and temperatures have atmospheric inertia (persistence)
    df["cloud_cover_rolling_3h"] = np.round(df["cloud_cover"].rolling(window=3, min_periods=1).mean(), 2)
    df["temp_rolling_3h"] = np.round(df["temperature_2m"].rolling(window=3, min_periods=1).mean(), 2)

    # 5. Save output
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    logger.info(f"Feature set created and saved to {output_path} ({df.shape[0]} rows, {df.shape[1]} cols).")
    return df

if __name__ == "__main__":
    features_df = generate_features()
    print("\n--- FEATURE MATRIX SUMMARY ---")
    print(f"Total Rows: {len(features_df)}")
    print(f"Total Features: {features_df.shape[1]}")
    print("\nColumn List:")
    for col in features_df.columns:
        print(f" - {col}")

    print("\nSample Feature Rows (Noon snapshot):")
    sample_noon = features_df[features_df["hour"] == 12].head(3)
    cols_to_view = ["timestamp", "shortwave_radiation", "clearsky_ghi", "clearness_index", "hour_sin", "hour_cos", "actual_generation_mw"]
    print(sample_noon[cols_to_view].to_string())
