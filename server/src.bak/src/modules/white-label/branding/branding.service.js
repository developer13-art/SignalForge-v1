/**
 * Branding Service
 *
 * Manages branding assets and colors for a white-label project.
 * Branding is applied to the public site, login screens, and email
 * templates associated with the project.
 *
 * @module server/modules/white-label/branding/branding.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { logger } = require('../../../lib/logger');
const { nowIso } = require('@signalforge/shared/utils/date.util');
const { db } = require('../../../database');
const { DEFAULT_BRANDING } = require('../white-label.constants');

export async function initializeBranding({ projectId, brandName }) {
  if (!projectId) {
    throw new AppError('projectId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  await db.query(
    `INSERT INTO white_label_branding
       (project_id, brand_name, logo_url, favicon_url, primary_color, secondary_color, support_email, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
     ON CONFLICT (project_id) DO NOTHING`,
    [
      projectId,
      brandName || null,
      DEFAULT_BRANDING.logoUrl,
      DEFAULT_BRANDING.faviconUrl,
      DEFAULT_BRANDING.primaryColor,
      DEFAULT_BRANDING.secondaryColor,
      DEFAULT_BRANDING.supportEmail,
      nowIso(),
    ],
  );

  logger.info({ projectId }, 'White label branding initialized');
}

export async function getBranding({ projectId }) {
  if (!projectId) {
    throw new AppError('projectId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT brand_name, logo_url, favicon_url, primary_color, secondary_color, support_email
       FROM white_label_branding
      WHERE project_id = $1
      LIMIT 1`,
    [projectId],
  );

  const row = rows[0];

  if (!row) {
    return { ...DEFAULT_BRANDING };
  }

  return {
    brandName: row.brand_name,
    logoUrl: row.logo_url,
    faviconUrl: row.favicon_url,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    supportEmail: row.support_email,
  };
}

export async function updateBranding({ projectId, payload }) {
  if (!projectId) {
    throw new AppError('projectId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updates = [];
  const params = [projectId];

  const map = {
    brandName: 'brand_name',
    logoUrl: 'logo_url',
    faviconUrl: 'favicon_url',
    primaryColor: 'primary_color',
    secondaryColor: 'secondary_color',
    supportEmail: 'support_email',
  };

  for (const [key, column] of Object.entries(map)) {
    if (payload[key] !== undefined) {
      params.push(payload[key]);
      updates.push(`${column} = $${params.length}`);
    }
  }

  if (updates.length === 0) {
    return getBranding({ projectId });
  }

  params.push(nowIso());
  updates.push(`updated_at = $${params.length}`);

  await db.query(
    `UPDATE white_label_branding
        SET ${updates.join(', ')}
      WHERE project_id = $1`,
    params,
  );

  logger.info({ projectId }, 'White label branding updated');

  return getBranding({ projectId });
}

export async function deleteBranding({ projectId }) {
  if (!projectId) {
    return;
  }
  await db.query(`DELETE FROM white_label_branding WHERE project_id = $1`, [projectId]);
}
const brandingService = {
  initializeBranding,
  getBranding,
  updateBranding,
  deleteBranding,
};
module.exports.brandingService = brandingService;
