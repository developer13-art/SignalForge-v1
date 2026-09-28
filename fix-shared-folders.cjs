'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, 'shared', 'src');

// Folders that contain an index.cjs and are imported using folder syntax.
const FOLDERS_WITH_INDEX = [
  'constants/crypto-pairs',
  'constants/proof-of-alpha',
  'constants/solana-actions',
  'schemas/actions',
  'schemas/execution-routing',
  'schemas/proof-of-alpha',
  'constants',
  'schemas',
  'types',
  'utils',
  'validators',
];

let created = 0;
let skipped = 0;

for (const rel of FOLDERS_WITH_INDEX) {
  const folder = path.join(ROOT, rel);
  const indexFile = path.join(folder, 'index.cjs');

  if (!fs.existsSync(indexFile)) {
    console.log(`skipped (no index.cjs): ${rel}`);
    skipped += 1;
    continue;
  }

  const pkgPath = path.join(folder, 'package.json');
  const content = JSON.stringify({ main: './index.cjs' }, null, 2) + '\n';

  fs.writeFileSync(pkgPath, content, 'utf8');
  console.log(`wrote: ${path.relative(ROOT, pkgPath)}`);
  created += 1;
}

console.log('');
console.log(`Created: ${created}`);
console.log(`Skipped: ${skipped}`);