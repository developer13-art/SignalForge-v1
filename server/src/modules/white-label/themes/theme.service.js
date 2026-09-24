/**
 * Theme Service
 *
 * Manages visual themes for white-label projects including color
 * scheme, fonts, and custom CSS.
 *
 * @module server/modules/white-label/themes/theme.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../../database';
import { DEFAULT_THEME } from '../white-label.constants';

export async function initializeTheme({ projectId }) {
  if (!projectId) {
    throw new AppError('projectId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  await db.query(
    `INSERT INTO white_label_themes
       (project_id, mode, font_family, primary_color, accent_color, custom_css, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
     ON CONFLICT (project_id) DO NOTHING`,
    [
      projectId,
      DEFAULT_THEME.mode,
      DEFAULT_THEME.fontFamily,
      DEFAULT_THEME.primaryColor,
      DEFAULT_THEME.accentColor,
      null,
      nowIso(),
    ],
  );

  logger.info({ projectId }, 'White label theme initialized');
}

export async function getTheme({ projectId }) {
  if (!projectId) {
    throw new AppError('projectId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT mode, font_family, primary_color, accent_color, custom_css
       FROM white_label_themes
      WHERE project_id = $1
      LIMIT 1`,
    [projectId],
  );

  const row = rows[0];

  if (!row) {
    return { ...DEFAULT_THEME, customCss: null };
  }

  return {
    mode: row.mode,
    fontFamily: row.font_family,
    primaryColor: row.primary_color,
    accentColor: row.accent_color,
    customCss: row.custom_css,
  };
}

export async function updateTheme({ projectId, payload }) {
  if (!projectId) {
    throw new AppError('projectId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updates = [];
  const params = [projectId];

  const map = {
    mode: 'mode',
    fontFamily: 'font_family',
    primaryColor: 'primary_color',
    accentColor: 'accent_color',
    customCss: 'custom_css',
  };

  for (const [key, column] of Object.entries(map)) {
    if (payload[key] !== undefined) {
      params.push(payload[key]);
      updates.push(`${column} = $${params.length}`);
    }
  }

  if (updates.length === 0) {
    return getTheme({ projectId });
  }

  params.push(nowIso());
  updates.push(`updated_at = $${params.length}`);

  await db.query(
    `UPDATE white_label_themes
        SET ${updates.join(', ')}
      WHERE project_id = $1`,
    params,
  );

  logger.info({ projectId }, 'White label theme updated');

  return getTheme({ projectId });
}

export async function deleteTheme({ projectId }) {
  if (!projectId) {
    return;
  }
  await db.query(`DELETE FROM white_label_themes WHERE project_id = $1`, [projectId]);
}

export const themeService = {
  initializeTheme,
  getTheme,
  updateTheme,
  deleteTheme,
};