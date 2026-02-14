import React, { useCallback, useEffect, useRef, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  OAuthProvider,
  signOut,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocsFromServer,
  getFirestore,
  initializeFirestore,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Dna,
  Droplets,
  Eye,
  Flame,
  Globe,
  Heart,
  LayoutGrid,
  List,
  LogOut,
  Loader2,
  Mic,
  MicOff,
  Moon,
  Plus,
  Play,
  RotateCcw,
  Scan,
  Search,
  Sparkles,
  StopCircle,
  Sun,
  Utensils,
  User as UserIcon,
  Wine,
  ExternalLink,
  X,
  Zap,
} from 'lucide-react';

declare global {
  interface Window {
    __firebase_config?: string;
    __app_id?: string;
    __initial_auth_token?: string;
  }
}

type Language = 'ru' | 'en';
type Diet = 'none' | 'vegan' | 'keto' | 'glutenFree';

// --- MEGA INGREDIENT DATABASE ---
const MEGA_INGREDIENTS: Record<Language, string[]> = {
  ru: [
    'Авокадо',
    'Абрикос',
    'Аджика',
    'Айсберг',
    'Анис',
    'Анчоусы',
    'Апельсин',
    'Арахис',
    'Арбуз',
    'Артишок',
    'Баклажан',
    'Базилик',
    'Бальзамический уксус',
    'Бамия',
    'Банан',
    'Баранина',
    'Барбарис',
    'Батат',
    'Бекон',
    'Белое вино',
    'Белые грибы',
    'Брокколи',
    'Брусника',
    'Булгур',
    'Буженина',
    'Ваниль',
    'Васаби',
    'Ветчина',
    'Виноград',
    'Вишня',
    'Вода',
    'Водоросли нори',
    'Вустерширский соус',
    'Гарам масала',
    'Гвоздика',
    'Герань',
    'Говядина',
    'Голубика',
    'Горох',
    'Горчица',
    'Горчичный порошок',
    'Гранатовый соус',
    'Грейпфрут',
    'Гречка',
    'Грибы',
    'Грудинка',
    'Груша',
    'Дайкон',
    'Дрожжи',
    'Дыня',
    'Ежевика',
    'Зеленый горошек',
    'Зеленый лук',
    'Зеленый чай',
    'Зелень',
    'Зира',
    'Изиум',
    'Имбирь',
    'Индейка',
    'Инжир',
    'Йогурт',
    'Кабачок',
    'Какао',
    'Кальмары',
    'Камбала',
    'Каперсы',
    'Капуста',
    'Кардамон',
    'Карри',
    'Картофель',
    'Квас',
    'Кедровые орехи',
    'Кешью',
    'Кетчуп',
    'Кинза',
    'Киноа',
    'Киви',
    'Кленовый сироп',
    'Клубника',
    'Клюква',
    'Кокосовое молоко',
    'Кокосовая стружка',
    'Колбаса',
    'Кориандр',
    'Корица',
    'Корнишоны',
    'Кофе',
    'Краб',
    'Крахмал',
    'Креветки',
    'Кролик',
    'Крупа манная',
    'Кукуруза',
    'Кумин',
    'Кунжут',
    'Кунжутное масло',
    'Курага',
    'Курица',
    'Куркума',
    'Кускус',
    'Лавровый лист',
    'Лайм',
    'Лемонграсс',
    'Лимон',
    'Лисички',
    'Лосось',
    'Лук белый',
    'Лук красный',
    'Лук порей',
    'Лук репчатый',
    'Лук шалот',
    'Майоран',
    'Майонез',
    'Макароны',
    'Малина',
    'Манго',
    'Мандарин',
    'Маргарин',
    'Маринад',
    'Маслины',
    'Масло оливковое',
    'Масло подсолнечное',
    'Масло сливочное',
    'Масло топленое',
    'Мед',
    'Мидии',
    'Миндаль',
    'Минтай',
    'Мисо паста',
    'Молоко',
    'Молоко сгущенное',
    'Морковь',
    'Морская капуста',
    'Морская соль',
    'Мука пшеничная',
    'Мука ржаная',
    'Мускатный орех',
    'Мята',
    'Наршараб',
    'Нут',
    'Облепиха',
    'Овсяные хлопья',
    'Огурец',
    'Окунь',
    'Оливки',
    'Оливковое масло',
    'Орегано',
    'Орехи',
    'Осетрина',
    'Отруби',
    'Палтус',
    'Паприка',
    'Пармезан',
    'Пастернак',
    'Паста',
    'Патиссон',
    'Пекинская капуста',
    'Перепелиные яйца',
    'Перец болгарский',
    'Перец душистый',
    'Перец красный (чили)',
    'Перец черный ко горошком',
    'Перловка',
    'Персик',
    'Петрушка',
    'Печень говяжья',
    'Печень куриная',
    'Печень трески',
    'Пиво',
    'Помидор',
    'Помидоры черри',
    'Проростки пшеницы',
    'Простокваша',
    'Пшено',
    'Раки',
    'Рапсовое масло',
    'Ревень',
    'Редис',
    'Редька',
    'Репа',
    'Рис белый',
    'Рис бурый',
    'Рис дикий',
    'Розмарин',
    'Ром',
    'Рукола',
    'Рыба',
    'Рябина',
    'Ряженка',
    'Салат латук',
    'Сало',
    'Сахар',
    'Сахарная пудра',
    'Свекла',
    'Свинина',
    'Сгущенка',
    'Сельдерей',
    'Сельдь',
    'Семечки подсолнуха',
    'Семга',
    'Сироп',
    'Скумбрия',
    'Слива',
    'Сливки',
    'Сливочное масло',
    'Сметана',
    'Сода',
    'Соевое молоко',
    'Соевый соус',
    'Соль',
    'Солодка',
    'Сом',
    'Соус табаско',
    'Соус тартар',
    'Соус томатный',
    'Спаржа',
    'Сыр гауда',
    'Сыр моцарелла',
    'Сыр рикотта',
    'Сыр фета',
    'Сыр чеддер',
    'Тархун',
    'Творог',
    'Телятина',
    'Тимьян',
    'Тмин',
    'Томатная паста',
    'Топинамбур',
    'Треска',
    'Трюфельное масло',
    'Тунец',
    'Тыква',
    'Тыквенные семечки',
    'Уксус',
    'Укроп',
    'Устрицы',
    'Утка',
    'Фасоль белая',
    'Фасоль красная',
    'Фасоль стручковая',
    'Фенхель',
    'Финики',
    'Фисташки',
    'Форель',
    'Фундук',
    'Халва',
    'Хамон',
    'Хлеб пшеничный',
    'Хлеб ржаной',
    'Хлопья кукурузные',
    'Хмель-сунели',
    'Хрен',
    'Хурма',
    'Цветная капуста',
    'Цедра лимона',
    'Цукини',
    'Цыпленок',
    'Чай черный',
    'Чеддер',
    'Черемуха',
    'Черешня',
    'Черная смородина',
    'Черника',
    'Чернослив',
    'Черный перец',
    'Чеснок',
    'Чечевица',
    'Чиа семена',
    'Шампиньоны',
    'Шалфей',
    'Шафран',
    'Шиповник',
    'Шпинат',
    'Шпроты',
    'Щука',
    'Эстрагон',
    'Яблоки',
    'Ягнятина',
    'Ягода',
    'Яйцо куриное',
    'Яйцо перепелиное',
    'Ячмень',
  ],
  en: [
    'Apple',
    'Apricot',
    'Artichoke',
    'Arugula',
    'Asparagus',
    'Avocado',
    'Almonds',
    'Anchovies',
    'Anise',
    'Bacon',
    'Balsamic vinegar',
    'Banana',
    'Barley',
    'Basil',
    'Bay leaf',
    'Beans',
    'Beef',
    'Beer',
    'Beetroot',
    'Bell pepper',
    'Black pepper',
    'Blackberries',
    'Blueberries',
    'Bread',
    'Broccoli',
    'Brown rice',
    'Brussels sprouts',
    'Buckwheat',
    'Butter',
    'Cabbage',
    'Cantaloupe',
    'Capers',
    'Caraway',
    'Cardamom',
    'Carrot',
    'Cashews',
    'Cauliflower',
    'Celery',
    'Cheddar',
    'Cheese',
    'Cherry',
    'Chia seeds',
    'Chicken',
    'Chickpeas',
    'Chili pepper',
    'Chives',
    'Chocolate',
    'Cilantro',
    'Cinnamon',
    'Clams',
    'Cloves',
    'Coconut milk',
    'Cod',
    'Coffee',
    'Coriander',
    'Corn',
    'Couscous',
    'Crab',
    'Cranberries',
    'Cream',
    'Cucumber',
    'Cumin',
    'Currants',
    'Curry',
    'Dates',
    'Dill',
    'Duck',
    'Eggplant',
    'Eggs',
    'Endive',
    'Fennel',
    'Fenugreek',
    'Feta',
    'Figs',
    'Fish',
    'Flax seeds',
    'Flour',
    'Garlic',
    'Ginger',
    'Goat cheese',
    'Goose',
    'Grapes',
    'Green beans',
    'Green tea',
    'Ground beef',
    'Guava',
    'Halibut',
    'Ham',
    'Hazelnuts',
    'Honey',
    'Horseradish',
    'Hummus',
    'Iceberg lettuce',
    'Icing sugar',
    'Jalapeno',
    'Jasmine rice',
    'Kale',
    'Ketchup',
    'Kidney beans',
    'Kiwi',
    'Kohlrabi',
    'Lamb',
    'Lard',
    'Lavender',
    'Leek',
    'Lemon',
    'Lemongrass',
    'Lentils',
    'Lettuce',
    'Lime',
    'Lobster',
    'Lotus root',
    'Macadamia nuts',
    'Mackerel',
    'Mango',
    'Maple syrup',
    'Marjoram',
    'Marshmallows',
    'Mayonnaise',
    'Milk',
    'Mint',
    'Miso paste',
    'Molasses',
    'Mozzarella',
    'Mushrooms',
    'Mussels',
    'Mustard',
    'Mutton',
    'Nectarine',
    'Nori',
    'Nutmeg',
    'Oatmeal',
    'Oats',
    'Olive oil',
    'Olives',
    'Onion',
    'Orange',
    'Oregano',
    'Oysters',
    'Paprika',
    'Parmesan',
    'Parsley',
    'Parsnip',
    'Pasta',
    'Peach',
    'Peanuts',
    'Pear',
    'Peas',
    'Pecans',
    'Pesto',
    'Pickles',
    'Pine nuts',
    'Pineapple',
    'Pistachios',
    'Plum',
    'Pomegranate',
    'Pork',
    'Potato',
    'Prawns',
    'Pumpkin',
    'Quail eggs',
    'Quince',
    'Quinoa',
    'Radish',
    'Raisins',
    'Raspberries',
    'Red cabbage',
    'Red onion',
    'Red wine',
    'Rhubarb',
    'Ribs',
    'Rice',
    'Ricotta',
    'Roast beef',
    'Rosemary',
    'Rum',
    'Saffron',
    'Sage',
    'Salmon',
    'Salt',
    'Sardines',
    'Sausage',
    'Scallops',
    'Sea salt',
    'Seaweed',
    'Sesame oil',
    'Sesame seeds',
    'Shallot',
    'Shrimp',
    'Smoked salmon',
    'Snow peas',
    'Sour cream',
    'Soy milk',
    'Soy sauce',
    'Soybeans',
    'Spinach',
    'Squash',
    'Squid',
    'Star anise',
    'Steak',
    'Strawberries',
    'Sugar',
    'Sunflower oil',
    'Sunflower seeds',
    'Sweet potato',
    'Swiss cheese',
    'Tabasco',
    'Tahini',
    'Tamarind',
    'Tarragon',
    'Tea',
    'Thyme',
    'Tofu',
    'Tomato',
    'Tomato paste',
    'Trout',
    'Truffle oil',
    'Tuna',
    'Turkey',
    'Turmeric',
    'Turnip',
    'Vanilla',
    'Veal',
    'Venison',
    'Vinegar',
    'Walnuts',
    'Wasabi',
    'Water',
    'Watercress',
    'Watermelon',
    'Wheat',
    'White rice',
    'White wine',
    'Worcestershire sauce',
    'Yeast',
    'Yellow onion',
    'Yogurt',
    'Zucchini',
  ],
};

// --- TRANSLATIONS ---
const TRANSLATIONS = {
  en: {
    heroTitle: 'Your AI',
    heroAccent: 'Culinary Vision',
    heroDesc: 'Scan ingredients, dictate lists, and cook like a Michelin chef with real-time AI guidance.',
    searchPlaceholder: 'Search or add ingredients...',
    suggestionsHeader: 'Suggestions',
    startScanning: 'Live Scanner',
    stopScanning: 'Stop',
    scanningActive: 'Chef is watching...',
    addBtn: 'Add',
    generateBtn: 'Create Recipe',
    startCooking: 'Start Cooking',
    stopCooking: 'Finish',
    nextStepLabel: 'Next',
    prevStepLabel: 'Back',
    collection: 'Collection',
    favoritesEmpty: 'Your collection is empty',
    backBtn: 'Back',
    backToResults: 'Back to choices',
    chooseTitle: "Chef's Recommendations",
    visualizing: 'AI is plating the dish...',
    imgError: 'Visuals busy. Focus on the taste!',
    imgKeyError: 'API key missing.',
    analyzing: 'Analyzing...',
    mealPlanTitle: 'Weekly Meal Plan',
    drinksTitle: 'Sommelier Advice',
    authTitle: 'Profile',
    signOut: 'Sign out',
    welcome: 'Welcome',
    anonymousUser: 'Guest',
    loadingMeal: 'Chef is drafting the recipe...',
    showIngredients: 'Ingredients',
    hideIngredients: 'Hide',
    meals: { morning: 'Breakfast', day: 'Lunch', evening: 'Dinner' },
    nutrition: { calories: 'Kcal', protein: 'Protein', fat: 'Fat', carbs: 'Carbs' },
    sections: { ingredients: 'Ingredients', steps: 'Method', aiTools: "Chef's Insights", mealPlan: 'Meal Plan', drinks: 'Sommelier' },
    settings: { title: 'Dietary Profile', none: 'Standard', vegan: 'Vegan', keto: 'Keto', glutenFree: 'Gluten Free' },
    dietBtn: 'Diet',
    homeBtn: 'Home',
  },
  ru: {
    heroTitle: 'Ваш личный',
    heroAccent: 'AI-Сканер',
    heroDesc: 'Наведите камеру на продукты. ИИ узнает их в реальном времени и создаст изысканный рецепт.',
    searchPlaceholder: 'Ищите или добавляйте продукты...',
    suggestionsHeader: 'Подходящие продукты',
    startScanning: 'Живой сканер',
    stopScanning: 'Стоп',
    scanningActive: 'Шеф смотрит...',
    addBtn: 'Добавить',
    generateBtn: 'Создать шедевр',
    startCooking: 'Начать готовить',
    stopCooking: 'Завершить',
    nextStepLabel: 'Далее',
    prevStepLabel: 'Назад',
    collection: 'Мои рецепты',
    favoritesEmpty: 'Ваша книга пуста',
    backBtn: 'Назад',
    backToResults: 'К выбору блюд',
    chooseTitle: 'Рекомендации шефа',
    visualizing: 'Шеф украшает блюдо...',
    imgError: 'Движок занят. Главное — вкус!',
    imgKeyError: 'Ключ не найден.',
    analyzing: 'Анализ...',
    mealPlanTitle: 'Рацион на неделю',
    drinksTitle: 'Рекомендации сомелье',
    authTitle: 'Ваш профиль',
    signOut: 'Выйти',
    welcome: 'Привет',
    anonymousUser: 'Гость',
    loadingMeal: 'Шеф уже в процессе...',
    showIngredients: 'Состав',
    hideIngredients: 'Скрыть состав',
    meals: { morning: 'Завтрак', day: 'Обед', evening: 'Ужин' },
    nutrition: { calories: 'Ккал', protein: 'Белки', fat: 'Жиры', carbs: 'Углеводы' },
    sections: { ingredients: 'Состав', steps: 'Инструкция', aiTools: 'Советы шефа', mealPlan: 'План питания', drinks: 'Напитки' },
    settings: { title: 'Диета', none: 'Обычная', vegan: 'Веган', keto: 'Кето', glutenFree: 'Без глютена' },
    dietBtn: 'Диета',
    homeBtn: 'Главная',
  },
} as const;

type Recipe = {
  title: string;
  description: string;
  prepTime: string;
  difficulty: string;
  nutrition: { calories: number; protein: string; fat: string; carbs: string };
  ingredientsList: string[];
  instructions: string[];
};

type FavoriteRecipe = Recipe & {
  id?: string;
  timestamp?: number;
  image?: string | null;
};

type MealPlanItem = { day: string; breakfast: string; lunch: string; dinner: string };

type DrinkSuggestion = {
  alcohol?: string;
  nonAlcohol?: string;
};

// --- FIREBASE CONFIG ---
const getFirebaseConfig = () => {
  try {
    if (typeof window.__firebase_config === 'string' && window.__firebase_config) {
      return JSON.parse(window.__firebase_config);
    }
  } catch (e) {
    console.error('Config error', e);
  }
  return { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' };
};

const firebaseConfig = getFirebaseConfig();
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = (() => {
  // Some networks/browsers block Firestore's default transport and cause `unavailable`.
  // Force long-polling to maximize compatibility (esp. iOS/WebView/strict proxies).
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      useFetchStreams: false,
    } as any);
  } catch {
    return getFirestore(app);
  }
})();
const appId =
  (typeof window.__app_id === 'string' && window.__app_id ? window.__app_id : '') ||
  (typeof (firebaseConfig as any)?.projectId === 'string' ? (firebaseConfig as any).projectId : '') ||
  '';

const apiBaseUrl: string = (import.meta as any).env?.VITE_API_BASE_URL || '';
const apiUrl = (path: string) => {
  const base = String(apiBaseUrl || '').trim();
  if (!base) return path;
  return `${base.replace(/\/$/g, '')}${path}`;
};

const normalizeIngredient = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

const legacyRecipeIdFromTitle = (title: string) => {
  const b64 = btoa(unescape(encodeURIComponent(title)));
  return b64.replace(/=+$/g, '');
};

const safeRecipeIdFromTitle = (title: string) => {
  const legacy = legacyRecipeIdFromTitle(title);
  return legacy.replace(/\+/g, '-').replace(/\//g, '_');
};

const recipeIdCandidatesFromTitle = (title: string) => {
  const legacy = legacyRecipeIdFromTitle(title);
  const safe = safeRecipeIdFromTitle(title);
  return safe === legacy ? [safe] : [safe, legacy];
};

const compressImage = async (base64Str: string): Promise<string> => {
  return await new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => resolve(base64Str);
  });
};

const normalizeRecipeData = (raw: any, fallbackTitle = ''): Recipe | null => {
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

const attemptImageGeneration = async (prompt: string): Promise<string | null> => {
  try {
    const res = await fetch(apiUrl('/api/image'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json().catch(() => ({}));
    const imageBase64 = data?.imageBase64;
    if (typeof imageBase64 === 'string' && imageBase64.startsWith('data:image/')) return imageBase64;
    const imageUrl = data?.imageUrl;
    if (typeof imageUrl === 'string' && imageUrl.length > 0) return imageUrl;
  } catch {
    // ignore
  }
  return null;
};

const App: React.FC = () => {
  const debugEnabled =
    typeof window !== 'undefined' &&
    (() => {
      try {
        return new URLSearchParams(window.location.search).has('debug');
      } catch {
        return false;
      }
    })();

  const [language, setLanguage] = useState<Language>('ru');
  const [diet, setDiet] = useState<Diet>('none');
  const [showSettings, setShowSettings] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const t = TRANSLATIONS[language];

  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'favorites' | 'cooking'>('home');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isMealLoading, setIsMealLoading] = useState(false);

  const [recipeSuggestions, setRecipeSuggestions] = useState<Recipe[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [recipeImage, setRecipeImage] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [imageCache, setImageCache] = useState<Record<string, { data: string; timestamp: number }>>({});

  const [mealPlan, setMealPlan] = useState<MealPlanItem[] | null>(null);
  const [drinkSuggestion, setDrinkSuggestion] = useState<DrinkSuggestion | null>(null);
  const [showCookingIngredients, setShowCookingIngredients] = useState(false);

  const [guestFavorites, setGuestFavorites] = useState<FavoriteRecipe[]>([]);
  const [cloudFavorites, setCloudFavorites] = useState<FavoriteRecipe[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const [debugServerFavoritesCount, setDebugServerFavoritesCount] = useState<number | null>(null);
  const [debugServerFavoritesError, setDebugServerFavoritesError] = useState<string | null>(null);
  const [debugLastFavoritesWriteError, setDebugLastFavoritesWriteError] = useState<string | null>(null);
  const [debugProbeResult, setDebugProbeResult] = useState<string | null>(null);
  const [debugChannelProbeResult, setDebugChannelProbeResult] = useState<string | null>(null);
  const [debugRestListResult, setDebugRestListResult] = useState<string | null>(null);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isScanningAI, setIsScanningAI] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scannerInterval = useRef<number | null>(null);
  const recognitionRef = useRef<any | null>(null);
  const suggestionsBoxRef = useRef<HTMLDivElement | null>(null);
  const didSetPersistenceRef = useRef(false);
  const lastAccountUidRef = useRef<string | null>(null);
  const cloudFavoritesRef = useRef<FavoriteRecipe[]>([]);
  const isScanningAIRef = useRef(false);
  const ingredientsRef = useRef<string[]>([]);

  // Prefer auth.currentUser as the source of truth to avoid stale React state.
  const effectiveUser = auth.currentUser ?? user;
  const isAccountUser = !!effectiveUser && !effectiveUser.isAnonymous;

  // If auth momentarily reports null (rare), don't flip UI to guest and hide favorites.
  const shouldPreferCloud = isAccountUser || (!!lastAccountUidRef.current && !effectiveUser);
  const favorites = shouldPreferCloud ? cloudFavorites : guestFavorites;

  useEffect(() => {
    if (isAccountUser && effectiveUser?.uid) lastAccountUidRef.current = effectiveUser.uid;
  }, [isAccountUser, (effectiveUser as any)?.uid]);

  useEffect(() => {
    cloudFavoritesRef.current = cloudFavorites;
  }, [cloudFavorites]);

  // Keep refs in sync for interval/event-handler closures
  useEffect(() => {
    isScanningAIRef.current = isScanningAI;
  }, [isScanningAI]);

  useEffect(() => {
    ingredientsRef.current = ingredients;
  }, [ingredients]);

  // --- SUGGESTIONS LOGIC ---
  useEffect(() => {
    if (inputValue.trim().length > 0) {
      const query = inputValue.trim().toLowerCase();
      const filtered = MEGA_INGREDIENTS[language]
        .filter((item) => item.toLowerCase().startsWith(query) && !ingredients.includes(item))
        .sort((a, b) => a.localeCompare(b));
      setSuggestions(filtered.slice(0, 40));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, ingredients, language]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (suggestionsBoxRef.current && !suggestionsBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // --- UI HELPERS ---
  const addIngredient = (ing: string) => {
    const normalized = normalizeIngredient(ing);
    if (normalized && !ingredients.includes(normalized)) {
      setIngredients((prev) => [...prev, normalized]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeIngredient = (ing: string) => {
    setIngredients((prev) => prev.filter((i) => i !== ing));
  };

  // --- AUTH ---
  useEffect(() => {
    const ensurePersistence = async () => {
      if (didSetPersistenceRef.current) return;
      didSetPersistenceRef.current = true;
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (e) {
        console.warn('Local persistence unavailable, falling back to session', e);
        try {
          await setPersistence(auth, browserSessionPersistence);
        } catch (e2) {
          console.warn('Session persistence unavailable, using default', e2);
        }
      }
    };

    ensurePersistence().catch(() => {
      // ignore
    });

    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!appId) {
      console.error('Missing appId (window.__app_id).');
      return;
    }
    const u = auth.currentUser ?? user;
    if (!u || u.isAnonymous) return;

    const cacheKey = `kitchen-ai:favorites:account:${appId}:${u.uid}`;

    const readAccountCache = (): FavoriteRecipe[] => {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return [];
        const parsed = JSON.parse(cached);
        return Array.isArray(parsed) ? (parsed as FavoriteRecipe[]) : [];
      } catch {
        return [];
      }
    };

    const writeAccountCache = (items: FavoriteRecipe[]) => {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(items));
      } catch {
        // ignore
      }
    };

    const cachedNow = readAccountCache();
    if (cachedNow.length > 0) setCloudFavorites(cachedNow);

    // Best-effort initial load to surface permission/network errors.
    (async () => {
      try {
        const snap = await getDocsFromServer(collection(db, 'artifacts', appId, 'users', u.uid, 'favorites'));
        const next = snap.docs.map((d) => ({ ...(d.data() as any), id: d.id }));
        setCloudFavorites(next);
        writeAccountCache(next);
      } catch (e) {
        console.error('Firestore read error', e);
        setErrorState(language === 'ru' ? 'Нет доступа к избранному (Firestore).' : 'Cannot read favorites (Firestore).');
      }
    })();

    return onSnapshot(
      collection(db, 'artifacts', appId, 'users', u.uid, 'favorites'),
      { includeMetadataChanges: true },
      (snap) => {
        const next = snap.docs.map((d) => ({ ...(d.data() as any), id: d.id }));

        // Important for cross-device sync:
        // - If the SERVER says it's empty, we must clear UI + cache (this includes unliking the last item).
        // - If only local cache says empty (offline/transient), don't overwrite; keep current UI/cached state.
        if (next.length === 0) {
          if (!snap.metadata.fromCache) {
            setCloudFavorites([]);
            writeAccountCache([]);
          }
          return;
        }

        setCloudFavorites(next);
        writeAccountCache(next);
      },
      (err) => {
        console.error('Firestore error', err);
        setErrorState(language === 'ru' ? 'Ошибка Firestore (избранное).' : 'Firestore error (favorites).');
      },
    );
  }, [user]);

  const nextStep = useCallback(
    () => setCurrentStep((prev) => {
      const r = recipe;
      return r ? Math.min(prev + 1, r.instructions.length - 1) : prev;
    }),
    [recipe],
  );
  const prevStep = useCallback(
    () => setCurrentStep((prev) => Math.max(0, prev - 1)),
    [],
  );

  // --- VOICE LOGIC ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    recognitionRef.current.lang = language === 'ru' ? 'ru-RU' : 'en-US';

    // Update onresult handler so it captures fresh nextStep/prevStep.
    recognitionRef.current.onresult = (e: any) => {
      const text = e?.results?.[0]?.[0]?.transcript || '';
      if (!text) return;

      if (view === 'cooking') {
        const lower = text.toLowerCase();
        if (lower.includes(language === 'ru' ? 'далее' : 'next')) nextStep();
        if (lower.includes(language === 'ru' ? 'назад' : 'back')) prevStep();
      } else {
        const splitBy = language === 'ru' ? /[,]| и /i : /[,]| and /i;
        const words = text
          .split(splitBy)
          .map((w: string) => w.trim())
          .filter((w: string) => w.length > 1);
        words.forEach((word: string) => addIngredient(word));
      }
    };
  }, [language, view, nextStep, prevStep]);

  const signInGoogle = () => signInWithProvider(new GoogleAuthProvider());
  const signInApple = () => signInWithProvider(new OAuthProvider('apple.com'));

  const signInWithProvider = async (provider: GoogleAuthProvider | OAuthProvider) => {
    setErrorState(null);
    if (!appId) {
      setErrorState(language === 'ru' ? 'Не загружен appId (firebase-config.js).' : 'Missing appId (firebase-config.js).');
      return;
    }
    try {
      const cred = await signInWithPopup(auth, provider);
      const u = cred.user;
      if (u && guestFavorites.length > 0) {
        await Promise.allSettled(
          guestFavorites.map(async (r) => {
            const id = safeRecipeIdFromTitle(r.title);
            const { id: _ignoreId, ...data } = (r as any) || {};
            let finalImage: string | null = r.image || null;
            if (finalImage && finalImage.startsWith('data:image/')) {
              finalImage = await compressImage(finalImage);
            }
            await setDoc(doc(db, 'artifacts', appId, 'users', u.uid, 'favorites', id), {
              ...data,
              image: finalImage,
              timestamp: Date.now(),
            });
          }),
        );
        setGuestFavorites([]);
      }
      setShowAuth(false);
    } catch (e) {
      console.error('Sign-in error', e);
      const providerName = provider instanceof GoogleAuthProvider ? 'Google' : 'Apple';
      setErrorState(language === 'ru' ? `Не удалось войти через ${providerName}.` : `${providerName} sign-in failed.`);
    }
  };

  const doSignOut = async () => {
    setErrorState(null);
    try {
      await signOut(auth);
      setGuestFavorites([]);
      setCloudFavorites([]);
      setShowAuth(false);
    } catch (e) {
      console.error('Sign-out error', e);
      setErrorState(language === 'ru' ? 'Не удалось выйти.' : 'Sign out failed.');
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      setErrorState(language === 'ru' ? 'Голосовой ввод не поддерживается.' : 'Voice input not supported.');
      return;
    }

    if (isListening) recognitionRef.current.stop();
    else {
      setErrorState(null);
      try {
        recognitionRef.current.start();
      } catch {
        setErrorState(language === 'ru' ? 'Микрофон недоступен.' : 'Microphone not available.');
      }
    }
  };

  // --- LIVE SCANNER LOGIC ---
  const stopScanner = () => {
    if (scannerInterval.current) {
      window.clearInterval(scannerInterval.current);
      scannerInterval.current = null;
    }
    if (videoRef.current && (videoRef.current as any).srcObject) {
      const stream = (videoRef.current as any).srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      (videoRef.current as any).srcObject = null;
    }
    setIsScanningAI(false);
    setIsScannerOpen(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
      recognitionRef.current?.stop?.();
    };
  }, []);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || isScanningAIRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const width = video.videoWidth || 0;
    const height = video.videoHeight || 0;
    if (width === 0 || height === 0) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const base64Data = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];

    setIsScanningAI(true);
    try {
      const res = await fetch(
        apiUrl('/api/vision'),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: 'image/jpeg',
            language,
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      const detected = data?.ingredients;
      if (Array.isArray(detected)) {
        // Use ref to get fresh ingredients state for dedup
        const current = ingredientsRef.current;
        detected.forEach((item: string) => {
          const normalized = normalizeIngredient(item);
          if (normalized && !current.includes(normalized)) {
            addIngredient(item);
          }
        });
      }
    } catch {
      // ignore
    } finally {
      setIsScanningAI(false);
    }
  };

  const startScanner = async () => {
    setIsScannerOpen(true);
    setErrorState(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      if (videoRef.current) {
        (videoRef.current as any).srcObject = stream;
        await videoRef.current.play().catch(() => {});
        scannerInterval.current = window.setInterval(captureAndAnalyze, 4000);
      }
    } catch {
      setErrorState(language === 'ru' ? 'Доступ к камере запрещен.' : 'Camera access denied.');
      setIsScannerOpen(false);
    }
  };

  // --- RECIPE LOGIC ---
  const generateRecipe = async () => {
    if (ingredients.length === 0) return;

    setIsGenerating(true);
    setErrorState(null);
    setRecipeSuggestions([]);
    setRecipe(null);
    setRecipeImage(null);
    setImageFailed(false);
    setMealPlan(null);
    setDrinkSuggestion(null);

    try {
      const res = await fetch(apiUrl('/api/recipes'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, language, diet }),
      });
      const parsed = await res.json().catch(() => ([] as any));
      const suggestionsAny: any[] = Array.isArray(parsed) ? parsed : [parsed];
      const normalized = suggestionsAny
        .map((x) => normalizeRecipeData(x))
        .filter(Boolean) as Recipe[];
      setRecipeSuggestions(normalized.slice(0, 3));
      setIsGenerating(false);
    } catch {
      setIsGenerating(false);
      setErrorState(language === 'ru' ? 'Не удалось создать рецепты.' : 'Failed to create recipes.');
    }
  };

  const selectRecipe = async (raw: any, fallbackTitle = '') => {
    const r = normalizeRecipeData(raw, fallbackTitle) ?? (raw as Recipe);
    setRecipe(r);
    setRecipeImage(null);
    setImageFailed(false);
    setCurrentStep(0);
    setMealPlan(null);
    setDrinkSuggestion(null);

    const cached = imageCache[r.title];
    if (cached && Date.now() - cached.timestamp < 60 * 60 * 1000) {
      setRecipeImage(cached.data);
      return;
    }

    const imgPrompt = `Professional high-end food photo of ${r.title}, gourmet plating, studio lighting`;
    const dataUrl = await attemptImageGeneration(imgPrompt);
    if (dataUrl) {
      setRecipeImage(dataUrl);
      setImageCache((prev) => ({
        ...prev,
        [r.title]: { data: dataUrl, timestamp: Date.now() },
      }));
    } else {
      setImageFailed(true);
    }
  };

  const generateMealPlan = async () => {
    if (!recipe) return;

    setIsAiLoading(true);
    setErrorState(null);
    try {
      const res = await fetch(apiUrl('/api/meal-plan'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: recipe.title, language, diet }),
      });
      const parsed = await res.json().catch(() => ([] as any));
      if (Array.isArray(parsed)) setMealPlan(parsed as MealPlanItem[]);
    } catch {
      // ignore
    } finally {
      setIsAiLoading(false);
    }
  };

  const suggestDrinks = async () => {
    if (!recipe) return;

    setIsAiLoading(true);
    setErrorState(null);
    try {
      const res = await fetch(apiUrl('/api/drinks'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: recipe.title, language, diet }),
      });
      const parsed = await res.json().catch(() => null);
      if (parsed) setDrinkSuggestion(parsed as DrinkSuggestion);
    } catch {
      // ignore
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleMealClick = async (mealTitle: string) => {
    if (!mealTitle || isMealLoading) return;
    setIsMealLoading(true);
    setErrorState(null);
    try {
      const res = await fetch(apiUrl('/api/recipe-detail'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: mealTitle, language, diet }),
      });
      const parsed = await res.json().catch(() => null);
      if (parsed) await selectRecipe(parsed, mealTitle);
    } catch {
      setErrorState(language === 'ru' ? 'Не удалось загрузить рецепт.' : 'Failed to load recipe.');
    } finally {
      setIsMealLoading(false);
    }
  };

  const toggleFavorite = async (r: Recipe) => {
    if (!appId) {
      setErrorState(language === 'ru' ? 'Не загружен appId (firebase-config.js).' : 'Missing appId (firebase-config.js).');
      return;
    }
    const explicitId = (r as any)?.id as string | undefined;
    const candidates = recipeIdCandidatesFromTitle(r.title);

    // Guest mode: keep favorites only in memory (will reset on refresh).
    const u = auth.currentUser ?? user;
    if (!u || u.isAnonymous) {
      setGuestFavorites((prev) => {
        const existingIndex = prev.findIndex((f) => {
          if (explicitId && f.id === explicitId) return true;
          return typeof f.id === 'string' && candidates.includes(f.id);
        });

        if (existingIndex >= 0) {
          return prev.filter((_, i) => i !== existingIndex);
        }

        const idToStore = candidates[0];
        const image: string | null = recipeImage || (r as any).image || null;
        return [...prev, { ...(r as any), id: idToStore, image, timestamp: Date.now() }];
      });
      return;
    }

    try {
      const existing = cloudFavorites.find((f) => typeof f.id === 'string' && candidates.includes(f.id));

      const cacheKey = `kitchen-ai:favorites:account:${appId}:${u.uid}`;
      const writeAccountCache = (items: FavoriteRecipe[]) => {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(items));
        } catch {
          // ignore
        }
      };

      if (explicitId) {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', u.uid, 'favorites', explicitId));
        setCloudFavorites((prev) => {
          const next = prev.filter((f) => f.id !== explicitId);
          writeAccountCache(next);
          return next;
        });
        return;
      }

      if (existing?.id) {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', u.uid, 'favorites', existing.id));
        setCloudFavorites((prev) => {
          const next = prev.filter((f) => f.id !== existing.id);
          writeAccountCache(next);
          return next;
        });
      } else {
        const idToWrite = candidates[0];
        let finalImage: string | null = recipeImage || (r as any).image || null;
        if (finalImage && finalImage.startsWith('data:image/')) {
          finalImage = await compressImage(finalImage);
        }
        const { id: _ignoreId, ...data } = (r as any) || {};
        await setDoc(doc(db, 'artifacts', appId, 'users', u.uid, 'favorites', idToWrite), {
          ...data,
          image: finalImage,
          timestamp: Date.now(),
        });

        setCloudFavorites((prev) => {
          if (prev.some((f) => f.id === idToWrite)) return prev;
          const next = [...prev, { ...(r as any), id: idToWrite, image: finalImage, timestamp: Date.now() }];
          writeAccountCache(next);
          return next;
        });
      }
    } catch (err) {
      console.error('Save error', err);
      if (debugEnabled) {
        const anyErr: any = err as any;
        const code = anyErr?.code ? String(anyErr.code) : '';
        const msg = anyErr?.message ? String(anyErr.message) : '';
        setDebugLastFavoritesWriteError([code, msg].filter(Boolean).join(' | ') || String(err));
      }
      setErrorState(language === 'ru' ? 'Ошибка сохранения.' : 'Failed to update favorites.');
    }
  };

  const isFavorite = (r: Recipe) => {
    const candidates = recipeIdCandidatesFromTitle(r.title);
    return favorites.some((f) => typeof f.id === 'string' && candidates.includes(f.id));
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-[#1A1A1A] font-sans pb-[calc(5rem+var(--safe-bottom))] overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.03] px-4 sm:px-6 pb-4 pt-[calc(1rem+var(--safe-top))] flex items-center justify-between gap-3">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => {
            setView('home');
            setRecipe(null);
            setRecipeSuggestions([]);
            setMealPlan(null);
            setDrinkSuggestion(null);
          }}
        >
          <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
            <ChefHat size={22} />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase italic">Kitchen.AI</span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={() => setLanguage((l) => (l === 'ru' ? 'en' : 'ru'))}
            className="p-2.5 bg-slate-50 border border-black/[0.05] rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-100 transition-all"
            aria-label="Toggle language"
          >
            <Globe size={16} />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              showSettings
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                : 'bg-white border border-black/[0.05] text-slate-500 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 size={14} className={showSettings ? 'text-white' : 'text-emerald-500'} />
            {t.dietBtn}
          </button>

          <button
            onClick={() => setView('favorites')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase transition-all ${
              view === 'favorites'
                ? 'bg-slate-900 text-white shadow-xl'
                : 'bg-white border border-black/[0.05] text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Heart size={14} className={view === 'favorites' ? 'fill-white' : ''} />
            {favorites.length}
          </button>

          <button
            onClick={() => setShowAuth((s) => !s)}
            className={`p-2.5 rounded-xl border border-black/[0.05] overflow-hidden transition-all ${
              showAuth ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
            aria-label="Profile"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} className="w-6 h-6 rounded-full" alt="profile" />
            ) : (
              <UserIcon size={16} />
            )}
          </button>
        </div>
      </nav>

      {showAuth && (
        <div className="max-w-sm mx-auto mt-4 p-8 bg-white rounded-[3rem] shadow-2xl border border-black/[0.02] animate-in slide-in-from-top-4 mx-6 lg:mx-auto relative z-[80] text-center space-y-6">
          <h3 className="text-2xl font-black text-slate-800">{t.authTitle}</h3>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">{t.welcome}</p>
            <p className="text-sm font-bold text-slate-700">
              {user?.displayName || (user?.isAnonymous ? t.anonymousUser : user?.email) || t.anonymousUser}
            </p>
          </div>

          <div className="space-y-3">
            {!user || user.isAnonymous ? (
              <>
                <button
                  onClick={signInGoogle}
                  className="w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm text-slate-700 hover:bg-white transition-all"
                >
                  Google
                </button>
                <button
                  onClick={signInApple}
                  className="w-full py-4 bg-black rounded-2xl flex items-center justify-center gap-3 font-bold text-sm text-white hover:opacity-80 transition-all"
                >
                  Apple
                </button>
              </>
            ) : (
              <button
                onClick={doSignOut}
                className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> {t.signOut}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Settings */}
      {showSettings && (
        <div className="max-w-md mx-auto mt-4 p-6 bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-black/[0.03] animate-in slide-in-from-top-4 mx-6 lg:mx-auto relative z-[70]">
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-5">{t.settings.title}</h3>
          <div className="grid grid-cols-2 gap-2">
            {(['none', 'vegan', 'keto', 'glutenFree'] as Diet[]).map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDiet(d);
                  setShowSettings(false);
                }}
                className={`px-4 py-3 rounded-[1.2rem] text-xs font-bold transition-all ${
                  diet === d ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.settings[d]}
              </button>
            ))}
          </div>

          {debugEnabled && (
            <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-600 break-all">
              <div className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">Debug</div>
              <div>projectId: {(firebaseConfig as any)?.projectId || '—'}</div>
              <div>appId(artifacts): {appId || '—'}</div>
              <div>online: {typeof navigator !== 'undefined' ? String(navigator.onLine) : '—'}</div>
              <div>mode: {isAccountUser ? 'account' : 'guest'}</div>
              <div>uid: {effectiveUser?.uid || '—'}</div>
              <div>
                providers:{' '}
                {effectiveUser?.providerData?.length
                  ? effectiveUser.providerData
                      .map((p) => p.providerId)
                      .filter(Boolean)
                      .join(', ')
                  : '—'}
              </div>
              <div>
                favorites: cloud={cloudFavorites.length} guest={guestFavorites.length} using={shouldPreferCloud ? 'cloud' : 'guest'}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-100 transition-all"
                  onClick={async () => {
                    setDebugServerFavoritesError(null);
                    setDebugServerFavoritesCount(null);
                    try {
                      if (!appId || !effectiveUser?.uid) throw new Error('Missing appId/uid');
                      const snap = await getDocsFromServer(
                        collection(db, 'artifacts', appId, 'users', effectiveUser.uid, 'favorites'),
                      );
                      setDebugServerFavoritesCount(snap.size);
                    } catch (e: any) {
                      const code = e?.code ? String(e.code) : '';
                      const msg = e?.message ? String(e.message) : '';
                      setDebugServerFavoritesError([code, msg].filter(Boolean).join(' | ') || String(e));
                    }
                  }}
                >
                  Server refresh
                </button>
                <div>
                  serverFavorites: {debugServerFavoritesCount === null ? '—' : debugServerFavoritesCount}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-100 transition-all"
                  onClick={async () => {
                    setDebugProbeResult(null);
                    try {
                      const t0 = performance.now();
                      // no-cors: we only care if the request can be made (DNS/network/adblock).
                      await fetch('https://firestore.googleapis.com/', { mode: 'no-cors', cache: 'no-store' });
                      const ms = Math.round(performance.now() - t0);
                      setDebugProbeResult(`firestore.googleapis.com: OK (~${ms}ms)`);
                    } catch (e: any) {
                      const msg = e?.message ? String(e.message) : String(e);
                      setDebugProbeResult(`firestore.googleapis.com: FAIL | ${msg}`);
                    }
                  }}
                >
                  Network probe
                </button>
                <div>probe: {debugProbeResult || '—'}</div>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <button
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-100 transition-all"
                  onClick={async () => {
                    setDebugChannelProbeResult(null);
                    try {
                      const t0 = performance.now();
                      // This is the endpoint used by Firestore listen (via WebChannel / long-poll).
                      await fetch('https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel', {
                        mode: 'no-cors',
                        cache: 'no-store',
                      });
                      const ms = Math.round(performance.now() - t0);
                      setDebugChannelProbeResult(`Listen/channel: OK (~${ms}ms)`);
                    } catch (e: any) {
                      const msg = e?.message ? String(e.message) : String(e);
                      setDebugChannelProbeResult(`Listen/channel: FAIL | ${msg}`);
                    }
                  }}
                >
                  Channel probe
                </button>
                <div>channel: {debugChannelProbeResult || '—'}</div>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <button
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-100 transition-all"
                  onClick={async () => {
                    setDebugRestListResult(null);
                    try {
                      const projectId = (firebaseConfig as any)?.projectId as string | undefined;
                      if (!projectId) throw new Error('Missing projectId');
                      if (!appId || !effectiveUser?.uid) throw new Error('Missing appId/uid');
                      if (!effectiveUser?.getIdToken) throw new Error('Missing getIdToken');

                      const token = await (effectiveUser as any).getIdToken();
                      const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
                        projectId,
                      )}/databases/(default)/documents/artifacts/${encodeURIComponent(
                        appId,
                      )}/users/${encodeURIComponent(effectiveUser.uid)}/favorites?pageSize=50`;

                      const res = await fetch(url, {
                        method: 'GET',
                        cache: 'no-store',
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      });

                      if (!res.ok) {
                        const text = await res.text().catch(() => '');
                        setDebugRestListResult(`REST: HTTP ${res.status} | ${text || '(no body)'}`);
                        return;
                      }

                      const json: any = await res.json().catch(() => ({}));
                      const count = Array.isArray(json?.documents) ? json.documents.length : 0;
                      setDebugRestListResult(`REST: OK | documents=${count}`);
                    } catch (e: any) {
                      const msg = e?.message ? String(e.message) : String(e);
                      setDebugRestListResult(`REST: FAIL | ${msg}`);
                    }
                  }}
                >
                  REST list
                </button>
                <div>rest: {debugRestListResult || '—'}</div>
              </div>
              {debugServerFavoritesError && <div className="mt-1 text-rose-600">serverError: {debugServerFavoritesError}</div>}
              {debugLastFavoritesWriteError && <div className="mt-1 text-rose-600">lastWriteError: {debugLastFavoritesWriteError}</div>}
              <div>
                path:{' '}
                {appId && effectiveUser?.uid
                  ? `artifacts/${appId}/users/${effectiveUser.uid}/favorites`
                  : '—'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Scanner */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in">
          <div className="relative flex-1">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale-[0.2]" />
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-64 h-64 border-2 border-emerald-500/50 rounded-[3rem] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_20px_#10b981] animate-scanner-line" />
              </div>
              <div className="mt-8 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 border border-white/10">
                <div className={`w-2 h-2 rounded-full ${isScanningAI ? 'bg-emerald-500 animate-ping' : 'bg-white/20'}`} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                  {isScanningAI ? t.scanningActive : 'Scanning...'}
                </span>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="bg-[#1A1A1A] p-8 pb-12 flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center gap-2 max-h-24 overflow-y-auto w-full px-4">
              {ingredients.map((ing) => (
                <span
                  key={ing}
                  className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 animate-in zoom-in"
                >
                  {ing} <CheckCircle2 size={12} />
                </span>
              ))}
            </div>
            <button
              onClick={stopScanner}
              className="bg-white text-black px-12 py-5 rounded-full font-black uppercase text-xs tracking-widest flex items-center gap-3 active:scale-95 transition-all"
            >
              <StopCircle size={18} /> {t.stopScanning}
            </button>
          </div>
        </div>
      )}

      {isMealLoading && (
        <div className="fixed inset-0 z-[200] bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center space-y-6 animate-in fade-in">
          <Loader2 size={64} className="text-emerald-600 animate-spin" />
          <p className="text-sm md:text-lg font-black tracking-tight text-slate-800 text-center px-6">{t.loadingMeal}</p>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        {view === 'home' && (
          <>
            {recipeSuggestions.length === 0 && !recipe && !isGenerating ? (
              <section className="text-center space-y-12 animate-in fade-in duration-1000">
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                    {t.heroTitle} <br />{' '}
                    <span className="text-emerald-600 font-serif italic">{t.heroAccent}</span>
                  </h1>
                  <p className="text-slate-400 font-medium max-w-lg mx-auto text-sm md:text-lg leading-relaxed">{t.heroDesc}</p>
                </div>

                <div className="flex flex-col items-center gap-6 relative">
                  <button
                    onClick={startScanner}
                    className="group relative bg-emerald-600 text-white px-12 py-6 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-4 active:scale-95"
                  >
                    <Scan size={24} className="group-hover:rotate-90 transition-transform" /> {t.startScanning}
                  </button>

                  <div className="w-full max-w-2xl bg-white rounded-[2.2rem] p-2 flex items-center shadow-2xl border border-black/[0.02] focus-within:ring-4 focus-within:ring-emerald-50 transition-all z-50">
                    <Search className="ml-4 text-slate-300" size={24} />
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={inputValue}
                      onFocus={() => setShowSuggestions(true)}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addIngredient(inputValue)}
                      className="flex-1 min-w-0 py-4 px-3 sm:px-4 bg-transparent outline-none font-bold text-base sm:text-lg"
                    />
                    <button
                      onClick={toggleVoiceInput}
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all ${
                        isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-50 text-slate-400 hover:text-emerald-600'
                      }`}
                      aria-label="Toggle voice"
                    >
                      {isListening ? <Mic size={20} /> : <MicOff size={20} />}
                    </button>
                  </div>

                  {showSuggestions && suggestions.length > 0 && (
                    <div
                      ref={suggestionsBoxRef}
                      className="absolute top-full left-1/2 -translate-x-1/2 w-full max-w-2xl mt-4 bg-white rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.12)] border border-black/[0.01] overflow-hidden z-[60] animate-in slide-in-from-top-4 duration-300"
                    >
                      <div className="p-3">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] p-4 pb-2 text-left border-b border-slate-50 mb-2">
                          {t.suggestionsHeader}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                          {suggestions.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => addIngredient(item)}
                              className="flex items-center gap-4 px-6 py-4 text-left hover:bg-emerald-50 rounded-2xl transition-all group"
                            >
                              <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-emerald-600 group-hover:shadow-sm transition-all">
                                <Plus size={16} />
                              </div>
                              <span className="font-bold text-slate-700 group-hover:text-emerald-900 transition-colors">{item}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  {ingredients.map((ing) => (
                    <div
                      key={ing}
                      className="bg-white border border-black/[0.03] text-slate-700 px-5 py-3 rounded-2xl text-[13px] font-black flex items-center gap-3 shadow-sm group animate-in zoom-in"
                    >
                      {ing}{' '}
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
                    className="bg-slate-900 text-white px-16 py-6 rounded-full font-black text-sm uppercase tracking-[0.3em] shadow-2xl hover:bg-emerald-600 transition-all active:scale-95 flex items-center gap-4 mx-auto"
                  >
                    {t.generateBtn} <ArrowRight size={20} />
                  </button>
                )}
              </section>
            ) : isGenerating ? (
              <div className="min-h-[500px] flex flex-col items-center justify-center space-y-12 text-center animate-in fade-in">
                <div className="relative">
                  <div className="w-32 h-32 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin" />
                  <ChefHat className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600" size={40} />
                </div>
                <h3 className="text-3xl font-black tracking-tight">{t.visualizing}</h3>
              </div>
            ) : recipeSuggestions.length > 0 && !recipe ? (
              <div className="space-y-16 animate-in slide-in-from-bottom-8 duration-700 pb-20">
                <div className="flex flex-col items-center text-center space-y-4">
                  <button
                    onClick={() => setRecipeSuggestions([])}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 mb-4 transition-all"
                  >
                    <ChevronLeft size={16} /> {t.backBtn}
                  </button>
                  <h2 className="text-5xl font-black tracking-tighter text-slate-800">{t.chooseTitle}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {recipeSuggestions.map((r, idx) => (
                    <div
                      key={idx}
                      onClick={() => selectRecipe(r)}
                      className="bg-white rounded-[3rem] p-8 border border-black/[0.01] shadow-lg hover:shadow-2xl transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden active:scale-95"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Utensils size={120} />
                      </div>
                      <div className="flex justify-between items-start mb-10">
                        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <Zap size={20} />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-emerald-600 transition-colors">
                          {r.difficulty}
                        </div>
                      </div>
                      <h3 className="text-2xl font-black mb-4 leading-tight text-slate-800">{r.title}</h3>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8 line-clamp-3">
                        {r.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-6">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                          <Clock size={14} /> {r.prepTime}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : recipe ? (
              <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-20">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setRecipe(null)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-all"
                  >
                    <ChevronLeft size={16} /> {t.backToResults}
                  </button>
                  <button
                    onClick={() => {
                      setView('cooking');
                      setCurrentStep(0);
                        setShowCookingIngredients(false);
                    }}
                    className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all"
                  >
                    <Play size={14} /> {t.startCooking}
                  </button>
                </div>

                <div className="bg-white rounded-[3.5rem] md:rounded-[5rem] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.04)] border border-black/[0.01]">
                  <div className="h-[400px] md:h-[700px] relative bg-slate-50 group overflow-hidden">
                    {recipeImage ? (
                      <img
                        src={recipeImage}
                        className="w-full h-full object-cover transition-transform duration-[30s] group-hover:scale-110"
                        alt={recipe.title}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-emerald-600/30">
                        {imageFailed ? <Eye size={64} /> : <RotateCcw className="animate-spin" size={32} />}
                        <span className="text-[10px] font-black uppercase tracking-widest px-10 text-center">
                          {imageFailed ? t.imgError : t.visualizing}
                        </span>
                      </div>
                    )}
                      <div className="absolute top-6 left-4 right-4 md:top-8 md:left-8 md:right-8 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 md:gap-3 min-w-0">
                          <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 md:px-5 md:py-3 rounded-2xl shadow-xl flex items-center gap-2 text-[10px] font-black uppercase border border-white/50 tracking-widest whitespace-nowrap">
                            <Clock size={16} className="text-emerald-600" /> {recipe.prepTime}
                          </div>
                          <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 md:px-5 md:py-3 rounded-2xl shadow-xl flex items-center gap-2 text-[10px] font-black uppercase border border-white/50 text-rose-500 tracking-widest whitespace-nowrap">
                            <Flame size={16} /> {recipe.difficulty}
                          </div>
                        </div>

                        <button
                          onClick={() => toggleFavorite(recipe)}
                          className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-[1.8rem] shadow-2xl backdrop-blur-xl flex items-center justify-center transition-all active:scale-90 border border-white/50 flex-shrink-0 ${
                            isFavorite(recipe)
                              ? 'bg-rose-500 text-white'
                              : 'bg-white/95 text-slate-400 hover:text-rose-500'
                          }`}
                          aria-label="Toggle favorite"
                        >
                          <Heart size={24} className="md:w-7 md:h-7" />
                        </button>
                      </div>
                  </div>

                  <div className="p-10 md:p-24 space-y-24">
                    <div className="max-w-4xl mx-auto space-y-8 text-center">
                      <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.95]">{recipe.title}</h2>
                      <p className="text-xl md:text-3xl text-slate-400 font-serif italic leading-relaxed">« {recipe.description} »</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
                      {[
                        { l: t.nutrition.calories, v: recipe.nutrition.calories, c: 'text-emerald-600', i: Zap },
                        { l: t.nutrition.protein, v: recipe.nutrition.protein, c: 'text-amber-600', i: Dna },
                        { l: t.nutrition.fat, v: recipe.nutrition.fat, c: 'text-blue-600', i: Droplets },
                        { l: t.nutrition.carbs, v: recipe.nutrition.carbs, c: 'text-purple-600', i: Sparkles },
                      ].map((n, i) => (
                        <div
                          key={i}
                          className="bg-[#FBFBFC] p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] text-center border border-black/[0.01] hover:bg-white hover:shadow-2xl transition-all"
                        >
                          <n.i size={24} className="mx-auto mb-4 opacity-20" />
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-3">{n.l}</p>
                          <p className={`text-2xl md:text-5xl font-black tracking-tighter ${n.c}`}>{n.v}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-24">
                      <div className="space-y-12 text-left">
                        <div className="flex items-center gap-5">
                          <div className="w-2 h-10 bg-emerald-600 rounded-full" />
                          <h3 className="text-4xl font-black tracking-tight">{t.sections.ingredients}</h3>
                        </div>
                        <div className="space-y-4">
                          {recipe.ingredientsList.map((item, idx) => (
                            <div
                              key={idx}
                              className="bg-[#FBFBFC] p-6 rounded-3xl text-slate-600 font-bold text-lg border border-black/[0.01] flex items-center gap-4 transition-all hover:bg-emerald-50 shadow-sm hover:shadow-md"
                            >
                              <div className="w-2 h-2 bg-emerald-500 rounded-full opacity-30" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-12 text-left">
                        <div className="flex items-center gap-5">
                          <div className="w-2 h-10 bg-slate-900 rounded-full" />
                          <h3 className="text-4xl font-black tracking-tight">{t.sections.steps}</h3>
                        </div>
                        <div className="space-y-12 relative pl-10">
                          <div className="absolute left-10 top-10 bottom-10 w-[1px] bg-slate-100" />
                          {recipe.instructions.map((step, idx) => (
                            <div key={idx} className="flex gap-12 relative group">
                              <span className="bg-white border border-black/[0.05] text-slate-400 w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 shadow-sm relative z-10 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                {idx + 1}
                              </span>
                              <p className="text-slate-500 font-bold text-xl md:text-2xl leading-relaxed">{step}</p>
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
                          className="flex items-center justify-center gap-3 px-10 py-5 bg-white border border-slate-100 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-sm active:scale-95 disabled:opacity-60"
                        >
                          <CalendarDays size={18} className="text-emerald-600" /> ✨ {t.sections.mealPlan}
                        </button>
                        <button
                          onClick={suggestDrinks}
                          disabled={isAiLoading}
                          className="flex items-center justify-center gap-3 px-10 py-5 bg-white border border-slate-100 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm active:scale-95 disabled:opacity-60"
                        >
                          <Wine size={18} className="text-rose-500" /> ✨ {t.sections.drinks}
                        </button>
                      </div>

                      {isAiLoading && (
                        <div className="text-[10px] font-black uppercase text-slate-300 animate-pulse">{t.analyzing}</div>
                      )}

                      {mealPlan && (
                        <div className="animate-in fade-in slide-in-from-top-6 duration-500 space-y-8 text-left">
                          <h4 className="text-xl font-bold flex items-center gap-3 mb-2">
                            <CalendarDays className="text-emerald-600" /> {t.mealPlanTitle}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {mealPlan.map((day, idx) => (
                              <div
                                key={idx}
                                className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-black/[0.01] hover:-translate-y-2 transition-all group overflow-hidden relative"
                              >
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                  <LayoutGrid size={80} />
                                </div>
                                <h5 className="text-emerald-600 font-black text-xs uppercase tracking-[0.2em] mb-6 border-b border-emerald-50 pb-4">
                                  {day.day}
                                </h5>
                                <div className="space-y-6">
                                  <div className="flex gap-4">
                                    <Coffee size={18} className="text-amber-500 shrink-0" />
                                    <div>
                                      <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest mb-1">{t.meals.morning}</p>
                                      <button
                                        type="button"
                                        onClick={() => handleMealClick(day.breakfast)}
                                        className="text-sm font-bold text-slate-700 hover:text-emerald-600 flex items-center gap-2 text-left"
                                      >
                                        {day.breakfast} <ExternalLink size={12} className="opacity-40" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex gap-4">
                                    <Sun size={18} className="text-emerald-500 shrink-0" />
                                    <div>
                                      <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest mb-1">{t.meals.day}</p>
                                      <button
                                        type="button"
                                        onClick={() => handleMealClick(day.lunch)}
                                        className="text-sm font-bold text-slate-700 hover:text-emerald-600 flex items-center gap-2 text-left"
                                      >
                                        {day.lunch} <ExternalLink size={12} className="opacity-40" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex gap-4">
                                    <Moon size={18} className="text-blue-500 shrink-0" />
                                    <div>
                                      <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest mb-1">{t.meals.evening}</p>
                                      <button
                                        type="button"
                                        onClick={() => handleMealClick(day.dinner)}
                                        className="text-sm font-bold text-slate-700 hover:text-emerald-600 flex items-center gap-2 text-left"
                                      >
                                        {day.dinner} <ExternalLink size={12} className="opacity-40" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {drinkSuggestion && (
                        <div className="bg-rose-50/30 rounded-[3rem] p-8 md:p-12 space-y-6 text-left animate-in slide-in-from-top-4">
                          <h4 className="text-xl font-bold flex items-center gap-3 mb-6">
                            <Wine className="text-rose-500" /> {t.drinksTitle}
                          </h4>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white/60 p-6 rounded-2xl border border-rose-100 shadow-sm transition-transform hover:scale-[1.02]">
                              <p className="text-[9px] font-black uppercase text-rose-500 mb-2">Alcoholic</p>
                              <p className="font-bold text-slate-700">{drinkSuggestion.alcohol}</p>
                            </div>
                            <div className="bg-white/60 p-6 rounded-2xl border border-rose-100 shadow-sm transition-transform hover:scale-[1.02]">
                              <p className="text-[9px] font-black uppercase text-rose-500 mb-2">Non-Alcoholic</p>
                              <p className="font-bold text-slate-700">{drinkSuggestion.nonAlcohol}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}

        {view === 'cooking' && recipe && (
          <div className="fixed inset-0 z-[100] bg-[#FDFDFF] flex flex-col p-6 md:p-12 animate-in fade-in zoom-in-95 overflow-y-auto">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <ChefHat size={20} />
                </div>
                <span className="font-black uppercase text-xs tracking-[0.2em]">{recipe.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowCookingIngredients((v) => !v)}
                  className={`p-4 px-6 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 ${
                    showCookingIngredients
                      ? 'bg-emerald-600 text-white shadow-emerald-100'
                      : 'bg-white text-slate-500 hover:bg-slate-50 border border-black/[0.05]'
                  }`}
                >
                  <List size={14} /> {showCookingIngredients ? t.hideIngredients : t.showIngredients}
                </button>
                <button
                  onClick={() => {
                    setView('home');
                    setCurrentStep(0);
                    setShowCookingIngredients(false);
                  }}
                  className="bg-slate-100 p-4 px-8 rounded-3xl hover:bg-rose-50 hover:text-rose-500 transition-all font-black text-[10px] uppercase tracking-widest"
                >
                  {t.stopCooking}
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-12 items-center justify-center max-w-6xl mx-auto w-full relative pb-20">
              {showCookingIngredients && (
                <div className="w-full lg:w-80 bg-white border border-black/[0.02] shadow-2xl rounded-[2.5rem] p-8 animate-in slide-in-from-left-4 duration-300 max-h-[50vh] lg:max-h-none overflow-y-auto text-left">
                  <h4 className="text-xl font-black mb-6 uppercase tracking-widest">{t.sections.ingredients}</h4>
                  <div className="space-y-4">
                    {recipe.ingredientsList.map((ing, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-500">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                        {ing}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex-1 flex flex-col items-center text-center space-y-12">
                <div className="space-y-6 max-w-4xl text-center">
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-600">
                    Step {currentStep + 1} of {recipe.instructions.length}
                  </span>
                  <h2 className="text-4xl md:text-7xl font-black tracking-tight leading-tight transition-all duration-500 text-slate-800">
                    {recipe.instructions[currentStep]}
                  </h2>
                </div>

                <div className="flex gap-6 w-full max-w-md">
                  <button
                    disabled={currentStep === 0}
                    onClick={prevStep}
                    className="flex-1 py-7 bg-slate-100 rounded-[2rem] font-black uppercase text-xs tracking-widest disabled:opacity-30 active:scale-95 transition-all shadow-sm"
                  >
                    {t.prevStepLabel}
                  </button>
                  <button
                    disabled={currentStep === recipe.instructions.length - 1}
                    onClick={nextStep}
                    className="flex-[2] py-7 bg-emerald-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-emerald-200 active:scale-95 transition-all"
                  >
                    {t.nextStepLabel}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-auto flex justify-center gap-4 pb-10">
              {recipe.instructions.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-500 ${i === currentStep ? 'w-16 bg-emerald-600' : 'w-3 bg-slate-100'}`}
                />
              ))}
            </div>
          </div>
        )}

        {view === 'favorites' && (
          <div className="animate-in fade-in duration-500 space-y-16">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-6xl font-black tracking-tighter italic uppercase text-slate-800">{t.collection}</h2>
              <button
                onClick={() => setView('home')}
                className="bg-slate-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
              >
                Close
              </button>
            </div>
            {favorites.length === 0 ? (
              <div className="h-[400px] flex flex-col items-center justify-center text-center opacity-20">
                <ChefHat size={80} strokeWidth={1} />
                <p className="mt-8 text-[11px] font-bold uppercase tracking-widest">{t.favoritesEmpty}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-2">
                {favorites.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white rounded-[3rem] overflow-hidden border border-black/[0.01] shadow-xl hover:shadow-[0_30px_70px_rgba(0,0,0,0.08)] transition-all flex flex-col h-full group animate-in slide-in-from-bottom-4"
                  >
                    <div className="h-72 bg-emerald-950/10 relative overflow-hidden flex items-center justify-center">
                      {f.image ? (
                        <img
                          src={f.image}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                          alt={f.title}
                        />
                      ) : (
                        <ChefHat size={60} className="text-emerald-600 opacity-20" />
                      )}
                      <button
                        onClick={() => toggleFavorite(f)}
                        className="absolute top-6 right-6 bg-rose-500 text-white p-4 rounded-2xl shadow-xl active:scale-90 transition-all hover:bg-rose-600"
                      >
                        <Heart size={20} className="fill-white" />
                      </button>
                    </div>
                    <div className="p-10 space-y-8 flex flex-col flex-1 text-left">
                      <h4 className="font-bold text-3xl tracking-tight leading-tight line-clamp-2 text-slate-800">{f.title}</h4>
                      <button
                        onClick={() => {
                          setRecipe(f);
                          setRecipeImage(f.image || null);
                          setRecipeSuggestions([]);
                          setMealPlan(null);
                          setDrinkSuggestion(null);
                          setView('home');
                        }}
                        className="mt-auto w-full py-5 bg-slate-50 text-slate-700 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      >
                        View Recipe
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {errorState && (
        <div className="fixed bottom-[calc(2.5rem+var(--safe-bottom))] left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white px-10 py-6 rounded-3xl shadow-2xl flex items-center gap-5 z-[100] animate-in slide-in-from-bottom-12 border border-white/5 mx-4 w-[90%] md:w-auto">
          <AlertCircle size={24} className="text-rose-500 shrink-0" />
          <p className="text-xs md:text-sm font-black tracking-tight">{errorState?.toString()}</p>
          <button onClick={() => setErrorState(null)} className="p-2 hover:opacity-50 ml-auto transition-opacity">
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
