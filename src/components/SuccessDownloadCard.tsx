import React, { useState } from 'react';
import { Download, CheckCircle2, RefreshCw, Zap, HardDrive, FileCheck, Copy, Check } from 'lucide-react';
import type { CompressionResult } from '../utils/zipEngine';
import { triggerDownload } from '../utils/zipEngine';
import { formatBytes, calculateSavings } from '../utils/zipUtils';

interface SuccessDownloadCardProps {
  result: CompressionResult;
  onReset: () => void;
}

export const SuccessDownloadCard: React.FC<SuccessDownloadCardProps> = ({ result, onReset }) => {
  const [copied, setCopied] = useState(false);
  const savings = calculateSavings(result.originalSize, result.compressedSize);

  const handleDownload = () => {
    triggerDownload(result.blob, result.filename);
  };

  const handleCopySummary = async () => {
    const text = `Archive: ${result.filename}
Files: ${result.fileCount}
Original Size: ${formatBytes(result.originalSize)}
Compressed Size: ${formatBytes(result.compressedSize)}
Space Saved: ${savings.savingsPercentage}% (${formatBytes(savings.savingsBytes)})
Compressed locally in ${result.timeTakenMs}ms with Folder2Zip`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200/90 dark:border-emerald-800/50 shadow-md p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-98 duration-200 transition-colors">
      {/* Success Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg sm:text-xl">
                Archive Ready to Download!
              </h3>
              {savings.savingsPercentage > 0 && (
                <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  -{savings.savingsPercentage}%
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {result.filename} • {formatBytes(result.compressedSize)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopySummary}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />}
          <span>{copied ? 'Copied Summary!' : 'Copy Summary'}</span>
        </button>
      </div>

      {/* Main Download Button */}
      <div>
        <button
          type="button"
          onClick={handleDownload}
          className="w-full py-4 px-6 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:from-emerald-800 active:to-teal-800 dark:from-emerald-500 dark:dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:to-teal-600 shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-3 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Download className="w-6 h-6" />
          <span>Download {result.filename} ({formatBytes(result.compressedSize)})</span>
        </button>
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">
          Click above if download doesn't start automatically.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs mb-1">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Original</span>
          </div>
          <div className="text-base font-bold text-slate-800 dark:text-slate-100">
            {formatBytes(result.originalSize)}
          </div>
        </div>

        <div className="bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl p-3.5 border border-emerald-100 dark:border-emerald-900/50">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs mb-1">
            <Download className="w-3.5 h-3.5" />
            <span>Compressed</span>
          </div>
          <div className="text-base font-bold text-emerald-800 dark:text-emerald-300">
            {formatBytes(result.compressedSize)}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs mb-1">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Files Archived</span>
          </div>
          <div className="text-base font-bold text-slate-800 dark:text-slate-100">
            {result.fileCount}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Speed</span>
          </div>
          <div className="text-base font-bold text-slate-800 dark:text-slate-100">
            {result.timeTakenMs < 1000 ? `${result.timeTakenMs} ms` : `${(result.timeTakenMs / 1000).toFixed(1)} s`}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Stored directly in your browser memory.
        </span>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Compress Another Folder</span>
        </button>
      </div>
    </div>
  );
};
