/**
 * White Label Service
 *
 * Top-level orchestration for white-label projects. Coordinates
 * branding, domains, themes, pricing, and analytics for each project.
 *
 * @module server/modules/white-label/white-label.service
 */

import crypto from 'node:crypto';
import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { logger } from '../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../database';
import { brandingService } from './branding/branding.service';
import { domainService } from './domains/domain.service';
import { themeService } from './themes/theme.service';
import { customPricingService } from './pricing/custom-pricing.service';
import { wlAnalyticsService } from './analytics/wl-analytics.service';

function generateSlug(name) {
  if (!name) {
    return `wl-${crypto.randomBytes(4).toString('hex')}`;
  }
  return name
    .toLowerCase()
    .replace(/[^\w\s-]+/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 60) || `wl-${crypto.randomBytes(4).toString('hex')}`;
}

export async function listProjects({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT id, slug, name, brand_name, brand_domain, status, created_at, updated_at
       FROM white_label_projects
      WHERE owner_user_id = $1
      ORDER BY created_at DESC`,
    [userId],
  );

  return rows.map((row) => ({
    projectId: row.id,
    slug: row.slug,
    name: row.name,
    brandName: row.brand_name,
    brandDomain: row.brand_domain,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getProject({ userId, projectId }) {
  if (!userId || !projectId) {
    throw new AppError('userId and projectId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT * FROM white_label_projects WHERE id = $1 AND owner_user_id = $2 LIMIT 1`,
    [projectId, userId],
  );

  const row = rows[0];

  if (!row) {
    throw new AppError('White label project not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const branding = await brandingService.getBranding({ projectId });
  const theme = await themeService.getTheme({ projectId });
  const domains = await domainService.listDomains({ projectId });
  const pricing = await customPricingService.getPricing({ projectId });

  return {
    projectId: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    brandName: row.brand_name,
    brandDomain: row.brand_domain,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    branding,
    theme,
    domains,
    pricing,
  };
}

export async function createProject({ userId, name, brandName, brandDomain }) {
  if (!userId || !name) {
    throw new AppError('userId and name are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const slug = generateSlug(name);

  const { rows } = await db.query(
    `INSERT INTO white_label_projects
       (owner_user_id, slug, name, brand_name, brand_domain, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, 'DRAFT', $6, $6)
     RETURNING *`,
    [userId, slug, name, brandName || name, brandDomain || null, nowIso()],
  );

  const row = rows[0];

  await brandingService.initializeBranding({ projectId: row.id, brandName: brandName || name });
  await themeService.initializeTheme({ projectId: row.id });

  logger.info({ userId, projectId: row.id, slug }, 'White label project created');

  return {
    projectId: row.id,
    slug: row.slug,
    name: row.name,
    brandName: row.brand_name,
    brandDomain: row.brand_domain,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function updateBranding({ userId, projectId, payload }) {
  await assertOwnership({ userId, projectId });
  return brandingService.updateBranding({ projectId, payload });
}

export async function updateTheme({ userId, projectId, payload }) {
  await assertOwnership({ userId, projectId });
  return themeService.updateTheme({ projectId, payload });
}

export async function addDomain({ userId, projectId, domain }) {
  await assertOwnership({ userId, projectId });
  return domainService.addDomain({ projectId, domain });
}

export async function verifyDomain({ userId, projectId, domainId }) {
  await assertOwnership({ userId, projectId });
  return domainService.verifyDomain({ projectId, domainId });
}

export async function removeDomain({ userId, projectId, domainId }) {
  await assertOwnership({ userId, projectId });
  return domainService.removeDomain({ projectId, domainId });
}

export async function updateCustomPricing({ userId, projectId, payload }) {
  await assertOwnership({ userId, projectId });
  return customPricingService.updatePricing({ projectId, payload });
}

export async function getAnalytics({ userId, projectId, from, to }) {
  await assertOwnership({ userId, projectId });
  return wlAnalyticsService.getAnalytics({ projectId, from, to });
}

export async function deleteProject({ userId, projectId }) {
  await assertOwnership({ userId, projectId });

  await db.query(`DELETE FROM white_label_projects WHERE id = $1 AND owner_user_id = $2`, [projectId, userId]);
  await brandingService.deleteBranding({ projectId });
  await themeService.deleteTheme({ projectId });
  await domainService.deleteAllDomains({ projectId });
  await customPricingService.deletePricing({ projectId });

  logger.info({ userId, projectId }, 'White label project deleted');

  return { deleted: true };
}

export async function assertOwnership({ userId, projectId }) {
  if (!userId || !projectId) {
    throw new AppError('userId and projectId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT id FROM white_label_projects WHERE id = $1 AND owner_user_id = $2 LIMIT 1`,
    [projectId, userId],
  );

  if (!rows[0]) {
    throw new AppError('White label project not found', ERROR_CODES.NOT_FOUND, 404);
  }
}

export const whiteLabelService = {
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
  assertOwnership,
};