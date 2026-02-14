import { useEffect, useMemo, useRef, useState } from 'react';
import { MEGA_INGREDIENTS } from '../constants/ingredients';
import type { Language } from '../types';

export const useSuggestions = (
  inputValue: string,
  ingredients: string[],
  language: Language,
) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsBoxRef = useRef<HTMLDivElement | null>(null);

  const suggestions = useMemo(() => {
    if (inputValue.trim().length === 0) return [];
    const query = inputValue.trim().toLowerCase();
    return MEGA_INGREDIENTS[language]
      .filter((item) => item.toLowerCase().startsWith(query) && !ingredients.includes(item))
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 40);
  }, [inputValue, ingredients, language]);

  useEffect(() => {
    setShowSuggestions(inputValue.trim().length > 0 && suggestions.length > 0);
  }, [inputValue, suggestions.length]);

  // Click-outside handler
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (suggestionsBoxRef.current && !suggestionsBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return {
    suggestions,
    showSuggestions,
    setShowSuggestions,
    suggestionsBoxRef,
  };
};
