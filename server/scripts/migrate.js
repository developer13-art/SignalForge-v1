'use strict';

/**
 * Migration CLI
 *
 * Runs every pending migration in order. This script is CommonJS
 * because the rest of the server is CommonJS; mixing ES modules and
 * CommonJS in the same project produces "Cannot use import statement
 * outside a module" errors at runtime.
 *
 * Usage:
 *   node scripts/migrate.js
 *   node scripts/migrate.js --rollback --step 1
 *   node scripts/migrate.js --status
 *
 * @module server/scripts/migrate
 */

require('dotenv').config();

const runner = require('../src/database/migrations/runner');
const { closePool } = require('../src/database/connection');
const { getLogger } = require('../src/bootstrap/initLogger');

function parseArgs(argv) {
  const args = argv.slice(2);
  const options = { mode: 'migrate', step: 1 };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--rollback') {
      options.mode = 'rollback';
    } else if (arg === '--status') {
      options.mode = 'status';
    } else if (arg === '--step' && args[i + 1]) {
      const parsed = Number.parseInt(args[i + 1], 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        options.step = parsed;
      }
      i += 1;
    }
  }

  return options;
}

async function main() {
  const logger = getLogger('migrate');
  const options = parseArgs(process.argv);

  try {
    if (options.mode === 'rollback') {
      const result = await runner.rollback({ step: options.step, logger });
      logger.info({ result }, 'Rollback complete');
    } else if (options.mode === 'status') {
      const result = await runner.status({ logger });
      logger.info({ result }, 'Migration status');
    } else {
      const result = await runner.migrate({ logger });
      logger.info({ result }, 'Migrations complete');
    }

    await closePool();
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Migration failed');
    try {
      await closePool();
    } catch (_closeError) {
      // Ignore close errors on the failure path.
    }
    process.exit(1);
  }
}

main();