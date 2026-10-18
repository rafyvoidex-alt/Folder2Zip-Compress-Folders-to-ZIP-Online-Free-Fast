import React, { useRef, useState, useCallback } from 'react';
import { FolderUp, UploadCloud, FilePlus, Sparkles, Folder } from 'lucide-react';
import { processDataTransferItems, processFileInputList } from '../utils/fileScanner';
import type { ZipFileItem } from '../utils/zipUtils';

interface DropZoneProps {
  onFilesAdded: (newFiles: ZipFileItem[]) => void;
  onLoadSample: () => void;
  hasFiles: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesAdded, onLoadSample, hasFiles }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer && e.dataTransfer.items) {
        setIsProcessing(true);
        try {
          const items = await processDataTransferItems(e.dataTransfer.items);
          if (items.length > 0) {
            onFilesAdded(items);
          }
        } catch (err) {
          console.error('Error scanning dropped files:', err);
        } finally {
          setIsProcessing(false);
        }
      } else if (e.dataTransfer && e.dataTransfer.files) {
        const items = processFileInputList(e.dataTransfer.files);
        if (items.length > 0) {
          onFilesAdded(items);
        }
      }
    },
    [onFilesAdded]
  );

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const items = processFileInputList(e.target.files);
      onFilesAdded(items);
      e.target.value = '';
    }
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const items = processFileInputList(e.target.files);
      onFilesAdded(items);
      e.target.value = '';
    }
  };

  if (hasFiles) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-3.5 rounded-xl border border-dashed transition-all flex items-center justify-between gap-3 text-xs ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
            : 'border-slate-300 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
        }`}
      >
        <input
          type="file"
          ref={folderInputRef}
          onChange={handleFolderChange}
          // @ts-expect-error webkitdirectory is standard for folder picker
          webkitdirectory="true"
          directory="true"
          multiple
          className="hidden"
          aria-label="Add Folder"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFilesChange}
          multiple
          className="hidden"
          aria-label="Add Files"
        />

        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>Drop more files or folders here, or</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            className="px-2.5 py-1 font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100/50 dark:hover:bg-blue-950/50 rounded-md cursor-pointer transition-colors"
          >
            + Add Folder
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md cursor-pointer transition-colors"
          >
            + Add Files
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderChange}
        // @ts-expect-error webkitdirectory is standard for folder picker
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
        aria-label="Select Folder"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFilesChange}
        multiple
        className="hidden"
        aria-label="Select Files"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-3xl border-2 border-dashed transition-all duration-200 p-8 sm:p-12 text-center bg-white dark:bg-slate-900/90 shadow-xs ${
          isDragging
            ? 'border-blue-600 dark:border-blue-500 bg-blue-50/90 dark:bg-blue-950/30 scale-[1.01] shadow-xl shadow-blue-500/10'
            : 'border-slate-300 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50/40 dark:hover:bg-slate-800/40'
        }`}
      >
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-transform ${
              isDragging
                ? 'bg-blue-600 text-white scale-110 shadow-lg'
                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
            }`}
          >
            {isDragging ? <UploadCloud className="w-8 h-8 animate-bounce" /> : <FolderUp className="w-8 h-8" />}
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {isDragging ? 'Release to upload folder' : 'Drag & Drop your folder here'}
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            All subfolders and files inside are packed into a clean ZIP archive with zero data leaving your browser.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:hover:bg-blue-500 transition-all shadow-md shadow-blue-500/25 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FolderUp className="w-5 h-5" />
              <span>Choose Folder</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 transition-colors cursor-pointer"
            >
              <FilePlus className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Or Choose Files</span>
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <span>Want to test it first?</span>
            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Try demo project folder</span>
            </button>
          </div>

          {isProcessing && (
            <div className="mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400 animate-pulse">
              Reading folder contents...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
