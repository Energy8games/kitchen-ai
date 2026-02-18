"""FastAPI application entry point."""

from __future__ import annotations

import logging
import sys

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware

from .config import BODY_LIMIT, CORS_ORIGIN, GEMINI_API_KEY, PORT
from .routes import limiter, router

# ── Logging ──────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger("kitchen-ai")

# ── App ──────────────────────────────────────────────────────────────────
app = FastAPI(title="Kitchen AI API", version="0.1.0")

# Body size limit middleware (equivalent to express.json({ limit: '12mb' }))
class LimitBodySizeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > BODY_LIMIT:
            return JSONResponse(
                status_code=413,
                content={"error": "Request body too large"},
            )
        return await call_next(request)

app.add_middleware(LimitBodySizeMiddleware)

# Rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# GZip compression (equivalent to express compression())
app.add_middleware(GZipMiddleware, minimum_size=500)

# CORS
if CORS_ORIGIN:
    origins = [o.strip() for o in CORS_ORIGIN.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    logger.warning(
        "[WARN] CORS_ORIGIN is not set — falling back to same-origin only. "
        "Set CORS_ORIGIN env var for cross-origin access."
    )

# Validation error handler — return structured JSON matching Express behaviour
@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    # Extract the first human-readable error message
    errors = exc.errors()
    if errors:
        msg = errors[0].get("msg", "Validation error")
        field = ".".join(str(l) for l in errors[0].get("loc", []) if l != "body")
        detail = f"{field}: {msg}" if field else msg
    else:
        detail = "Validation error"
    return JSONResponse(
        status_code=400,
        content={"error": detail},
    )

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"},
    )

# Routes
app.include_router(router)

# Startup log
@app.on_event("startup")
async def _startup() -> None:
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is not set — AI endpoints will fail")
    logger.info("API server listening on %d", PORT)
