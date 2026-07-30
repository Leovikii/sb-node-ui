import { readFile } from 'node:fs/promises';

const allowedLicenses = new Set([
  '0BSD',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  'MIT',
  '(MIT OR CC0-1.0)',
]);

const lockfile = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'));
const rejected = [];
const counts = new Map();

for (const [path, metadata] of Object.entries(lockfile.packages ?? {})) {
  if (!path.startsWith('node_modules/') || metadata.dev) continue;

  const name = path.slice('node_modules/'.length);
  const license = typeof metadata.license === 'string' ? metadata.license : '<missing>';
  counts.set(license, (counts.get(license) ?? 0) + 1);

  if (!allowedLicenses.has(license)) {
    rejected.push({ name, license });
  }
}

if (rejected.length > 0) {
  console.error('Rejected production dependency licenses:');
  for (const { name, license } of rejected) {
    console.error(`- ${name}: ${license}`);
  }
  console.error('Review the package terms and record an ADR before changing the allowlist.');
  process.exitCode = 1;
} else {
  const summary = [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([license, count]) => `${license}: ${count}`)
    .join(', ');
  console.log(`Production dependency licenses accepted (${summary}).`);
}
