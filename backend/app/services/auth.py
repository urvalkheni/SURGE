from dataclasses import dataclass
from uuid import UUID

import httpx
import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import Settings, get_settings
from app.core.errors import ApiException
from app.services.supabase import SupabaseRepository

bearer = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class CurrentUser:
    id: UUID
    token: str


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    settings: Settings = Depends(get_settings),
) -> CurrentUser:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise ApiException(401, "AUTH_TOKEN_MISSING", "A Supabase bearer token is required.")
    try:
        if settings.supabase_jwt_secret:
            payload = jwt.decode(credentials.credentials, settings.supabase_jwt_secret, algorithms=["HS256"], audience="authenticated")
        elif settings.supabase_url and settings.supabase_anon_key:
            async with httpx.AsyncClient(timeout=5) as client:
                result = await client.get(
                    f"{settings.supabase_url.rstrip('/')}/auth/v1/user",
                    headers={"apikey": settings.supabase_anon_key, "Authorization": f"Bearer {credentials.credentials}"},
                )
            if result.status_code != 200:
                raise ValueError("Supabase did not accept the token")
            payload = result.json()
        else:
            raise ApiException(503, "AUTH_UNAVAILABLE", "Supabase authentication is not configured.")
        return CurrentUser(id=UUID(payload["sub"] if "sub" in payload else payload["id"]), token=credentials.credentials)
    except ApiException:
        raise
    except Exception as exc:
        raise ApiException(401, "INVALID_TOKEN", "The Supabase bearer token is invalid.") from exc


class Authorizer:
    def __init__(self, repo: SupabaseRepository, user: CurrentUser):
        self.repo, self.user = repo, user

    async def plant(self, plant_id: UUID, *, write: bool = False, acknowledge: bool = False) -> dict:
        plant = await self.repo.one("plants", str(plant_id))
        org_id = plant["organization_id"]
        roles = await self.repo.request("GET", "organization_members", params={
            "organization_id": f"eq.{org_id}", "user_id": f"eq.{self.user.id}", "select": "role",
        })
        role_set = {entry["role"] for entry in roles}
        memberships = await self.repo.request("GET", "plant_memberships", params={
            "plant_id": f"eq.{plant_id}", "user_id": f"eq.{self.user.id}", "select": "access_level",
        })
        access = memberships[0]["access_level"] if memberships else None
        readable = "ORG_ADMIN" in role_set or "ENERGY_ANALYST" in role_set or access is not None
        writable = "ORG_ADMIN" in role_set or access in {"OPERATE", "MANAGE"}
        if not readable or (write and not writable) or (acknowledge and not ("ORG_ADMIN" in role_set or access)):
            raise ApiException(403, "FORBIDDEN", "You do not have the required plant permission.")
        return plant

    async def org_admin(self, organization_id: str) -> None:
        memberships = await self.repo.request("GET", "organization_members", params={
            "organization_id": f"eq.{organization_id}", "user_id": f"eq.{self.user.id}", "role": "eq.ORG_ADMIN",
        })
        if not memberships:
            raise ApiException(403, "FORBIDDEN", "Organization administrator permission is required.")
