"""API route handlers — mirrors the Express endpoints 1:1."""

import json
import logging
import resource
from typing import Any, Optional

from fastapi import APIRouter, Body, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from .config import MAX_PROMPT_LENGTH, MAX_TITLE_LENGTH
from .google_ai import generate_image, generate_text
from .models import (
    DrinksRequest,
    ImageRequest,
    MealPlanRequest,
    RecipeDetailRequest,
    RecipeRequest,
    RecipesRequest,
    VisionRequest,
    sanitize_text,
)
from .config import GEMINI_API_KEY

logger = logging.getLogger("kitchen-ai")

router = APIRouter(prefix="/api")

# The limiter instance is created here but attached to the app in main.py
limiter = Limiter(key_func=get_remote_address)


def _require_api_key() -> None:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Missing GEMINI_API_KEY")


def _target_lang(language: Optional[str]) -> str:
    return "Russian" if language == "ru" else "English"


def _safe_diet(diet: Optional[str]) -> str:
    return sanitize_text(str(diet or "none"))[:30]


def _clean_json_text(raw: str) -> str:
    """Strip markdown code fences that models sometimes add."""
    return raw.replace("```json", "").replace("```", "").strip()


# ── Health ───────────────────────────────────────────────────────────────

@router.get("/health")
async def health() -> dict[str, Any]:
    usage = resource.getrusage(resource.RUSAGE_SELF)
    rss_mb = usage.ru_maxrss / (1024 * 1024)  # macOS returns bytes; Linux returns KB
    import platform
    if platform.system() == "Linux":
        rss_mb = usage.ru_maxrss / 1024  # Linux ru_maxrss is in KB
    return {
        "ok": True,
        "memory": {
            "rss": f"{rss_mb:.1f} MB",
        },
    }


# ── Vision ───────────────────────────────────────────────────────────────

@router.post("/vision")
@limiter.limit("30/minute")
async def vision(request: Request, body: VisionRequest = Body()) -> dict[str, Any]:
    _require_api_key()
    target = _target_lang(body.language)
    prompt = f"List all food items in this photo. Return JSON array of strings in {target}."

    try:
        raw = await generate_text(
            contents=[
                {
                    "parts": [
                        {"text": prompt},
                        {"inlineData": {"mimeType": body.mimeType, "data": body.imageBase64}},
                    ]
                }
            ],
            label="vision",
        )
        parsed = json.loads(raw) if raw else []
        return {"ingredients": parsed if isinstance(parsed, list) else []}
    except Exception as exc:
        logger.error("[/api/vision] Error: %s", exc)
        raise HTTPException(status_code=500, detail="Vision request failed")


# ── Single recipe ────────────────────────────────────────────────────────

@router.post("/recipe")
@limiter.limit("30/minute")
async def recipe(request: Request, body: RecipeRequest = Body()) -> dict[str, Any]:
    _require_api_key()
    target = _target_lang(body.language)
    system_prompt = (
        f"You are a world-class chef. Create a gourmet recipe in {target}. Return ONLY JSON. "
        'Schema: { "title": "string", "description": "string", "prepTime": "string", "difficulty": "string", '
        '"nutrition": { "calories": number, "protein": "string", "fat": "string", "carbs": "string" },'
        '"ingredientsList": ["string"], "instructions": ["string"] }'
    )

    try:
        raw = await generate_text(
            contents=[{"parts": [{"text": f"Ingredients: {', '.join(body.ingredients)}"}]}],
            system_instruction={"parts": [{"text": system_prompt}]},
            label="recipe",
        )
        if not raw:
            raise HTTPException(status_code=502, detail="Empty response from AI model")
        return json.loads(_clean_json_text(raw))
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("[/api/recipe] Error: %s", exc)
        raise HTTPException(status_code=500, detail="Recipe request failed")


# ── Multiple recipes ────────────────────────────────────────────────────

@router.post("/recipes")
@limiter.limit("30/minute")
async def recipes(request: Request, body: RecipesRequest = Body()) -> list[dict[str, Any]]:
    _require_api_key()
    target = _target_lang(body.language)
    safe_diet = _safe_diet(body.diet)
    system_prompt = (
        "Michelin Chef. Create 3 distinct recipes based on the ingredients provided. "
        "Respond ONLY with a JSON array of 3 objects.\n"
        'Schema for each object: { "title": "str", "description": "str", "prepTime": "str", "difficulty": "str", '
        '"nutrition": {"calories": num, "protein": "str", "fat": "str", "carbs": "str"}, '
        f'"ingredientsList": ["str"], "instructions": ["str"] }} in {target}. Diet: {safe_diet}.'
    )

    try:
        raw = await generate_text(
            contents=[{"parts": [{"text": f"Ingredients: {', '.join(body.ingredients)}"}]}],
            system_instruction={"parts": [{"text": system_prompt}]},
            label="recipes",
        )
        if not raw:
            raise HTTPException(status_code=502, detail="Empty response from AI model")
        parsed = json.loads(_clean_json_text(raw))
        return parsed if isinstance(parsed, list) else [parsed]
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("[/api/recipes] Error: %s", exc)
        raise HTTPException(status_code=500, detail="Recipes request failed")


# ── Recipe detail ────────────────────────────────────────────────────────

@router.post("/recipe-detail")
@limiter.limit("30/minute")
async def recipe_detail(request: Request, body: RecipeDetailRequest = Body()) -> dict[str, Any]:
    _require_api_key()
    target = _target_lang(body.language)
    safe_diet = _safe_diet(body.diet)
    system_prompt = (
        "Expert Chef. Create a detailed recipe for the dish described by the user. "
        "Respond ONLY valid JSON object with schema: "
        '{ "title": "str", "description": "str", "prepTime": "str", "difficulty": "str", '
        '"nutrition": {"calories": num, "protein": "str", "fat": "str", "carbs": "str"}, '
        f'"ingredientsList": ["str"], "instructions": ["str"] }} in {target}. Diet: {safe_diet}.'
    )

    try:
        raw = await generate_text(
            contents=[{"parts": [{"text": f"Recipe for: {body.title}"}]}],
            system_instruction={"parts": [{"text": system_prompt}]},
            label="recipe-detail",
        )
        if not raw:
            raise HTTPException(status_code=502, detail="Empty response from AI model")
        parsed = json.loads(_clean_json_text(raw))
        return parsed if parsed else {}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("[/api/recipe-detail] Error: %s", exc)
        raise HTTPException(status_code=500, detail="Recipe detail request failed")


# ── Meal plan ────────────────────────────────────────────────────────────

@router.post("/meal-plan")
@limiter.limit("30/minute")
async def meal_plan(request: Request, body: MealPlanRequest = Body()) -> list[dict[str, Any]]:
    _require_api_key()
    target = _target_lang(body.language)
    safe_diet = _safe_diet(body.diet)
    diet_ctx = f"Diet: {safe_diet}." if safe_diet != "none" else ""
    prompt = (
        "Based on the dish described by the user, create a balanced 7-day meal plan. "
        "Return JSON array of 7 objects. "
        f'Schema: {{ "day": "Day Name", "breakfast": "Dish", "lunch": "Dish", "dinner": "Dish" }}. '
        f"Use {target}. {diet_ctx}"
    )

    try:
        raw = await generate_text(
            contents=[{"parts": [{"text": f"Dish: {body.title}"}]}],
            system_instruction={"parts": [{"text": prompt}]},
            generation_config={"responseMimeType": "application/json"},
            label="meal-plan",
        )
        parsed = json.loads(raw) if raw else []
        return parsed if isinstance(parsed, list) else []
    except Exception as exc:
        logger.error("[/api/meal-plan] Error: %s", exc)
        raise HTTPException(status_code=500, detail="Meal plan request failed")


# ── Drinks ───────────────────────────────────────────────────────────────

@router.post("/drinks")
@limiter.limit("30/minute")
async def drinks(request: Request, body: DrinksRequest = Body()) -> dict[str, Any]:
    _require_api_key()
    target = _target_lang(body.language)
    safe_diet = _safe_diet(body.diet)
    diet_ctx = f"Diet: {safe_diet}." if safe_diet != "none" else ""
    prompt = (
        f"Suggest drinks for the dish described by the user in {target}. {diet_ctx} "
        'JSON: {alcohol: "text", nonAlcohol: "text"}.'
    )

    try:
        raw = await generate_text(
            contents=[{"parts": [{"text": f"Dish: {body.title}"}]}],
            system_instruction={"parts": [{"text": prompt}]},
            generation_config={"responseMimeType": "application/json"},
            label="drinks",
        )
        return json.loads(raw) if raw else {}
    except Exception as exc:
        logger.error("[/api/drinks] Error: %s", exc)
        raise HTTPException(status_code=500, detail="Drinks request failed")


# ── Image generation ─────────────────────────────────────────────────────

@router.post("/image")
@limiter.limit("10/minute")
async def image(request: Request, body: ImageRequest = Body()) -> dict[str, Any]:
    _require_api_key()

    if not body.recipeTitle and not body.prompt:
        raise HTTPException(status_code=400, detail="recipeTitle or prompt is required")

    safe_title = sanitize_text(str(body.recipeTitle or ""))[:MAX_TITLE_LENGTH]
    final_prompt = (
        body.prompt[:MAX_PROMPT_LENGTH]
        if body.prompt
        else f"Gourmet cinematic food photography of {safe_title}, exquisite plating, professional lighting, 4k"
    )

    try:
        result = await generate_image(final_prompt)
        if result:
            return {"imageBase64": f"data:{result['mime']};base64,{result['base64']}"}
        return {"imageBase64": None}
    except Exception as exc:
        logger.error("[/api/image] Unhandled error for %r: %s", body.recipeTitle, exc)
        raise HTTPException(status_code=500, detail="Image request failed")
