/**
 * Permission Service
 *
 * @module signalforge/server/modules/rbac/permission-service
 */

import { PermissionRepository } from './permission.repository.js';
import { PermissionNotFoundError, PermissionAlreadyExistsError, ProtectedPermissionError } from './rbac.errors.js';
import { PROTECTED_PERMISSIONS, RBAC_EVENTS } from './rbac.constants.js';
import { getEventBus } from '../../bootstrap/initEventBus.js';
import { PERMISSION_DEFINITIONS } from './permission-registry.js';

export class PermissionService {
  constructor(repository = null) {
    this.repository = repository || new PermissionRepository();
  }

  async list(filters = {}) {
    return this.repository.list(filters);
  }

  async getByName(name) {
    const permission = await this.repository.findByName(name);
    if (!permission) {
      throw new PermissionNotFoundError(undefined, { name });
    }
    return permission;
  }

  async getById(permissionId) {
    const permission = await this.repository.findById(permissionId);
    if (!permission) {
      throw new PermissionNotFoundError(undefined, { permissionId });
    }
    return permission;
  }

  async create(payload) {
    const existing = await this.repository.findByName(payload.name);
    if (existing) {
      throw new PermissionAlreadyExistsError();
    }

    const created = await this.repository.create({
      name: payload.name,
      description: payload.description || null,
      group: payload.group,
      isSystem: false,
    });

    await getEventBus().publish(RBAC_EVENTS.PERMISSION_CREATED, {
      permissionId: created.id,
      name: created.name,
      group: created.group,
      createdAt: created.created_at,
    });

    return created;
  }

  async update(permissionId, payload) {
    const existing = await this.repository.findById(permissionId);
    if (!existing) {
      throw new PermissionNotFoundError();
    }
    if (existing.is_system && PROTECTED_PERMISSIONS.includes(existing.name)) {
      throw new ProtectedPermissionError();
    }

    const updated = await this.repository.update(permissionId, payload);

    await getEventBus().publish(RBAC_EVENTS.PERMISSION_UPDATED, {
      permissionId: updated.id,
      changes: Object.keys(payload),
      updatedAt: updated.updated_at,
    });

    return updated;
  }

  async delete(permissionId) {
    const existing = await this.repository.findById(permissionId);
    if (!existing) {
      throw new PermissionNotFoundError();
    }
    if (existing.is_system) {
      throw new ProtectedPermissionError('Cannot delete a system permission');
    }

    await this.repository.delete(permissionId);

    await getEventBus().publish(RBAC_EVENTS.PERMISSION_DELETED, {
      permissionId,
      name: existing.name,
      deletedAt: new Date().toISOString(),
    });

    return { deleted: true };
  }

  async listForRole(roleId) {
    return this.repository.listForRole(roleId);
  }

  async seedSystemPermissions() {
    const results = { created: 0, existing: 0 };
    for (const definition of PERMISSION_DEFINITIONS) {
      const existing = await this.repository.findByName(definition.name);
      if (existing) {
        results.existing++;
        continue;
      }
      await this.repository.create({
        name: definition.name,
        description: definition.description,
        group: definition.group,
        isSystem: true,
      });
      results.created++;
    }
    return results;
  }
}

export default PermissionService;