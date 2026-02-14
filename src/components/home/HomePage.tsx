import React from 'react';
import { useRecipeStore } from '../../stores/useRecipeStore';
import HeroSection from './HeroSection';
import RecipeSuggestions from './RecipeSuggestions';
import RecipeDetail from './RecipeDetail';
import type { Recipe } from '../../types';

interface HomePageProps {
  startScanner: () => void;
  toggleFavorite: (r: Recipe) => void;
  isFavorite: (r: Recipe) => boolean;
}

const HomePage: React.FC<HomePageProps> = ({ startScanner, toggleFavorite, isFavorite }) => {
  const recipeSuggestions = useRecipeStore((s) => s.recipeSuggestions);
  const recipe = useRecipeStore((s) => s.recipe);
  const isGenerating = useRecipeStore((s) => s.isGenerating);

  const showHero = recipeSuggestions.length === 0 && !recipe && !isGenerating;

  return (
    <>
      {showHero && <HeroSection startScanner={startScanner} />}
      {(isGenerating || (recipeSuggestions.length > 0 && !recipe)) && <RecipeSuggestions />}
      {recipe && <RecipeDetail toggleFavorite={toggleFavorite} isFavorite={isFavorite} />}
    </>
  );
};

export default HomePage;
