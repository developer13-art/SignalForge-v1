/**
 * User-Role Repository
 *
 * @module signalforge/server/modules/rbac/user-role-repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class UserRoleRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async listRolesForUser(userId) {
    const result = await this.db.query(
      `SELECT r.id, r.name, r.description, r.is_system, r.priority, ur.assigned_at, ur.assigned_by
         FROM user_roles ur
         JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = $1
        ORDER BY r.priority DESC, r.name`,
      [userId],
    );
    return result.rows;
  }

  async listUserIdsForRole(roleId) {
    const result = await this.db.query(
      `SELECT user_id FROM user_roles WHERE role_id = $1`,
      [roleId],
    );
    return result.rows.map((row) => row.user_id);
  }

  async hasRole(userId, roleId) {
    const result = await this.db.query(
      `SELECT 1 FROM user_roles WHERE user_id = $1 AND role_id = $2 LIMIT 1`,
      [userId, roleId],
    );
    return result.rowCount > 0;
  }

  async assign(userId, roleId, assignedBy = null) {
    const result = await this.db.query(
      `INSERT INTO user_roles (user_id, role_id, assigned_at, assigned_by)
       VALUES ($1, $2, NOW(), $3)
       ON CONFLICT (user_id, role_id) DO NOTHING
       RETURNING user_id, role_id, assigned_at`,
      [userId, roleId, assignedBy],
    );
    return result.rows[0] || null;
  }

  async revoke(userId, roleId) {
    const result = await this.db.query(
      `DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2 RETURNING user_id`,
      [userId, roleId],
    );
    return result.rowCount > 0;
  }

  async replaceRoles(userId, roleIds, assignedBy = null) {
    await this.db.transaction(async (client) => {
      await client.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
      if (roleIds.length === 0) {
        return;
      }
      const placeholders = roleIds.map((_, i) => `($1, $${i + 2}, NOW(), $${roleIds.length + 2})`).join(', ');
      const values = [userId, ...roleIds, assignedBy];
      await client.query(
        `INSERT INTO user_roles (user_id, role_id, assigned_at, assigned_by)
         VALUES ${placeholders}
         ON CONFLICT (user_id, role_id) DO NOTHING`,
        values,
      );
    });
  }

  async countUsersWithRole(roleId) {
    const result = await this.db.query(
      `SELECT COUNT(*)::int AS count FROM user_roles WHERE role_id = $1`,
      [roleId],
    );
    return result.rows[0]?.count || 0;
  }

  async countUsersWithAnyRole(roleNames) {
    const result = await this.db.query(
      `SELECT COUNT(DISTINCT ur.user_id)::int AS count
         FROM user_roles ur
         JOIN roles r ON r.id = ur.role_id
        WHERE r.name = ANY($1::text[])`,
      [roleNames],
    );
    return result.rows[0]?.count || 0;
  }
}

export default UserRoleRepository;