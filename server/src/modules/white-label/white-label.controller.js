/**
 * White Label Controller
 *
 * HTTP handlers for white-label project operations including branding,
 * domains, themes, custom pricing, and analytics.
 *
 * @module server/modules/white-label/white-label.controller
 */
const { AppError } = require('../../lib/errors/app-error');
const { ERROR_CODES } = require('../../lib/errors/error-codes');
const { logger } = require('../../lib/logger');
const { successResponse } = require('../../lib/response/success.response');
const { whiteLabelService } = require('./white-label.service');
async function listProjects(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const projects = await whiteLabelService.listProjects({ userId });

  return successResponse(res, { projects });
}
async function getProject(req, res) {
  const userId = req.user && req.user.id;
  const { projectId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const project = await whiteLabelService.getProject({ userId, projectId });

  return successResponse(res, { project });
}
async function createProject(req, res) {
  const userId = req.user && req.user.id;
  const { name, brandName, brandDomain } = req.body || {};

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const project = await whiteLabelService.createProject({
    userId,
    name,
    brandName,
    brandDomain,
  });

  logger.info({ userId, projectId: project.projectId }, 'White label project created');

  return successResponse(res, { project }, 201);
}
async function updateBranding(req, res) {
  const userId = req.user && req.user.id;
  const { projectId } = req.params;
  const payload = req.body || {};

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const branding = await whiteLabelService.updateBranding({
    userId,
    projectId,
    payload,
  });

  return successResponse(res, { branding });
}
async function updateTheme(req, res) {
  const userId = req.user && req.user.id;
  const { projectId } = req.params;
  const payload = req.body || {};

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const theme = await whiteLabelService.updateTheme({
    userId,
    projectId,
    payload,
  });

  return successResponse(res, { theme });
}
async function addDomain(req, res) {
  const userId = req.user && req.user.id;
  const { projectId } = req.params;
  const { domain } = req.body || {};

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await whiteLabelService.addDomain({ userId, projectId, domain });

  return successResponse(res, { domain: result }, 201);
}
async function verifyDomain(req, res) {
  const userId = req.user && req.user.id;
  const { projectId, domainId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await whiteLabelService.verifyDomain({ userId, projectId, domainId });

  return successResponse(res, result);
}
async function removeDomain(req, res) {
  const userId = req.user && req.user.id;
  const { projectId, domainId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await whiteLabelService.removeDomain({ userId, projectId, domainId });

  return successResponse(res, result);
}
async function updateCustomPricing(req, res) {
  const userId = req.user && req.user.id;
  const { projectId } = req.params;
  const payload = req.body || {};

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const pricing = await whiteLabelService.updateCustomPricing({
    userId,
    projectId,
    payload,
  });

  return successResponse(res, { pricing });
}
async function getAnalytics(req, res) {
  const userId = req.user && req.user.id;
  const { projectId } = req.params;
  const { from, to } = req.query;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const analytics = await whiteLabelService.getAnalytics({
    userId,
    projectId,
    from,
    to,
  });

  return successResponse(res, { analytics });
}
async function deleteProject(req, res) {
  const userId = req.user && req.user.id;
  const { projectId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await whiteLabelService.deleteProject({ userId, projectId });

  return successResponse(res, result);
}
const whiteLabelController = {
  listProjects,
  getProject,
  createProject,
  updateBranding,
  updateTheme,
  addDomain,
  verifyDomain,
  removeDomain,
  updateCustomPricing,
  getAnalytics,
  deleteProject,
};
module.exports.whiteLabelController = whiteLabelController;

module.exports.listProjects = listProjects;

module.exports.getProject = getProject;

module.exports.createProject = createProject;

module.exports.updateBranding = updateBranding;

module.exports.updateTheme = updateTheme;

module.exports.addDomain = addDomain;

module.exports.verifyDomain = verifyDomain;

module.exports.removeDomain = removeDomain;

module.exports.updateCustomPricing = updateCustomPricing;

module.exports.getAnalytics = getAnalytics;

module.exports.deleteProject = deleteProject;
