'use strict';

/**
 * SignalForge - Roles and Users Seed Script
 *
 * Creates one account per platform role so every console and every
 * authenticated flow can be tested end to end. Roles, permissions,
 * and role-permission bindings are already seeded by the migration
 * `028_seed_system_roles_and_permissions.js`; this script does not
 * touch them. It only creates users, profiles, and role bindings.
 *
 * The script is idempotent. Running it repeatedly is safe:
 *   - Users are matched by email and updated in place.
 *   - Profiles are matched by user_id and updated in place.
 *   - Role bindings are matched by (user_id, role_id) and skipped if
 *     they already exist.
 *
 * Usage:
 *   cd server
 *   node scripts/seed-roles-and-users.js
 *
 * This script must be run from the `server/` folder so that `dotenv`
 * and `pg` resolve from `server/node_modules`.
 */

require('dotenv').config();

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const SEED_USERS = [
  {
    email: 'superadmin@signalforge.local',
    password: 'SuperAdminPass123!',
    firstName: 'Super',
    lastName: 'Admin',
    roleName: 'SUPER_ADMIN',
    kycStatus: 'VERIFIED',
    accountType: 'ADMIN',
  },
  {
    email: 'admin@signalforge.local',
    password: 'AdminPass123!',
    firstName: 'Platform',
    lastName: 'Admin',
    roleName: 'ADMIN',
    kycStatus: 'VERIFIED',
    accountType: 'ADMIN',
  },
  {
    email: 'compliance@signalforge.local',
    password: 'CompliancePass123!',
    firstName: 'Compliance',
    lastName: 'Officer',
    roleName: 'COMPLIANCE_OFFICER',
    kycStatus: 'VERIFIED',
    accountType: 'ADMIN',
  },
  {
    email: 'finance@signalforge.local',
    password: 'FinancePass123!',
    firstName: 'Finance',
    lastName: 'Admin',
    roleName: 'FINANCE_ADMIN',
    kycStatus: 'VERIFIED',
    accountType: 'ADMIN',
  },
  {
    email: 'support@signalforge.local',
    password: 'SupportPass123!',
    firstName: 'Support',
    lastName: 'Agent',
    roleName: 'SUPPORT',
    kycStatus: 'VERIFIED',
    accountType: 'ADMIN',
  },
  {
    email: 'moderator@signalforge.local',
    password: 'ModeratorPass123!',
    firstName: 'Content',
    lastName: 'Moderator',
    roleName: 'MODERATOR',
    kycStatus: 'VERIFIED',
    accountType: 'ADMIN',
  },
  {
    email: 'provider@signalforge.local',
    password: 'ProviderPass123!',
    firstName: 'Signal',
    lastName: 'Provider',
    roleName: 'PROVIDER',
    kycStatus: 'VERIFIED',
    accountType: 'USER',
  },
  {
    email: 'trader@signalforge.local',
    password: 'TraderPass123!',
    firstName: 'Manual',
    lastName: 'Trader',
    roleName: 'TRADER',
    kycStatus: 'VERIFIED',
    accountType: 'USER',
  },
  {
    email: 'user@signalforge.local',
    password: 'UserPass123!',
    firstName: 'Standard',
    lastName: 'User',
    roleName: 'USER',
    kycStatus: 'VERIFIED',
    accountType: 'USER',
  },
];

async function upsertUser(pool, spec) {
  const passwordHash = await bcrypt.hash(spec.password, 10);

  const result = await pool.query(
    `
      INSERT INTO users (
        email,
        password_hash,
        first_name,
        last_name,
        status,
        kyc_status,
        account_type,
        email_verified_at,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, 'ACTIVE', $5, $6, NOW(), NOW(), NOW())
      ON CONFLICT (email)
      DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        status = 'ACTIVE',
        kyc_status = EXCLUDED.kyc_status,
        account_type = EXCLUDED.account_type,
        email_verified_at = COALESCE(users.email_verified_at, NOW()),
        failed_login_attempts = 0,
        locked_until = NULL,
        updated_at = NOW()
      RETURNING id, email, status, kyc_status, account_type
    `,
    [spec.email, passwordHash, spec.firstName, spec.lastName, spec.kycStatus, spec.accountType],
  );

  return result.rows[0];
}

async function upsertProfile(pool, userId) {
  await pool.query(
    `
      INSERT INTO user_profiles (user_id, timezone, language, created_at, updated_at)
      VALUES ($1, 'UTC', 'en', NOW(), NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET updated_at = NOW()
    `,
    [userId],
  );
}

async function lookupRole(pool, roleName) {
  const result = await pool.query('SELECT id, name FROM roles WHERE name = $1 LIMIT 1', [
    roleName,
  ]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

async function bindUserToRole(pool, userId, roleId) {
  const existing = await pool.query(
    'SELECT 1 FROM user_roles WHERE user_id = $1 AND role_id = $2 LIMIT 1',
    [userId, roleId],
  );

  if (existing.rows.length > 0) {
    return { bound: false, reason: 'already_bound' };
  }

  await pool.query(
    `
      INSERT INTO user_roles (user_id, role_id, granted_at)
      VALUES ($1, $2, NOW())
    `,
    [userId, roleId],
  );

  return { bound: true };
}

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const summary = [];

  try {
    for (const spec of SEED_USERS) {
      const role = await lookupRole(pool, spec.roleName);

      if (!role) {
        summary.push({
          email: spec.email,
          role: spec.roleName,
          status: 'FAILED',
          reason: `Role ${spec.roleName} not found in the roles table`,
        });
        continue;
      }

      const user = await upsertUser(pool, spec);
      await upsertProfile(pool, user.id);

      const binding = await bindUserToRole(pool, user.id, role.id);

      summary.push({
        email: user.email,
        role: role.name,
        kycStatus: user.kyc_status,
        accountType: user.account_type,
        password: spec.password,
        status: 'OK',
        roleBinding: binding.bound ? 'created' : 'already_present',
      });
    }

    // Bind the pre-existing test account to USER if it is not yet bound
    // to any role. This account was created earlier for ad-hoc testing.
    const legacyTest = await pool.query(
      "SELECT id FROM users WHERE email = 'test@signalforge.local' LIMIT 1",
    );

    if (legacyTest.rows.length > 0) {
      const userRole = await lookupRole(pool, 'USER');
      if (userRole) {
        const binding = await bindUserToRole(pool, legacyTest.rows[0].id, userRole.id);
        summary.push({
          email: 'test@signalforge.local',
          role: 'USER',
          kycStatus: 'NOT_STARTED',
          accountType: 'USER',
          password: 'TestPassword1',
          status: 'OK',
          roleBinding: binding.bound ? 'created' : 'already_present',
        });
      }
    }
  } finally {
    await pool.end();
  }

  const pad = (value, width) => String(value || '').padEnd(width);
  const padLeft = (value, width) => String(value || '').padStart(width);

  console.log('');
  console.log('==========================================================================================');
  console.log('SignalForge - Seeded Accounts');
  console.log('==========================================================================================');
  console.log(
    `${pad('EMAIL', 34)} ${pad('ROLE', 22)} ${pad('PASSWORD', 24)} ${pad('KYC', 12)} STATUS`,
  );
  console.log('------------------------------------------------------------------------------------------');

  for (const row of summary) {
    console.log(
      `${pad(row.email, 34)} ${pad(row.role, 22)} ${pad(row.password, 24)} ${pad(
        row.kycStatus,
        12,
      )} ${row.status === 'OK' ? 'OK' : `FAILED (${row.reason})`}`,
    );
  }

  console.log('------------------------------------------------------------------------------------------');
  console.log(`${padLeft(summary.filter((r) => r.status === 'OK').length, 3)} accounts ready.`);
  console.log('');
  console.log('Log in with any of the above credentials at http://localhost:3000/login');
  console.log('');
}

main().catch((error) => {
  console.error('');
  console.error('Seed failed:', error.message);
  if (error.code) {
    console.error('SQLSTATE:', error.code);
  }
  if (error.detail) {
    console.error('Detail:', error.detail);
  }
  process.exit(1);
});