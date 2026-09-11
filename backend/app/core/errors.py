from datetime import UTC, datetime

from fastapi import Request
from fastapi.responses import JSONResponse


class ApiException(Exception):
    def __init__(self, status_code: int, code: str, message: str, detail: object | None = None):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.detail = detail


async def api_exception_handler(_: Request, exc: ApiException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {"code": exc.code, "message": exc.message, "detail": exc.detail},
            "timestamp": datetime.now(UTC).isoformat(),
        },
    )
