/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DropZone } from './components/DropZone';
import { FileListTree } from './components/FileListTree';
import { CompressionOptions } from './components/CompressionOptions';
import { ProgressCard } from './components/ProgressCard';
import { SuccessDownloadCard } from './components/SuccessDownloadCard';
import { FilePreviewModal } from './components/FilePreviewModal';
import { createSampleFolder } from './utils/sampleData';
import {
  suggestZipName,
  formatBytes,
  getFileTypeStats,
  type ZipFileItem,
} from './utils/zipUtils';
import {
  createZipArchive,
  triggerDownload,
  type CompressionOptions as CompressionOptionsType,
  type CompressionResult,
} from './utils/zipEngine';
import { AlertCircle, FolderSync, ShieldCheck, Zap, Lock } from 'lucide-react';

export default function App() {
  const [files, setFiles] = useState<ZipFileItem[]>([]);
  const [options, setOptions] = useState<CompressionOptionsType>({
    level: 'normal',
    ignoreHidden: true,
    ignoreSystem: true,
    ignoreNodeModules: false,
    customFilename: '',
  });

  // Dark mode state: default to system preference or stored preference
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('folder2zip_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('folder2zip_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('folder2zip_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [previewItem, setPreviewItem] = useState<ZipFileItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check for ?autostart=1 or ?demo=1 query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' || params.get('demo') === '1') {
      const demoFiles = createSampleFolder();
      setFiles(demoFiles);
      setOptions((prev) => ({
        ...prev,
        customFilename: suggestZipName(demoFiles, 'my-project'),
      }));
    }
  }, []);

  // Update suggested filename when files change
  const handleFilesAdded = useCallback((newItems: ZipFileItem[]) => {
    setFiles((prev) => {
      const map = new Map<string, ZipFileItem>();
      prev.forEach((item) => map.set(item.path, item));
      newItems.forEach((item) => map.set(item.path, item));
      const combined = Array.from(map.values());

      setOptions((currOptions) => {
        if (!currOptions.customFilename || currOptions.customFilename === 'archive.zip') {
          return {
            ...currOptions,
            customFilename: suggestZipName(combined),
          };
        }
        return currOptions;
      });

      return combined;
    });
    setCompressionResult(null);
    setErrorMessage(null);
  }, []);

  const handleLoadSample = useCallback(() => {
    const demoItems = createSampleFolder();
    setFiles(demoItems);
    setOptions((prev) => ({
      ...prev,
      customFilename: 'my-project.zip',
    }));
    setCompressionResult(null);
    setErrorMessage(null);
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
    setCompressionResult(null);
  }, []);

  const handleClearAll = useCallback(() => {
    setFiles([]);
    setCompressionResult(null);
    setErrorMessage(null);
    setOptions((prev) => ({ ...prev, customFilename: '' }));
  }, []);

  const handleOptionsChange = useCallback((updated: Partial<CompressionOptionsType>) => {
    setOptions((prev) => ({ ...prev, ...updated }));
  }, []);

  const totalBytes = useMemo(() => {
    return files.reduce((acc, f) => acc + f.size, 0);
  }, [files]);

  const typeStats = useMemo(() => {
    return getFileTypeStats(files);
  }, [files]);

  const handleStartCompression = useCallback(async () => {
    if (files.length === 0 || isCompressing) return;

    try {
      setIsCompressing(true);
      setProgress(0);
      setStatusText('Reading directory tree and analyzing files...');
      setErrorMessage(null);

      const effectiveFilename = options.customFilename.trim() || suggestZipName(files);

      const result = await createZipArchive(
        files,
        {
          ...options,
          customFilename: effectiveFilename,
        },
        (percent, currentFile) => {
          setProgress(percent);
          setStatusText(currentFile);
        }
      );

      setCompressionResult(result);
      // Auto-trigger browser download
      triggerDownload(result.blob, result.filename);
    } catch (err: any) {
      console.error('Compression failed:', err);
      setErrorMessage(err?.message || 'An error occurred while creating the ZIP archive.');
    } finally {
      setIsCompressing(false);
    }
  }, [files, isCompressing, options]);

  // Keyboard shortcut: Enter to compress, Esc to cancel/close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isCompressing && files.length > 0 && !previewItem) {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          handleStartCompression();
        }
      } else if (e.key === 'Escape') {
        if (previewItem) {
          setPreviewItem(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [files.length, isCompressing, previewItem, handleStartCompression]);

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200">
      <Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Simple & Clear Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Folder to ZIP
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Convert entire folders into compressed ZIP archives instantly. Zero uploads, 100% private in your browser.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div
            role="alert"
            className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-xs"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-300 font-bold ml-2 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Success Card when compression finished */}
        {compressionResult && (
          <SuccessDownloadCard
            result={compressionResult}
            onReset={handleClearAll}
          />
        )}

        {/* Active Compression Progress Card */}
        {isCompressing && (
          <ProgressCard progress={progress} statusText={statusText} />
        )}

        {/* Main Interaction Stage */}
        <div className="space-y-4">
          <DropZone
            onFilesAdded={handleFilesAdded}
            onLoadSample={handleLoadSample}
            hasFiles={files.length > 0}
          />

          {files.length > 0 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Options & Compress Action */}
              <CompressionOptions
                options={options}
                onChange={handleOptionsChange}
                onCompress={handleStartCompression}
                onClear={handleClearAll}
                isCompressing={isCompressing}
                totalFiles={files.length}
                totalSizeFormatted={formatBytes(totalBytes)}
                typeStats={typeStats}
              />

              {/* Collapsible File List Drawer */}
              <FileListTree
                items={files}
                onRemoveItem={handleRemoveItem}
                onPreviewItem={(item) => setPreviewItem(item)}
              />
            </div>
          )}
        </div>

        {/* Subtle trust & speed pill */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Files never leave your device</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Sub-second browser compression</span>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Exact folder hierarchy preserved</span>
          </span>
        </div>
      </main>

      {/* File Preview Modal */}
      <FilePreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-5 text-center text-xs text-slate-400 dark:text-slate-500 transition-colors">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <FolderSync className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Folder2Zip — Fast, Simple & Secure</span>
          </div>
          <p>Client-Side WebAssembly & JSZip Engine</p>
        </div>
      </footer>
    </div>
  );
}
