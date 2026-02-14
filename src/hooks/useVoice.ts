import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../stores/useAppStore';

interface UseVoiceOptions {
  onIngredients: (words: string[]) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  isCooking: boolean;
}

export const useVoice = ({ onIngredients, onNextStep, onPrevStep, isCooking }: UseVoiceOptions) => {
  const language = useAppStore((s) => s.language);
  const setErrorState = useAppStore((s) => s.setErrorState);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any | null>(null);

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

    recognitionRef.current.onresult = (e: any) => {
      const text = e?.results?.[0]?.[0]?.transcript || '';
      if (!text) return;

      if (isCooking) {
        const lower = text.toLowerCase();
        if (lower.includes(language === 'ru' ? 'далее' : 'next')) onNextStep();
        if (lower.includes(language === 'ru' ? 'назад' : 'back')) onPrevStep();
      } else {
        const splitBy = language === 'ru' ? /[,]| и /i : /[,]| and /i;
        const words = text
          .split(splitBy)
          .map((w: string) => w.trim())
          .filter((w: string) => w.length > 1);
        onIngredients(words);
      }
    };

    return () => {
      recognitionRef.current?.stop?.();
    };
  }, [language, isCooking, onIngredients, onNextStep, onPrevStep]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      setErrorState(language === 'ru' ? 'Голосовой ввод не поддерживается.' : 'Voice input not supported.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setErrorState(null);
      try {
        recognitionRef.current.start();
      } catch {
        setErrorState(language === 'ru' ? 'Микрофон недоступен.' : 'Microphone not available.');
      }
    }
  };

  return { isListening, toggleVoiceInput };
};
