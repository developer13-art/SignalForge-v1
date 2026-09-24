/**
 * White Label Controller
 *
 * HTTP handlers for white-label project operations including branding,
 * domains, themes, custom pricing, and analytics.
 *
 * @module server/modules/white-label/white-label.controller
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { logger } from '../../lib/logger';
import { successResponse } from '../../lib/response/success.response';
import { whiteLabelService } from './white-label.service';

export async function listProjects(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const projects = await whiteLabelService.listProjects({ userId });

  return successResponse(res, { projects });
}

export async function getProject(req, res) {
  const userId = req.user && req.user.id;
  const { projectId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const project = await whiteLabelService.getProject({ userId, projectId });

  return successResponse(res, { project });
}

export async function createProject(req, res) {
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

export async function updateBranding(req, res) {
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

export async function updateTheme(req, res) {
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

export async function addDomain(req, res) {
  const userId = req.user && req.user.id;
  const { projectId } = req.params;
  const { domain } = req.body || {};

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await whiteLabelService.addDomain({ userId, projectId, domain });

  return successResponse(res, { domain: result }, 201);
}

export async function verifyDomain(req, res) {
  const userId = req.user && req.user.id;
  const { projectId, domainId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await whiteLabelService.verifyDomain({ userId, projectId, domainId });

  return successResponse(res, result);
}

export async function removeDomain(req, res) {
  const userId = req.user && req.user.id;
  const { projectId, domainId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await whiteLabelService.removeDomain({ userId, projectId, domainId });

  return successResponse(res, result);
}

export async function updateCustomPricing(req, res) {
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

export async function getAnalytics(req, res) {
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

export async function deleteProject(req, res) {
  const userId = req.user && req.user.id;
  const { projectId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await whiteLabelService.deleteProject({ userId, projectId });

  return successResponse(res, result);
}

export const whiteLabelController = {
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