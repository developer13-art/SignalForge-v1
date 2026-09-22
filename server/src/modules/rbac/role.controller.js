/**
 * Role Controller
 *
 * @module signalforge/server/modules/rbac/role-controller
 */

import { RoleService } from './role.service.js';
import {
  validateRoleCreatePayload,
  validateRoleUpdatePayload,
  validatePermissionsUpdatePayload,
} from './role.validator.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export class RoleController {
  constructor(service = null) {
    this.service = service || new RoleService();
  }

  validateOrThrow(validator, body) {
    const result = validator(body);
    if (!result.valid) {
      throw new ValidationError('Validation failed', {
        code: 'VALIDATION_FAILED',
        details: { errors: result.errors },
      });
    }
  }

  listRoles = async (req, res, next) => {
    try {
      const filters = {
        isSystem: req.query.isSystem !== undefined ? req.query.isSystem === 'true' : undefined,
        search: req.query.search,
      };
      const roles = await this.service.list(filters);
      res.status(200).json({ roles });
    } catch (error) {
      next(error);
    }
  };

  getRole = async (req, res, next) => {
    try {
      const role = await this.service.getById(req.params.roleId);
      const permissions = await this.service.listPermissions(role.id);
      res.status(200).json({ role: { ...role, permissions } });
    } catch (error) {
      next(error);
    }
  };

  createRole = async (req, res, next) => {
    try {
      this.validateOrThrow(validateRoleCreatePayload, req.body);
      const role = await this.service.create(req.body);
      res.status(201).json({ role });
    } catch (error) {
      next(error);
    }
  };

  updateRole = async (req, res, next) => {
    try {
      this.validateOrThrow(validateRoleUpdatePayload, req.body);
      const role = await this.service.update(req.params.roleId, req.body);
      res.status(200).json({ role });
    } catch (error) {
      next(error);
    }
  };

  deleteRole = async (req, res, next) => {
    try {
      const result = await this.service.delete(req.params.roleId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listPermissions = async (req, res, next) => {
    try {
      const permissions = await this.service.listPermissions(req.params.roleId);
      res.status(200).json({ permissions });
    } catch (error) {
      next(error);
    }
  };

  grantPermission = async (req, res, next) => {
    try {
      const result = await this.service.grantPermission(
        req.params.roleId,
        req.params.permissionName,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  revokePermission = async (req, res, next) => {
    try {
      const result = await this.service.revokePermission(
        req.params.roleId,
        req.params.permissionName,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  replacePermissions = async (req, res, next) => {
    try {
      this.validateOrThrow(validatePermissionsUpdatePayload, req.body);
      const result = await this.service.replacePermissions(
        req.params.roleId,
        req.body.permissions,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default RoleController;