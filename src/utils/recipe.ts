import type { Recipe } from '../types';

export const normalizeRecipeData = (raw: any, fallbackTitle = ''): Recipe | null => {
  if (!raw) return null;
  const data = raw?.recipe ? raw.recipe : raw;

  const cleanStr = (v: any): string => {
    if (v === undefined || v === null) return '';
    let result = '';
    if (typeof v === 'object') {
      result =
        v.text ||
        v.instruction ||
        v.name ||
        v.desc ||
        Object.values(v).find((val) => typeof val === 'string') ||
        '';
    } else {
      result = String(v);
    }
    return result
      .replace(/^step\s*\d+\s*:\s*/gi, '')
      .replace(/^\d+[\.\)]\s*/g, '')
      .trim();
  };

  const extractNum = (v: any): number => {
    if (v === undefined || v === null) return 0;
    const n = parseFloat(String(v).replace(/[^\d\.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };

  const findMacro = (...keys: string[]): string => {
    for (const key of keys) {
      const val = data?.nutrition?.[key] ?? data?.[key];
      if (val !== undefined && val !== null) {
        const s = cleanStr(val);
        if (s) return s;
      }
    }
    return '0';
  };

  const ingredientsListSource =
    Array.isArray(data?.ingredientsList) ? data.ingredientsList : Array.isArray(data?.ingredients) ? data.ingredients : [];
  const instructionsSource =
    Array.isArray(data?.instructions) ? data.instructions : Array.isArray(data?.steps) ? data.steps : [];

  return {
    title: cleanStr(data?.title) || fallbackTitle || 'Untitled Recipe',
    description: cleanStr(data?.description) || 'AI Chef Creation',
    prepTime: cleanStr(data?.prepTime || data?.time) || '30m',
    difficulty: cleanStr(data?.difficulty) || 'Normal',
    nutrition: {
      calories: extractNum(data?.nutrition?.calories ?? data?.nutrition?.kcal ?? data?.calories ?? data?.kcal ?? 0),
      protein: findMacro('protein', 'proteins', 'белки', 'белок'),
      fat: findMacro('fat', 'fats', 'жиры', 'жир'),
      carbs: findMacro('carbs', 'carbohydrates', 'углеводы', 'углевод'),
    },
    ingredientsList: (ingredientsListSource as any[]).map(cleanStr).filter((s) => s.length > 0),
    instructions: (instructionsSource as any[]).map(cleanStr).filter((s) => s.length > 0),
  };
};

export const legacyRecipeIdFromTitle = (title: string) => {
  const b64 = btoa(unescape(encodeURIComponent(title)));
  return b64.replace(/=+$/g, '');
};

export const safeRecipeIdFromTitle = (title: string) => {
  const legacy = legacyRecipeIdFromTitle(title);
  return legacy.replace(/\+/g, '-').replace(/\//g, '_');
};

export const recipeIdCandidatesFromTitle = (title: string) => {
  const legacy = legacyRecipeIdFromTitle(title);
  const safe = safeRecipeIdFromTitle(title);
  return safe === legacy ? [safe] : [safe, legacy];
};
