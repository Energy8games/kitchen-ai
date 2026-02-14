import { create } from 'zustand';
import type { DrinkSuggestion, MealPlanItem, Recipe } from '../types';
import { fetchDrinks, fetchImage, fetchMealPlan, fetchRecipeDetail, fetchRecipes } from '../lib/api';
import { normalizeRecipeData } from '../utils/recipe';
import { normalizeIngredient } from '../utils/ingredient';
import { useAppStore } from './useAppStore';

interface RecipeState {
  ingredients: string[];
  inputValue: string;

  isGenerating: boolean;
  isAiLoading: boolean;

  recipeSuggestions: Recipe[];
  recipe: Recipe | null;
  recipeImage: string | null;
  imageFailed: boolean;
  imageCache: Record<string, { data: string; timestamp: number }>;

  mealPlan: MealPlanItem[] | null;
  drinkSuggestion: DrinkSuggestion | null;

  currentStep: number;
  showCookingIngredients: boolean;

  addIngredient: (ing: string) => void;
  removeIngredient: (ing: string) => void;
  setInputValue: (value: string) => void;

  setRecipeSuggestions: (suggestions: Recipe[]) => void;
  setRecipe: (recipe: Recipe | null) => void;
  setRecipeImage: (image: string | null) => void;

  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setShowCookingIngredients: (show: boolean) => void;
  toggleCookingIngredients: () => void;

  generateRecipe: () => Promise<void>;
  selectRecipe: (raw: any, fallbackTitle?: string) => Promise<void>;
  generateMealPlan: () => Promise<void>;
  suggestDrinks: () => Promise<void>;
  handleMealClick: (mealTitle: string) => Promise<void>;

  resetRecipeView: () => void;
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  ingredients: [],
  inputValue: '',

  isGenerating: false,
  isAiLoading: false,

  recipeSuggestions: [],
  recipe: null,
  recipeImage: null,
  imageFailed: false,
  imageCache: {},

  mealPlan: null,
  drinkSuggestion: null,

  currentStep: 0,
  showCookingIngredients: false,

  addIngredient: (ing) => {
    const normalized = normalizeIngredient(ing);
    if (normalized && !get().ingredients.includes(normalized)) {
      set((s) => ({ ingredients: [...s.ingredients, normalized] }));
    }
    set({ inputValue: '' });
  },

  removeIngredient: (ing) => {
    set((s) => ({ ingredients: s.ingredients.filter((i) => i !== ing) }));
  },

  setInputValue: (inputValue) => set({ inputValue }),

  setRecipeSuggestions: (recipeSuggestions) => set({ recipeSuggestions }),
  setRecipe: (recipe) => set({ recipe }),
  setRecipeImage: (recipeImage) => set({ recipeImage }),

  setCurrentStep: (currentStep) => set({ currentStep }),
  nextStep: () => {
    const { recipe, currentStep } = get();
    if (recipe) {
      set({ currentStep: Math.min(currentStep + 1, recipe.instructions.length - 1) });
    }
  },
  prevStep: () => {
    set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) }));
  },
  setShowCookingIngredients: (showCookingIngredients) => set({ showCookingIngredients }),
  toggleCookingIngredients: () => set((s) => ({ showCookingIngredients: !s.showCookingIngredients })),

  generateRecipe: async () => {
    const { ingredients } = get();
    if (ingredients.length === 0) return;

    const { language, diet, setErrorState } = useAppStore.getState();

    set({
      isGenerating: true,
      recipeSuggestions: [],
      recipe: null,
      recipeImage: null,
      imageFailed: false,
      mealPlan: null,
      drinkSuggestion: null,
    });
    setErrorState(null);

    try {
      const normalized = await fetchRecipes(ingredients, language, diet);
      set({ recipeSuggestions: normalized.slice(0, 3), isGenerating: false });
    } catch {
      set({ isGenerating: false });
      setErrorState(language === 'ru' ? 'Не удалось создать рецепты.' : 'Failed to create recipes.');
    }
  },

  selectRecipe: async (raw, fallbackTitle = '') => {
    const r = normalizeRecipeData(raw, fallbackTitle) ?? (raw as Recipe);
    set({
      recipe: r,
      recipeImage: null,
      imageFailed: false,
      currentStep: 0,
      mealPlan: null,
      drinkSuggestion: null,
    });

    const { imageCache } = get();
    const cached = imageCache[r.title];
    if (cached && Date.now() - cached.timestamp < 60 * 60 * 1000) {
      set({ recipeImage: cached.data });
      return;
    }

    const imgPrompt = `Professional high-end food photo of ${r.title}, gourmet plating, studio lighting`;
    const dataUrl = await fetchImage(imgPrompt);
    if (dataUrl) {
      set((s) => ({
        recipeImage: dataUrl,
        imageCache: {
          ...s.imageCache,
          [r.title]: { data: dataUrl, timestamp: Date.now() },
        },
      }));
    } else {
      set({ imageFailed: true });
    }
  },

  generateMealPlan: async () => {
    const { recipe } = get();
    if (!recipe) return;

    const { language, diet } = useAppStore.getState();
    set({ isAiLoading: true });
    useAppStore.getState().setErrorState(null);

    try {
      const plan = await fetchMealPlan(recipe.title, language, diet);
      if (plan) set({ mealPlan: plan });
    } catch {
      // ignore
    } finally {
      set({ isAiLoading: false });
    }
  },

  suggestDrinks: async () => {
    const { recipe } = get();
    if (!recipe) return;

    const { language, diet } = useAppStore.getState();
    set({ isAiLoading: true });
    useAppStore.getState().setErrorState(null);

    try {
      const drinks = await fetchDrinks(recipe.title, language, diet);
      if (drinks) set({ drinkSuggestion: drinks });
    } catch {
      // ignore
    } finally {
      set({ isAiLoading: false });
    }
  },

  handleMealClick: async (mealTitle) => {
    if (!mealTitle) return;

    const { language, diet, setErrorState, setIsMealLoading } = useAppStore.getState();
    setIsMealLoading(true);
    setErrorState(null);

    try {
      const parsed = await fetchRecipeDetail(mealTitle, language, diet);
      if (parsed) await get().selectRecipe(parsed, mealTitle);
    } catch {
      setErrorState(language === 'ru' ? 'Не удалось загрузить рецепт.' : 'Failed to load recipe.');
    } finally {
      setIsMealLoading(false);
    }
  },

  resetRecipeView: () => {
    set({
      recipe: null,
      recipeSuggestions: [],
      mealPlan: null,
      drinkSuggestion: null,
    });
  },
}));
