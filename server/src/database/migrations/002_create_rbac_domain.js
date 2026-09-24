/**
 * Migration 002 - RBAC Domain
 *
 * Creates roles, permissions, and their mapping tables used to
 * enforce authorization across the platform.
 *
 * @module server/database/migrations/002_create_rbac_domain
 */

export async function up(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(64) NOT NULL UNIQUE,
      description VARCHAR(255),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS permissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(128) NOT NULL UNIQUE,
      description VARCHAR(255),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS user_roles (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
      PRIMARY KEY (user_id, role_id)
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
      PRIMARY KEY (role_id, permission_id)
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS user_permissions (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
      granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
      PRIMARY KEY (user_id, permission_id)
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles (user_id);
    CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions (role_id);
    CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions (user_id);
  `);
}

export async function down(client) {
  await client.query(`DROP TABLE IF EXISTS user_permissions CASCADE`);
  await client.query(`DROP TABLE IF EXISTS role_permissions CASCADE`);
  await client.query(`DROP TABLE IF EXISTS user_roles CASCADE`);
  await client.query(`DROP TABLE IF EXISTS permissions CASCADE`);
  await client.query(`DROP TABLE IF EXISTS roles CASCADE`);
}   