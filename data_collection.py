"""
data_collection.py
------------------
Main entrypoint to download historical weather from Open-Meteo API,
download live 72-hour forecast, and compute ground-truth PV generation target.
"""

from src.data_collection.fetch_weather import fetch_historical_weather, fetch_weather_forecast
from src.data_collection.generate_target import calculate_pv_generation

if __name__ == "__main__":
    print("\n[STEP 1/3] Fetching 1-Year Historical Weather from Open-Meteo...")
    fetch_historical_weather()

    print("\n[STEP 2/3] Fetching 72-Hour Live Future Weather Forecast...")
    fetch_weather_forecast()

    print("\n[STEP 3/3] Calculating NREL PVLib Physics Generation Target...")
    calculate_pv_generation()

    print("\n[COMPLETED] Raw weather and target generation datasets created successfully in data/raw/!")
