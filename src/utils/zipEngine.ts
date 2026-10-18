import JSZip from 'jszip';
import type { ZipFileItem } from './zipUtils';
import { isIgnoredPath } from './zipUtils';

export interface CompressionOptions {
  level: 'store' | 'normal' | 'maximum'; // store = 0, normal = 6, maximum = 9
  ignoreHidden: boolean;
  ignoreSystem: boolean;
  ignoreNodeModules: boolean;
  customFilename: string;
}

export interface CompressionResult {
  blob: Blob;
  blobUrl: string;
  filename: string;
  originalSize: number;
  compressedSize: number;
  fileCount: number;
  timeTakenMs: number;
}

export type ProgressCallback = (percent: number, currentFile: string) => void;

/**
 * Compress ZipFileItems into a single ZIP archive blob
 */
export async function createZipArchive(
  items: ZipFileItem[],
  options: CompressionOptions,
  onProgress?: ProgressCallback
): Promise<CompressionResult> {
  const startTime = performance.now();
  const zip = new JSZip();

  // Filter items based on user preferences
  const activeItems = items.filter(
    (item) =>
      !isIgnoredPath(item.path, {
        ignoreHidden: options.ignoreHidden,
        ignoreSystem: options.ignoreSystem,
        ignoreNodeModules: options.ignoreNodeModules,
      })
  );

  if (activeItems.length === 0) {
    throw new Error('No files to compress after applying ignore filters.');
  }

  const originalTotalSize = activeItems.reduce((acc, item) => acc + item.size, 0);

  // Add each file into the zip
  for (let i = 0; i < activeItems.length; i++) {
    const item = activeItems[i];
    if (onProgress) {
      const stepPercent = Math.round((i / (activeItems.length * 2)) * 100);
      onProgress(stepPercent, `Preparing ${item.name}`);
    }

    if (item.file) {
      zip.file(item.path, item.file, {
        date: item.lastModified ? new Date(item.lastModified) : new Date(),
      });
    } else if (item.content) {
      zip.file(item.path, item.content, {
        date: item.lastModified ? new Date(item.lastModified) : new Date(),
      });
    }
  }

  // Determine compression parameters
  let compressionMethod: 'STORE' | 'DEFLATE' = 'DEFLATE';
  let compressionLevel = 6;

  if (options.level === 'store') {
    compressionMethod = 'STORE';
    compressionLevel = 1;
  } else if (options.level === 'maximum') {
    compressionMethod = 'DEFLATE';
    compressionLevel = 9;
  } else {
    compressionMethod = 'DEFLATE';
    compressionLevel = 6;
  }

  // Generate ZIP blob with progress tracking
  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: compressionMethod,
      compressionOptions: {
        level: compressionLevel,
      },
      mimeType: 'application/zip',
    },
    (metadata) => {
      if (onProgress) {
        // Map 0-100 of generateAsync to 50%-100% of the overall process
        const overallPercent = Math.min(100, Math.round(50 + metadata.percent * 0.5));
        onProgress(overallPercent, metadata.currentFile ? `Compressing ${metadata.currentFile}` : 'Finalizing archive...');
      }
    }
  );

  const endTime = performance.now();
  const timeTakenMs = Math.round(endTime - startTime);

  let finalFilename = options.customFilename.trim();
  if (!finalFilename.toLowerCase().endsWith('.zip')) {
    finalFilename += '.zip';
  }

  const blobUrl = URL.createObjectURL(zipBlob);

  return {
    blob: zipBlob,
    blobUrl,
    filename: finalFilename,
    originalSize: originalTotalSize,
    compressedSize: zipBlob.size,
    fileCount: activeItems.length,
    timeTakenMs,
  };
}

/**
 * Triggers browser download of a generated Blob
 */
export function triggerDownload(blobOrUrl: Blob | string, filename: string): void {
  const url = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  if (typeof blobOrUrl !== 'string') {
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}
