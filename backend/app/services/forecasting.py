from datetime import UTC, datetime
from math import sin, pi
from typing import Any


def confidence_level(score: float) -> str:
    return "HIGH" if score >= .80 else "MEDIUM" if score >= .60 else "LOW"


def build_forecast(plant: dict[str, Any], weather: dict[str, Any], horizon_hours: int) -> tuple[list[dict[str, Any]], float, str]:
    """Physics-informed, bounded baseline. An XGBoost model can replace this service without changing the API."""
    hourly = weather["hourly"]
    timestamps = hourly["time"][:horizon_hours]
    cloud = hourly.get("cloud_cover", [0] * len(timestamps))
    radiation = hourly.get("shortwave_radiation", [0] * len(timestamps))
    wind = hourly.get("wind_speed_100m", hourly.get("wind_speed_10m", [0] * len(timestamps)))
    capacity = float(plant["capacity_mw"])
    energy_type = plant["energy_type"]
    points: list[dict[str, Any]] = []
    for index, timestamp in enumerate(timestamps):
        if energy_type == "SOLAR":
            value = capacity * min(1.0, max(0.0, float(radiation[index]) / 900)) * (1 - min(0.7, float(cloud[index]) / 250))
        else:
            speed = float(wind[index])
            value = capacity * (0 if speed < 3 or speed >= 25 else min(1, ((speed - 3) / 9) ** 3))
        value = round(min(capacity, max(0, value)), 4)
        uncertainty = max(.08, min(.35, .08 + float(cloud[index]) / 400))
        confidence = round(1 - uncertainty, 4)
        points.append({
            "timestamp": datetime.fromisoformat(timestamp).replace(tzinfo=UTC).isoformat(),
            "predicted_generation_mw": value,
            "lower_bound_mw": round(max(0, value * (1 - uncertainty)), 4),
            "upper_bound_mw": round(min(capacity, value * (1 + uncertainty)), 4),
            "confidence_score": confidence,
            "risk_level": confidence_level(confidence),
        })
    score = round(sum(point["confidence_score"] for point in points) / max(1, len(points)), 4)
    explanation = ("Forecast uses measured shortwave radiation and cloud cover." if energy_type == "SOLAR"
                   else "Forecast uses hub-height wind speed and the configured capacity constraint.")
    return points, score, explanation
