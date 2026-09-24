#!/usr/bin/env node
/**
 * Create Admin Script
 *
 * @module server/scripts/create-admin
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
    const email = (await rl.question('Admin email: ')).trim().toLowerCase();
    const password = (await rl.question('Password (min 12 chars): ')).trim();

    if (!email || !password || password.length < 12) {
      logger.error('Invalid input');
      process.exit(1);
    }

    const hash = await hashPassword(password);

    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, status, kyc_status, account_type, email_verified_at, created_at, updated_at)
       VALUES ($1, $2, 'ACTIVE', 'VERIFIED', 'ADMIN', NOW(), NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW()
       RETURNING id`,
      [email, hash],
    );

    const userId = rows[0].id;

    const { rows: roleRows } = await db.query(`SELECT id FROM roles WHERE name = 'SUPER_ADMIN' LIMIT 1`);

    if (roleRows[0]) {
      await db.query(
        `INSERT INTO user_roles (user_id, role_id, granted_at) VALUES ($1, $2, NOW())
         ON CONFLICT DO NOTHING`,
        [userId, roleRows[0].id],
      );
    }

    logger.info({ userId, email }, 'Admin user created');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Failed to create admin');
    process.exit(1);
  } finally {
    rl.close();
    await closePool();
  }
})();