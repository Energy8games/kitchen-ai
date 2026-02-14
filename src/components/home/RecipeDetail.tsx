import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ChevronLeft,
  Clock,
  Coffee,
  Dna,
  Droplets,
  ExternalLink,
  Eye,
  Flame,
  Heart,
  LayoutGrid,
  Moon,
  Play,
  RotateCcw,
  Sparkles,
  Sun,
  Wine,
  Zap,
} from 'lucide-react';
import { useTranslations } from '../../stores/useAppStore';
import { useRecipeStore } from '../../stores/useRecipeStore';
import type { Recipe } from '../../types';

interface RecipeDetailProps {
  toggleFavorite: (r: Recipe) => void;
  isFavorite: (r: Recipe) => boolean;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ toggleFavorite, isFavorite }) => {
  const navigate = useNavigate();
  const t = useTranslations();

  const recipe = useRecipeStore((s) => s.recipe);
  const recipeImage = useRecipeStore((s) => s.recipeImage);
  const imageFailed = useRecipeStore((s) => s.imageFailed);
  const isAiLoading = useRecipeStore((s) => s.isAiLoading);
  const mealPlan = useRecipeStore((s) => s.mealPlan);
  const drinkSuggestion = useRecipeStore((s) => s.drinkSuggestion);

  const setRecipe = useRecipeStore((s) => s.setRecipe);
  const setCurrentStep = useRecipeStore((s) => s.setCurrentStep);
  const setShowCookingIngredients = useRecipeStore((s) => s.setShowCookingIngredients);
  const generateMealPlan = useRecipeStore((s) => s.generateMealPlan);
  const suggestDrinks = useRecipeStore((s) => s.suggestDrinks);
  const handleMealClick = useRecipeStore((s) => s.handleMealClick);

  if (!recipe) return null;

  return (
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
            setCurrentStep(0);
            setShowCookingIngredients(false);
            navigate('/cooking');
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
  );
};

export default RecipeDetail;
