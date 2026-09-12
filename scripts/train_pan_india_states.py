"""
scripts/train_pan_india_states.py
---------------------------------
Trains specialized State-Level XGBoost Models for 24 Indian States and Union Territories.
Generates localized physical training data using NREL pvlib equations:
- Local solar astronomy (zenith, azimuth, elevation)
- State-specific optimal tilt angles (beta approx latitude)
- Local Plane-of-Array (POA) Hay-Davies irradiance transposition
- Sandia/King cell temperature derating with local ambient temp and wind cooling
- Inverter conversion efficiency and AC nameplate clipping
- Aerodynamic wind generation scaled to 100m hub height with local air density (altitude adjusted)

Outputs:
- models/states/{state_key}_solar_model.joblib (for all 24 states)
- models/states/{state_key}_wind_model.joblib (for all 24 states)
- models/pan_india_solar_model.joblib (universal model)
- models/pan_india_wind_model.joblib (universal model)
- models/state_metrics.json (benchmarks for every state)
"""

import os
import json
import time
import numpy as np
import pandas as pd
import pvlib
import joblib
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# List of 24 Indian States & Territories with geographic and climate calibration
PAN_INDIA_STATES = [
    {
        "key": "gujarat",
        "name": "Gujarat",
        "lat": 23.02,
        "lon": 72.57,
        "tilt": 22.0,
        "elevation": 53,
        "temp_base": 28.0,
        "temp_amp": 10.0,
        "wind_avg": 7.2,
        "cloud_bias": 0.25,
        "dni_ratio": 0.75,
        "hub": "Ahmedabad / Kutch RE Hub"
    },
    {
        "key": "rajasthan",
        "name": "Rajasthan",
        "lat": 27.53,
        "lon": 71.91,
        "tilt": 26.0,
        "elevation": 224,
        "temp_base": 31.0,
        "temp_amp": 13.0,
        "wind_avg": 7.8,
        "cloud_bias": 0.12,
        "dni_ratio": 0.88,
        "hub": "Bhadla Phase IV / Jaisalmer"
    },
    {
        "key": "maharashtra",
        "name": "Maharashtra",
        "lat": 18.52,
        "lon": 73.85,
        "tilt": 19.0,
        "elevation": 560,
        "temp_base": 26.0,
        "temp_amp": 8.5,
        "wind_avg": 6.8,
        "cloud_bias": 0.32,
        "dni_ratio": 0.68,
        "hub": "Solapur / Pune Industrial Grid"
    },
    {
        "key": "karnataka",
        "name": "Karnataka",
        "lat": 14.16,
        "lon": 77.26,
        "tilt": 14.0,
        "elevation": 650,
        "temp_base": 27.0,
        "temp_amp": 8.0,
        "wind_avg": 7.4,
        "cloud_bias": 0.28,
        "dni_ratio": 0.72,
        "hub": "Pavagada Solar / Chitradurga Wind"
    },
    {
        "key": "tamil_nadu",
        "name": "Tamil Nadu",
        "lat": 8.24,
        "lon": 77.55,
        "tilt": 9.0,
        "elevation": 40,
        "temp_base": 29.0,
        "temp_amp": 6.0,
        "wind_avg": 8.9,
        "cloud_bias": 0.30,
        "dni_ratio": 0.70,
        "hub": "Muppandal Wind Pass / Kamuthi"
    },
    {
        "key": "madhya_pradesh",
        "name": "Madhya Pradesh",
        "lat": 24.53,
        "lon": 81.30,
        "tilt": 24.0,
        "elevation": 304,
        "temp_base": 27.5,
        "temp_amp": 11.0,
        "wind_avg": 6.2,
        "cloud_bias": 0.24,
        "dni_ratio": 0.76,
        "hub": "Rewa Ultra Mega Solar"
    },
    {
        "key": "andhra_pradesh",
        "name": "Andhra Pradesh",
        "lat": 15.82,
        "lon": 78.03,
        "tilt": 16.0,
        "elevation": 273,
        "temp_base": 29.5,
        "temp_amp": 8.5,
        "wind_avg": 7.1,
        "cloud_bias": 0.26,
        "dni_ratio": 0.74,
        "hub": "Kurnool Ultra Mega Solar Park"
    },
    {
        "key": "telangana",
        "name": "Telangana",
        "lat": 17.38,
        "lon": 78.48,
        "tilt": 17.0,
        "elevation": 505,
        "temp_base": 28.5,
        "temp_amp": 9.5,
        "wind_avg": 6.5,
        "cloud_bias": 0.27,
        "dni_ratio": 0.73,
        "hub": "Mahbubnagar Clean Energy Hub"
    },
    {
        "key": "uttar_pradesh",
        "name": "Uttar Pradesh",
        "lat": 25.14,
        "lon": 82.56,
        "tilt": 25.0,
        "elevation": 80,
        "temp_base": 26.5,
        "temp_amp": 12.0,
        "wind_avg": 5.4,
        "cloud_bias": 0.35,
        "dni_ratio": 0.65,
        "hub": "Bundelkhand / Mirzapur Solar"
    },
    {
        "key": "punjab",
        "name": "Punjab",
        "lat": 30.21,
        "lon": 74.94,
        "tilt": 30.0,
        "elevation": 211,
        "temp_base": 25.0,
        "temp_amp": 13.5,
        "wind_avg": 5.8,
        "cloud_bias": 0.28,
        "dni_ratio": 0.72,
        "hub": "Bathinda Green Energy Cluster"
    },
    {
        "key": "haryana",
        "name": "Haryana",
        "lat": 28.28,
        "lon": 76.15,
        "tilt": 28.0,
        "elevation": 260,
        "temp_base": 26.0,
        "temp_amp": 13.0,
        "wind_avg": 6.0,
        "cloud_bias": 0.27,
        "dni_ratio": 0.73,
        "hub": "Mahendragarh Solar Feeder"
    },
    {
        "key": "kerala",
        "name": "Kerala",
        "lat": 11.60,
        "lon": 76.08,
        "tilt": 11.0,
        "elevation": 750,
        "temp_base": 27.0,
        "temp_amp": 5.0,
        "wind_avg": 6.9,
        "cloud_bias": 0.48,
        "dni_ratio": 0.52,
        "hub": "Banasura Sagar Floating Solar"
    },
    {
        "key": "odisha",
        "name": "Odisha",
        "lat": 18.81,
        "lon": 82.71,
        "tilt": 19.0,
        "elevation": 870,
        "temp_base": 27.0,
        "temp_amp": 7.5,
        "wind_avg": 6.4,
        "cloud_bias": 0.38,
        "dni_ratio": 0.62,
        "hub": "Koraput High-Altitude Solar"
    },
    {
        "key": "west_bengal",
        "name": "West Bengal",
        "lat": 23.33,
        "lon": 86.36,
        "tilt": 23.0,
        "elevation": 228,
        "temp_base": 27.5,
        "temp_amp": 8.5,
        "wind_avg": 5.9,
        "cloud_bias": 0.40,
        "dni_ratio": 0.60,
        "hub": "Purulia Pumped & Solar Array"
    },
    {
        "key": "bihar",
        "name": "Bihar",
        "lat": 24.79,
        "lon": 85.00,
        "tilt": 25.0,
        "elevation": 111,
        "temp_base": 26.8,
        "temp_amp": 11.5,
        "wind_avg": 5.2,
        "cloud_bias": 0.36,
        "dni_ratio": 0.64,
        "hub": "Gaya Clean Energy Substation"
    },
    {
        "key": "assam",
        "name": "Assam",
        "lat": 26.75,
        "lon": 94.21,
        "tilt": 26.0,
        "elevation": 100,
        "temp_base": 24.5,
        "temp_amp": 7.0,
        "wind_avg": 4.8,
        "cloud_bias": 0.50,
        "dni_ratio": 0.50,
        "hub": "Amguri Solar Park"
    },
    {
        "key": "himachal_pradesh",
        "name": "Himachal Pradesh",
        "lat": 32.24,
        "lon": 77.18,
        "tilt": 32.0,
        "elevation": 2050,
        "temp_base": 14.0,
        "temp_amp": 9.0,
        "wind_avg": 7.6,
        "cloud_bias": 0.30,
        "dni_ratio": 0.70,
        "hub": "Spiti Valley Cold-Desert Solar"
    },
    {
        "key": "uttarakhand",
        "name": "Uttarakhand",
        "lat": 29.94,
        "lon": 78.16,
        "tilt": 30.0,
        "elevation": 314,
        "temp_base": 22.0,
        "temp_amp": 10.5,
        "wind_avg": 5.7,
        "cloud_bias": 0.32,
        "dni_ratio": 0.68,
        "hub": "Haridwar Industrial RE Feeder"
    },
    {
        "key": "chhattisgarh",
        "name": "Chhattisgarh",
        "lat": 21.10,
        "lon": 81.03,
        "tilt": 21.0,
        "elevation": 307,
        "temp_base": 28.0,
        "temp_amp": 10.0,
        "wind_avg": 5.8,
        "cloud_bias": 0.33,
        "dni_ratio": 0.67,
        "hub": "Rajnandgaon Solar Array"
    },
    {
        "key": "jharkhand",
        "name": "Jharkhand",
        "lat": 23.66,
        "lon": 86.15,
        "tilt": 23.0,
        "elevation": 210,
        "temp_base": 26.5,
        "temp_amp": 9.5,
        "wind_avg": 5.6,
        "cloud_bias": 0.34,
        "dni_ratio": 0.66,
        "hub": "Bokaro Solar Park"
    },
    {
        "key": "goa",
        "name": "Goa",
        "lat": 15.49,
        "lon": 73.82,
        "tilt": 15.0,
        "elevation": 10,
        "temp_base": 28.5,
        "temp_amp": 5.5,
        "wind_avg": 6.6,
        "cloud_bias": 0.42,
        "dni_ratio": 0.58,
        "hub": "Panaji Coastal Microgrid"
    },
    {
        "key": "jammu_kashmir",
        "name": "Jammu & Kashmir",
        "lat": 32.72,
        "lon": 74.85,
        "tilt": 33.0,
        "elevation": 327,
        "temp_base": 21.0,
        "temp_amp": 12.0,
        "wind_avg": 6.2,
        "cloud_bias": 0.30,
        "dni_ratio": 0.70,
        "hub": "Jammu Solar Power Feeder"
    },
    {
        "key": "ladakh",
        "name": "Ladakh",
        "lat": 34.15,
        "lon": 77.57,
        "tilt": 34.0,
        "elevation": 3500,
        "temp_base": 7.0,
        "temp_amp": 12.0,
        "wind_avg": 8.8,
        "cloud_bias": 0.14,
        "dni_ratio": 0.86,
        "hub": "Pang 10 GW Mega Solar Park"
    },
    {
        "key": "delhi",
        "name": "Delhi NCR",
        "lat": 28.61,
        "lon": 77.20,
        "tilt": 28.0,
        "elevation": 216,
        "temp_base": 26.5,
        "temp_amp": 13.0,
        "wind_avg": 5.8,
        "cloud_bias": 0.31,
        "dni_ratio": 0.69,
        "hub": "Delhi Rooftop & Microgrid Pool"
    }
]

# Standard feature columns aligned with prediction pipeline
SOLAR_FEATURES = [
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

def generate_state_dataset(cfg, hours=4380):
    """
    Generates realistic 6-month historical hourly observations tailored for the state.
    """
    lat = cfg["lat"]
    lon = cfg["lon"]
    tilt = cfg["tilt"]
    elev = cfg["elevation"]
    
    # 6-month timestamp range in IST
    timestamps = pd.date_range("2024-03-01 00:00", periods=hours, freq="h", tz="Asia/Kolkata")
    
    # Atmospheric pressure based on barometric elevation formula
    base_pressure = 1013.25 * ((1.0 - 2.25577e-5 * elev) ** 5.25588)
    
    # 1. Solar Astronomy
    solpos = pvlib.solarposition.get_solarposition(timestamps, lat, lon)
    zenith = np.asarray(solpos["apparent_zenith"])
    azimuth = np.asarray(solpos["azimuth"])
    elevation = np.maximum(0.0, 90.0 - zenith)
    
    # Clear-Sky GHI via Ineichen model
    loc = pvlib.location.Location(lat, lon, tz="Asia/Kolkata", altitude=elev)
    clearsky = loc.get_clearsky(timestamps, model="ineichen")
    clearsky_ghi = np.maximum(0.0, np.asarray(clearsky["ghi"]))
    clearsky_dni = np.maximum(0.0, np.asarray(clearsky["dni"]))
    clearsky_dhi = np.maximum(0.0, np.asarray(clearsky["dhi"]))
    
    # Diurnal / Seasonal meteorological variations
    hour = timestamps.hour.values
    month = timestamps.month.values
    dayofyear = timestamps.dayofyear.values
    
    # Cloud cover with stochastic weather cycles
    np.random.seed(int(abs(lat * 100 + lon)))
    noise = np.convolve(np.random.randn(hours), np.ones(12)/12, mode="same")
    cloud_cover = np.clip(cfg["cloud_bias"] * 100.0 + 35.0 * noise, 0.0, 100.0)
    
    # Irradiance attenuations under clouds
    cloud_transmittance = 1.0 - 0.75 * (cloud_cover / 100.0) ** 1.8
    ghi = np.maximum(0.0, clearsky_ghi * cloud_transmittance)
    dni = np.maximum(0.0, clearsky_dni * (cloud_transmittance ** 1.5) * cfg["dni_ratio"])
    dhi = np.maximum(0.0, ghi - dni * np.cos(np.deg2rad(zenith)))
    
    # Ambient Temperature
    diurnal_temp = cfg["temp_base"] + cfg["temp_amp"] * np.sin(np.pi * (hour - 9) / 12) + 4.0 * np.sin(2 * np.pi * dayofyear / 365.25)
    temp_2m = diurnal_temp - 0.05 * cloud_cover + np.random.normal(0, 1.0, hours)
    
    # Relative humidity (inversely proportional to temp)
    rh = np.clip(100.0 - 1.8 * (temp_2m - 10.0) + 0.3 * cloud_cover, 10.0, 95.0)
    
    # Surface pressure variations
    surface_pressure = base_pressure + np.random.normal(0, 1.5, hours)
    
    # Wind speed at 10m and 100m
    wind_diurnal = cfg["wind_avg"] + 1.8 * np.sin(np.pi * (hour - 12) / 12) + np.random.normal(0, 1.2, hours)
    wind_10m = np.maximum(0.5, wind_diurnal)
    wind_shear_alpha = 0.14 if elev < 300 else 0.18
    wind_100m = np.maximum(1.0, wind_10m * ((100.0 / 10.0) ** wind_shear_alpha))
    wind_gusts = wind_10m * 1.35
    wind_dir = (180.0 + 80.0 * np.sin(hour / 6) + np.random.normal(0, 20, hours)) % 360.0
    
    # Air Density (altitude and temperature adjusted)
    temp_k = temp_2m + 273.15
    air_density = (surface_pressure * 100.0) / (287.058 * temp_k)
    
    # -------------------------------------------------------------
    # PHYSICAL TARGET 1: SOLAR POWER (100 MW Utility AC Block)
    # -------------------------------------------------------------
    dni_extra = np.asarray(pvlib.irradiance.get_extra_radiation(timestamps))
    poa = pvlib.irradiance.get_total_irradiance(
        surface_tilt=tilt,
        surface_azimuth=180.0,
        solar_zenith=zenith,
        solar_azimuth=azimuth,
        dni=dni,
        ghi=ghi,
        dhi=dhi,
        dni_extra=dni_extra,
        model="haydavies"
    )
    poa_global = np.maximum(0.0, np.asarray(poa["poa_global"]))
    
    # Sandia/King cell temp with wind cooling
    temp_cell = pvlib.temperature.sapm_cell(
        poa_global=poa_global,
        temp_air=temp_2m,
        wind_speed=wind_10m,
        a=-3.56,
        b=-0.075,
        deltaT=3.0
    )
    temp_cell = np.asarray(temp_cell)
    
    # Monocrystalline negative temperature derate: -0.38%/deg C above 25 deg C
    dc_capacity = 100.0 * 1.25 # 125 MWp DC
    thermal_derate = np.clip(1.0 - 0.0038 * (temp_cell - 25.0), 0.70, 1.10)
    
    solar_dc = dc_capacity * (poa_global / 1000.0) * thermal_derate * 0.86
    solar_ac = np.clip(solar_dc * 0.98, 0.0, 100.0)
    solar_ac[elevation <= 0.0] = 0.0
    solar_target = np.round(solar_ac, 2)
    
    # -------------------------------------------------------------
    # PHYSICAL TARGET 2: WIND POWER (100 MW Utility Cluster)
    # -------------------------------------------------------------
    # IEC Class II/III utility turbine power curve with air density normalization
    v_cut_in = 3.0
    v_rated = 11.5
    v_cut_out = 25.0
    
    wind_norm = (air_density / 1.225)
    power_frac = np.zeros(hours)
    
    mask_ramp = (wind_100m >= v_cut_in) & (wind_100m < v_rated)
    power_frac[mask_ramp] = ((wind_100m[mask_ramp]**3 - v_cut_in**3) / (v_rated**3 - v_cut_in**3))
    
    mask_rated = (wind_100m >= v_rated) & (wind_100m < v_cut_out)
    power_frac[mask_rated] = 1.0
    
    wind_ac = np.clip(100.0 * power_frac * wind_norm * 0.94, 0.0, 100.0)
    wind_target = np.round(wind_ac, 2)
    
    # Assemble DataFrame
    df = pd.DataFrame({
        "timestamp": timestamps.tz_convert("Asia/Kolkata").tz_localize(None),
        "shortwave_radiation": ghi,
        "direct_normal_irradiance": dni,
        "diffuse_radiation": dhi,
        "temperature_2m": temp_2m,
        "relative_humidity_2m": rh,
        "surface_pressure": surface_pressure,
        "cloud_cover": cloud_cover,
        "wind_speed_10m": wind_10m,
        "wind_speed_100m": wind_100m,
        "wind_gusts_10m": wind_gusts,
        "wind_direction_100m": wind_dir,
        "air_density": air_density,
        "solar_zenith": zenith,
        "solar_azimuth": azimuth,
        "solar_elevation": elevation,
        "clearsky_ghi": clearsky_ghi,
        "clearness_index": np.clip(ghi / np.maximum(1.0, clearsky_ghi), 0.0, 1.2),
        "actual_solar_mw": solar_target,
        "actual_wind_mw": wind_target
    })
    
    # Cyclical Features
    df["hour_sin"] = np.sin(2 * np.pi * hour / 24.0)
    df["hour_cos"] = np.cos(2 * np.pi * hour / 24.0)
    df["month_sin"] = np.sin(2 * np.pi * month / 12.0)
    df["month_cos"] = np.cos(2 * np.pi * month / 12.0)
    df["day_of_year_sin"] = np.sin(2 * np.pi * dayofyear / 365.25)
    df["day_of_year_cos"] = np.cos(2 * np.pi * dayofyear / 365.25)
    
    # Wind Direction Vector
    rad_w = np.deg2rad(wind_dir)
    df["wind_dir_sin"] = np.sin(rad_w)
    df["wind_dir_cos"] = np.cos(rad_w)
    
    # Rolling stats
    df["cloud_cover_rolling_3h"] = df["cloud_cover"].rolling(3, min_periods=1).mean()
    df["temp_rolling_3h"] = df["temperature_2m"].rolling(3, min_periods=1).mean()
    df["wind_speed_rolling_3h"] = df["wind_speed_100m"].rolling(3, min_periods=1).mean()
    df["wind_speed_rolling_6h"] = df["wind_speed_100m"].rolling(6, min_periods=1).mean()
    
    return df

def train_all_states():
    print(f"=== Starting Pan-India Multi-State ML Training Engine ({len(PAN_INDIA_STATES)} States) ===")
    t_start = time.time()
    
    os.makedirs("models/states", exist_ok=True)
    all_solar_dfs = []
    all_wind_dfs = []
    state_metrics = {}
    
    for idx, state_cfg in enumerate(PAN_INDIA_STATES, 1):
        s_key = state_cfg["key"]
        s_name = state_cfg["name"]
        print(f"[{idx:02d}/{len(PAN_INDIA_STATES)}] Modeling & Training: {s_name} (Tilt: {state_cfg['tilt']}°, Elev: {state_cfg['elevation']}m)...")
        
        t0 = time.time()
        df = generate_state_dataset(state_cfg, hours=4380)
        
        # Split train (80%) and holdout test (20%) chronologically
        split_idx = int(len(df) * 0.8)
        train_df = df.iloc[:split_idx]
        test_df = df.iloc[split_idx:]
        
        # 1. Train Solar XGBoost
        X_sol_train = train_df[SOLAR_FEATURES]
        y_sol_train = train_df["actual_solar_mw"]
        X_sol_test = test_df[SOLAR_FEATURES]
        y_sol_test = test_df["actual_solar_mw"]
        
        solar_model = XGBRegressor(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.08,
            random_state=42,
            n_jobs=-1
        )
        solar_model.fit(X_sol_train, y_sol_train)
        
        sol_preds = np.clip(solar_model.predict(X_sol_test), 0.0, 100.0)
        sol_preds[X_sol_test["solar_elevation"] <= 0.0] = 0.0
        sol_mae = mean_absolute_error(y_sol_test, sol_preds)
        sol_rmse = np.sqrt(mean_squared_error(y_sol_test, sol_preds))
        sol_r2 = r2_score(y_sol_test, sol_preds)
        sol_nrmse = (sol_rmse / 100.0) * 100.0
        
        solar_model_path = f"models/states/{s_key}_solar_model.joblib"
        joblib.dump(solar_model, solar_model_path)
        
        # 2. Train Wind XGBoost
        X_wnd_train = train_df[WIND_FEATURES]
        y_wnd_train = train_df["actual_wind_mw"]
        X_wnd_test = test_df[WIND_FEATURES]
        y_wnd_test = test_df["actual_wind_mw"]
        
        wind_model = XGBRegressor(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.08,
            random_state=42,
            n_jobs=-1
        )
        wind_model.fit(X_wnd_train, y_wnd_train)
        
        wnd_preds = np.clip(wind_model.predict(X_wnd_test), 0.0, 100.0)
        wnd_mae = mean_absolute_error(y_wnd_test, wnd_preds)
        wnd_rmse = np.sqrt(mean_squared_error(y_wnd_test, wnd_preds))
        wnd_r2 = r2_score(y_wnd_test, wnd_preds)
        wnd_nrmse = (wnd_rmse / 100.0) * 100.0
        
        wind_model_path = f"models/states/{s_key}_wind_model.joblib"
        joblib.dump(wind_model, wind_model_path)
        
        duration = round(time.time() - t0, 2)
        
        state_metrics[s_key] = {
            "state_name": s_name,
            "hub": state_cfg["hub"],
            "coordinates": {"lat": state_cfg["lat"], "lon": state_cfg["lon"]},
            "optimal_tilt_deg": state_cfg["tilt"],
            "elevation_m": state_cfg["elevation"],
            "solar_metrics": {
                "MAE_MW": round(float(sol_mae), 3),
                "RMSE_MW": round(float(sol_rmse), 3),
                "nRMSE_pct": round(float(sol_nrmse), 2),
                "R2": round(float(sol_r2), 4)
            },
            "wind_metrics": {
                "MAE_MW": round(float(wnd_mae), 3),
                "RMSE_MW": round(float(wnd_rmse), 3),
                "nRMSE_pct": round(float(wnd_nrmse), 2),
                "R2": round(float(wnd_r2), 4)
            },
            "training_time_s": duration
        }
        
        print(f"   -> Solar nRMSE: {sol_nrmse:.2f}% | Wind nRMSE: {wnd_nrmse:.2f}% | Done in {duration}s")
        
        # Append for pan-India universal training
        all_solar_dfs.append(df[SOLAR_FEATURES + ["actual_solar_mw"]])
        all_wind_dfs.append(df[WIND_FEATURES + ["actual_wind_mw"]])
        
    # 3. Train Universal Pan-India Climate-Adaptive Models
    print("\nTraining Pan-India Universal Climate-Adaptive Models across all 24 states...")
    full_solar_df = pd.concat(all_solar_dfs, ignore_index=True)
    full_wind_df = pd.concat(all_wind_dfs, ignore_index=True)
    
    universal_solar = XGBRegressor(n_estimators=120, max_depth=6, learning_rate=0.08, random_state=42, n_jobs=-1)
    universal_solar.fit(full_solar_df[SOLAR_FEATURES], full_solar_df["actual_solar_mw"])
    joblib.dump(universal_solar, "models/pan_india_solar_model.joblib")
    
    universal_wind = XGBRegressor(n_estimators=120, max_depth=6, learning_rate=0.08, random_state=42, n_jobs=-1)
    universal_wind.fit(full_wind_df[WIND_FEATURES], full_wind_df["actual_wind_mw"])
    joblib.dump(universal_wind, "models/pan_india_wind_model.joblib")
    
    # Save Metrics Registry
    with open("models/state_metrics.json", "w") as f:
        json.dump(state_metrics, f, indent=4)
        
    total_time = round(time.time() - t_start, 2)
    print(f"\n✅ All 24 States successfully trained & verified in {total_time}s!")
    print(f"Saved 48 state models to models/states/ and universal models to models/")

if __name__ == "__main__":
    train_all_states()
