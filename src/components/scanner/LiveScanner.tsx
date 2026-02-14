import React from 'react';
import { CheckCircle2, StopCircle } from 'lucide-react';
import { useTranslations } from '../../stores/useAppStore';
import { useRecipeStore } from '../../stores/useRecipeStore';

interface LiveScannerProps {
  isScannerOpen: boolean;
  isScanningAI: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  stopScanner: () => void;
}

const LiveScanner: React.FC<LiveScannerProps> = ({
  isScannerOpen,
  isScanningAI,
  videoRef,
  canvasRef,
  stopScanner,
}) => {
  const t = useTranslations();
  const ingredients = useRecipeStore((s) => s.ingredients);

  if (!isScannerOpen) return null;

  return (
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
  );
};

export default LiveScanner;
