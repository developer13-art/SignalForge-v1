/**
 * Domain Service
 *
 * Manages custom domains for white-label projects. Handles domain
 * registration, DNS verification orchestration, and removal.
 *
 * @module server/modules/white-label/domains/domain.service
 */

import crypto from 'node:crypto';
import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../../database';
import { DNS_VERIFICATION_PREFIX } from '../white-label.constants';

function generateVerificationToken() {
  return crypto.randomBytes(24).toString('hex');
}

export async function listDomains({ projectId }) {
  if (!projectId) {
    throw new AppError('projectId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT id, domain, status, verification_token, verified_at, created_at
       FROM white_label_domains
      WHERE project_id = $1
      ORDER BY created_at DESC`,
    [projectId],
  );

  return rows.map((row) => ({
    domainId: row.id,
    domain: row.domain,
    status: row.status,
    verificationRecord: {
      type: 'TXT',
      name: `${DNS_VERIFICATION_PREFIX}.${row.domain}`,
      value: row.verification_token,
    },
    verifiedAt: row.verified_at,
    createdAt: row.created_at,
  }));
}

export async function addDomain({ projectId, domain }) {
  if (!projectId || !domain) {
    throw new AppError('projectId and domain are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const normalized = domain.trim().toLowerCase();

  const { rows: existing } = await db.query(
    `SELECT id FROM white_label_domains WHERE domain = $1 LIMIT 1`,
    [normalized],
  );

  if (existing[0]) {
    throw new AppError('Domain is already registered', ERROR_CODES.CONFLICT, 409);
  }

  const verificationToken = generateVerificationToken();

  const { rows } = await db.query(
    `INSERT INTO white_label_domains
       (project_id, domain, status, verification_token, created_at, updated_at)
     VALUES ($1, $2, 'PENDING', $3, $4, $4)
     RETURNING id, domain, status, verification_token, created_at`,
    [projectId, normalized, verificationToken, nowIso()],
  );

  const row = rows[0];

  logger.info({ projectId, domain: normalized, domainId: row.id }, 'White label domain added');

  return {
    domainId: row.id,
    domain: row.domain,
    status: row.status,
    verificationRecord: {
      type: 'TXT',
      name: `${DNS_VERIFICATION_PREFIX}.${row.domain}`,
      value: row.verification_token,
    },
    createdAt: row.created_at,
  };
}

export async function verifyDomain({ projectId, domainId }) {
  if (!projectId || !domainId) {
    throw new AppError('projectId and domainId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT id, domain, verification_token, status FROM white_label_domains
      WHERE id = $1 AND project_id = $2
      LIMIT 1`,
    [domainId, projectId],
  );

  const row = rows[0];

  if (!row) {
    throw new AppError('Domain not found', ERROR_CODES.NOT_FOUND, 404);
  }

  if (row.status === 'VERIFIED') {
    return { verified: true, alreadyVerified: true };
  }

  const dns = await import('node:dns').catch(() => null);

  if (!dns) {
    throw new AppError('DNS resolver unavailable', ERROR_CODES.INTERNAL_ERROR, 500);
  }

  const recordName = `${DNS_VERIFICATION_PREFIX}.${row.domain}`;

  let verified = false;
  try {
    const records = await dns.promises.resolveTxt(recordName);
    for (const parts of records) {
      const value = Array.isArray(parts) ? parts.join('') : String(parts);
      if (value.trim() === row.verification_token) {
        verified = true;
        break;
      }
    }
  } catch (err) {
    logger.warn({ err, domain: row.domain }, 'DNS TXT lookup failed');
  }

  if (verified) {
    await db.query(
      `UPDATE white_label_domains
          SET status = 'VERIFIED',
              verified_at = $1,
              updated_at = $1
        WHERE id = $2`,
      [nowIso(), domainId],
    );

    logger.info({ projectId, domainId, domain: row.domain }, 'White label domain verified');

    return { verified: true };
  }

  await db.query(
    `UPDATE white_label_domains
        SET status = 'FAILED', updated_at = $1
      WHERE id = $2`,
    [nowIso(), domainId],
  );

  return { verified: false, reason: 'RECORD_NOT_FOUND' };
}

export async function removeDomain({ projectId, domainId }) {
  if (!projectId || !domainId) {
    throw new AppError('projectId and domainId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rowCount } = await db.query(
    `DELETE FROM white_label_domains WHERE id = $1 AND project_id = $2`,
    [domainId, projectId],
  );

  if (rowCount === 0) {
    throw new AppError('Domain not found', ERROR_CODES.NOT_FOUND, 404);
  }

  logger.info({ projectId, domainId }, 'White label domain removed');

  return { removed: true };
}

export async function deleteAllDomains({ projectId }) {
  if (!projectId) {
    return;
  }
  await db.query(`DELETE FROM white_label_domains WHERE project_id = $1`, [projectId]);
}

export async function findVerifiedDomain({ domain }) {
  if (!domain) {
    return null;
  }

  const { rows } = await db.query(
    `SELECT id, project_id, domain, status
       FROM white_label_domains
      WHERE domain = $1 AND status = 'VERIFIED'
      LIMIT 1`,
    [domain.trim().toLowerCase()],
  );

  return rows[0] || null;
}

export const domainService = {
  listDomains,
  addDomain,
  verifyDomain,
  removeDomain,
  deleteAllDomains,
  findVerifiedDomain,
};