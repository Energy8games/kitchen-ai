import React, { useCallback } from 'react';
import { ArrowRight, Mic, MicOff, Plus, Scan, Search, X } from 'lucide-react';
import { useTranslations } from '../../stores/useAppStore';
import { useRecipeStore } from '../../stores/useRecipeStore';
import { useSuggestions } from '../../hooks/useSuggestions';
import { useVoice } from '../../hooks/useVoice';
import { useAppStore } from '../../stores/useAppStore';

interface HeroSectionProps {
  startScanner: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ startScanner }) => {
  const t = useTranslations();
  const language = useAppStore((s) => s.language);
  const ingredients = useRecipeStore((s) => s.ingredients);
  const inputValue = useRecipeStore((s) => s.inputValue);
  const setInputValue = useRecipeStore((s) => s.setInputValue);
  const addIngredient = useRecipeStore((s) => s.addIngredient);
  const removeIngredient = useRecipeStore((s) => s.removeIngredient);
  const generateRecipe = useRecipeStore((s) => s.generateRecipe);

  const { suggestions, showSuggestions, setShowSuggestions, suggestionsBoxRef } = useSuggestions(
    inputValue,
    ingredients,
    language,
  );

  const onIngredients = useCallback((words: string[]) => {
    words.forEach((w) => addIngredient(w));
  }, [addIngredient]);

  const onNextStep = useCallback(() => {}, []);
  const onPrevStep = useCallback(() => {}, []);

  const { isListening, toggleVoiceInput } = useVoice({
    onIngredients,
    onNextStep,
    onPrevStep,
    isCooking: false,
  });

  return (
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
  );
};

export default HeroSection;
