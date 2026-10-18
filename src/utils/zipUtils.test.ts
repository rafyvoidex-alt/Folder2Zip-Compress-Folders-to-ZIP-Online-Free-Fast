import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatBytes,
  normalizeZipPath,
  suggestZipName,
  isIgnoredPath,
  calculateSavings,
  buildFileTree,
  getFileTypeStats,
  type ZipFileItem,
} from './zipUtils.ts';

test('formatBytes handles zero, bytes, KB, MB, GB gracefully', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(512), '512 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1536), '1.5 KB');
  assert.equal(formatBytes(1048576), '1 MB');
  assert.equal(formatBytes(1073741824), '1 GB');
});

test('normalizeZipPath cleans up backslashes, leading/trailing slashes, redundant slashes', () => {
  assert.equal(normalizeZipPath('foo\\bar\\baz.txt'), 'foo/bar/baz.txt');
  assert.equal(normalizeZipPath('/project/assets/logo.png'), 'project/assets/logo.png');
  assert.equal(normalizeZipPath('./my-folder//subfolder///file.js'), 'my-folder/subfolder/file.js');
  assert.equal(normalizeZipPath('plain-file.pdf'), 'plain-file.pdf');
  assert.equal(normalizeZipPath(''), '');
});

test('suggestZipName detects common root directory or single file base name', () => {
  const folderItems: ZipFileItem[] = [
    { id: '1', name: 'index.html', path: 'my-project/index.html', size: 100, type: 'text/html' },
    { id: '2', name: 'style.css', path: 'my-project/css/style.css', size: 200, type: 'text/css' },
  ];
  assert.equal(suggestZipName(folderItems), 'my-project.zip');

  const singleFile: ZipFileItem[] = [
    { id: '1', name: 'document.pdf', path: 'document.pdf', size: 500, type: 'application/pdf' },
  ];
  assert.equal(suggestZipName(singleFile), 'document.zip');

  const mixedItems: ZipFileItem[] = [
    { id: '1', name: 'a.txt', path: 'folderA/a.txt', size: 100, type: 'text/plain' },
    { id: '2', name: 'b.txt', path: 'folderB/b.txt', size: 100, type: 'text/plain' },
  ];
  assert.equal(suggestZipName(mixedItems, 'custom-bundle'), 'custom-bundle.zip');
});

test('isIgnoredPath filters hidden and system files according to options', () => {
  assert.equal(isIgnoredPath('.DS_Store', { ignoreHidden: true }), true);
  assert.equal(isIgnoredPath('folder/.DS_Store', { ignoreHidden: true }), true);
  assert.equal(isIgnoredPath('folder/.git/config', { ignoreHidden: true }), true);
  assert.equal(isIgnoredPath('folder/Thumbs.db', { ignoreSystem: true }), true);
  assert.equal(isIgnoredPath('my-app/node_modules/package.json', { ignoreNodeModules: true }), true);

  // When disabled
  assert.equal(isIgnoredPath('folder/.DS_Store', { ignoreHidden: false }), false);
  assert.equal(isIgnoredPath('folder/regular-file.txt', { ignoreHidden: true, ignoreSystem: true }), false);
});

test('calculateSavings accurately calculates bytes and percentage', () => {
  const result = calculateSavings(1000, 400);
  assert.equal(result.savingsBytes, 600);
  assert.equal(result.savingsPercentage, 60);
  assert.equal(result.ratio, 0.4);

  const noSavings = calculateSavings(100, 100);
  assert.equal(noSavings.savingsBytes, 0);
  assert.equal(noSavings.savingsPercentage, 0);

  const edgeZero = calculateSavings(0, 0);
  assert.equal(edgeZero.savingsBytes, 0);
  assert.equal(edgeZero.savingsPercentage, 0);
});

test('buildFileTree creates ordered hierarchical tree representation', () => {
  const items: ZipFileItem[] = [
    { id: '1', name: 'README.md', path: 'docs/README.md', size: 150, type: 'text/markdown' },
    { id: '2', name: 'main.js', path: 'src/main.js', size: 300, type: 'text/javascript' },
    { id: '3', name: 'util.js', path: 'src/utils/util.js', size: 200, type: 'text/javascript' },
    { id: '4', name: 'index.html', path: 'index.html', size: 100, type: 'text/html' },
  ];

  const tree = buildFileTree(items);
  assert.equal(tree.size, 750);
  assert.ok(tree.children);
  // Folders should sort first: docs, src, then index.html
  assert.equal(tree.children[0].name, 'docs');
  assert.equal(tree.children[0].isFolder, true);
  assert.equal(tree.children[1].name, 'src');
  assert.equal(tree.children[1].isFolder, true);
  assert.equal(tree.children[2].name, 'index.html');
  assert.equal(tree.children[2].isFolder, false);

  // Check subfolder
  const src = tree.children[1];
  assert.ok(src.children);
  assert.equal(src.children[0].name, 'utils');
  assert.equal(src.children[0].isFolder, true);
  assert.equal(src.children[1].name, 'main.js');
  assert.equal(src.children[1].isFolder, false);
});

test('getFileTypeStats categorizes files properly and counts correctly', () => {
  const items: ZipFileItem[] = [
    { id: '1', name: 'photo.jpg', path: 'img/photo.jpg', size: 1000, type: 'image/jpeg' },
    { id: '2', name: 'banner.png', path: 'img/banner.png', size: 2000, type: 'image/png' },
    { id: '3', name: 'script.js', path: 'js/script.js', size: 500, type: 'text/javascript' },
    { id: '4', name: 'notes.txt', path: 'notes.txt', size: 200, type: 'text/plain' },
  ];

  const stats = getFileTypeStats(items);
  assert.equal(stats.length, 3);
  assert.equal(stats[0].category, 'Images');
  assert.equal(stats[0].count, 2);
  assert.equal(stats[0].size, 3000);
});
