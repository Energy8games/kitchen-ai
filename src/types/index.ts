declare global {
  interface Window {
    __firebase_config?: string;
    __app_id?: string;
    __initial_auth_token?: string;
  }
}

export type Language = 'ru' | 'en';
export type Diet = 'none' | 'vegan' | 'keto' | 'glutenFree';

export type Recipe = {
  title: string;
  description: string;
  prepTime: string;
  difficulty: string;
  nutrition: { calories: number; protein: string; fat: string; carbs: string };
  ingredientsList: string[];
  instructions: string[];
};

export type FavoriteRecipe = Recipe & {
  id?: string;
  timestamp?: number;
  image?: string | null;
};

export type MealPlanItem = {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
};

export type DrinkSuggestion = {
  alcohol?: string;
  nonAlcohol?: string;
};
