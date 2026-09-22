/**
 * RBAC Routes (module-level)
 *
 * @module signalforge/server/modules/rbac/routes
 */

import { Router } from 'express';

import { RoleController } from './role.controller.js';
import { PermissionService } from './permission.service.js';
import { UserRoleService } from './user-role.service.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';
import { requireAdminMiddleware } from '../../middleware/require-admin.middleware.js';
import { validationMiddleware } from '../../middleware/validation.middleware.js';
import { validateRolesReplacePayload } from './role.validator.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export function buildRbacRouter(controller = null) {
  const router = Router();
  const roleController = controller || new RoleController();
  const permissionService = new PermissionService();
  const userRoleService = new UserRoleService();

  router.use(authenticationMiddleware());
  router.use(requireAdminMiddleware());

  router.get('/roles', roleController.listRoles);
  router.post('/roles', roleController.createRole);
  router.get('/roles/:roleId', roleController.getRole);
  router.patch('/roles/:roleId', roleController.updateRole);
  router.delete('/roles/:roleId', roleController.deleteRole);

  router.get('/roles/:roleId/permissions', roleController.listPermissions);
  router.post('/roles/:roleId/permissions/:permissionName', roleController.grantPermission);
  router.delete('/roles/:roleId/permissions/:permissionName', roleController.revokePermission);
  router.put('/roles/:roleId/permissions', roleController.replacePermissions);

  router.get('/permissions', async (req, res, next) => {
    try {
      const permissions = await permissionService.list({
        group: req.query.group,
        search: req.query.search,
      });
      res.status(200).json({ permissions });
    } catch (error) {
      next(error);
    }
  });

  router.get('/users/:userId/roles', async (req, res, next) => {
    try {
      const roles = await userRoleService.listRolesForUser(req.params.userId);
      res.status(200).json({ roles });
    } catch (error) {
      next(error);
    }
  });

  router.get('/users/:userId/permissions', async (req, res, next) => {
    try {
      const permissions = await userRoleService.listPermissionsForUser(req.params.userId);
      res.status(200).json({ permissions });
    } catch (error) {
      next(error);
    }
  });

  router.post('/users/:userId/roles/:roleId', async (req, res, next) => {
    try {
      const result = await userRoleService.assignRole(
        req.params.userId,
        req.params.roleId,
        req.user.id,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/users/:userId/roles/:roleId', async (req, res, next) => {
    try {
      const result = await userRoleService.revokeRole(
        req.params.userId,
        req.params.roleId,
        req.user.id,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.put(
    '/users/:userId/roles',
    validationMiddleware({
      body: (body) => {
        const result = validateRolesReplacePayload(body);
        return result;
      },
    }),
    async (req, res, next) => {
      try {
        const result = await userRoleService.replaceRoles(
          req.params.userId,
          req.body.roleIds || [],
          req.user.id,
        );
        res.status(200).json(result);
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}

export default buildRbacRouter;