/**
 * Role Repository
 *
 * @module signalforge/server/modules/rbac/role-repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class RoleRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async findByName(name) {
    const result = await this.db.query(
      `SELECT id, name, description, is_system, priority, created_at, updated_at
         FROM roles
        WHERE name = $1
        LIMIT 1`,
      [name],
    );
    return result.rows[0] || null;
  }

  async findById(roleId) {
    const result = await this.db.query(
      `SELECT id, name, description, is_system, priority, created_at, updated_at
         FROM roles
        WHERE id = $1
        LIMIT 1`,
      [roleId],
    );
    return result.rows[0] || null;
  }

  async list(filters = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.isSystem !== undefined) {
      conditions.push(`is_system = $${index++}`);
      values.push(filters.isSystem);
    }

    if (filters.search) {
      conditions.push(`(name ILIKE $${index} OR description ILIKE $${index})`);
      values.push(`%${filters.search}%`);
      index++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query(
      `SELECT r.id, r.name, r.description, r.is_system, r.priority, r.created_at, r.updated_at,
              COALESCE(COUNT(DISTINCT ur.user_id), 0)::int AS user_count,
              COALESCE(COUNT(DISTINCT rp.permission_id), 0)::int AS permission_count
         FROM roles r
         LEFT JOIN user_roles ur ON ur.role_id = r.id
         LEFT JOIN role_permissions rp ON rp.role_id = r.id
         ${where}
         GROUP BY r.id
         ORDER BY r.priority DESC, r.name`,
      values,
    );
    return result.rows;
  }

  async create(data) {
    const result = await this.db.query(
      `INSERT INTO roles (name, description, is_system, priority, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, name, description, is_system, priority, created_at, updated_at`,
      [
        data.name,
        data.description || null,
        data.isSystem === true,
        data.priority ?? 100,
      ],
    );
    return result.rows[0];
  }

  async update(roleId, data) {
    const fields = [];
    const values = [roleId];
    let index = 2;

    if (data.description !== undefined) {
      fields.push(`description = $${index++}`);
      values.push(data.description);
    }
    if (data.priority !== undefined) {
      fields.push(`priority = $${index++}`);
      values.push(data.priority);
    }

    if (fields.length === 0) {
      return this.findById(roleId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE roles
          SET ${fields.join(', ')}
        WHERE id = $1`,
      values,
    );
    return this.findById(roleId);
  }

  async delete(roleId) {
    await this.db.query('DELETE FROM roles WHERE id = $1', [roleId]);
  }

  async countUsersWithRole(roleId) {
    const result = await this.db.query(
      `SELECT COUNT(*)::int AS count FROM user_roles WHERE role_id = $1`,
      [roleId],
    );
    return result.rows[0]?.count || 0;
  }

  async grantPermission(roleId, permissionId) {
    await this.db.query(
      `INSERT INTO role_permissions (role_id, permission_id, granted_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (role_id, permission_id) DO NOTHING`,
      [roleId, permissionId],
    );
  }

  async revokePermission(roleId, permissionId) {
    await this.db.query(
      `DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2`,
      [roleId, permissionId],
    );
  }

  async replacePermissions(roleId, permissionIds) {
    await this.db.transaction(async (client) => {
      await client.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);
      if (permissionIds.length === 0) {
        return;
      }
      const placeholders = permissionIds.map((_, i) => `($1, $${i + 2}, NOW())`).join(', ');
      const values = [roleId, ...permissionIds];
      await client.query(
        `INSERT INTO role_permissions (role_id, permission_id, granted_at)
         VALUES ${placeholders}
         ON CONFLICT (role_id, permission_id) DO NOTHING`,
        values,
      );
    });
  }
}

export default RoleRepository;