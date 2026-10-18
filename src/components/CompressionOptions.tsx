import React from 'react';
import {
  FileArchive,
  Zap,
  Gauge,
  FolderArchive,
  Image as ImageIcon,
  FileCode,
  FileText,
  File,
  X,
} from 'lucide-react';
import type { CompressionOptions as CompressionOptionsType } from '../utils/zipEngine';
import type { FileTypeSummary } from '../utils/zipUtils';

interface CompressionOptionsProps {
  options: CompressionOptionsType;
  onChange: (updated: Partial<CompressionOptionsType>) => void;
  onCompress: () => void;
  onClear: () => void;
  isCompressing: boolean;
  totalFiles: number;
  totalSizeFormatted: string;
  typeStats: FileTypeSummary[];
}

function getCategoryIcon(icon: FileTypeSummary['icon']) {
  switch (icon) {
    case 'image':
      return <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />;
    case 'code':
      return <FileCode className="w-3.5 h-3.5 text-blue-500" />;
    case 'doc':
      return <FileText className="w-3.5 h-3.5 text-indigo-500" />;
    default:
      return <File className="w-3.5 h-3.5 text-slate-400" />;
  }
}

export const CompressionOptions: React.FC<CompressionOptionsProps> = ({
  options,
  onChange,
  onCompress,
  onClear,
  isCompressing,
  totalFiles,
  totalSizeFormatted,
  typeStats,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-6 transition-colors">
      {/* Folder Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FolderArchive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                Ready to Compress
              </h3>
              <span className="text-xs font-bold bg-blue-100 dark:bg-blue-950 dark:text-blue-300 text-blue-700 px-2.5 py-0.5 rounded-full">
                {totalFiles} {totalFiles === 1 ? 'file' : 'files'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Total uncompressed size: <span className="font-semibold text-slate-700 dark:text-slate-300">{totalSizeFormatted}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-100 dark:hover:border-red-900/40 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear Folder</span>
        </button>
      </div>

      {/* File Type Breakdown Badges */}
      {typeStats.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium mr-1">Contents:</span>
          {typeStats.slice(0, 5).map((stat) => (
            <div
              key={stat.category}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium"
            >
              {getCategoryIcon(stat.icon)}
              <span>
                {stat.count} {stat.category}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Controls Grid */}
      <div className="space-y-4">
        {/* Compression Level Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Compression Mode
            </label>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {options.level === 'maximum'
                ? 'Smallest archive size (DEFLATE 9)'
                : options.level === 'store'
                ? 'Instant packaging, no recompression'
                : 'Balanced speed & file reduction (DEFLATE 6)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => onChange({ level: 'normal' })}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                options.level === 'normal'
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-blue-500/20 text-slate-900 dark:text-white shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                  <Gauge className="w-4 h-4" />
                  <span>Standard</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-100 dark:bg-blue-900 dark:text-blue-200 text-blue-700 px-1.5 py-0.5 rounded">
                  Default
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Best all-round speed & space saving</p>
            </button>

            <button
              type="button"
              onClick={() => onChange({ level: 'maximum' })}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                options.level === 'maximum'
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-blue-500/20 text-slate-900 dark:text-white shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                  <FileArchive className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Maximum</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                  Smallest
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Deepest compression for code & docs</p>
            </button>

            <button
              type="button"
              onClick={() => onChange({ level: 'store' })}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                options.level === 'store'
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-blue-500/20 text-slate-900 dark:text-white shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Ultra Fast</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded">
                  0 ms lag
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Fastest archive packaging, zero CPU load</p>
            </button>
          </div>
        </div>

        {/* Filename & Clean Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label htmlFor="zip-filename" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              ZIP Archive Name
            </label>
            <div className="relative">
              <input
                id="zip-filename"
                type="text"
                value={options.customFilename}
                onChange={(e) => onChange({ customFilename: e.target.value })}
                placeholder="archive.zip"
                className="w-full pl-3 pr-12 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 dark:text-slate-500 pointer-events-none">
                .zip
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <div className="flex items-center gap-3 py-2 text-xs text-slate-600 dark:text-slate-400">
              <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.ignoreHidden && options.ignoreSystem}
                  onChange={(e) =>
                    onChange({
                      ignoreHidden: e.target.checked,
                      ignoreSystem: e.target.checked,
                    })
                  }
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-medium">Clean OS junk (.DS_Store, Thumbs.db)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onCompress}
          disabled={isCompressing || totalFiles === 0}
          className="w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg text-white bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <FileArchive className="w-5 h-5" />
          <span>Compress & Download ZIP</span>
          <span className="text-xs bg-blue-500/50 dark:bg-blue-700/50 px-2 py-0.5 rounded-md font-mono hidden sm:inline">
            ↵ Enter
          </span>
        </button>
      </div>
    </div>
  );
};
