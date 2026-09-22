/**
 * Permission Repository
 *
 * @module signalforge/server/modules/rbac/permission-repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class PermissionRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async findByName(name) {
    const result = await this.db.query(
      `SELECT id, name, description, "group", is_system, created_at, updated_at
         FROM permissions
        WHERE name = $1
        LIMIT 1`,
      [name],
    );
    return result.rows[0] || null;
  }

  async findById(permissionId) {
    const result = await this.db.query(
      `SELECT id, name, description, "group", is_system, created_at, updated_at
         FROM permissions
        WHERE id = $1
        LIMIT 1`,
      [permissionId],
    );
    return result.rows[0] || null;
  }

  async list(filters = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.group) {
      conditions.push(`"group" = $${index++}`);
      values.push(filters.group);
    }

    if (filters.search) {
      conditions.push(`(name ILIKE $${index} OR description ILIKE $${index})`);
      values.push(`%${filters.search}%`);
      index++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query(
      `SELECT id, name, description, "group", is_system, created_at, updated_at
         FROM permissions
         ${where}
         ORDER BY "group", name`,
      values,
    );
    return result.rows;
  }

  async create(data) {
    const result = await this.db.query(
      `INSERT INTO permissions (name, description, "group", is_system, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, name, description, "group", is_system, created_at, updated_at`,
      [data.name, data.description || null, data.group, data.isSystem === true],
    );
    return result.rows[0];
  }

  async update(permissionId, data) {
    const fields = [];
    const values = [permissionId];
    let index = 2;

    if (data.description !== undefined) {
      fields.push(`description = $${index++}`);
      values.push(data.description);
    }
    if (data.group !== undefined) {
      fields.push(`"group" = $${index++}`);
      values.push(data.group);
    }

    if (fields.length === 0) {
      return this.findById(permissionId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE permissions
          SET ${fields.join(', ')}
        WHERE id = $1`,
      values,
    );
    return this.findById(permissionId);
  }

  async delete(permissionId) {
    await this.db.query('DELETE FROM permissions WHERE id = $1', [permissionId]);
  }

  async listForRole(roleId) {
    const result = await this.db.query(
      `SELECT p.id, p.name, p.description, p."group", p.is_system
         FROM permissions p
         JOIN role_permissions rp ON rp.permission_id = p.id
        WHERE rp.role_id = $1
        ORDER BY p."group", p.name`,
      [roleId],
    );
    return result.rows;
  }

  async listNamesForRole(roleId) {
    const result = await this.db.query(
      `SELECT p.name
         FROM permissions p
         JOIN role_permissions rp ON rp.permission_id = p.id
        WHERE rp.role_id = $1`,
      [roleId],
    );
    return result.rows.map((row) => row.name);
  }
}

export default PermissionRepository;