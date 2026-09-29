'use strict';

require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  try {
    const result = await pool.query(
      `SELECT column_name, is_nullable, data_type
         FROM information_schema.columns
        WHERE table_name = 'user_sessions'
        ORDER BY ordinal_position`,
    );
    console.log('user_sessions columns:');
    console.table(result.rows);
  } catch (error) {
    console.error('ERR', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();