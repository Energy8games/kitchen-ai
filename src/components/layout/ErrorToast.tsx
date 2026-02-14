import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

const ErrorToast: React.FC = () => {
  const errorState = useAppStore((s) => s.errorState);
  const clearError = useAppStore((s) => s.clearError);

  if (!errorState) return null;

  return (
    <div className="fixed bottom-[calc(2.5rem+var(--safe-bottom))] left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white px-10 py-6 rounded-3xl shadow-2xl flex items-center gap-5 z-[100] animate-in slide-in-from-bottom-12 border border-white/5 mx-4 w-[90%] md:w-auto">
      <AlertCircle size={24} className="text-rose-500 shrink-0" />
      <p className="text-xs md:text-sm font-black tracking-tight">{errorState?.toString()}</p>
      <button onClick={clearError} className="p-2 hover:opacity-50 ml-auto transition-opacity">
        <X size={20} />
      </button>
    </div>
  );
};

export default ErrorToast;
