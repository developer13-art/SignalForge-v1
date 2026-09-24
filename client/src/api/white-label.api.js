/**
 * White Label API
 *
 * @module client/src/api/white-label.api
 */

import { get, post, patch, del } from './client.js';
import { endpoints } from './endpoints.js';

export const whiteLabelApi = {
  listProjects: () => get(endpoints.whiteLabel.projects),

  getProject: (projectId) => get(endpoints.whiteLabel.project(projectId)),

  createProject: (payload) => post(endpoints.whiteLabel.createProject, payload),

  deleteProject: (projectId) => del(endpoints.whiteLabel.deleteProject(projectId)),

  updateBranding: (projectId, payload) =>
    patch(endpoints.whiteLabel.branding(projectId), payload),

  updateTheme: (projectId, payload) => patch(endpoints.whiteLabel.theme(projectId), payload),

  updatePricing: (projectId, payload) =>
    patch(endpoints.whiteLabel.pricing(projectId), payload),

  listDomains: (projectId) => get(endpoints.whiteLabel.domains(projectId)),

  addDomain: (projectId, payload) => post(endpoints.whiteLabel.domains(projectId), payload),

  verifyDomain: (projectId, domainId) =>
    post(endpoints.whiteLabel.verifyDomain(projectId, domainId)),

  removeDomain: (projectId, domainId) =>
    del(endpoints.whiteLabel.domain(projectId, domainId)),

  getAnalytics: (projectId, params) =>
    get(endpoints.whiteLabel.analytics(projectId), { params }),

  listUsers: (projectId, params) =>
    get(endpoints.whiteLabel.users(projectId), { params }),

  getRevenue: (projectId, params) =>
    get(endpoints.whiteLabel.revenue(projectId), { params }),

  getSettings: (projectId) => get(endpoints.whiteLabel.settings(projectId)),

  updateSettings: (projectId, payload) =>
    patch(endpoints.whiteLabel.settings(projectId), payload),
};

export default whiteLabelApi;