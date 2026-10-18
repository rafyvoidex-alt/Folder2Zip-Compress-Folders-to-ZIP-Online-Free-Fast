import type { ZipFileItem } from './zipUtils';
import { normalizeZipPath } from './zipUtils';

/**
 * Read FileSystemEntry recursively (for drag-and-drop of folders and files)
 */
async function scanEntry(entry: any, basePath = ''): Promise<ZipFileItem[]> {
  if (entry.isFile) {
    return new Promise((resolve) => {
      (entry as any).file((file: File) => {
        const fullPath = normalizeZipPath(basePath ? `${basePath}/${entry.name}` : entry.name);
        resolve([
          {
            id: `${fullPath}-${file.size}-${file.lastModified}`,
            name: file.name,
            path: fullPath,
            size: file.size,
            type: file.type || 'application/octet-stream',
            lastModified: file.lastModified,
            file: file,
          },
        ]);
      }, () => resolve([]));
    });
  } else if (entry.isDirectory) {
    const dirReader = (entry as any).createReader();
    const currentPath = basePath ? `${basePath}/${entry.name}` : entry.name;
    const entries: any[] = [];

    // Read entries in batches (WebKit directory reader can read in chunks of up to 100)
    const readBatch = async (): Promise<any[]> => {
      return new Promise((resolve) => {
        dirReader.readEntries((results: any[]) => {
          if (!results || results.length === 0) {
            resolve(entries);
          } else {
            entries.push(...results);
            readBatch().then(resolve);
          }
        }, () => resolve(entries));
      });
    };

    const allSubEntries = await readBatch();
    const nestedPromises = allSubEntries.map((subEntry) => scanEntry(subEntry, currentPath));
    const nestedResults = await Promise.all(nestedPromises);
    return nestedResults.flat();
  }
  return [];
}

/**
 * Process dragged DataTransfer items, extracting folders and nested files
 */
export async function processDataTransferItems(items: DataTransferItemList): Promise<ZipFileItem[]> {
  const promises: Promise<ZipFileItem[]>[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === 'file') {
      const entry = (item as any).webkitGetAsEntry?.();
      if (entry) {
        promises.push(scanEntry(entry));
      } else {
        const file = item.getAsFile();
        if (file) {
          promises.push(
            Promise.resolve([
              {
                id: `${file.name}-${file.size}-${file.lastModified}`,
                name: file.name,
                path: file.name,
                size: file.size,
                type: file.type || 'application/octet-stream',
                lastModified: file.lastModified,
                file: file,
              },
            ])
          );
        }
      }
    }
  }

  const results = await Promise.all(promises);
  return results.flat();
}

/**
 * Process HTML input[type=file] with webkitdirectory or multiple
 */
export function processFileInputList(fileList: FileList): ZipFileItem[] {
  const items: ZipFileItem[] = [];
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    // webkitRelativePath contains e.g. "my-folder/sub/file.txt" when webkitdirectory is selected
    const relativePath = file.webkitRelativePath || file.name;
    const normalized = normalizeZipPath(relativePath);

    items.push({
      id: `${normalized}-${file.size}-${file.lastModified}`,
      name: file.name,
      path: normalized,
      size: file.size,
      type: file.type || 'application/octet-stream',
      lastModified: file.lastModified,
      file: file,
    });
  }
  return items;
}
