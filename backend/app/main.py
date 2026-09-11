from contextlib import asynccontextmanager
from datetime import UTC, datetime
from uuid import UUID

from fastapi import Depends, FastAPI, Query, status
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import Settings, get_settings
from app.core.errors import ApiException, api_exception_handler
from app.schemas.domain import (
    DataTrustResponse, ForecastRequest, ForecastResponse, LocationResult,
    PlantCreate, PlantMemberCreate, PlantPatch, RecommendationAcknowledge, WeatherResponse,
)
from app.services.auth import Authorizer, CurrentUser, get_current_user
from app.services.forecasting import build_forecast, confidence_level
from app.services.intelligence import detect_risks, recommendations_for
from app.services.supabase import SupabaseRepository
from app.services.weather import OpenMeteoClient


def repo(settings: Settings = Depends(get_settings)) -> SupabaseRepository:
    return SupabaseRepository(settings)


def weather(settings: Settings = Depends(get_settings)) -> OpenMeteoClient:
    return OpenMeteoClient(settings)


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield


settings = get_settings()
app = FastAPI(title="SURGE API", version="0.1.0", lifespan=lifespan)
app.add_exception_handler(ApiException, api_exception_handler)
app.add_middleware(
    CORSMiddleware, allow_origins=settings.cors_origin_list, allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"], allow_headers=["Authorization", "Content-Type"],
)
PREFIX = settings.api_prefix


@app.get(f"{PREFIX}/health")
async def health(store: SupabaseRepository = Depends(repo)) -> dict:
    database_status = "not_configured"
    if store.is_configured:
        database_status = "online" if await store.ping() else "unavailable"
    return {"status": "ok", "version": app.version, "timestamp": datetime.now(UTC).isoformat(), "services": {
        "database": database_status,
        "weather": "online", "inference_worker": "baseline_ready",
    }}


@app.get(f"{PREFIX}/location/search", response_model=list[LocationResult])
async def location_search(q: str = Query(min_length=2, max_length=120), client: OpenMeteoClient = Depends(weather)):
    results = await client.search(q)
    return [{key: item.get(key) for key in ("name", "country", "admin1", "latitude", "longitude", "timezone")} for item in results]


@app.get(f"{PREFIX}/weather", response_model=WeatherResponse)
async def get_weather(latitude: float = Query(ge=-90, le=90), longitude: float = Query(ge=-180, le=180),
                      horizon_hours: int = Query(24, ge=24, le=72), client: OpenMeteoClient = Depends(weather)):
    data = await client.forecast(latitude, longitude, horizon_hours)
    return {"latitude": data["latitude"], "longitude": data["longitude"], "timezone": data["timezone"], "hourly": data["hourly"]}


@app.get(f"{PREFIX}/plants")
async def list_plants(user: CurrentUser = Depends(get_current_user), store: SupabaseRepository = Depends(repo)):
    orgs = await store.request("GET", "organization_members", params={"user_id": f"eq.{user.id}", "select": "organization_id,role"})
    memberships = await store.request("GET", "plant_memberships", params={"user_id": f"eq.{user.id}", "select": "plant_id"})
    plant_ids = {entry["plant_id"] for entry in memberships}
    broad_org_ids = {entry["organization_id"] for entry in orgs if entry["role"] in {"ORG_ADMIN", "ENERGY_ANALYST"}}
    all_plants = await store.request("GET", "plants", params={"select": "*"})
    return [plant for plant in all_plants if plant["id"] in plant_ids or plant["organization_id"] in broad_org_ids]


@app.post(f"{PREFIX}/plants", status_code=status.HTTP_201_CREATED)
async def create_plant(payload: PlantCreate, user: CurrentUser = Depends(get_current_user), store: SupabaseRepository = Depends(repo)):
    authorizer = Authorizer(store, user)
    await authorizer.org_admin(str(payload.organization_id))
    created = (await store.request("POST", "plants", json=payload.model_dump(mode="json")))[0]
    await store.audit(user_id=str(user.id), organization_id=created["organization_id"], plant_id=created["id"], event_type="PLANT_CREATED", entity_type="plants", entity_id=created["id"])
    return created


@app.get(f"{PREFIX}/plants/{{plant_id}}")
async def get_plant(plant_id: UUID, user: CurrentUser = Depends(get_current_user), store: SupabaseRepository = Depends(repo)):
    return await Authorizer(store, user).plant(plant_id)


@app.patch(f"{PREFIX}/plants/{{plant_id}}")
async def update_plant(plant_id: UUID, payload: PlantPatch, user: CurrentUser = Depends(get_current_user), store: SupabaseRepository = Depends(repo)):
    plant = await Authorizer(store, user).plant(plant_id, write=True)
    changes = payload.model_dump(exclude_unset=True, mode="json")
    if not changes:
        return plant
    updated = (await store.request("PATCH", "plants", params={"id": f"eq.{plant_id}"}, json=changes))[0]
    await store.audit(user_id=str(user.id), organization_id=plant["organization_id"], plant_id=str(plant_id), event_type="PLANT_UPDATED", entity_type="plants", entity_id=str(plant_id))
    return updated


@app.post(f"{PREFIX}/plants/{{plant_id}}/members", status_code=status.HTTP_201_CREATED)
async def assign_plant_member(plant_id: UUID, payload: PlantMemberCreate, user: CurrentUser = Depends(get_current_user), store: SupabaseRepository = Depends(repo)):
    plant = await Authorizer(store, user).plant(plant_id, write=True)
    await Authorizer(store, user).org_admin(plant["organization_id"])
    return (await store.request("POST", "plant_memberships", json={"plant_id": str(plant_id), **payload.model_dump(mode="json")}))[0]


@app.post(f"{PREFIX}/forecast", response_model=ForecastResponse)
async def generate_forecast(payload: ForecastRequest, user: CurrentUser = Depends(get_current_user),
                            store: SupabaseRepository = Depends(repo), client: OpenMeteoClient = Depends(weather)):
    plant = await Authorizer(store, user).plant(payload.plant_id)
    weather_data = await client.forecast(float(plant["latitude"]), float(plant["longitude"]), payload.horizon_hours)
    points, score, explanation = build_forecast(plant, weather_data, payload.horizon_hours)
    run = (await store.request("POST", "forecast_runs", json={"plant_id": str(payload.plant_id), "requested_by": str(user.id), "energy_type": plant["energy_type"], "horizon_hours": payload.horizon_hours, "model_name": "physics-weather-baseline-v1", "status": "COMPLETED", "generated_at": datetime.now(UTC).isoformat()}))[0]
    await store.request("POST", "forecast_points", json=[{"forecast_run_id": run["id"], **point} for point in points])
    await store.request("POST", "forecast_explanations", json={"forecast_run_id": run["id"], "summary": explanation, "drivers": {"weather_source": "Open-Meteo", "energy_type": plant["energy_type"]}})
    risk_rows = detect_risks(plant, run["id"], points)
    persisted_risks = await store.request("POST", "risks", json=risk_rows) if risk_rows else []
    recommendation_rows = recommendations_for([
        {**risk, "id": persisted["id"]} for risk, persisted in zip(risk_rows, persisted_risks)
    ])
    if recommendation_rows:
        for recommendation, risk in zip(recommendation_rows, persisted_risks):
            recommendation["risk_id"] = risk["id"]
        await store.request("POST", "recommendations", json=recommendation_rows)
    await store.audit(user_id=str(user.id), organization_id=plant["organization_id"], plant_id=str(payload.plant_id), event_type="FORECAST_GENERATED", entity_type="forecast_runs", entity_id=run["id"])
    return {"forecast_run_id": run["id"], "plant_id": payload.plant_id, "model_name": run["model_name"], "generated_at": run["generated_at"], "horizon_hours": payload.horizon_hours, "confidence_score": score, "confidence_level": confidence_level(score), "explanation": explanation, "points": points}


@app.get(f"{PREFIX}/forecasts/{{forecast_run_id}}")
async def get_forecast(forecast_run_id: UUID, user: CurrentUser = Depends(get_current_user), store: SupabaseRepository = Depends(repo)):
    run = await store.one("forecast_runs", str(forecast_run_id))
    await Authorizer(store, user).plant(UUID(run["plant_id"]))
    points = await store.request("GET", "forecast_points", params={"forecast_run_id": f"eq.{forecast_run_id}", "order": "timestamp.asc"})
    explanations = await store.request("GET", "forecast_explanations", params={"forecast_run_id": f"eq.{forecast_run_id}", "limit": "1"})
    return {**run, "points": points, "explanation": explanations[0] if explanations else None}


@app.get(f"{PREFIX}/risks")
async def list_risks(plant_id: UUID | None = None, user: CurrentUser = Depends(get_current_user), store: SupabaseRepository = Depends(repo)):
    if plant_id:
        await Authorizer(store, user).plant(plant_id)
        return await store.request("GET", "risks", params={"plant_id": f"eq.{plant_id}", "order": "start_time.asc"})
    plants = await list_plants(user, store)
    ids = [plant["id"] for plant in plants]
    return [] if not ids else await store.request("GET", "risks", params={"plant_id": f"in.({','.join(ids)})", "order": "start_time.asc"})


@app.get(f"{PREFIX}/recommendations")
async def list_recommendations(plant_id: UUID | None = None, user: CurrentUser = Depends(get_current_user), store: SupabaseRepository = Depends(repo)):
    if plant_id:
        await Authorizer(store, user).plant(plant_id)
        return await store.request("GET", "recommendations", params={"plant_id": f"eq.{plant_id}", "order": "created_at.desc"})
    plants = await list_plants(user, store)
    ids = [plant["id"] for plant in plants]
    return [] if not ids else await store.request("GET", "recommendations", params={"plant_id": f"in.({','.join(ids)})", "order": "created_at.desc"})


@app.post(f"{PREFIX}/recommendations/{{recommendation_id}}/acknowledge")
async def acknowledge_recommendation(recommendation_id: UUID, _: RecommendationAcknowledge,
                                     user: CurrentUser = Depends(get_current_user), store: SupabaseRepository = Depends(repo)):
    recommendation = await store.one("recommendations", str(recommendation_id))
    plant = await Authorizer(store, user).plant(UUID(recommendation["plant_id"]), acknowledge=True)
    if recommendation["status"] != "PENDING":
        raise ApiException(409, "INVALID_STATE", "Only pending recommendations can be acknowledged.")
    updated = (await store.request("PATCH", "recommendations", params={"id": f"eq.{recommendation_id}"}, json={"status": "ACKNOWLEDGED"}))[0]
    await store.audit(user_id=str(user.id), organization_id=plant["organization_id"], plant_id=plant["id"], event_type="RECOMMENDATION_ACKNOWLEDGED", entity_type="recommendations", entity_id=str(recommendation_id))
    return updated


@app.get(f"{PREFIX}/data-trust", response_model=DataTrustResponse)
async def data_trust(plant_id: UUID | None = None, user: CurrentUser = Depends(get_current_user), store: SupabaseRepository = Depends(repo)):
    if plant_id:
        await Authorizer(store, user).plant(plant_id)
        runs = await store.request("GET", "data_validation_runs", params={"plant_id": f"eq.{plant_id}", "order": "checked_at.desc"})
        anomalies = await store.request("GET", "data_anomalies", params={"plant_id": f"eq.{plant_id}", "order": "detected_at.desc"})
    else:
        plants = await list_plants(user, store)
        ids = [plant["id"] for plant in plants]
        runs, anomalies = ([], []) if not ids else (
            await store.request("GET", "data_validation_runs", params={"plant_id": f"in.({','.join(ids)})", "order": "checked_at.desc"}),
            await store.request("GET", "data_anomalies", params={"plant_id": f"in.({','.join(ids)})", "order": "detected_at.desc"}),
        )
    state = "QUARANTINED" if any(run["overall_status"] == "QUARANTINED" for run in runs) else "WARNING" if any(run["overall_status"] == "WARNING" for run in runs) else "HEALTHY"
    return {"plant_id": plant_id, "overall_status": state, "validation_runs": runs, "anomalies": anomalies}
