"""
predict.py
----------
Main entrypoint to generate 24-72h future renewable generation forecast
and run grid advisory dispatch rules.
"""

import argparse
from src.prediction.predict import forecast_future

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run Future Solar Power Forecast")
    parser.add_argument("--hours", type=int, default=72, help="Forecast horizon in hours (24, 48, 72)")
    parser.add_argument("--live", action="store_true", help="Fetch live real-time weather from Open-Meteo API over internet")
    args = parser.parse_args()

    df_fc = forecast_future(horizon_hours=args.hours, live_fetch=args.live)
    print("\n" + "="*85)
    source_type = "LIVE REAL-TIME API FETCH" if args.live else "LOCAL CACHED SNAPSHOT"
    print(f"   OPERATIONAL {args.hours}-HOUR RENEWABLE FORECAST & GRID ADVISORY [{source_type}]")
    print("="*85)
    print(df_fc.head(24)[["timestamp", "predicted_generation_mw", "expected_demand_mw", "balance_delta_mw", "grid_status"]].to_string(index=False))
