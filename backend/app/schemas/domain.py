from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

EnergyType = Literal["SOLAR", "WIND"]
PlantStatus = Literal["DRAFT", "ACTIVE", "MAINTENANCE", "OFFLINE"]
AccessLevel = Literal["VIEW", "OPERATE", "MANAGE"]


class PlantCreate(BaseModel):
    organization_id: UUID
    name: str = Field(min_length=1, max_length=160)
    energy_type: EnergyType
    location_name: str | None = None
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    timezone: str | None = None
    capacity_mw: float = Field(gt=0)
    status: PlantStatus = "ACTIVE"
    configuration: dict[str, Any] = Field(default_factory=dict)


class PlantPatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    location_name: str | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    timezone: str | None = None
    capacity_mw: float | None = Field(default=None, gt=0)
    status: PlantStatus | None = None
    configuration: dict[str, Any] | None = None


class ForecastRequest(BaseModel):
    plant_id: UUID
    horizon_hours: Literal[24, 48, 72] = 24


class LocationResult(BaseModel):
    name: str
    country: str | None = None
    admin1: str | None = None
    latitude: float
    longitude: float
    timezone: str | None = None


class WeatherResponse(BaseModel):
    latitude: float
    longitude: float
    timezone: str
    hourly: dict[str, list[Any]]


class ForecastPoint(BaseModel):
    timestamp: datetime
    predicted_generation_mw: float
    lower_bound_mw: float
    upper_bound_mw: float
    confidence_score: float
    risk_level: Literal["HIGH", "MEDIUM", "LOW"]


class ForecastResponse(BaseModel):
    forecast_run_id: UUID
    plant_id: UUID
    model_name: str
    generated_at: datetime
    horizon_hours: int
    confidence_score: float
    confidence_level: Literal["HIGH", "MEDIUM", "LOW"]
    explanation: str
    points: list[ForecastPoint]


class RecommendationAcknowledge(BaseModel):
    status: Literal["ACKNOWLEDGED"] = "ACKNOWLEDGED"


class DataTrustResponse(BaseModel):
    plant_id: UUID | None = None
    overall_status: Literal["HEALTHY", "WARNING", "QUARANTINED"]
    validation_runs: list[dict[str, Any]]
    anomalies: list[dict[str, Any]]


class PlantMemberCreate(BaseModel):
    user_id: UUID
    access_level: AccessLevel
