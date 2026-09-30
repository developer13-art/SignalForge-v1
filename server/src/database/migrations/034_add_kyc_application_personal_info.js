'use strict';

/**
 * Add persisted personal information to KYC applications so users
 * can resume verification after leaving the flow.
 */
async function up(client) {
  await client.query(`
    ALTER TABLE kyc_applications
      ADD COLUMN IF NOT EXISTS personal_info JSONB;
  `);
}

async function down(client) {
  await client.query(`
    ALTER TABLE kyc_applications
      DROP COLUMN IF EXISTS personal_info;
  `);
}

module.exports = { up, down };