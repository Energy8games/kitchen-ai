"""Async client for Google Generative AI (Gemini / Imagen) with retry logic."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

import httpx

from .config import (
    FETCH_TIMEOUT,
    GEMINI_IMAGE_MODEL,
    GEMINI_MODEL,
    IMAGEN_MODELS,
    MAX_RETRIES,
    MODEL_TIMEOUT,
    gemini_url,
    google_api_headers,
    imagen_url,
)

logger = logging.getLogger("kitchen-ai")


async def fetch_with_retry(
    url: str,
    *,
    json_body: dict[str, Any],
    timeout: float = FETCH_TIMEOUT,
    max_retries: int = MAX_RETRIES,
    label: str = "",
) -> dict[str, Any] | None:
    """POST *url* with *json_body*, retrying on 429 / 5xx with exponential backoff."""
    delay = 1.0
    headers = google_api_headers()

    for attempt in range(1, max_retries + 1):
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                resp = await client.post(url, headers=headers, json=json_body)

            if resp.is_success:
                return resp.json()

            status = resp.status_code
            body_preview = resp.text[:500]
            logger.error(
                "[fetchWithRetry] %s attempt %d/%d — HTTP %d: %s",
                label, attempt, max_retries, status, body_preview,
            )

            if status == 429 or status >= 500:
                await asyncio.sleep(delay)
                delay *= 2
                continue

            # Non-retryable 4xx (400, 403, 451 …)
            return None

        except (httpx.TimeoutException, httpx.ConnectError, httpx.HTTPError) as exc:
            logger.error(
                "[fetchWithRetry] %s attempt %d/%d — network error: %s",
                label, attempt, max_retries, exc,
            )
            if attempt == max_retries:
                raise
            await asyncio.sleep(delay)
            delay *= 2

    return None


# ── High-level helpers ───────────────────────────────────────────────────

async def generate_text(
    *,
    contents: list[dict[str, Any]],
    system_instruction: dict[str, Any] | None = None,
    generation_config: dict[str, Any] | None = None,
    label: str = "",
) -> str:
    """Call Gemini generateContent for text and return the raw text result."""
    body: dict[str, Any] = {"contents": contents}
    if system_instruction:
        body["systemInstruction"] = system_instruction
    body["generationConfig"] = generation_config or {"responseMimeType": "application/json"}

    data = await fetch_with_retry(
        gemini_url(GEMINI_MODEL),
        json_body=body,
        timeout=FETCH_TIMEOUT,
        label=label,
    )

    return (
        data.get("candidates", [{}])[0]
        .get("content", {})
        .get("parts", [{}])[0]
        .get("text", "")
        if data
        else ""
    )


async def _try_gemini_image(model: str, prompt: str) -> dict[str, str] | None:
    """Try generating an image via Gemini generateContent with IMAGE modality."""
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]},
    }
    data = await fetch_with_retry(
        gemini_url(model),
        json_body=body,
        timeout=MODEL_TIMEOUT,
        max_retries=1,
        label=f"gemini-image:{model}",
    )
    if not data:
        return None

    parts = (
        data.get("candidates", [{}])[0]
        .get("content", {})
        .get("parts", [])
    )
    for part in parts:
        inline = part.get("inlineData")
        if inline and inline.get("data"):
            return {
                "base64": inline["data"],
                "mime": inline.get("mimeType", "image/png"),
            }
    return None


async def _try_imagen(model: str, prompt: str) -> dict[str, str] | None:
    """Try generating an image via Imagen :predict endpoint."""
    body = {
        "instances": [{"prompt": prompt}],
        "parameters": {"sampleCount": 1},
    }
    data = await fetch_with_retry(
        imagen_url(model),
        json_body=body,
        timeout=MODEL_TIMEOUT,
        max_retries=1,
        label=f"imagen:{model}",
    )
    if not data:
        return None

    b64 = (data.get("predictions") or [{}])[0].get("bytesBase64Encoded")
    return {"base64": b64, "mime": "image/png"} if b64 else None


async def generate_image(prompt: str) -> dict[str, str] | None:
    """Sequential fallback across image models. Returns {base64, mime} or None."""
    strategies = [
        lambda: _try_gemini_image(GEMINI_IMAGE_MODEL, prompt),
        lambda: _try_imagen(IMAGEN_MODELS[0], prompt),
        lambda: _try_imagen(IMAGEN_MODELS[1], prompt),
        lambda: _try_imagen(IMAGEN_MODELS[2], prompt),
    ]

    for try_model in strategies:
        try:
            result = await try_model()
            if result:
                return result
        except Exception as exc:
            logger.error("[generate_image] model error: %s", exc)

    return None
