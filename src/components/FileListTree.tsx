import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  File,
  Trash2,
  Eye,
  List,
  Network,
  Search,
  ChevronRight,
  ChevronDown,
  FileCode,
  FileText,
  FileImage,
  Archive,
} from 'lucide-react';
import type { ZipFileItem, TreeNode } from '../utils/zipUtils';
import { formatBytes, buildFileTree } from '../utils/zipUtils';

interface FileListTreeProps {
  items: ZipFileItem[];
  onRemoveItem: (id: string) => void;
  onPreviewItem: (item: ZipFileItem) => void;
}

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext || '')) {
    return <FileImage className="w-4 h-4 text-emerald-500 shrink-0" />;
  }
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp', 'rs', 'go', 'php'].includes(ext || '')) {
    return <FileCode className="w-4 h-4 text-blue-500 shrink-0" />;
  }
  if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ext || '')) {
    return <Archive className="w-4 h-4 text-amber-500 shrink-0" />;
  }
  if (['txt', 'md', 'doc', 'docx', 'pdf'].includes(ext || '')) {
    return <FileText className="w-4 h-4 text-indigo-500 shrink-0" />;
  }
  return <File className="w-4 h-4 text-slate-400 shrink-0" />;
}

export const FileListTree: React.FC<FileListTreeProps> = ({
  items,
  onRemoveItem,
  onPreviewItem,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) => item.path.toLowerCase().includes(query) || item.name.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const tree = useMemo(() => buildFileTree(filteredItems), [filteredItems]);

  const toggleFolder = (fullPath: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [fullPath]: prev[fullPath] === false ? true : false,
    }));
  };

  const isFolderExpanded = (fullPath: string) => {
    return expandedFolders[fullPath] !== false;
  };

  const renderTreeNode = (node: TreeNode, depth = 0) => {
    if (node.isFolder && (!node.children || node.children.length === 0)) {
      return null;
    }

    if (node.isFolder) {
      const expanded = isFolderExpanded(node.fullPath);
      return (
        <div key={node.fullPath} className="select-none">
          <div
            onClick={() => toggleFolder(node.fullPath)}
            className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-300 text-xs font-medium group transition-colors"
            style={{ paddingLeft: `${Math.max(8, depth * 14 + 8)}px` }}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </span>
              {expanded ? (
                <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
              ) : (
                <Folder className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <span className="truncate font-semibold text-slate-800 dark:text-slate-200">{node.name}</span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal shrink-0">
              {formatBytes(node.size)}
            </span>
          </div>

          {expanded && node.children && (
            <div className="space-y-0.5">
              {node.children.map((child) => renderTreeNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    const fileItem = node.item;
    if (!fileItem) return null;

    return (
      <div
        key={fileItem.id}
        className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 group text-slate-600 dark:text-slate-400 text-xs transition-colors"
        style={{ paddingLeft: `${Math.max(8, depth * 14 + 8)}px` }}
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {getFileIcon(node.name)}
          <span className="truncate font-mono text-slate-700 dark:text-slate-300">{node.name}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            {formatBytes(node.size)}
          </span>

          <div className="flex items-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onPreviewItem(fileItem)}
              aria-label={`Preview ${fileItem.name}`}
              className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors cursor-pointer"
              title="Preview file"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onRemoveItem(fileItem.id)}
              aria-label={`Remove ${fileItem.name}`}
              className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors cursor-pointer"
              title="Remove file"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
      {/* Accordion Toggle Bar */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
          <span className="text-slate-400 dark:text-slate-500">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </span>
          <span>Review Files in Archive ({items.length})</span>
        </div>
        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
          {isOpen ? 'Hide list' : 'Show details'}
        </span>
      </button>

      {/* Expanded File View */}
      {isOpen && (
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-3 bg-slate-50/40 dark:bg-slate-950/30">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setViewMode('tree')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'tree' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs font-semibold' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Network className="w-3 h-3" />
                <span>Tree</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs font-semibold' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <List className="w-3 h-3" />
                <span>List</span>
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto rounded-xl bg-white dark:bg-slate-900 p-2 border border-slate-200/60 dark:border-slate-800">
            {filteredItems.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                {searchQuery ? `No files match "${searchQuery}"` : 'No files found'}
              </div>
            ) : viewMode === 'tree' ? (
              <div className="space-y-0.5">
                {tree.children && tree.children.map((child) => renderTreeNode(child, 0))}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-1.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg group text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      {getFileIcon(item.name)}
                      <span className="font-mono text-slate-700 dark:text-slate-300 truncate">{item.path}</span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                        {formatBytes(item.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onPreviewItem(item)}
                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors cursor-pointer"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
