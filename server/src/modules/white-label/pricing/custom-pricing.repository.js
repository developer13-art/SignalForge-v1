/**
 * Custom Pricing Repository
 *
 * Persistence layer for white-label custom pricing.
 *
 * @module server/modules/white-label/pricing/custom-pricing.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function findByProjectId({ projectId }) {
  const { rows } = await db.query(
    `SELECT * FROM white_label_pricing WHERE project_id = $1 LIMIT 1`,
    [projectId],
  );
  return rows[0] || null;
}

export async function upsertPricing({
  projectId,
  monthlyPrice,
  yearlyPrice,
  lifetimePrice,
  enterprisePrice,
  currency = 'USD',
}) {
  const { rows } = await db.query(
    `INSERT INTO white_label_pricing
       (project_id, monthly_price, yearly_price, lifetime_price, enterprise_price, currency, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
     ON CONFLICT (project_id) DO UPDATE
       SET monthly_price = EXCLUDED.monthly_price,
           yearly_price = EXCLUDED.yearly_price,
           lifetime_price = EXCLUDED.lifetime_price,
           enterprise_price = EXCLUDED.enterprise_price,
           currency = EXCLUDED.currency,
           updated_at = EXCLUDED.updated_at
     RETURNING *`,
    [projectId, monthlyPrice || null, yearlyPrice || null, lifetimePrice || null, enterprisePrice || null, currency, nowIso()],
  );
  return rows[0];
}

export async function deletePricing({ projectId }) {
  const { rowCount } = await db.query(
    `DELETE FROM white_label_pricing WHERE project_id = $1`,
    [projectId],
  );
  return rowCount > 0;
}

export const customPricingRepository = {
  findByProjectId,
  upsertPricing,
  deletePricing,
};