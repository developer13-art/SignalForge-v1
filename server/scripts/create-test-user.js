'use strict';

require('dotenv').config();

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const USERS = [
  {
    email: 'test@signalforge.local',
    password: 'TestPassword1',
    firstName: 'Test',
    lastName: 'User',
    kycStatus: 'NOT_STARTED',
  },
  {
    email: 'second@signalforge.local',
    password: 'TestPassword2',
    firstName: 'Second',
    lastName: 'User',
    kycStatus: 'VERIFIED',
  },
];

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    for (const user of USERS) {
      const hash = await bcrypt.hash(user.password, 10);
      const result = await pool.query(
        `INSERT INTO users (
           email, password_hash, first_name, last_name,
           status, kyc_status, email_verified_at
         ) VALUES ($1, $2, $3, $4, 'ACTIVE', $5, NOW())
         ON CONFLICT (email) DO UPDATE
           SET password_hash = EXCLUDED.password_hash,
               first_name = EXCLUDED.first_name,
               last_name = EXCLUDED.last_name,
               status = EXCLUDED.status,
               kyc_status = EXCLUDED.kyc_status,
               email_verified_at = NOW()
         RETURNING id, email, kyc_status, status`,
        [user.email, hash, user.firstName, user.lastName, user.kycStatus],
      );
      console.log('Upserted:', result.rows[0]);
    }
    console.log('');
    console.log('Test credentials ready:');
    for (const user of USERS) {
      console.log(`  ${user.email}  /  ${user.password}  (kyc: ${user.kycStatus})`);
    }
  } catch (error) {
    console.error('Failed:', error.message);
    if (error.code) {
      console.error('SQLSTATE:', error.code);
    }
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();