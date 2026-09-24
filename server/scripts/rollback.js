#!/usr/bin/env node
/**
 * Rollback Script
 *
 * @module server/scripts/rollback
 */

import { rollbackMigration } from '../src/database/migrations/rollback';
import { closePool } from '../src/database/connection';
import { logger } from '../src/lib/logger';

const filename = process.argv[2];

(async () => {
  try {
    const result = await rollbackMigration({ filename });
    logger.info({ result }, 'Rollback complete');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Rollback failed');
    process.exit(1);
  } finally {
    await closePool();
  }
})();