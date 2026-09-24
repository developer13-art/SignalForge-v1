/**
 * Custom Pricing Service
 *
 * Manages custom subscription pricing for white-label projects. A
 * white-label project can override the platform's default pricing
 * plans.
 *
 * @module server/modules/white-label/pricing/custom-pricing.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../../database';

const DEFAULT_CURRENCY = 'USD';

export async function getPricing({ projectId }) {
  if (!projectId) {
    throw new AppError('projectId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT monthly_price, yearly_price, currency, lifetime_price, enterprise_price
       FROM white_label_pricing
      WHERE project_id = $1
      LIMIT 1`,
    [projectId],
  );

  const row = rows[0];

  if (!row) {
    return null;
  }

  return {
    monthlyPrice: row.monthly_price ? Number(row.monthly_price) : null,
    yearlyPrice: row.yearly_price ? Number(row.yearly_price) : null,
    lifetimePrice: row.lifetime_price ? Number(row.lifetime_price) : null,
    enterprisePrice: row.enterprise_price ? Number(row.enterprise_price) : null,
    currency: row.currency,
  };
}

export async function updatePricing({ projectId, payload }) {
  if (!projectId) {
    throw new AppError('projectId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const monthlyPrice = payload.monthlyPrice !== undefined ? payload.monthlyPrice : null;
  const yearlyPrice = payload.yearlyPrice !== undefined ? payload.yearlyPrice : null;
  const lifetimePrice = payload.lifetimePrice !== undefined ? payload.lifetimePrice : null;
  const enterprisePrice = payload.enterprisePrice !== undefined ? payload.enterprisePrice : null;
  const currency = payload.currency || DEFAULT_CURRENCY;

  await db.query(
    `INSERT INTO white_label_pricing
       (project_id, monthly_price, yearly_price, lifetime_price, enterprise_price, currency, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
     ON CONFLICT (project_id) DO UPDATE
       SET monthly_price = COALESCE(EXCLUDED.monthly_price, white_label_pricing.monthly_price),
           yearly_price = COALESCE(EXCLUDED.yearly_price, white_label_pricing.yearly_price),
           lifetime_price = COALESCE(EXCLUDED.lifetime_price, white_label_pricing.lifetime_price),
           enterprise_price = COALESCE(EXCLUDED.enterprise_price, white_label_pricing.enterprise_price),
           currency = EXCLUDED.currency,
           updated_at = EXCLUDED.updated_at`,
    [projectId, monthlyPrice, yearlyPrice, lifetimePrice, enterprisePrice, currency, nowIso()],
  );

  logger.info({ projectId }, 'White label custom pricing updated');

  return getPricing({ projectId });
}

export async function deletePricing({ projectId }) {
  if (!projectId) {
    return;
  }
  await db.query(`DELETE FROM white_label_pricing WHERE project_id = $1`, [projectId]);
}

export const customPricingService = {
  getPricing,
  updatePricing,
  deletePricing,
};