import { readdir, readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const MAX_APP_JS_GZIP_KIB = 285.81;
const MAX_EDITOR_JS_GZIP_KIB = 120;
const MAX_TOTAL_JS_GZIP_KIB = 405.81;
const assetsDirectory = new URL('../dist/assets/', import.meta.url);
const files = (await readdir(assetsDirectory)).filter((file) => file.endsWith('.js'));

if (files.length === 0) {
  throw new Error('No production JavaScript assets found; run the production build first.');
}

const entries = await Promise.all(files.map(async (file) => {
  const source = await readFile(new URL(file, assetsDirectory));
  return { file, gzipBytes: gzipSync(source, { level: 9 }).byteLength };
}));
const editorEntries = entries.filter((entry) => /^CodeEditor-.*\.js$/.test(entry.file));

if (editorEntries.length !== 1) {
  throw new Error(
    `Expected exactly one lazy CodeEditor JavaScript asset, found ${editorEntries.length}: ${editorEntries.map((entry) => entry.file).join(', ') || 'none'}.`,
  );
}

const editorBytes = editorEntries[0].gzipBytes;
const totalBytes = entries.reduce((total, entry) => total + entry.gzipBytes, 0);
const appBytes = totalBytes - editorBytes;
const appKiB = appBytes / 1024;
const editorKiB = editorBytes / 1024;
const totalKiB = totalBytes / 1024;
const failures = [];

if (appKiB > MAX_APP_JS_GZIP_KIB) {
  failures.push(`ordinary app: ${appKiB.toFixed(2)} KiB > ${MAX_APP_JS_GZIP_KIB.toFixed(2)} KiB`);
}
if (editorKiB > MAX_EDITOR_JS_GZIP_KIB) {
  failures.push(`CodeEditor: ${editorKiB.toFixed(2)} KiB > ${MAX_EDITOR_JS_GZIP_KIB.toFixed(2)} KiB`);
}
if (totalKiB > MAX_TOTAL_JS_GZIP_KIB) {
  failures.push(`total: ${totalKiB.toFixed(2)} KiB > ${MAX_TOTAL_JS_GZIP_KIB.toFixed(2)} KiB`);
}

if (failures.length > 0) {
  const largest = entries
    .sort((left, right) => right.gzipBytes - left.gzipBytes)
    .slice(0, 5)
    .map((entry) => `${entry.file}: ${(entry.gzipBytes / 1024).toFixed(2)} KiB`)
    .join('\n');
  throw new Error(
    `Client JavaScript budget exceeded:\n${failures.join('\n')}\nLargest assets:\n${largest}`,
  );
}

console.log(
  [
    'Client JavaScript budgets accepted:',
    `ordinary app ${appKiB.toFixed(2)} / ${MAX_APP_JS_GZIP_KIB.toFixed(2)} KiB gzip`,
    `CodeEditor ${editorKiB.toFixed(2)} / ${MAX_EDITOR_JS_GZIP_KIB.toFixed(2)} KiB gzip`,
    `total ${totalKiB.toFixed(2)} / ${MAX_TOTAL_JS_GZIP_KIB.toFixed(2)} KiB gzip`,
  ].join('\n'),
);
