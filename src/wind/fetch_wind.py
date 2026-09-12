"""
fetch_wind.py
-------------
Downloads historical and forecast wind data from Open-Meteo API
for Jaisalmer Wind Park, Rajasthan (Lat: 26.9157, Lon: 70.9083).
Computes physical ground-truth generation for a 100 MW wind farm
using IEC 61400 wind turbine power curves and air density correction.
"""

import os
import requests
import pandas as pd
import numpy as np
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Jaisalmer Wind Park, Rajasthan
LATITUDE = 26.9157
LONGITUDE = 70.9083
START_DATE = "2023-01-01"
END_DATE = "2023-12-31"

ARCHIVE_API_URL = "https://archive-api.open-meteo.com/v1/archive"
FORECAST_API_URL = "https://api.open-meteo.com/v1/forecast"

# Wind turbine specifications (Standard 2.0 MW modern utility turbine, 50 units = 100 MW farm)
RATED_CAPACITY_MW = 100.0
V_CUT_IN = 3.0    # m/s (10.8 km/h)
V_RATED = 12.0    # m/s (43.2 km/h)
V_CUT_OUT = 25.0  # m/s (90.0 km/h)
R_SPECIFIC_AIR = 287.058  # J/(kg·K)
STANDARD_AIR_DENSITY = 1.225  # kg/m³

WIND_HOURLY_VARIABLES = [
    "wind_speed_10m",
    "wind_speed_100m",       # Hub height wind speed
    "wind_direction_10m",
    "wind_direction_100m",   # Hub height wind direction
    "wind_gusts_10m",
    "temperature_2m",
    "surface_pressure"
]

def calculate_wind_power(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes physical turbine power output (MW) using IEC cubic power curve
    with air density correction.
    """
    # Convert wind speed from km/h to m/s
    v_hub = np.maximum(0.0, df["wind_speed_100m"].values / 3.6)
    
    # Calculate local air density: rho = P_Pa / (R * T_Kelvin)
    temp_kelvin = df["temperature_2m"].values + 273.15
    pressure_pa = df["surface_pressure"].values * 100.0  # hPa to Pa
    air_density = pressure_pa / (R_SPECIFIC_AIR * temp_kelvin)
    density_ratio = np.clip(air_density / STANDARD_AIR_DENSITY, 0.85, 1.15)

    power_mw = np.zeros(len(df))

    # Region 2: Cubic power curve between cut-in and rated speed
    # P = P_rated * ((v^3 - v_cutin^3) / (v_rated^3 - v_cutin^3)) * (rho / rho_0)
    cubic_mask = (v_hub >= V_CUT_IN) & (v_hub < V_RATED)
    num = (v_hub[cubic_mask] ** 3) - (V_CUT_IN ** 3)
    den = (V_RATED ** 3) - (V_CUT_IN ** 3)
    power_mw[cubic_mask] = RATED_CAPACITY_MW * (num / den) * density_ratio[cubic_mask]

    # Region 3: Rated power (Blade pitch regulation maintains 100 MW)
    rated_mask = (v_hub >= V_RATED) & (v_hub < V_CUT_OUT)
    power_mw[rated_mask] = RATED_CAPACITY_MW

    # Region 4: Storm cut-out protection (v >= 25 m/s) -> Power = 0
    cutout_mask = v_hub >= V_CUT_OUT
    power_mw[cutout_mask] = 0.0

    # Apply 8% wake & electrical transmission losses
    farm_efficiency = 0.92
    power_mw = np.clip(power_mw * farm_efficiency, 0.0, RATED_CAPACITY_MW)
    
    df["air_density"] = np.round(air_density, 3)
    df["wind_speed_hub_ms"] = np.round(v_hub, 2)
    df["actual_generation_mw"] = np.round(power_mw, 2)
    return df

def fetch_historical_wind(output_path: str = "data/raw/wind/wind_historical.csv") -> pd.DataFrame:
    params = {
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "start_date": START_DATE,
        "end_date": END_DATE,
        "hourly": ",".join(WIND_HOURLY_VARIABLES),
        "timezone": "Asia/Kolkata"
    }

    logger.info(f"Downloading historical wind data for Jaisalmer Wind Park ({START_DATE} to {END_DATE})...")
    resp = requests.get(ARCHIVE_API_URL, params=params, timeout=30)
    resp.raise_for_status()
    
    df = pd.DataFrame(resp.json()["hourly"])
    df.rename(columns={"time": "timestamp"}, inplace=True)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["latitude"] = LATITUDE
    df["longitude"] = LONGITUDE
    df["plant_id"] = "Jaisalmer_Wind_Park"

    df = calculate_wind_power(df)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    logger.info(f"Saved {len(df)} records of historical wind data to {output_path}")
    return df

def fetch_forecast_wind(output_path: str = "data/raw/wind/wind_forecast.csv") -> pd.DataFrame:
    params = {
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "hourly": ",".join(WIND_HOURLY_VARIABLES),
        "forecast_days": 3,
        "timezone": "Asia/Kolkata"
    }

    logger.info("Downloading live 72-hour wind forecast for Jaisalmer...")
    resp = requests.get(FORECAST_API_URL, params=params, timeout=30)
    resp.raise_for_status()

    df = pd.DataFrame(resp.json()["hourly"])
    df.rename(columns={"time": "timestamp"}, inplace=True)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["latitude"] = LATITUDE
    df["longitude"] = LONGITUDE
    df["plant_id"] = "Jaisalmer_Wind_Park"

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    logger.info(f"Saved {len(df)} forecast hours to {output_path}")
    return df

if __name__ == "__main__":
    df_hist = fetch_historical_wind()
    df_fc = fetch_forecast_wind()
    print("\n--- JAISALMER WIND POWER SUMMARY (100 MW FARM) ---")
    print(df_hist[["wind_speed_hub_ms", "air_density", "actual_generation_mw"]].describe().to_string())
    print(f"\nAnnual Wind Energy: {df_hist['actual_generation_mw'].sum():,.2f} MWh")
    print(f"Capacity Utilization Factor (CUF): {(df_hist['actual_generation_mw'].sum() / (100.0 * 8760)) * 100:.2f}%")
