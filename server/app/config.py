"""Application configuration loaded from environment variables."""

from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()

# ── API keys ─────────────────────────────────────────────────────────────
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""

# ── Model names ──────────────────────────────────────────────────────────
GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3-flash-preview")
GEMINI_IMAGE_MODEL: str = "gemini-2.5-flash-preview-native-audio-dialog"
IMAGEN_MODELS: list[str] = [
    "imagen-4.0-fast-generate-001",
    "imagen-4.0-generate-001",
    "imagen-4.0-ultra-generate-001",
]

# ── Server ───────────────────────────────────────────────────────────────
PORT: int = int(os.getenv("PORT", "5050"))
CORS_ORIGIN: str = os.getenv("CORS_ORIGIN", "")

# ── Limits / timeouts ───────────────────────────────────────────────────
BODY_LIMIT: int = 12 * 1024 * 1024  # 12 MB
MODEL_TIMEOUT: float = 15.0  # seconds – image model calls
FETCH_TIMEOUT: float = 60.0  # seconds – text endpoints
MAX_RETRIES: int = 5

MAX_INGREDIENTS: int = 50
MAX_INGREDIENT_LENGTH: int = 100
MAX_TITLE_LENGTH: int = 200
MAX_PROMPT_LENGTH: int = 500
MAX_BASE64_LENGTH: int = 16 * 1024 * 1024  # ~12 MB raw

ALLOWED_MIME_TYPES: list[str] = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]

# ── Google AI API URLs ───────────────────────────────────────────────────
GOOGLE_AI_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


def gemini_url(model: str) -> str:
    return f"{GOOGLE_AI_BASE}/{model}:generateContent"


def imagen_url(model: str) -> str:
    return f"{GOOGLE_AI_BASE}/{model}:predict"


def google_api_headers() -> dict[str, str]:
    return {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
    }
