/**
 * Base Repository
 *
 * Provides a generic repository implementation with common CRUD
 * operations. Domain-specific repositories extend this class and
 * override or extend its behaviour.
 *
 * @module server/database/repositories/base.repository
 */

import { getPool } from '../connection';
import { withTransaction } from '../transaction';

export class BaseRepository {
  constructor(table) {
    if (!table) {
      throw new Error('table is required');
    }
    this.table = table;
  }

  async findById(id) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT * FROM ${this.table} WHERE id = $1 LIMIT 1`,
      [id],
    );
    return rows[0] || null;
  }

  async findAll({ limit = 100, offset = 0, orderBy = 'created_at', direction = 'DESC' } = {}) {
    const dir = String(direction).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT * FROM ${this.table} ORDER BY ${orderBy} ${dir} LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return rows;
  }

  async findWhere(conditions = {}, { limit = 100, offset = 0 } = {}) {
    const keys = Object.keys(conditions);
    if (keys.length === 0) {
      return this.findAll({ limit, offset });
    }

    const params = keys.map((k) => conditions[k]);
    const where = keys.map((k, i) => `${k} = $${i + 1}`).join(' AND ');

    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT * FROM ${this.table} WHERE ${where} ORDER BY created_at DESC LIMIT $${keys.length + 1} OFFSET $${keys.length + 2}`,
      [...params, limit, offset],
    );
    return rows;
  }

  async count(conditions = {}) {
    const keys = Object.keys(conditions);
    const params = keys.map((k) => conditions[k]);
    const where = keys.length > 0 ? `WHERE ${keys.map((k, i) => `${k} = $${i + 1}`).join(' AND ')}` : '';

    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM ${this.table} ${where}`,
      params,
    );
    return rows[0].total;
  }

  async insert(data) {
    const keys = Object.keys(data);
    const values = keys.map((k) => data[k]);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO ${this.table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values,
    );
    return rows[0];
  }

  async update(id, data) {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return this.findById(id);
    }

    const values = keys.map((k) => data[k]);
    const assignments = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');

    const pool = getPool();
    const { rows } = await pool.query(
      `UPDATE ${this.table} SET ${assignments}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id],
    );
    return rows[0] || null;
  }

  async delete(id) {
    const pool = getPool();
    const { rowCount } = await pool.query(
      `DELETE FROM ${this.table} WHERE id = $1`,
      [id],
    );
    return rowCount > 0;
  }

  async transaction(fn) {
    return withTransaction(async (client) => fn(client, this));
  }
}

export default BaseRepository;