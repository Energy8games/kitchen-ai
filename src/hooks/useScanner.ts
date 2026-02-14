import { useEffect, useRef, useState } from 'react';
import { fetchVision } from '../lib/api';
import { normalizeIngredient } from '../utils/ingredient';
import { useAppStore } from '../stores/useAppStore';
import { useRecipeStore } from '../stores/useRecipeStore';

export const useScanner = () => {
  const language = useAppStore((s) => s.language);
  const setErrorState = useAppStore((s) => s.setErrorState);
  const addIngredient = useRecipeStore((s) => s.addIngredient);
  const ingredients = useRecipeStore((s) => s.ingredients);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isScanningAI, setIsScanningAI] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scannerInterval = useRef<number | null>(null);
  const isScanningAIRef = useRef(false);
  const ingredientsRef = useRef<string[]>([]);

  // Keep refs in sync
  useEffect(() => {
    isScanningAIRef.current = isScanningAI;
  }, [isScanningAI]);

  useEffect(() => {
    ingredientsRef.current = ingredients;
  }, [ingredients]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
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
      const detected = await fetchVision(base64Data, 'image/jpeg', language);
      const current = ingredientsRef.current;
      detected.forEach((item: string) => {
        const normalized = normalizeIngredient(item);
        if (normalized && !current.includes(normalized)) {
          addIngredient(item);
        }
      });
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

  return {
    isScannerOpen,
    isScanningAI,
    videoRef,
    canvasRef,
    startScanner,
    stopScanner,
  };
};
