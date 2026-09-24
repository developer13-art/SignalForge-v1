/**
 * RBAC API
 *
 * @module client/src/api/rbac.api
 */

import { get, post, del } from './client.js';
import { endpoints } from './endpoints.js';

export const rbacApi = {
  listRoles: () => get(endpoints.rbac.roles),

  listPermissions: () => get(endpoints.rbac.permissions),

  assignRole: (payload) => post(endpoints.rbac.assignRole, payload),

  revokeRole: (payload) => post(endpoints.rbac.revokeRole, payload),

  removeRole: (userId, roleId) => del(`${endpoints.rbac.revokeRole}/${userId}/${roleId}`),
};

export default rbacApi;