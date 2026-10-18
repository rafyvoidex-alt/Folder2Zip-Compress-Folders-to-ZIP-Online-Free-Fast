import React, { useState, useEffect } from 'react';
import { X, FileText, Image as ImageIcon, Code } from 'lucide-react';
import type { ZipFileItem } from '../utils/zipUtils';
import { formatBytes } from '../utils/zipUtils';

interface FilePreviewModalProps {
  item: ZipFileItem | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ item, onClose }) => {
  const [content, setContent] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!item) {
      setContent(null);
      setImageUrl(null);
      return;
    }

    const isImage = item.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(item.name);
    const isText =
      item.type.startsWith('text/') ||
      item.type.includes('json') ||
      item.type.includes('javascript') ||
      /\.(txt|md|html|css|js|ts|tsx|jsx|json|xml|yaml|yml|svg|sh)$/i.test(item.name);

    if (item.content && typeof item.content === 'string') {
      if (isImage && item.name.endsWith('.svg')) {
        setImageUrl(`data:image/svg+xml;utf8,${encodeURIComponent(item.content)}`);
      } else {
        setContent(item.content);
      }
      return;
    }

    if (item.file) {
      if (isImage) {
        const url = URL.createObjectURL(item.file);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
      } else if (isText && item.size < 2 * 1024 * 1024) {
        setLoading(true);
        const reader = new FileReader();
        reader.onload = () => {
          setContent(reader.result as string);
          setLoading(false);
        };
        reader.onerror = () => {
          setContent('Unable to read file contents.');
          setLoading(false);
        };
        reader.readAsText(item.file);
      } else {
        setContent(null);
      }
    }
  }, [item]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
              {imageUrl ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h4 id="preview-title" className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
                {item.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">
                {item.path} • {formatBytes(item.size)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Viewer */}
        <div className="p-4 sm:p-6 overflow-auto flex-1 bg-slate-50/30 dark:bg-slate-950/40">
          {loading && (
            <div className="flex items-center justify-center py-12 text-sm text-slate-500 dark:text-slate-400">
              Loading preview...
            </div>
          )}

          {!loading && imageUrl && (
            <div className="flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-800/80 rounded-xl min-h-[240px]">
              <img
                src={imageUrl}
                alt={item.name}
                className="max-h-[50vh] max-w-full object-contain rounded-lg shadow-xs"
              />
            </div>
          )}

          {!loading && !imageUrl && content !== null && (
            <pre className="p-4 bg-slate-900 dark:bg-slate-950 text-slate-100 font-mono text-xs rounded-xl overflow-x-auto max-h-[55vh] leading-relaxed select-all border border-slate-800">
              <code>{content}</code>
            </pre>
          )}

          {!loading && !imageUrl && content === null && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 dark:text-slate-400">
              <Code className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Preview not supported for this file type</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Binary or non-text file ({formatBytes(item.size)}). It will be safely archived inside the ZIP.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Path in archive: <span className="font-mono text-slate-700 dark:text-slate-300">{item.path}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
