/**
 * Utilities for file hierarchy, size formatting, path normalization, and ZIP processing.
 */

export interface ZipFileItem {
  id: string;
  name: string;
  path: string; // relative path inside archive, e.g. "my-folder/assets/logo.png"
  size: number;
  type: string;
  lastModified?: number;
  file?: File;
  content?: Blob | string | Uint8Array;
}

export interface TreeNode {
  name: string;
  fullPath: string;
  isFolder: boolean;
  size: number;
  children?: TreeNode[];
  item?: ZipFileItem;
}

/**
 * Format bytes into human readable format (KB, MB, GB, etc.)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  if (bytes < 0 || isNaN(bytes)) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const idx = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, idx)).toFixed(dm))} ${sizes[idx]}`;
}

export interface FileTypeSummary {
  category: string;
  count: number;
  size: number;
  icon: 'image' | 'code' | 'doc' | 'archive' | 'media' | 'other';
}

/**
 * Summarize files into friendly categories (Images, Code, Documents, Media, Other)
 */
export function getFileTypeStats(items: ZipFileItem[]): FileTypeSummary[] {
  const map: Record<string, { count: number; size: number; icon: FileTypeSummary['icon'] }> = {};

  for (const item of items) {
    const ext = item.name.split('.').pop()?.toLowerCase() || '';
    let category = 'Other';
    let icon: FileTypeSummary['icon'] = 'other';

    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico', 'avif'].includes(ext)) {
      category = 'Images';
      icon = 'image';
    } else if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp', 'rs', 'go', 'php', 'rb', 'sql', 'sh', 'yaml', 'yml'].includes(ext)) {
      category = 'Code';
      icon = 'code';
    } else if (['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'csv', 'xlsx', 'pptx'].includes(ext)) {
      category = 'Docs';
      icon = 'doc';
    } else if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext)) {
      category = 'Archives';
      icon = 'archive';
    } else if (['mp3', 'wav', 'ogg', 'mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext)) {
      category = 'Media';
      icon = 'media';
    }

    if (!map[category]) {
      map[category] = { count: 0, size: 0, icon };
    }
    map[category].count += 1;
    map[category].size += item.size;
  }

  return Object.entries(map).map(([category, data]) => ({
    category,
    count: data.count,
    size: data.size,
    icon: data.icon,
  })).sort((a, b) => b.count - a.count);
}


/**
 * Clean and normalize a relative path inside a ZIP archive.
 * Converts Windows backslashes to forward slashes, strips leading/trailing slashes.
 */
export function normalizeZipPath(rawPath: string): string {
  if (!rawPath) return '';
  // Convert backslashes to forward slashes
  let clean = rawPath.replace(/\\/g, '/');
  // Strip redundant multiple slashes
  clean = clean.replace(/\/+/g, '/');
  // Strip leading slash or dot slash
  clean = clean.replace(/^(\.\/|\/)+/, '');
  // Strip trailing slash
  clean = clean.replace(/\/+$/, '');
  return clean.trim();
}

/**
 * Suggest a ZIP filename based on the items or root directory
 */
export function suggestZipName(items: ZipFileItem[], fallbackName = 'archive'): string {
  if (!items || items.length === 0) return `${fallbackName}.zip`;

  // Check if all items share a top-level root folder
  const firstPath = items[0].path;
  const firstSlashIndex = firstPath.indexOf('/');

  if (firstSlashIndex > 0) {
    const candidateRoot = firstPath.substring(0, firstSlashIndex);
    const allShareRoot = items.every(item => item.path.startsWith(`${candidateRoot}/`));
    if (allShareRoot && candidateRoot.trim().length > 0) {
      return `${candidateRoot}.zip`;
    }
  }

  // If there's only 1 file and no folder
  if (items.length === 1 && !firstPath.includes('/')) {
    const baseName = items[0].name.replace(/\.[^/.]+$/, '');
    return `${baseName || 'archive'}.zip`;
  }

  return `${fallbackName}.zip`;
}

/**
 * Check if a path or file should be ignored based on common ignore patterns
 */
export function isIgnoredPath(
  path: string,
  options: {
    ignoreHidden?: boolean; // .DS_Store, .git, .env, etc.
    ignoreSystem?: boolean; // Thumbs.db, desktop.ini
    ignoreNodeModules?: boolean;
  } = {}
): boolean {
  const normalized = normalizeZipPath(path);
  const segments = normalized.split('/');

  for (const seg of segments) {
    if (options.ignoreHidden && seg.startsWith('.')) {
      return true;
    }
    if (options.ignoreSystem && (seg === 'Thumbs.db' || seg.toLowerCase() === 'desktop.ini')) {
      return true;
    }
    if (options.ignoreNodeModules && seg === 'node_modules') {
      return true;
    }
  }
  return false;
}

/**
 * Calculate saved percentage and ratio
 */
export function calculateSavings(originalBytes: number, compressedBytes: number): {
  savingsBytes: number;
  savingsPercentage: number;
  ratio: number;
} {
  if (originalBytes <= 0 || compressedBytes <= 0) {
    return { savingsBytes: 0, savingsPercentage: 0, ratio: 1 };
  }
  const savingsBytes = Math.max(0, originalBytes - compressedBytes);
  const savingsPercentage = Math.round((savingsBytes / originalBytes) * 100);
  const ratio = parseFloat((compressedBytes / originalBytes).toFixed(2));
  return { savingsBytes, savingsPercentage, ratio };
}

/**
 * Build a nested tree structure for folder view from flat items list
 */
export function buildFileTree(items: ZipFileItem[]): TreeNode {
  const root: TreeNode = {
    name: 'root',
    fullPath: '',
    isFolder: true,
    size: 0,
    children: [],
  };

  for (const item of items) {
    root.size += item.size;
    const parts = item.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');

      if (!current.children) {
        current.children = [];
      }

      let existing = current.children.find(child => child.name === part);
      if (!existing) {
        existing = {
          name: part,
          fullPath: currentPath,
          isFolder: !isFile,
          size: isFile ? item.size : 0,
          children: isFile ? undefined : [],
          item: isFile ? item : undefined,
        };
        current.children.push(existing);
      } else if (!isFile) {
        existing.size += item.size;
      }

      current = existing;
    }
  }

  // Sort nodes: folders first, then files alphabetically
  function sortNodes(node: TreeNode) {
    if (node.children) {
      node.children.sort((a, b) => {
        if (a.isFolder === b.isFolder) {
          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        }
        return a.isFolder ? -1 : 1;
      });
      node.children.forEach(sortNodes);
    }
  }

  sortNodes(root);
  return root;
}
