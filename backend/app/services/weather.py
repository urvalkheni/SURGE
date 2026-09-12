from typing import Any

import httpx

from app.core.config import Settings
from app.core.errors import ApiException


class OpenMeteoClient:
    def __init__(self, settings: Settings):
        self.settings = settings

    async def search(self, query: str) -> list[dict[str, Any]]:
        try:
            async with httpx.AsyncClient(timeout=8) as client:
                response = await client.get(f"{self.settings.open_meteo_geocoding_url}/v1/search", params={"name": query, "count": 10, "language": "en", "format": "json"})
                response.raise_for_status()
            return response.json().get("results", [])
        except httpx.HTTPError as exc:
            raise ApiException(503, "WEATHER_UNAVAILABLE", "Location service is unavailable.") from exc

    async def forecast(self, latitude: float, longitude: float, horizon_hours: int) -> dict[str, Any]:
        variables = "temperature_2m,cloud_cover,shortwave_radiation,direct_radiation,diffuse_radiation,direct_normal_irradiance,wind_speed_10m,wind_speed_100m"
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(f"{self.settings.open_meteo_base_url}/v1/forecast", params={
                    "latitude": latitude, "longitude": longitude, "hourly": variables,
                    "forecast_days": min(3, max(1, (horizon_hours + 23) // 24)), "timezone": "UTC",
                })
                response.raise_for_status()
            return response.json()
        except httpx.HTTPError as exc:
            raise ApiException(503, "WEATHER_UNAVAILABLE", "Weather service is unavailable.") from exc

    async def ensemble(self, latitude: float, longitude: float, horizon_hours: int, models: str = "gfs025,ecmwf_ifs025,icon_seamless") -> dict[str, Any]:
        variables = "temperature_2m,cloud_cover,shortwave_radiation,direct_radiation,diffuse_radiation,wind_speed_10m,wind_speed_100m"
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                response = await client.get("https://ensemble-api.open-meteo.com/v1/ensemble", params={
                    "latitude": latitude, "longitude": longitude, "hourly": variables,
                    "models": models,
                    "forecast_days": min(3, max(1, (horizon_hours + 23) // 24)), "timezone": "UTC",
                })
                response.raise_for_status()
            return response.json()
        except httpx.HTTPError as exc:
            raise ApiException(503, "WEATHER_UNAVAILABLE", "Ensemble weather service is unavailable.") from exc
