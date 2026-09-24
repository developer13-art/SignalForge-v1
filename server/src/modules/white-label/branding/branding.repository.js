/**
 * Branding Repository
 *
 * Persistence layer for white-label branding.
 *
 * @module server/modules/white-label/branding/branding.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function findByProjectId({ projectId }) {
  const { rows } = await db.query(
    `SELECT * FROM white_label_branding WHERE project_id = $1 LIMIT 1`,
    [projectId],
  );
  return rows[0] || null;
}

export async function insertBranding({
  projectId,
  brandName,
  logoUrl,
  faviconUrl,
  primaryColor,
  secondaryColor,
  supportEmail,
}) {
  const { rows } = await db.query(
    `INSERT INTO white_label_branding
       (project_id, brand_name, logo_url, favicon_url, primary_color, secondary_color, support_email, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
     RETURNING *`,
    [
      projectId,
      brandName || null,
      logoUrl || null,
      faviconUrl || null,
      primaryColor || null,
      secondaryColor || null,
      supportEmail || null,
      nowIso(),
    ],
  );
  return rows[0];
}

export async function updateBranding({
  projectId,
  brandName,
  logoUrl,
  faviconUrl,
  primaryColor,
  secondaryColor,
  supportEmail,
}) {
  const { rowCount } = await db.query(
    `UPDATE white_label_branding
        SET brand_name = COALESCE($1, brand_name),
            logo_url = COALESCE($2, logo_url),
            favicon_url = COALESCE($3, favicon_url),
            primary_color = COALESCE($4, primary_color),
            secondary_color = COALESCE($5, secondary_color),
            support_email = COALESCE($6, support_email),
            updated_at = $7
      WHERE project_id = $8`,
    [
      brandName || null,
      logoUrl || null,
      faviconUrl || null,
      primaryColor || null,
      secondaryColor || null,
      supportEmail || null,
      nowIso(),
      projectId,
    ],
  );
  return rowCount > 0;
}

export async function deleteBranding({ projectId }) {
  const { rowCount } = await db.query(
    `DELETE FROM white_label_branding WHERE project_id = $1`,
    [projectId],
  );
  return rowCount > 0;
}

export const brandingRepository = {
  findByProjectId,
  insertBranding,
  updateBranding,
  deleteBranding,
};