import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import {
  ChefHat,
  X,
  Clock,
  Flame,
  Sparkles,
  RotateCcw,
  AlertCircle,
  Search,
  Heart,
  ChevronLeft,
  Mic,
  MicOff,
  Camera,
  ArrowRight,
  Wine,
  CalendarDays,
  Globe,
} from 'lucide-react';

declare const __firebase_config: string | undefined;
declare const __app_id: string | undefined;
declare const __initial_auth_token: string | undefined;

type Language = 'en' | 'ru';

// Dictionary of interface translations
const TRANSLATIONS: Record<Language, {
  heroTitle: string;
  heroAccent: string;
  heroDesc: string;
  searchPlaceholder: string;
  listening: string;
  addBtn: string;
  generateBtn: string;
  collection: string;
  favoritesEmpty: string;
  backBtn: string;
  visualizing: string;
  imgError: string;
  nutrition: {
    calories: string;
    protein: string;
    fat: string;
    carbs: string;
  };
  sections: {
    ingredients: string;
    steps: string;
    aiTools: string;
    mealPlan: string;
    drinks: string;
  };
  mealPlanTitle: string;
  drinksTitle: string;
  drinkAlcohol: string;
  drinkNonAlcohol: string;
  loadingSteps: {
    menu: string;
    visual: string;
    vision: string;
    ai: string;
  };
  errors: {
    general: string;
    vision: string;
    recipe: string;
    mealPlan: string;
    drinks: string;
  };
  commonIngredients: string[];
  homeBtn: string;
}> = {
  en: {
    heroTitle: 'Your personal',
    heroAccent: 'AI Chef is here',
    heroDesc:
      'Take a photo of your food or dictate a list. I will create a perfect recipe and calculate nutrition.',
    searchPlaceholder: "What's in the fridge?",
    listening: "I'm listening...",
    addBtn: 'Add',
    generateBtn: 'Start Cooking',
    collection: 'Collection',
    favoritesEmpty: 'Your recipe book is empty',
    backBtn: 'Back to products',
    visualizing: 'AI is drawing...',
    imgError: 'All image engines are currently busy. Try later.',
    nutrition: {
      calories: 'Kcal',
      protein: 'Protein',
      fat: 'Fat',
      carbs: 'Carbs',
    },
    sections: {
      ingredients: 'Ingredients',
      steps: 'Instructions',
      aiTools: "Chef's AI Recommendations",
      mealPlan: 'Meal Plan',
      drinks: 'Drinks',
    },
    mealPlanTitle: 'Weekly Meal Plan',
    drinksTitle: 'Sommelier Advice',
    drinkAlcohol: 'Alcoholic pair',
    drinkNonAlcohol: 'Non-alcoholic',
    loadingSteps: {
      menu: 'Chef is creating a menu...',
      visual: 'Visualizing the dish...',
      vision: 'Chef is scanning ingredients...',
      ai: 'Chef is analyzing data...',
    },
    errors: {
      general: 'Oops! Please try again.',
      vision: 'Photo analysis failed.',
      recipe: 'Could not create a recipe.',
      mealPlan: 'Could not create meal plan.',
      drinks: 'Could not suggest drinks.',
    },
    commonIngredients: [
      'Eggs',
      'Chicken',
      'Tomatoes',
      'Cheese',
      'Avocado',
      'Salmon',
      'Pasta',
      'Mushrooms',
      'Greens',
      'Cream',
    ],
    homeBtn: 'Home',
  },
  ru: {
    heroTitle: 'Ваш личный',
    heroAccent: 'AI-шеф на связи',
    heroDesc:
      'Сфотографируйте продукты или продиктуйте список. Я создам идеальный рецепт и рассчитаю КБЖУ.',
    searchPlaceholder: 'Что сегодня в холодильнике?',
    listening: 'Слушаю вас...',
    addBtn: 'Добавить',
    generateBtn: 'Начать готовку',
    collection: 'Коллекция',
    favoritesEmpty: 'Книга рецептов пуста',
    backBtn: 'Назад к продуктам',
    visualizing: 'ИИ рисует...',
    imgError: 'Все графические движки заняты. Попробуйте позже.',
    nutrition: {
      calories: 'Ккал',
      protein: 'Белки',
      fat: 'Жиры',
      carbs: 'Углеводы',
    },
    sections: {
      ingredients: 'Ингредиенты',
      steps: 'Инструкция',
      aiTools: 'Умные рекомендации шеф-повара',
      mealPlan: 'План питания',
      drinks: 'Напитки',
    },
    mealPlanTitle: 'Рацион на неделю',
    drinksTitle: 'Рекомендации сомелье',
    drinkAlcohol: 'С алкоголем',
    drinkNonAlcohol: 'Без алкоголя',
    loadingSteps: {
      menu: 'Шеф составляет меню...',
      visual: 'Визуализируем блюдо...',
      vision: 'Шеф распознает ингредиенты...',
      ai: 'Шеф анализирует данные...',
    },
    errors: {
      general: 'Упс! Попробуйте еще раз.',
      vision: 'Ошибка анализа фото.',
      recipe: 'Не удалось составить рецепт.',
      mealPlan: 'Не удалось составить план.',
      drinks: 'Не удалось подобрать напитки.',
    },
    commonIngredients: [
      'Яйца',
      'Курица',
      'Томаты',
      'Сыр',
      'Авокадо',
      'Лосось',
      'Паста',
      'Грибы',
      'Зелень',
      'Сливки',
    ],
    homeBtn: 'На главную',
  },
};

// Firebase Configuration with Safe Parsing
const getFirebaseConfig = () => {
  try {
    if (typeof __firebase_config !== 'undefined' && __firebase_config) {
      return JSON.parse(__firebase_config);
    }
  } catch (e) {
    console.error('Firebase config error', e);
  }
  return {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  };
};

const firebaseConfig = getFirebaseConfig();
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'kitchen-ai-pwa';
const apiBase = import.meta.env.VITE_API_BASE_URL || '';

// Функция запроса с экспоненциальной задержкой
const fetchWithRetry = async (
  url: string,
  options?: RequestInit,
  maxRetries = 5,
): Promise<any> => {
  let delay = 1000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return await response.json();
      if (response.status === 429 || response.status >= 500) {
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      return null;
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
};


type Nutrition = {
  calories: number;
  protein: string;
  fat: string;
  carbs: string;
};

type Recipe = {
  title: string;
  description: string;
  prepTime: string;
  difficulty: string;
  nutrition: Nutrition;
  ingredientsList: string[];
  instructions: string[];
};

type MealPlanItem = {
  day: string;
  meal: string;
};

type DrinkSuggestion = {
  alcohol: string;
  nonAlcohol: string;
};

type FavoriteRecipe = Recipe & {
  id?: string;
  image?: string | null;
  timestamp?: number;
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const t = TRANSLATIONS[language];

  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'favorites'>('home');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [recipeImage, setRecipeImage] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadStep, setLoadStep] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlanItem[] | null>(null);
  const [drinkSuggestion, setDrinkSuggestion] =
    useState<DrinkSuggestion | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredSuggestions = t.commonIngredients
    .filter((ing) => {
      if (ingredients.includes(ing)) return false;
      const trimmed = inputValue.trim().toLowerCase();
      if (!trimmed) return true;
      const parts = trimmed.split(/[\s,]+/).filter(Boolean);
      const lastWord = parts[parts.length - 1] || '';
      return ing.toLowerCase().startsWith(lastWord);
    })
    .slice(0, 10);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Auth error:', err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const favsRef = collection(
      db,
      'artifacts',
      appId,
      'users',
      user.uid,
      'favorites',
    );
    const unsubscribe = onSnapshot(
      favsRef,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as FavoriteRecipe[];
        setFavorites(list);
      },
      (err) => console.error('Firestore error:', err),
    );
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.lang = language === 'ru' ? 'ru-RU' : 'en-US';
      recognition.interimResults = true;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputValue(transcript);
        if (event.results[0].isFinal) {
          const splitBy =
            language === 'ru' ? /[,]| и /i : /[,]| and /i;
          const words = transcript
            .split(splitBy)
            .map((w: string) => w.trim())
            .filter((w: string) => w.length > 1);
          words.forEach((word: string) =>
            addIngredient(
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
            ),
          );
          setInputValue('');
        }
      };
    }
  }, [language]);

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setError(null);
      try {
        recognitionRef.current?.start();
      } catch (e) {
        setError(t.errors.general);
      }
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsAnalyzingImage(true);
    setError(null);
    setLoadStep(t.loadingSteps.vision);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = String(reader.result).split(',')[1];
        const response = await fetchWithRetry(`${apiBase}/api/vision`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type,
            language,
          }),
        });
        const found = response?.ingredients;
        if (Array.isArray(found)) {
          found.forEach((item: string) =>
            addIngredient(
              item.charAt(0).toUpperCase() + item.slice(1).toLowerCase(),
            ),
          );
        }
        setIsAnalyzingImage(false);
      };
    } catch (err) {
      setError(t.errors.vision);
      setIsAnalyzingImage(false);
    }
  };

  const addIngredient = (ing: string) => {
    const trimmed = typeof ing === 'string' ? ing.trim() : '';
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients((prev) => [...prev, trimmed]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeIngredient = (ing: string) => {
    setIngredients((prev) => prev.filter((i) => i !== ing));
  };

  const generateImageWithFallbacks = async (
    recipeTitle: string,
  ): Promise<string | null> => {
    setLoadStep(
      language === 'ru' ? 'Генерируем изображение...' : 'Generating image...'
    );
    try {
      const res = await fetchWithRetry(`${apiBase}/api/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeTitle, language }),
      });
      return res?.imageUrl || res?.imageDataUrl || null;
    } catch (e) {
      console.error('Image request failed.');
      return null;
    }
  };

  const generateRecipe = async () => {
    if (ingredients.length === 0) return;
    setIsGenerating(true);
    setError(null);
    setRecipe(null);
    setRecipeImage(null);
    setImageFailed(false);
    setMealPlan(null);
    setDrinkSuggestion(null);
    setLoadStep(t.loadingSteps.menu);

    try {
      const recipeData: Recipe = await fetchWithRetry(`${apiBase}/api/recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, language }),
      });
      if (!recipeData) throw new Error('Empty recipe');

      // Show the recipe immediately, then generate the image in the background.
      setRecipe(recipeData);
      setIsGenerating(false);

      generateImageWithFallbacks(recipeData.title)
        .then((imageUrl) => {
          if (imageUrl) {
            setRecipeImage(imageUrl);
          } else {
            setImageFailed(true);
          }
        })
        .catch(() => setImageFailed(true));
    } catch (err) {
      setError(t.errors.recipe);
      setIsGenerating(false);
    }
  };

  const generateMealPlan = async () => {
    if (!recipe) return;
    setIsAiLoading(true);
    setMealPlan(null);
    try {
      const plan = await fetchWithRetry(`${apiBase}/api/meal-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: recipe.title, language }),
      });
      setMealPlan(Array.isArray(plan) ? plan : null);
    } catch (e) {
      setError(t.errors.mealPlan);
    } finally {
      setIsAiLoading(false);
    }
  };

  const suggestDrinks = async () => {
    if (!recipe) return;
    setIsAiLoading(true);
    setDrinkSuggestion(null);
    try {
      const suggestion = await fetchWithRetry(`${apiBase}/api/drinks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: recipe.title, language }),
      });
      setDrinkSuggestion(suggestion || null);
    } catch (e) {
      setError(t.errors.drinks);
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleFavorite = async (
    recipeToSave: Recipe | FavoriteRecipe,
    image?: string | null,
  ) => {
    if (!user) return;
    const recipeId = btoa(
      unescape(encodeURIComponent(recipeToSave.title)),
    ).replace(/=/g, '');
    const docRef = doc(
      db,
      'artifacts',
      appId,
      'users',
      user.uid,
      'favorites',
      recipeId,
    );
    if (favorites.some((f) => f.id === recipeId)) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, {
        ...recipeToSave,
        image: image || null,
        timestamp: Date.now(),
      });
    }
  };

  const isCurrentRecipeFavorite =
    recipe &&
    favorites.some(
      (f) =>
        f.id ===
        btoa(unescape(encodeURIComponent(recipe.title))).replace(/=/g, ''),
    );

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-[#1A1A1A] font-sans selection:bg-emerald-100 pb-20">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.03] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              setView('home');
              setRecipe(null);
            }}
          >
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-12">
              <ChefHat size={20} />
            </div>
            <span className="text-sm font-black tracking-widest uppercase italic">
              Kitchen.AI
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setLanguage((l) => (l === 'ru' ? 'en' : 'ru'))
              }
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-black/[0.05] rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-100 transition-all mr-2"
            >
              <Globe size={12} /> {language === 'ru' ? 'RU' : 'EN'}
            </button>

            <button
              onClick={() => setView('favorites')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase transition-all ${
                view === 'favorites'
                  ? 'bg-[#1A1A1A] text-white shadow-xl'
                  : 'bg-white border border-black/[0.05] text-slate-500'
              }`}
            >
              <Heart
                size={14}
                className={view === 'favorites' ? 'fill-white' : ''}
              />
              {t.collection} ({favorites.length})
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8 md:py-16">
        {view === 'home' ? (
          <>
            {!recipe && !isGenerating && !isAnalyzingImage ? (
              <section className="text-center space-y-12 animate-in fade-in duration-1000">
                <div className="space-y-5">
                  <h1 className="text-4xl md:text-7xl font-medium tracking-tight leading-[1.1]">
                    {t.heroTitle} <br />{' '}
                    <span className="text-emerald-600 font-serif italic">
                      {t.heroAccent}
                    </span>
                  </h1>
                  <p className="text-slate-400 font-medium max-w-lg mx-auto text-sm md:text-lg">
                    {t.heroDesc}
                  </p>
                </div>

                <div
                  className="relative max-w-2xl mx-auto"
                  ref={suggestionsRef}
                >
                  <div
                    className={`bg-white rounded-[2.2rem] p-2 md:p-3 flex items-center shadow-[0_20px_70px_rgba(0,0,0,0.05)] border transition-all duration-500 ${
                      isListening
                        ? 'border-emerald-500 ring-4 md:ring-8 ring-emerald-50'
                        : 'border-black/[0.03]'
                    }`}
                  >
                    <div className="pl-5 pr-1 text-slate-300 shrink-0">
                      <Search size={22} />
                    </div>

                    <input
                      type="text"
                      placeholder={
                        isListening ? t.listening : t.searchPlaceholder
                      }
                      value={inputValue}
                      onFocus={() => setShowSuggestions(true)}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onKeyPress={(e) =>
                        e.key === 'Enter' && addIngredient(inputValue)
                      }
                      className="flex-1 py-4 px-4 bg-transparent outline-none text-base md:text-xl font-medium placeholder:text-slate-300 min-w-0"
                    />

                    <div className="flex items-center gap-2 pr-2 shrink-0 border-l border-black/[0.05] ml-3 pl-4">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-11 h-11 md:w-14 md:h-14 flex items-center justify-center rounded-full text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all shadow-sm shrink-0 active:scale-95"
                      >
                        <Camera size={22} />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                        capture="environment"
                      />
                      <button
                        onClick={toggleVoiceInput}
                        className={`w-11 h-11 md:w-14 md:h-14 flex items-center justify-center rounded-full transition-all shrink-0 active:scale-95 ${
                          isListening
                            ? 'bg-emerald-500 text-white shadow-lg'
                            : 'text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {isListening ? (
                          <Mic size={22} className="animate-pulse" />
                        ) : (
                          <MicOff size={22} />
                        )}
                      </button>
                    </div>
                  </div>

                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-4 bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/40 z-50 p-6 overflow-hidden animate-in slide-in-from-top-4 text-left text-xs font-bold text-slate-500">
                      <div className="flex flex-wrap gap-2">
                        {filteredSuggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => addIngredient(s)}
                            className="px-4 py-2 rounded-full border border-black/[0.03] bg-white hover:text-emerald-600 transition-all shadow-sm"
                          >
                            + {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  {ingredients.map((ing) => (
                    <div
                      key={ing}
                      className="bg-white border border-black/[0.02] text-slate-700 px-5 py-3 rounded-2xl text-[13px] font-bold flex items-center gap-3 shadow-sm animate-in zoom-in group"
                    >
                      {ing}
                      <X
                        size={14}
                        className="cursor-pointer text-slate-300 group-hover:text-rose-500 transition-colors"
                        onClick={() => removeIngredient(ing)}
                      />
                    </div>
                  ))}
                </div>

                {ingredients.length > 0 && (
                  <button
                    onClick={generateRecipe}
                    className="group bg-[#1A1A1A] text-white px-14 py-6 rounded-full font-bold text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-emerald-600 transition-all flex items-center gap-4 mx-auto active:scale-95"
                  >
                    {t.generateBtn}{' '}
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                )}
              </section>
            ) : isGenerating || isAnalyzingImage ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center space-y-10 animate-in fade-in">
                <div className="relative">
                  <div className="w-20 h-20 md:w-28 md:h-28 border-3 border-slate-100 border-t-emerald-600 rounded-full animate-spin" />
                  <Sparkles
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600/30"
                    size={30}
                  />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl md:text-3xl font-medium tracking-tight">
                    {loadStep}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">
                    Multi-Engine Rendering
                  </p>
                </div>
              </div>
            ) : (
              recipe && (
                <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
                  <button
                    onClick={() => setRecipe(null)}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-all"
                  >
                    <ChevronLeft size={16} /> {t.backBtn}
                  </button>

                  <div className="bg-white rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.03)] border border-black/[0.01]">
                    <div className="h-[400px] md:h-[750px] relative bg-slate-50 group overflow-hidden">
                      {recipeImage ? (
                        <img
                          src={recipeImage}
                          className="w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-110"
                          alt={recipe.title}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-emerald-600/30 px-10 text-center">
                          {imageFailed ? (
                            <div className="space-y-4 grayscale">
                              <Sparkles size={64} className="mx-auto text-slate-200" />
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-relaxed max-w-xs mx-auto">
                                {t.imgError}
                              </p>
                            </div>
                          ) : (
                            <>
                              <RotateCcw className="animate-spin" size={32} />
                              <span className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                {t.visualizing}
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      <div className="absolute top-8 left-8 flex flex-wrap gap-3">
                        <div className="bg-white/95 backdrop-blur-2xl px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-2xl border border-white/50">
                          <Clock size={16} className="text-emerald-600" />{' '}
                          {recipe.prepTime}
                        </div>
                        <div className="bg-white/95 backdrop-blur-2xl px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-2xl border border-white/50 text-rose-500">
                          <Flame size={16} /> {recipe.difficulty}
                        </div>
                      </div>

                      <button
                        onClick={() => toggleFavorite(recipe, recipeImage)}
                        className={`absolute top-8 right-8 w-14 h-14 md:w-16 md:h-16 rounded-[1.8rem] shadow-2xl backdrop-blur-2xl flex items-center justify-center transition-all active:scale-90 border border-white/50 ${
                          isCurrentRecipeFavorite
                            ? 'bg-rose-500 text-white'
                            : 'bg-white/95 text-slate-400 hover:text-rose-500'
                        }`}
                      >
                        <Heart
                          size={28}
                          className={
                            isCurrentRecipeFavorite ? 'fill-white' : ''
                          }
                        />
                      </button>
                    </div>

                    <div className="p-10 md:p-24 space-y-20">
                      <div className="max-w-4xl mx-auto space-y-8 text-center">
                        <h2 className="text-4xl md:text-8xl font-medium tracking-tighter leading-[1.05]">
                          {recipe.title}
                        </h2>
                        <p className="text-xl md:text-3xl text-slate-400 font-serif italic leading-relaxed">
                          « {recipe.description} »
                        </p>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto">
                        {[
                          {
                            l: t.nutrition.calories,
                            v: recipe.nutrition.calories,
                            c: 'text-emerald-600',
                          },
                          {
                            l: t.nutrition.protein,
                            v: recipe.nutrition.protein,
                            c: 'text-amber-600',
                          },
                          {
                            l: t.nutrition.fat,
                            v: recipe.nutrition.fat,
                            c: 'text-blue-600',
                          },
                          {
                            l: t.nutrition.carbs,
                            v: recipe.nutrition.carbs,
                            c: 'text-purple-600',
                          },
                        ].map((n, i) => (
                          <div
                            key={i}
                            className="bg-[#FBFBFC] p-6 md:p-10 rounded-[2.2rem] md:rounded-[3rem] text-center border border-black/[0.01] transition-transform hover:-translate-y-2"
                          >
                            <p className="text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-slate-300 mb-2 md:mb-4">
                              {n.l}
                            </p>
                            <p
                              className={`text-2xl md:text-4xl font-bold tracking-tighter ${n.c}`}
                            >
                              {n.v}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="grid lg:grid-cols-2 gap-20">
                        <div className="space-y-12 text-left">
                          <div className="flex items-center gap-5">
                            <div className="w-2 h-10 bg-emerald-600 rounded-full" />
                            <h3 className="text-3xl font-bold tracking-tight">
                              {t.sections.ingredients}
                            </h3>
                          </div>
                          <div className="space-y-4">
                            {recipe.ingredientsList.map((item, idx) => (
                              <div
                                key={idx}
                                className="bg-[#FBFBFC] p-5 rounded-2xl text-slate-600 font-medium text-base md:text-lg border border-black/[0.01] flex items-center gap-5 transition-colors hover:bg-emerald-50/30"
                              >
                                <div className="w-2 h-2 bg-emerald-500 rounded-full opacity-30" />
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-12 text-left">
                          <div className="flex items-center gap-5">
                            <div className="w-2 h-10 bg-[#1A1A1A] rounded-full" />
                            <h3 className="text-3xl font-bold tracking-tight">
                              {t.sections.steps}
                            </h3>
                          </div>
                          <div className="space-y-12 relative pl-6">
                            <div className="absolute left-10 top-10 bottom-10 w-[1px] bg-slate-100" />
                            {recipe.instructions.map((step, idx) => (
                              <div key={idx} className="flex gap-10 relative">
                                <span className="bg-white border border-black/[0.05] text-slate-400 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm relative z-10 transition-colors hover:bg-[#1A1A1A] hover:text-white">
                                  {idx + 1}
                                </span>
                                <p className="text-slate-500 font-medium text-lg md:text-2xl leading-relaxed">
                                  {step}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-20 border-t border-slate-100 space-y-12 text-center">
                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                          <button
                            onClick={generateMealPlan}
                            disabled={isAiLoading}
                            className="flex items-center justify-center gap-3 px-10 py-5 bg-white border border-slate-100 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-sm active:scale-95"
                          >
                            <CalendarDays
                              size={18}
                              className="text-emerald-600"
                            />{' '}
                            ✨ {t.sections.mealPlan}
                          </button>
                          <button
                            onClick={suggestDrinks}
                            disabled={isAiLoading}
                            className="flex items-center justify-center gap-3 px-10 py-5 bg-white border border-slate-100 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm active:scale-95"
                          >
                            <Wine
                              size={18}
                              className="text-rose-500"
                            />{' '}
                            ✨ {t.sections.drinks}
                          </button>
                        </div>
                        {isAiLoading && (
                          <div className="text-[10px] font-black uppercase text-slate-300 animate-pulse">
                            {t.loadingSteps.ai}
                          </div>
                        )}
                        {mealPlan && (
                          <div className="bg-emerald-50/30 rounded-[3rem] p-8 md:p-12 space-y-6 text-left animate-in slide-in-from-top-4 shadow-inner">
                            <h4 className="text-xl font-bold flex items-center gap-3 mb-6">
                              <CalendarDays className="text-emerald-600" />{' '}
                              {t.mealPlanTitle}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {mealPlan.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white/60 p-5 rounded-2xl flex items-center justify-between border border-emerald-100 shadow-sm transition-transform hover:scale-[1.02]"
                                >
                                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider w-20 shrink-0">
                                    {item.day}
                                  </span>
                                  <span className="font-bold text-sm text-slate-700 text-right">
                                    {item.meal}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {drinkSuggestion && (
                          <div className="bg-rose-50/30 rounded-[3rem] p-8 md:p-12 space-y-6 text-left animate-in slide-in-from-top-4 shadow-inner">
                            <h4 className="text-xl font-bold flex items-center gap-3 mb-6">
                              <Wine className="text-rose-500" /> {t.drinksTitle}
                            </h4>
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="bg-white/60 p-6 rounded-2xl border border-rose-100">
                                <p className="text-[9px] font-black uppercase text-rose-500 mb-2">
                                  {t.drinkAlcohol}
                                </p>
                                <p className="font-bold text-slate-700">
                                  {drinkSuggestion.alcohol}
                                </p>
                              </div>
                              <div className="bg-white/60 p-6 rounded-2xl border border-rose-100">
                                <p className="text-[9px] font-black uppercase text-rose-500 mb-2">
                                  {t.drinkNonAlcohol}
                                </p>
                                <p className="font-bold text-slate-700">
                                  {drinkSuggestion.nonAlcohol}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </>
        ) : (
          <div className="animate-in fade-in duration-500 space-y-12 px-2">
            <h2 className="text-4xl font-medium tracking-tight">
              {language === 'ru' ? 'Ваша' : 'Your'}{' '}
              <span className="italic font-serif text-emerald-600">
                {t.collection}
              </span>
            </h2>
            {favorites.length === 0 ? (
              <div className="h-[400px] flex flex-col items-center justify-center text-center opacity-20">
                <ChefHat size={80} strokeWidth={1} />
                <p className="mt-8 text-[11px] font-bold uppercase tracking-widest">
                  {t.favoritesEmpty}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {favorites.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white rounded-[2.5rem] overflow-hidden border border-black/[0.01] shadow-lg hover:shadow-2xl transition-all flex flex-col h-full group"
                  >
                    <div className="h-56 bg-slate-100 relative overflow-hidden">
                      {f.image && (
                        <img
                          src={f.image}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      )}
                      <button
                        onClick={() => toggleFavorite(f)}
                        className="absolute top-5 right-5 bg-rose-500 text-white p-3.5 rounded-2xl shadow-xl active:scale-90"
                      >
                        <Heart size={18} className="fill-white" />
                      </button>
                    </div>
                    <div className="p-8 space-y-6 flex flex-col flex-1 text-left">
                      <h4 className="font-bold text-xl tracking-tight line-clamp-2">
                        {f.title}
                      </h4>
                      <button
                        onClick={() => {
                          setRecipe(f);
                          setRecipeImage(f.image ?? null);
                          setView('home');
                        }}
                        className="mt-auto w-full py-4 bg-slate-50 text-slate-700 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
                      >
                        {language === 'ru' ? 'Открыть' : 'Open'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {error && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white px-10 py-6 rounded-3xl shadow-2xl flex items-center gap-5 z-[100] animate-in slide-in-from-bottom-12 mx-4 border border-white/5">
          <AlertCircle size={24} className="text-rose-500 shrink-0" />
          <p className="text-xs md:text-sm font-bold tracking-tight">{error}</p>
          <button
            onClick={() => setError(null)}
            className="p-2 hover:opacity-50 ml-auto"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
