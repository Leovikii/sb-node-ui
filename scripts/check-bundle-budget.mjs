import { readdir, readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const MAX_TOTAL_JS_GZIP_KIB = 285.81;
const assetsDirectory = new URL('../dist/assets/', import.meta.url);
const files = (await readdir(assetsDirectory)).filter((file) => file.endsWith('.js'));

if (files.length === 0) {
  throw new Error('No production JavaScript assets found; run the production build first.');
}

const entries = await Promise.all(files.map(async (file) => {
  const source = await readFile(new URL(file, assetsDirectory));
  return { file, gzipBytes: gzipSync(source, { level: 9 }).byteLength };
}));
const totalBytes = entries.reduce((total, entry) => total + entry.gzipBytes, 0);
const totalKiB = totalBytes / 1024;

if (totalKiB > MAX_TOTAL_JS_GZIP_KIB) {
  const largest = entries
    .sort((left, right) => right.gzipBytes - left.gzipBytes)
    .slice(0, 5)
    .map((entry) => `${entry.file}: ${(entry.gzipBytes / 1024).toFixed(2)} KiB`)
    .join('\n');
  throw new Error(
    `Client JavaScript budget exceeded: ${totalKiB.toFixed(2)} KiB gzip > ${MAX_TOTAL_JS_GZIP_KIB.toFixed(2)} KiB.\n${largest}`,
  );
}

console.log(
  `Client JavaScript budget accepted: ${totalKiB.toFixed(2)} KiB gzip / ${MAX_TOTAL_JS_GZIP_KIB.toFixed(2)} KiB.`,
);
