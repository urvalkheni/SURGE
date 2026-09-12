"""
predict.py
----------
Loads the saved trained model, generates feature inputs from future weather forecasts,
predicts renewable generation for the next 24-72 hours, and runs the Grid Balancing Advisory.

Supports:
- Live Mode (--live): Queries Open-Meteo API in real-time over the internet.
- Cached Mode (default): Uses the latest saved snapshot in data/raw/weather_forecast.csv.
"""

import os
import json
import argparse
import requests
import pandas as pd
import numpy as np
import joblib
import pvlib
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

DEFAULT_MODEL_PATH = "models/solar_forecast_best.joblib"
DEFAULT_METADATA_PATH = "models/model_metadata.json"
DEFAULT_FORECAST_CSV = "data/raw/weather_forecast.csv"
OUTPUT_PREDICTION_CSV = "data/processed/forecast_output.csv"

FORECAST_API_URL = "https://api.open-meteo.com/v1/forecast"
HOURLY_VARIABLES = [
    "temperature_2m",
    "relative_humidity_2m",
    "surface_pressure",
    "cloud_cover",
    "wind_speed_10m",
    "shortwave_radiation",
    "direct_normal_irradiance",
    "diffuse_radiation",
    "direct_radiation"
]

def fetch_live_weather(lat: float = 27.5398, lon: float = 71.9153, forecast_days: int = 3) -> pd.DataFrame:
    """
    Directly fetches live real-time forecast from Open-Meteo over the internet.
    """
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": ",".join(HOURLY_VARIABLES),
        "forecast_days": forecast_days,
        "timezone": "Asia/Kolkata"
    }
    logger.info(f"Connecting to Open-Meteo API for LIVE real-time forecast (Lat: {lat}, Lon: {lon})...")
    resp = requests.get(FORECAST_API_URL, params=params, timeout=15)
    resp.raise_for_status()
    
    df = pd.DataFrame(resp.json()["hourly"])
    df.rename(columns={"time": "timestamp"}, inplace=True)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["latitude"] = lat
    df["longitude"] = lon
    df["plant_id"] = "Bhadla_Solar_Park"
    logger.info(f"Live real-time weather fetched successfully! ({len(df)} hours)")
    return df

def generate_forecast_features(df_weather: pd.DataFrame, feature_cols: list) -> pd.DataFrame:
    df = df_weather.copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    
    lat = df["latitude"].iloc[0] if "latitude" in df.columns else 27.5398
    lon = df["longitude"].iloc[0] if "longitude" in df.columns else 71.9153

    times = pd.DatetimeIndex(df["timestamp"]).tz_localize("Asia/Kolkata")

    # 1. Solar Astronomy
    solpos = pvlib.solarposition.get_solarposition(times, lat, lon)
    zenith = np.asarray(solpos["apparent_zenith"])
    azimuth = np.asarray(solpos["azimuth"])
    elevation = np.maximum(0.0, 90.0 - zenith)

    df["solar_zenith"] = np.round(zenith, 2)
    df["solar_azimuth"] = np.round(azimuth, 2)
    df["solar_elevation"] = np.round(elevation, 2)

    # 2. Clear-Sky Irradiance & Clearness Index (kt)
    loc = pvlib.location.Location(lat, lon, tz="Asia/Kolkata")
    clearsky = loc.get_clearsky(times, model="ineichen")
    clearsky_ghi = np.maximum(0.0, np.asarray(clearsky["ghi"]))
    df["clearsky_ghi"] = np.round(clearsky_ghi, 2)

    valid_sun = clearsky_ghi > 10.0
    kt = np.zeros(len(df))
    kt[valid_sun] = df["shortwave_radiation"].values[valid_sun] / clearsky_ghi[valid_sun]
    df["clearness_index"] = np.round(np.clip(kt, 0.0, 1.2), 3)

    # 3. Cyclical Temporal Encodings
    hour = df["timestamp"].dt.hour
    df["hour_sin"] = np.round(np.sin(2 * np.pi * hour / 24.0), 4)
    df["hour_cos"] = np.round(np.cos(2 * np.pi * hour / 24.0), 4)

    month = df["timestamp"].dt.month
    df["month_sin"] = np.round(np.sin(2 * np.pi * month / 12.0), 4)
    df["month_cos"] = np.round(np.cos(2 * np.pi * month / 12.0), 4)

    day_of_year = df["timestamp"].dt.dayofyear
    df["day_of_year_sin"] = np.round(np.sin(2 * np.pi * day_of_year / 365.25), 4)
    df["day_of_year_cos"] = np.round(np.cos(2 * np.pi * day_of_year / 365.25), 4)

    # 4. Atmospheric Dynamics (Rolling)
    df["cloud_cover_rolling_3h"] = np.round(df["cloud_cover"].rolling(window=3, min_periods=1).mean(), 2)
    df["temp_rolling_3h"] = np.round(df["temperature_2m"].rolling(window=3, min_periods=1).mean(), 2)

    return df[feature_cols]

def run_grid_advisory(generation_mw: float, expected_demand_mw: float) -> dict:
    delta_mw = round(generation_mw - expected_demand_mw, 2)
    if delta_mw > 10.0:
        status = "SURPLUS"
        action = f"Charge Battery Storage (+{delta_mw:.1f} MW) / Export to Regional Grid"
    elif delta_mw < -10.0:
        status = "DEFICIT"
        action = f"Discharge Battery Storage / Activate Fast Peaker Gas/Hydro (-{abs(delta_mw):.1f} MW)"
    else:
        status = "BALANCED"
        action = "Normal Grid Operation (Within ±10 MW tolerance)"

    return {
        "expected_demand_mw": expected_demand_mw,
        "balance_delta_mw": delta_mw,
        "grid_status": status,
        "recommended_action": action
    }

def forecast_future(
    horizon_hours: int = 72,
    live_fetch: bool = False,
    weather_forecast_path: str = DEFAULT_FORECAST_CSV,
    model_path: str = DEFAULT_MODEL_PATH,
    metadata_path: str = DEFAULT_METADATA_PATH,
    output_path: str = OUTPUT_PREDICTION_CSV
) -> pd.DataFrame:
    logger.info(f"Loading trained model from {model_path}...")
    model = joblib.load(model_path)

    with open(metadata_path, "r") as f:
        metadata = json.load(f)
    feature_cols = metadata["feature_columns"]
    plant_cap = metadata["plant_capacity_mw"]

    if live_fetch:
        weather_df = fetch_live_weather(forecast_days=max(1, (horizon_hours + 23) // 24))
    else:
        logger.info(f"Reading cached weather forecast from {weather_forecast_path}...")
        weather_df = pd.read_csv(weather_forecast_path)
        weather_df["timestamp"] = pd.to_datetime(weather_df["timestamp"])
    
    weather_df = weather_df.head(horizon_hours).reset_index(drop=True)
    X_future = generate_forecast_features(weather_df, feature_cols)

    raw_preds = model.predict(X_future)
    preds = np.clip(raw_preds, 0.0, plant_cap)
    preds[X_future["solar_elevation"] <= 0.0] = 0.0
    preds = np.round(preds, 2)

    hours = weather_df["timestamp"].dt.hour
    simulated_demand = 45.0 + 20.0 * np.sin(np.pi * (hours - 6) / 12).clip(0, 1) + 25.0 * np.sin(np.pi * (hours - 18) / 6).clip(0, 1)
    simulated_demand = np.round(simulated_demand, 1)

    results = []
    for t, gen, dem, ghi, cloud in zip(
        weather_df["timestamp"], preds, simulated_demand, weather_df["shortwave_radiation"], weather_df["cloud_cover"]
    ):
        advisory = run_grid_advisory(gen, dem)
        results.append({
            "timestamp": t.strftime("%Y-%m-%d %H:%M"),
            "predicted_generation_mw": gen,
            "expected_demand_mw": dem,
            "balance_delta_mw": advisory["balance_delta_mw"],
            "grid_status": advisory["grid_status"],
            "ghi_w_m2": round(ghi, 1),
            "cloud_cover_pct": int(cloud),
            "recommended_action": advisory["recommended_action"]
        })

    forecast_df = pd.DataFrame(results)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    forecast_df.to_csv(output_path, index=False)
    logger.info(f"Forecast successfully saved to {output_path}")
    return forecast_df

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Solar Renewable Generation Forecasting Pipeline")
    parser.add_argument("--hours", type=int, default=72, help="Forecast horizon in hours (default: 72)")
    parser.add_argument("--live", action="store_true", help="Fetch live real-time weather from Open-Meteo over the internet")
    args = parser.parse_args()

    df_fc = forecast_future(horizon_hours=args.hours, live_fetch=args.live)
    print("\n" + "="*85)
    source_type = "LIVE REAL-TIME API FETCH" if args.live else "LOCAL CACHED SNAPSHOT"
    print(f"   OPERATIONAL {args.hours}-HOUR RENEWABLE FORECAST & GRID ADVISORY [{source_type}]")
    print("="*85)
    print(df_fc.head(24)[["timestamp", "predicted_generation_mw", "expected_demand_mw", "balance_delta_mw", "grid_status"]].to_string(index=False))
