import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, List } from 'lucide-react';
import { useTranslations } from '../../stores/useAppStore';
import { useRecipeStore } from '../../stores/useRecipeStore';
import { useVoice } from '../../hooks/useVoice';

const CookingView: React.FC = () => {
  const navigate = useNavigate();
  const t = useTranslations();

  const recipe = useRecipeStore((s) => s.recipe);
  const currentStep = useRecipeStore((s) => s.currentStep);
  const showCookingIngredients = useRecipeStore((s) => s.showCookingIngredients);
  const nextStep = useRecipeStore((s) => s.nextStep);
  const prevStep = useRecipeStore((s) => s.prevStep);
  const toggleCookingIngredients = useRecipeStore((s) => s.toggleCookingIngredients);
  const setCurrentStep = useRecipeStore((s) => s.setCurrentStep);
  const setShowCookingIngredients = useRecipeStore((s) => s.setShowCookingIngredients);

  useVoice({
    onIngredients: useCallback((_words: string[]) => {}, []),
    onNextStep: nextStep,
    onPrevStep: prevStep,
    isCooking: true,
  });

  if (!recipe) {
    navigate('/');
    return null;
  }

  return (
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
            onClick={toggleCookingIngredients}
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
              setCurrentStep(0);
              setShowCookingIngredients(false);
              navigate('/');
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
  );
};

export default CookingView;
