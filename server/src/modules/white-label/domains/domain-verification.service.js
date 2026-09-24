/**
 * Domain Verification Service
 *
 * Handles periodic re-verification of white-label domains and cleanup
 * of domains that have failed verification for too long.
 *
 * @module server/modules/white-label/domains/domain-verification.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../../database';
import { domainService } from './domain.service';

const STALE_PENDING_HOURS = 72;
const STALE_FAILED_HOURS = 168;

export async function reverifyProjectDomains({ projectId }) {
  if (!projectId) {
    throw new AppError('projectId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT id, domain, status
       FROM white_label_domains
      WHERE project_id = $1 AND status IN ('PENDING', 'FAILED')`,
    [projectId],
  );

  const results = [];

  for (const row of rows) {
    try {
      const result = await domainService.verifyDomain({
        projectId,
        domainId: row.id,
      });
      results.push({ domainId: row.id, domain: row.domain, ...result });
    } catch (err) {
      logger.warn({ err, projectId, domainId: row.id }, 'Domain re-verification failed');
      results.push({ domainId: row.id, domain: row.domain, verified: false, reason: 'ERROR' });
    }
  }

  return { rechecked: results.length, results };
}

export async function cleanupStaleDomains() {
  const pendingCutoff = new Date(Date.now() - STALE_PENDING_HOURS * 60 * 60 * 1000).toISOString();
  const failedCutoff = new Date(Date.now() - STALE_FAILED_HOURS * 60 * 60 * 1000).toISOString();

  const { rowCount: expiredPending } = await db.query(
    `DELETE FROM white_label_domains
      WHERE status = 'PENDING' AND created_at < $1`,
    [pendingCutoff],
  );

  const { rowCount: expiredFailed } = await db.query(
    `DELETE FROM white_label_domains
      WHERE status = 'FAILED' AND updated_at < $1`,
    [failedCutoff],
  );

  logger.info(
    { expiredPending, expiredFailed },
    'White label domain cleanup complete',
  );

  return { expiredPending, expiredFailed };
}

export async function reverifyAll() {
  const { rows } = await db.query(
    `SELECT DISTINCT project_id
       FROM white_label_domains
      WHERE status IN ('PENDING', 'FAILED')`,
  );

  const results = [];

  for (const row of rows) {
    try {
      const result = await reverifyProjectDomains({ projectId: row.project_id });
      results.push({ projectId: row.project_id, ...result });
    } catch (err) {
      logger.warn({ err, projectId: row.project_id }, 'Batch domain re-verification failed');
    }
  }

  return results;
}

export async function recordVerificationAttempt({ domainId, success, reason }) {
  if (!domainId) {
    return;
  }

  await db.query(
    `INSERT INTO white_label_domain_verification_attempts
       (domain_id, success, reason, created_at)
     VALUES ($1, $2, $3, $4)`,
    [domainId, Boolean(success), reason || null, nowIso()],
  );
}

export const domainVerificationService = {
  reverifyProjectDomains,
  cleanupStaleDomains,
  reverifyAll,
  recordVerificationAttempt,
  STALE_PENDING_HOURS,
  STALE_FAILED_HOURS,
};