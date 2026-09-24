#!/usr/bin/env node
/**
 * Migrate Script
 *
 * @module server/scripts/migrate
 */

import { runMigrations } from '../src/database/migrations/runner';
import { closePool } from '../src/database/connection';
import { logger } from '../src/lib/logger';

(async () => {
  try {
    const result = await runMigrations();
    logger.info({ result }, 'Migrations complete');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Migration failed');
    process.exit(1);
  } finally {
    await closePool();
  }
})();