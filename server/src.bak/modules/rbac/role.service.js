/**
 * Role Service
 *
 * @module signalforge/server/modules/rbac/role-service
 */

import { RoleRepository } from './role.repository.js';
import { PermissionRepository } from './permission.repository.js';
import {
  RoleNotFoundError,
  RoleAlreadyExistsError,
  ProtectedRoleError,
  RoleInUseError,
} from './rbac.errors.js';
import { SYSTEM_PROTECTED_ROLES, RBAC_EVENTS } from './rbac.constants.js';
import { getEventBus } from '../../bootstrap/initEventBus.js';

export class RoleService {
  constructor(repository = null, permissionRepository = null) {
    this.repository = repository || new RoleRepository();
    this.permissionRepository = permissionRepository || new PermissionRepository();
  }

  async list(filters = {}) {
    return this.repository.list(filters);
  }

  async getById(roleId) {
    const role = await this.repository.findById(roleId);
    if (!role) {
      throw new RoleNotFoundError();
    }
    return role;
  }

  async getByName(name) {
    const role = await this.repository.findByName(name);
    if (!role) {
      throw new RoleNotFoundError(undefined, { name });
    }
    return role;
  }

  async getByNameWithPermissions(name) {
    const role = await this.getByName(name);
    const permissions = await this.permissionRepository.listNamesForRole(role.id);
    return { ...role, permissions };
  }

  async create(payload) {
    const existing = await this.repository.findByName(payload.name);
    if (existing) {
      throw new RoleAlreadyExistsError();
    }

    const created = await this.repository.create({
      name: payload.name,
      description: payload.description || null,
      isSystem: false,
      priority: payload.priority ?? 100,
    });

    if (Array.isArray(payload.permissions) && payload.permissions.length > 0) {
      const permissionIds = [];
      for (const name of payload.permissions) {
        const permission = await this.permissionRepository.findByName(name);
        if (permission) {
          permissionIds.push(permission.id);
        }
      }
      if (permissionIds.length > 0) {
        await this.repository.replacePermissions(created.id, permissionIds);
      }
    }

    await getEventBus().publish(RBAC_EVENTS.ROLE_CREATED, {
      roleId: created.id,
      name: created.name,
      createdAt: created.created_at,
    });

    return created;
  }

  async update(roleId, payload) {
    const existing = await this.repository.findById(roleId);
    if (!existing) {
      throw new RoleNotFoundError();
    }
    if (existing.is_system && SYSTEM_PROTECTED_ROLES.includes(existing.name)) {
      throw new ProtectedRoleError();
    }

    const updated = await this.repository.update(roleId, payload);

    await getEventBus().publish(RBAC_EVENTS.ROLE_UPDATED, {
      roleId: updated.id,
      changes: Object.keys(payload),
      updatedAt: updated.updated_at,
    });

    return updated;
  }

  async delete(roleId) {
    const existing = await this.repository.findById(roleId);
    if (!existing) {
      throw new RoleNotFoundError();
    }
    if (existing.is_system) {
      throw new ProtectedRoleError('Cannot delete a system role');
    }
    const userCount = await this.repository.countUsersWithRole(roleId);
    if (userCount > 0) {
      throw new RoleInUseError();
    }

    await this.repository.delete(roleId);

    await getEventBus().publish(RBAC_EVENTS.ROLE_DELETED, {
      roleId,
      name: existing.name,
      deletedAt: new Date().toISOString(),
    });

    return { deleted: true };
  }

  async grantPermission(roleId, permissionName) {
    const role = await this.repository.findById(roleId);
    if (!role) {
      throw new RoleNotFoundError();
    }
    const permission = await this.permissionRepository.findByName(permissionName);
    if (!permission) {
      throw new RoleNotFoundError('Permission not found', { permission: permissionName });
    }

    await this.repository.grantPermission(roleId, permission.id);

    await getEventBus().publish(RBAC_EVENTS.ROLE_PERMISSION_GRANTED, {
      roleId,
      permissionId: permission.id,
      permissionName: permission.name,
      grantedAt: new Date().toISOString(),
    });

    return { granted: true };
  }

  async revokePermission(roleId, permissionName) {
    const role = await this.repository.findById(roleId);
    if (!role) {
      throw new RoleNotFoundError();
    }
    if (role.is_system && SYSTEM_PROTECTED_ROLES.includes(role.name)) {
      throw new ProtectedRoleError('Cannot modify permissions of a protected role');
    }
    const permission = await this.permissionRepository.findByName(permissionName);
    if (!permission) {
      throw new RoleNotFoundError('Permission not found', { permission: permissionName });
    }

    await this.repository.revokePermission(roleId, permission.id);

    await getEventBus().publish(RBAC_EVENTS.ROLE_PERMISSION_REVOKED, {
      roleId,
      permissionId: permission.id,
      permissionName: permission.name,
      revokedAt: new Date().toISOString(),
    });

    return { revoked: true };
  }

  async replacePermissions(roleId, permissionNames) {
    const role = await this.repository.findById(roleId);
    if (!role) {
      throw new RoleNotFoundError();
    }
    if (role.is_system && SYSTEM_PROTECTED_ROLES.includes(role.name)) {
      throw new ProtectedRoleError('Cannot modify permissions of a protected role');
    }

    const permissionIds = [];
    for (const name of permissionNames) {
      const permission = await this.permissionRepository.findByName(name);
      if (permission) {
        permissionIds.push(permission.id);
      }
    }

    await this.repository.replacePermissions(roleId, permissionIds);

    await getEventBus().publish(RBAC_EVENTS.ROLE_UPDATED, {
      roleId,
      permissionsReplaced: true,
      permissionCount: permissionIds.length,
      updatedAt: new Date().toISOString(),
    });

    return { updated: true, permissionCount: permissionIds.length };
  }

  async listPermissions(roleId) {
    const role = await this.repository.findById(roleId);
    if (!role) {
      throw new RoleNotFoundError();
    }
    return this.permissionRepository.listForRole(roleId);
  }
}

export default RoleService;