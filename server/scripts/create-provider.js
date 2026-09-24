#!/usr/bin/env node
/**
 * Create Provider Script
 *
 * @module server/scripts/create-provider
 */

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { db } from '../src/database';
import { closePool } from '../src/database/connection';
import { hashPassword } from '../src/utils/password.util';
import { logger } from '../src/lib/logger';

(async () => {
  const rl = readline.createInterface({ input, output });

  try {
    const email = (await rl.question('Provider email: ')).trim().toLowerCase();
    const password = (await rl.question('Password (min 12 chars): ')).trim();
    const displayName = (await rl.question('Display name: ')).trim();

    if (!email || !password || password.length < 12 || !displayName) {
      logger.error('Invalid input');
      process.exit(1);
    }

    const hash = await hashPassword(password);

    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, status, kyc_status, account_type, email_verified_at, created_at, updated_at)
       VALUES ($1, $2, 'ACTIVE', 'VERIFIED', 'PROVIDER', NOW(), NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW()
       RETURNING id`,
      [email, hash],
    );

    const userId = rows[0].id;

    await db.query(
      `INSERT INTO providers (user_id, display_name, status, certification_status, created_at, updated_at)
       VALUES ($1, $2, 'ACTIVE', 'NOT_STARTED', NOW(), NOW())
       ON CONFLICT (user_id) DO NOTHING`,
      [userId, displayName],
    );

    const { rows: roleRows } = await db.query(`SELECT id FROM roles WHERE name = 'PROVIDER' LIMIT 1`);

    if (roleRows[0]) {
      await db.query(
        `INSERT INTO user_roles (user_id, role_id, granted_at) VALUES ($1, $2, NOW())
         ON CONFLICT DO NOTHING`,
        [userId, roleRows[0].id],
      );
    }

    logger.info({ userId, email }, 'Provider created');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Failed to create provider');
    process.exit(1);
  } finally {
    rl.close();
    await closePool();
  }
})();