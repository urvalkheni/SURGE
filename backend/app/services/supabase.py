from typing import Any

import httpx

from app.core.config import Settings
from app.core.errors import ApiException


class SupabaseRepository:
    """Small server-side PostgREST client; service-role credentials never leave FastAPI."""

    def __init__(self, settings: Settings):
        self.settings = settings

    def _headers(self) -> dict[str, str]:
        key = self.settings.supabase_service_role_key
        if not self.settings.supabase_url or not key:
            raise ApiException(503, "DATABASE_UNAVAILABLE", "Supabase server configuration is missing.")
        return {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}

    @property
    def is_configured(self) -> bool:
        return bool(self.settings.supabase_url and self.settings.supabase_service_role_key)

    async def ping(self) -> bool:
        """Safely checks PostgREST availability without returning database data."""
        try:
            await self.request("GET", "organizations", params={"select": "id", "limit": "1"})
        except ApiException:
            return False
        return True

    async def request(self, method: str, table: str, *, params: dict[str, str] | None = None,
                      json: Any = None, prefer: str = "return=representation") -> list[dict[str, Any]]:
        headers = self._headers()
        headers["Prefer"] = prefer
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.request(
                    method,
                    f"{self.settings.supabase_url.rstrip('/')}/rest/v1/{table}",
                    params=params,
                    json=json,
                    headers=headers,
                )
        except httpx.HTTPError as exc:
            raise ApiException(503, "DATABASE_UNAVAILABLE", "Could not reach Supabase.") from exc
        if response.status_code >= 400:
            raise ApiException(502, "DATABASE_ERROR", "Supabase rejected the request.", response.text)
        return response.json() if response.content else []

    async def one(self, table: str, identifier: str) -> dict[str, Any]:
        rows = await self.request("GET", table, params={"id": f"eq.{identifier}", "limit": "1"})
        if not rows:
            raise ApiException(404, "NOT_FOUND", f"{table.rstrip('s').title()} not found.")
        return rows[0]

    async def audit(self, *, user_id: str, organization_id: str | None, plant_id: str | None,
                    event_type: str, entity_type: str, entity_id: str | None) -> None:
        await self.request("POST", "audit_logs", json={
            "user_id": user_id, "organization_id": organization_id, "plant_id": plant_id,
            "event_type": event_type, "entity_type": entity_type, "entity_id": entity_id,
            "metadata": {},
        })
