#!/usr/bin/env node
/**
 * Generate API Keys Script
 *
 * @module server/scripts/generate-api-keys
 */

import crypto from 'node:crypto';
import { sha256 } from '../src/utils/hash.util';
import { logger } from '../src/lib/logger';

function generateRaw() {
  const prefix = `sf_${crypto.randomBytes(6).toString('hex')}`;
  const body = crypto.randomBytes(32).toString('base64url');
  return { prefix, raw: `${prefix}.${body}` };
}

function main() {
  const count = Number(process.argv[2]) || 1;

  const results = [];

  for (let i = 0; i < count; i++) {
    const { prefix, raw } = generateRaw();
    results.push({
      prefix,
      raw,
      hashed: sha256(raw),
    });
  }

  logger.info({ count }, 'API keys generated');

  process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
}

main();