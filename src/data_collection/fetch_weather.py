"""
fetch_weather.py
----------------
Fetches historical and forecast weather data from Open-Meteo API
for a specific solar plant location (Default: Bhadla Solar Park, Rajasthan).
"""

import os
import requests
import pandas as pd
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Coordinates for Bhadla Solar Park, Rajasthan (World's largest solar park location)
DEFAULT_LATITUDE = 27.5398
DEFAULT_LONGITUDE = 71.9153
DEFAULT_START_DATE = "2023-01-01"
DEFAULT_END_DATE = "2023-12-31"

ARCHIVE_API_URL = "https://archive-api.open-meteo.com/v1/archive"
FORECAST_API_URL = "https://api.open-meteo.com/v1/forecast"
ENSEMBLE_API_URL = "https://ensemble-api.open-meteo.com/v1/ensemble"

HOURLY_VARIABLES = [
    "temperature_2m",
    "relative_humidity_2m",
    "surface_pressure",
    "cloud_cover",
    "wind_speed_10m",
    "wind_speed_100m",
    "shortwave_radiation",       # GHI (Global Horizontal Irradiance) in W/m²
    "direct_normal_irradiance",  # DNI in W/m²
    "diffuse_radiation",         # DHI in W/m²
    "direct_radiation"           # Direct beam on horizontal in W/m²
]

def fetch_historical_weather(
    lat: float = DEFAULT_LATITUDE,
    lon: float = DEFAULT_LONGITUDE,
    start_date: str = DEFAULT_START_DATE,
    end_date: str = DEFAULT_END_DATE,
    output_path: str = "data/raw/weather_historical.csv"
) -> pd.DataFrame:
    """
    Downloads historical hourly weather data from Open-Meteo Archive API.
    """
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": ",".join(HOURLY_VARIABLES),
        "timezone": "Asia/Kolkata"  # Indian Standard Time (IST)
    }

    logger.info(f"Requesting historical weather from {start_date} to {end_date} for Lat: {lat}, Lon: {lon}...")
    response = requests.get(ARCHIVE_API_URL, params=params, timeout=30)
    
    if response.status_code != 200:
        logger.error(f"Failed to fetch data: HTTP {response.status_code} - {response.text}")
        response.raise_for_status()

    data = response.json()
    hourly = data.get("hourly", {})

    if not hourly:
        raise ValueError("Received empty hourly payload from Open-Meteo API.")

    df = pd.DataFrame(hourly)
    df.rename(columns={"time": "timestamp"}, inplace=True)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    
    # Add metadata columns
    df["latitude"] = lat
    df["longitude"] = lon
    df["plant_id"] = "Bhadla_Solar_Park"

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    logger.info(f"Successfully saved {len(df)} hourly weather records to {output_path}")
    return df

def fetch_weather_forecast(
    lat: float = DEFAULT_LATITUDE,
    lon: float = DEFAULT_LONGITUDE,
    forecast_days: int = 3,
    output_path: str = "data/raw/weather_forecast.csv"
) -> pd.DataFrame:
    """
    Downloads future 24-72h hourly weather forecast from Open-Meteo Forecast API.
    """
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": ",".join(HOURLY_VARIABLES),
        "forecast_days": forecast_days,
        "timezone": "Asia/Kolkata"
    }

    logger.info(f"Requesting {forecast_days}-day future weather forecast...")
    response = requests.get(FORECAST_API_URL, params=params, timeout=30)

    if response.status_code != 200:
        logger.error(f"Failed to fetch forecast: HTTP {response.status_code} - {response.text}")
        response.raise_for_status()

    data = response.json()
    hourly = data.get("hourly", {})
    df = pd.DataFrame(hourly)
    df.rename(columns={"time": "timestamp"}, inplace=True)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["latitude"] = lat
    df["longitude"] = lon
    df["plant_id"] = "Bhadla_Solar_Park"

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    logger.info(f"Successfully saved {len(df)} forecast records to {output_path}")
    return df

def fetch_ensemble_weather(
    lat: float = DEFAULT_LATITUDE,
    lon: float = DEFAULT_LONGITUDE,
    variables: list = None,
    models: str = "gfs025,ecmwf_ifs025,icon_seamless",
    forecast_days: int = 3,
    output_path: str = "data/raw/weather_ensemble.csv"
) -> pd.DataFrame:
    """
    Downloads multi-model ensemble weather forecasts from Open-Meteo Ensemble API.
    Captures genuine meteorological uncertainty/spread across numerical weather prediction (NWP) runs.
    """
    if variables is None:
        variables = ["shortwave_radiation", "direct_radiation", "diffuse_radiation", "cloud_cover", "wind_speed_10m", "wind_speed_100m", "temperature_2m"]

    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": ",".join(variables),
        "models": models,
        "forecast_days": forecast_days,
        "timezone": "Asia/Kolkata"
    }

    logger.info(f"Requesting {forecast_days}-day ensemble forecast for models {models}...")
    response = requests.get(ENSEMBLE_API_URL, params=params, timeout=30)

    if response.status_code != 200:
        logger.error(f"Failed to fetch ensemble forecast: HTTP {response.status_code} - {response.text}")
        response.raise_for_status()

    data = response.json()
    hourly = data.get("hourly", {})
    df = pd.DataFrame(hourly)
    df.rename(columns={"time": "timestamp"}, inplace=True)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["latitude"] = lat
    df["longitude"] = lon

    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        df.to_csv(output_path, index=False)
        logger.info(f"Successfully saved {len(df)} ensemble forecast records to {output_path}")
    return df

if __name__ == "__main__":
    logger.info("--- STARTING DATA COLLECTION ---")
    hist_df = fetch_historical_weather()
    print("\n--- HISTORICAL WEATHER DATA PREVIEW ---")
    print(hist_df.info())
    print("\nFirst 3 rows:")
    print(hist_df.head(3))

    fc_df = fetch_weather_forecast()
    print("\n--- FUTURE WEATHER FORECAST PREVIEW (NEXT 72 HOURS) ---")
    print(fc_df.info())
    print(f"Total forecast hours: {len(fc_df)}")
    logger.info("--- DATA COLLECTION COMPLETE ---")
