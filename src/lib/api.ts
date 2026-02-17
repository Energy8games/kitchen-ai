import type { Diet, DrinkSuggestion, Language, MealPlanItem, Recipe } from '../types';
import { normalizeRecipeData } from '../utils/recipe';

const apiBaseUrl: string = (import.meta as any).env?.VITE_API_BASE_URL || '';

export const apiUrl = (path: string) => {
  const base = String(apiBaseUrl || '').trim();
  if (!base) return path;
  return `${base.replace(/\/$/g, '')}${path}`;
};

export const fetchRecipes = async (
  ingredients: string[],
  language: Language,
  diet: Diet,
): Promise<Recipe[]> => {
  const res = await fetch(apiUrl('/api/recipes'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients, language, diet }),
  });
  const parsed = await res.json().catch(() => ([] as any));
  const suggestionsAny: any[] = Array.isArray(parsed) ? parsed : [parsed];
  return suggestionsAny
    .map((x) => normalizeRecipeData(x))
    .filter(Boolean) as Recipe[];
};

export const fetchRecipeDetail = async (
  title: string,
  language: Language,
  diet: Diet,
): Promise<any> => {
  const res = await fetch(apiUrl('/api/recipe-detail'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, language, diet }),
  });
  return res.json().catch(() => null);
};

export const fetchMealPlan = async (
  title: string,
  language: Language,
  diet: Diet,
): Promise<MealPlanItem[] | null> => {
  const res = await fetch(apiUrl('/api/meal-plan'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, language, diet }),
  });
  const parsed = await res.json().catch(() => ([] as any));
  return Array.isArray(parsed) ? (parsed as MealPlanItem[]) : null;
};

export const fetchDrinks = async (
  title: string,
  language: Language,
  diet: Diet,
): Promise<DrinkSuggestion | null> => {
  const res = await fetch(apiUrl('/api/drinks'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, language, diet }),
  });
  return res.json().catch(() => null) as Promise<DrinkSuggestion | null>;
};

export const fetchVision = async (
  imageBase64: string,
  mimeType: string,
  language: Language,
): Promise<string[]> => {
  const res = await fetch(apiUrl('/api/vision'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, language }),
  });
  const data = await res.json().catch(() => ({}));
  return Array.isArray(data?.ingredients) ? data.ingredients : [];
};

export const fetchImage = async (prompt: string): Promise<string | null> => {
  try {
    const res = await fetch(apiUrl('/api/image'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json().catch(() => ({}));
    const imageBase64 = data?.imageBase64;
    if (typeof imageBase64 === 'string' && imageBase64.startsWith('data:image/')) return imageBase64;
  } catch {
    // ignore
  }
  return null;
};
