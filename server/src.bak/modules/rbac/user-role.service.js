/**
 * User-Role Service
 *
 * @module signalforge/server/modules/rbac/user-role-service
 */

import { UserRoleRepository } from './user-role.repository.js';
import { RoleRepository } from './role.repository.js';
import { PermissionRepository } from './permission.repository.js';
import {
  RoleNotFoundError,
  UserRoleAlreadyAssignedError,
  UserRoleNotAssignedError,
  CannotRevokeLastAdminError,
} from './rbac.errors.js';
import { SYSTEM_PROTECTED_ROLES, RBAC_EVENTS } from './rbac.constants.js';
import { getEventBus } from '../../bootstrap/initEventBus.js';

export class UserRoleService {
  constructor(
    userRoleRepository = null,
    roleRepository = null,
    permissionRepository = null,
  ) {
    this.repository = userRoleRepository || new UserRoleRepository();
    this.roleRepository = roleRepository || new RoleRepository();
    this.permissionRepository = permissionRepository || new PermissionRepository();
  }

  async listRolesForUser(userId) {
    return this.repository.listRolesForUser(userId);
  }

  async listPermissionsForUser(userId) {
    const roles = await this.repository.listRolesForUser(userId);
    const permissions = new Set();
    for (const role of roles) {
      const rolePermissions = await this.permissionRepository.listNamesForRole(role.id);
      for (const p of rolePermissions) {
        permissions.add(p);
      }
    }
    return Array.from(permissions);
  }

  async assignRole(userId, roleId, assignedBy = null) {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new RoleNotFoundError();
    }

    const already = await this.repository.hasRole(userId, roleId);
    if (already) {
      throw new UserRoleAlreadyAssignedError();
    }

    await this.repository.assign(userId, roleId, assignedBy);

    await getEventBus().publish(RBAC_EVENTS.USER_ROLE_ASSIGNED, {
      userId,
      roleId,
      roleName: role.name,
      assignedBy,
      assignedAt: new Date().toISOString(),
    });

    return { assigned: true };
  }

  async revokeRole(userId, roleId, actorId = null) {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new RoleNotFoundError();
    }

    const hasRole = await this.repository.hasRole(userId, roleId);
    if (!hasRole) {
      throw new UserRoleNotAssignedError();
    }

    if (SYSTEM_PROTECTED_ROLES.includes(role.name)) {
      const remaining = await this.repository.countUsersWithRole(roleId);
      if (remaining <= 1) {
        throw new CannotRevokeLastAdminError();
      }
    }

    await this.repository.revoke(userId, roleId);

    await getEventBus().publish(RBAC_EVENTS.USER_ROLE_REVOKED, {
      userId,
      roleId,
      roleName: role.name,
      revokedBy: actorId,
      revokedAt: new Date().toISOString(),
    });

    return { revoked: true };
  }

  async replaceRoles(userId, roleIds, actorId = null) {
    const existing = await this.repository.listRolesForUser(userId);
    const existingIds = new Set(existing.map((r) => r.id));

    const newRoles = [];
    for (const roleId of roleIds) {
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw new RoleNotFoundError(undefined, { roleId });
      }
      newRoles.push(role);
    }

    const protectedRemovals = [];
    for (const existingRole of existing) {
      if (!roleIds.includes(existingRole.id) && SYSTEM_PROTECTED_ROLES.includes(existingRole.name)) {
        protectedRemovals.push(existingRole);
      }
    }

    if (protectedRemovals.length > 0) {
      throw new CannotRevokeLastAdminError(
        `Cannot remove protected role(s): ${protectedRemovals.map((r) => r.name).join(', ')}`,
      );
    }

    await this.repository.replaceRoles(userId, roleIds, actorId);

    for (const role of newRoles) {
      if (!existingIds.has(role.id)) {
        await getEventBus().publish(RBAC_EVENTS.USER_ROLE_ASSIGNED, {
          userId,
          roleId: role.id,
          roleName: role.name,
          assignedBy: actorId,
          assignedAt: new Date().toISOString(),
        });
      }
    }
    for (const role of existing) {
      if (!roleIds.includes(role.id)) {
        await getEventBus().publish(RBAC_EVENTS.USER_ROLE_REVOKED, {
          userId,
          roleId: role.id,
          roleName: role.name,
          revokedBy: actorId,
          revokedAt: new Date().toISOString(),
        });
      }
    }

    return { replaced: true, roleCount: roleIds.length };
  }

  async userHasRole(userId, roleName) {
    const role = await this.roleRepository.findByName(roleName);
    if (!role) {
      return false;
    }
    return this.repository.hasRole(userId, role.id);
  }

  async userHasPermission(userId, permissionName) {
    const permissions = await this.listPermissionsForUser(userId);
    return permissions.includes(permissionName);
  }
}

export default UserRoleService;