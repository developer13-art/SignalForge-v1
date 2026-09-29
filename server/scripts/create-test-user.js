'use strict';

/**
 * Creates a single test user for local development.
 *
 * Usage:  node scripts/create-test-user.js
 *
 * This script is intended for local development only. It is not
 * referenced by the server at runtime and has no effect on
 * production. Running it repeatedly is safe: the ON CONFLICT clause
 * replaces the password hash of an existing account.
 */

require('dotenv').config();

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const EMAIL = 'test@signalforge.local';
const PASSWORD = 'TestPassword1';

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const passwordHash = await bcrypt.hash(PASSWORD, 10);

    const result = await pool.query(
      `
        INSERT INTO users (
          email,
          password_hash,
          first_name,
          last_name,
          status,
          kyc_status,
          email_verified_at
        )
        VALUES ($1, $2, 'Test', 'User', 'ACTIVE', 'NOT_STARTED', NOW())
        ON CONFLICT (email)
        DO UPDATE SET password_hash = EXCLUDED.password_hash
        RETURNING id, email, status, kyc_status
      `,
      [EMAIL, passwordHash],
    );

    console.log('Test user ready:');
    console.log(result.rows[0]);
    console.log('');
    console.log('Email:    ', EMAIL);
    console.log('Password: ', PASSWORD);
  } catch (error) {
    console.error('Failed to create test user:', error.message);
    if (error.code) {
      console.error('SQLSTATE:', error.code);
    }
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();