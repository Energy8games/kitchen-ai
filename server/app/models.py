"""Pydantic models for request / response validation."""

from __future__ import annotations

import re
from typing import Optional

from pydantic import BaseModel, field_validator

from .config import (
    ALLOWED_MIME_TYPES,
    MAX_BASE64_LENGTH,
    MAX_INGREDIENTS,
    MAX_INGREDIENT_LENGTH,
    MAX_PROMPT_LENGTH,
    MAX_TITLE_LENGTH,
)

# ── Helpers ──────────────────────────────────────────────────────────────
_CONTROL_CHARS = re.compile(r"[\x00-\x1f\x7f]")


def sanitize_text(text: str) -> str:
    """Strip control characters and trim whitespace."""
    if not isinstance(text, str):
        return ""
    return _CONTROL_CHARS.sub("", text).strip()


# ── Request models ───────────────────────────────────────────────────────

class VisionRequest(BaseModel):
    imageBase64: str
    mimeType: str
    language: Optional[str] = "en"

    @field_validator("imageBase64")
    @classmethod
    def validate_base64(cls, v: str) -> str:
        if not isinstance(v, str) or len(v) > MAX_BASE64_LENGTH:
            raise ValueError("Image payload too large or invalid")
        return v

    @field_validator("mimeType")
    @classmethod
    def validate_mime(cls, v: str) -> str:
        if v not in ALLOWED_MIME_TYPES:
            raise ValueError("Unsupported image format")
        return v


class RecipeRequest(BaseModel):
    ingredients: list[str]
    language: Optional[str] = "en"

    @field_validator("ingredients")
    @classmethod
    def validate_ingredients(cls, v: list[str]) -> list[str]:
        if not v:
            raise ValueError("ingredients are required")
        if len(v) > MAX_INGREDIENTS:
            raise ValueError(f"Max {MAX_INGREDIENTS} ingredients allowed")
        cleaned = [
            sanitize_text(str(i))[:MAX_INGREDIENT_LENGTH]
            for i in v
            if sanitize_text(str(i))
        ]
        if not cleaned:
            raise ValueError("ingredients are required (non-empty)")
        return cleaned


class RecipesRequest(BaseModel):
    ingredients: list[str]
    language: Optional[str] = "en"
    diet: Optional[str] = "none"

    @field_validator("ingredients")
    @classmethod
    def validate_ingredients(cls, v: list[str]) -> list[str]:
        if not v:
            raise ValueError("ingredients are required")
        if len(v) > MAX_INGREDIENTS:
            raise ValueError(f"Max {MAX_INGREDIENTS} ingredients allowed")
        cleaned = [
            sanitize_text(str(i))[:MAX_INGREDIENT_LENGTH]
            for i in v
            if sanitize_text(str(i))
        ]
        if not cleaned:
            raise ValueError("ingredients are required (non-empty)")
        return cleaned


class RecipeDetailRequest(BaseModel):
    title: str
    language: Optional[str] = "en"
    diet: Optional[str] = "none"

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        t = sanitize_text(v)
        if not t or len(t) > MAX_TITLE_LENGTH:
            raise ValueError(f"title is required (max {MAX_TITLE_LENGTH} chars)")
        return t


class MealPlanRequest(BaseModel):
    title: str
    language: Optional[str] = "en"
    diet: Optional[str] = "none"

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        t = sanitize_text(v)
        if not t or len(t) > MAX_TITLE_LENGTH:
            raise ValueError(f"title is required (max {MAX_TITLE_LENGTH} chars)")
        return t


class DrinksRequest(BaseModel):
    title: str
    language: Optional[str] = "en"
    diet: Optional[str] = "none"

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        t = sanitize_text(v)
        if not t or len(t) > MAX_TITLE_LENGTH:
            raise ValueError(f"title is required (max {MAX_TITLE_LENGTH} chars)")
        return t


class ImageRequest(BaseModel):
    recipeTitle: Optional[str] = None
    prompt: Optional[str] = None

    @field_validator("prompt")
    @classmethod
    def validate_prompt(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return sanitize_text(str(v))[:MAX_PROMPT_LENGTH]
        return v

    @field_validator("recipeTitle")
    @classmethod
    def validate_recipe_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return sanitize_text(str(v))[:MAX_TITLE_LENGTH]
        return v


# ── Response models (for documentation) ─────────────────────────────────

class Nutrition(BaseModel):
    calories: int | float
    protein: str
    fat: str
    carbs: str


class Recipe(BaseModel):
    title: str
    description: str
    prepTime: str
    difficulty: str
    nutrition: Nutrition
    ingredientsList: list[str]
    instructions: list[str]


class MealPlanItem(BaseModel):
    day: str
    breakfast: str
    lunch: str
    dinner: str


class DrinkSuggestion(BaseModel):
    alcohol: Optional[str] = None
    nonAlcohol: Optional[str] = None


class HealthMemory(BaseModel):
    rss: str
    vms: str


class HealthResponse(BaseModel):
    ok: bool
    memory: HealthMemory
