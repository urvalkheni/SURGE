"""
generate_target.py
------------------
Calculates physical ground-truth AC power generation (MW) for a 100 MW utility-scale
reference block at Bhadla Solar Park using NREL PVLib physics equations.

Physics modeled:
1. Solar position (Zenith & Azimuth) using NREL SPA.
2. Extraterrestrial irradiance (DNI extra).
3. Plane-of-Array (POA) irradiance on fixed-tilt panels (Tilt: 25°, Azimuth: 180° South).
4. Cell temperature via King/Sandia thermal model (considering ambient temp and wind cooling).
5. Photovoltaic DC conversion with temperature derate (-0.38%/°C above 25°C).
6. Inverter AC conversion with 100 MW AC nameplate clipping and 14% BOS (Balance of System) losses.
"""

import os
import pandas as pd
import numpy as np
import pvlib
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Plant specifications
PLANT_AC_CAPACITY_MW = 100.0  # 100 MW reference block
DC_TO_AC_RATIO = 1.25         # 125 MWp DC installed capacity
TILT_ANGLE = 25.0             # Optimal tilt for latitude ~27° N
AZIMUTH_ANGLE = 180.0         # Facing South
TEMP_COEFF = -0.0038          # -0.38% per °C (standard monocrystalline module)
SYSTEM_DERATE = 0.86          # 14% total system losses (soiling, cables, mismatch)

def calculate_pv_generation(
    weather_csv_path: str = "data/raw/weather_historical.csv",
    output_path: str = "data/raw/solar_generation_raw.csv"
) -> pd.DataFrame:
    """
    Computes realistic actual_generation_mw from weather variables using pvlib.
    """
    logger.info(f"Loading raw weather data from {weather_csv_path}...")
    df = pd.read_csv(weather_csv_path)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    
    lat = df["latitude"].iloc[0]
    lon = df["longitude"].iloc[0]

    # Set datetime index for pvlib calculations in IST (UTC+05:30)
    times = pd.DatetimeIndex(df["timestamp"]).tz_localize("Asia/Kolkata")

    logger.info("Computing solar astronomical position and extraterrestrial radiation...")
    solpos = pvlib.solarposition.get_solarposition(times, lat, lon)
    solar_zenith = np.asarray(solpos["apparent_zenith"])
    solar_azimuth = np.asarray(solpos["azimuth"])
    dni_extra = np.asarray(pvlib.irradiance.get_extra_radiation(times))

    logger.info("Decomposing irradiance onto tilted Plane of Array (POA)...")
    poa_irradiance = pvlib.irradiance.get_total_irradiance(
        surface_tilt=TILT_ANGLE,
        surface_azimuth=AZIMUTH_ANGLE,
        solar_zenith=solar_zenith,
        solar_azimuth=solar_azimuth,
        dni=df["direct_normal_irradiance"].values,
        ghi=df["shortwave_radiation"].values,
        dhi=df["diffuse_radiation"].values,
        dni_extra=dni_extra,
        model="haydavies"
    )
    poa_global = np.maximum(0.0, np.asarray(poa_irradiance["poa_global"]))

    logger.info("Estimating PV cell module temperature with wind cooling...")
    # Sandia / King thermal model: T_cell = T_amb + POA * exp(-a - b * wind_speed)
    temp_cell = pvlib.temperature.sapm_cell(
        poa_global=poa_global,
        temp_air=df["temperature_2m"].values,
        wind_speed=df["wind_speed_10m"].values / 3.6,  # Convert km/h to m/s
        a=-3.56,
        b=-0.075,
        deltaT=3.0
    )
    temp_cell = np.asarray(temp_cell)

    logger.info("Calculating DC power with temperature derating and AC inverter clipping...")
    dc_capacity = PLANT_AC_CAPACITY_MW * DC_TO_AC_RATIO
    
    # DC Power = DC_Cap * (POA / 1000 W/m²) * [1 + gamma * (T_cell - 25)] * system_derate
    dc_power = np.zeros(len(df))
    daytime_mask = (poa_global > 1.0) & (solar_zenith < 89.0)
    
    thermal_efficiency_factor = 1.0 + TEMP_COEFF * (temp_cell[daytime_mask] - 25.0)
    thermal_efficiency_factor = np.clip(thermal_efficiency_factor, 0.70, 1.10)

    dc_power[daytime_mask] = (
        dc_capacity
        * (poa_global[daytime_mask] / 1000.0)
        * thermal_efficiency_factor
        * SYSTEM_DERATE
    )

    # Inverter conversion efficiency (~98%) and AC clipping at 100 MW nameplate capacity
    inverter_efficiency = 0.98
    ac_power = dc_power * inverter_efficiency
    actual_generation_mw = np.clip(ac_power, 0.0, PLANT_AC_CAPACITY_MW)

    # Clean night hours
    actual_generation_mw[~daytime_mask] = 0.0
    actual_generation_mw = np.round(actual_generation_mw, 2)

    # Store engineered physical columns into dataframe
    df["solar_zenith"] = np.round(solar_zenith, 2)
    df["solar_azimuth"] = np.round(solar_azimuth, 2)
    df["poa_global"] = np.round(poa_global, 2)
    df["cell_temperature"] = np.round(temp_cell, 2)
    df["actual_generation_mw"] = actual_generation_mw

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    logger.info(f"Target generation generated and saved to {output_path}")
    return df

if __name__ == "__main__":
    df_gen = calculate_pv_generation()
    print("\n--- GENERATION TARGET SUMMARY ---")
    print(df_gen[["timestamp", "shortwave_radiation", "poa_global", "temperature_2m", "cell_temperature", "actual_generation_mw"]].describe().to_string())
    
    # Peak generation check
    peak_row = df_gen.loc[df_gen["actual_generation_mw"].idxmax()]
    print(f"\nPeak Generation Observed: {peak_row['actual_generation_mw']} MW at {peak_row['timestamp']}")
    print(f"Total Annual Generation: {df_gen['actual_generation_mw'].sum():,.2f} MWh")
    
    # Non-zero generation count
    day_count = (df_gen['actual_generation_mw'] > 0).sum()
    print(f"Daylight Producing Hours: {day_count} / {len(df_gen)} hours ({(day_count/len(df_gen))*100:.1f}%)")
