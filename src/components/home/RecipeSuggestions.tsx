import React from 'react';
import { ChefHat, ChevronLeft, ChevronRight, Clock, Utensils, Zap } from 'lucide-react';
import { useTranslations } from '../../stores/useAppStore';
import { useRecipeStore } from '../../stores/useRecipeStore';

const RecipeSuggestions: React.FC = () => {
  const t = useTranslations();
  const recipeSuggestions = useRecipeStore((s) => s.recipeSuggestions);
  const isGenerating = useRecipeStore((s) => s.isGenerating);
  const recipe = useRecipeStore((s) => s.recipe);
  const setRecipeSuggestions = useRecipeStore((s) => s.setRecipeSuggestions);
  const selectRecipe = useRecipeStore((s) => s.selectRecipe);

  if (isGenerating) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-12 text-center animate-in fade-in">
        <div className="relative">
          <div className="w-32 h-32 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin" />
          <ChefHat className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600" size={40} />
        </div>
        <h3 className="text-3xl font-black tracking-tight">{t.visualizing}</h3>
      </div>
    );
  }

  if (recipeSuggestions.length === 0 || recipe) return null;

  return (
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
  );
};

export default RecipeSuggestions;
