import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Heart } from 'lucide-react';
import { useTranslations } from '../../stores/useAppStore';
import { useRecipeStore } from '../../stores/useRecipeStore';
import type { FavoriteRecipe, Recipe } from '../../types';

interface FavoritesViewProps {
  favorites: FavoriteRecipe[];
  toggleFavorite: (r: Recipe) => void;
}

const FavoritesView: React.FC<FavoritesViewProps> = ({ favorites, toggleFavorite }) => {
  const navigate = useNavigate();
  const t = useTranslations();

  const setRecipe = useRecipeStore((s) => s.setRecipe);
  const setRecipeImage = useRecipeStore((s) => s.setRecipeImage);
  const setRecipeSuggestions = useRecipeStore((s) => s.setRecipeSuggestions);

  const viewRecipe = (f: FavoriteRecipe) => {
    setRecipe(f);
    setRecipeImage(f.image || null);
    setRecipeSuggestions([]);
    useRecipeStore.setState({ mealPlan: null, drinkSuggestion: null });
    navigate('/');
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-16">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-6xl font-black tracking-tighter italic uppercase text-slate-800">{t.collection}</h2>
        <button
          onClick={() => navigate('/')}
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
                  onClick={() => viewRecipe(f)}
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
  );
};

export default FavoritesView;
