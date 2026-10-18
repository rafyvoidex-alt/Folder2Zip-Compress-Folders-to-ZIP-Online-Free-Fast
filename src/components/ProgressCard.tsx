import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProgressCardProps {
  progress: number;
  statusText: string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ progress, statusText }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-blue-200 dark:border-blue-900/60 shadow-md p-6 space-y-4 animate-in fade-in duration-200 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Compressing your archive...</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-sm sm:max-w-md">
              {statusText || 'Processing files...'}
            </p>
          </div>
        </div>
        <span className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">{progress}%</span>
      </div>

      {/* Progress track */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 h-full rounded-full transition-all duration-150 ease-out shadow-xs"
          style={{ width: `${Math.max(4, Math.min(100, progress))}%` }}
        />
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
        Processing files in memory with zero network delay.
      </p>
    </div>
  );
};
