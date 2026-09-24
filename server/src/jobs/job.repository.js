/**
 * Job Repository
 *
 * Persistence layer for the job queue. Uses PostgreSQL row locking
 * (FOR UPDATE SKIP LOCKED) so multiple workers can pull jobs safely
 * without Redis.
 *
 * @module server/jobs/job.repository
 */

import { db } from '../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function insertJob({
  jobType,
  payload,
  status = 'PENDING',
  priority = 50,
  maxAttempts = 3,
  scheduledAt = null,
}) {
  const { rows } = await db.query(
    `INSERT INTO jobs
       (job_type, payload, status, priority, attempts, max_attempts, scheduled_at, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 0, $5, COALESCE($6, NOW()), NOW(), NOW())
     RETURNING *`,
    [
      jobType,
      payload ? JSON.stringify(payload) : null,
      status,
      priority,
      maxAttempts,
      scheduledAt,
    ],
  );
  return rows[0];
}

export async function findById({ jobId }) {
  const { rows } = await db.query(
    `SELECT * FROM jobs WHERE id = $1 LIMIT 1`,
    [jobId],
  );
  return rows[0] || null;
}

export async function lockNextJob({ workerId }) {
  const { rows } = await db.query(
    `UPDATE jobs
        SET status = 'RUNNING',
            locked_by = $1,
            locked_at = NOW(),
            started_at = COALESCE(started_at, NOW()),
            attempts = attempts + 1,
            updated_at = NOW()
      WHERE id = (
        SELECT id FROM jobs
         WHERE status IN ('PENDING', 'RETRYING')
           AND scheduled_at <= NOW()
           AND (locked_at IS NULL OR locked_at < NOW() - INTERVAL '5 minutes')
         ORDER BY priority DESC, scheduled_at ASC, created_at ASC
         FOR UPDATE SKIP LOCKED
         LIMIT 1
      )
      RETURNING *`,
    [workerId],
  );
  return rows[0] || null;
}

export async function completeJob({ jobId }) {
  const { rowCount } = await db.query(
    `UPDATE jobs
        SET status = 'COMPLETED',
            completed_at = NOW(),
            locked_by = NULL,
            locked_at = NULL,
            error = NULL,
            updated_at = NOW()
      WHERE id = $1`,
    [jobId],
  );
  return rowCount > 0;
}

export async function failJob({ jobId, error, retry = true }) {
  const { rows } = await db.query(
    `SELECT attempts, max_attempts FROM jobs WHERE id = $1 LIMIT 1`,
    [jobId],
  );
  const job = rows[0];

  if (!job) {
    return { updated: false, reason: 'NOT_FOUND' };
  }

  const shouldRetry = retry && job.attempts < job.max_attempts;

  if (shouldRetry) {
    const delaySeconds = Math.min(300, Math.pow(2, job.attempts) * 5);

    await db.query(
      `UPDATE jobs
          SET status = 'RETRYING',
              error = $1,
              scheduled_at = NOW() + ($2 || ' seconds')::interval,
              locked_by = NULL,
              locked_at = NULL,
              updated_at = NOW()
        WHERE id = $3`,
      [error || 'UNKNOWN', delaySeconds, jobId],
    );

    return { updated: true, retrying: true, delaySeconds };
  }

  await db.query(
    `UPDATE jobs
        SET status = 'DEAD_LETTER',
            error = $1,
            failed_at = NOW(),
            locked_by = NULL,
            locked_at = NULL,
            updated_at = NOW()
      WHERE id = $2`,
    [error || 'UNKNOWN', jobId],
  );

  return { updated: true, deadLetter: true };
}

export async function cancelJob({ jobId }) {
  const { rowCount } = await db.query(
    `UPDATE jobs
        SET status = 'CANCELLED',
            locked_by = NULL,
            locked_at = NULL,
            updated_at = NOW()
      WHERE id = $1 AND status IN ('PENDING', 'RETRYING', 'SCHEDULED')`,
    [jobId],
  );
  return rowCount > 0;
}

export async function listJobs({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.jobType) {
    params.push(filters.jobType);
    conditions.push(`job_type = $${params.length}`);
  }

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }

  if (filters.from) {
    params.push(filters.from);
    conditions.push(`created_at >= $${params.length}`);
  }

  if (filters.to) {
    params.push(filters.to);
    conditions.push(`created_at <= $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = pagination.limit || 50;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT * FROM jobs
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM jobs ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function countByStatus() {
  const { rows } = await db.query(
    `SELECT status, COUNT(*)::int AS count FROM jobs GROUP BY status`,
  );
  return rows;
}

export async function countByJobType({ since }) {
  const params = [];
  let where = '';

  if (since) {
    params.push(since);
    where = 'WHERE created_at >= $1';
  }

  const { rows } = await db.query(
    `SELECT job_type, status, COUNT(*)::int AS count
       FROM jobs
       ${where}
      GROUP BY job_type, status`,
    params,
  );
  return rows;
}

export async function purgeOldJobs({ olderThanHours = 168 }) {
  const { rowCount } = await db.query(
    `DELETE FROM jobs
      WHERE status IN ('COMPLETED', 'DEAD_LETTER', 'CANCELLED')
        AND updated_at < NOW() - ($1 || ' hours')::interval`,
    [olderThanHours],
  );
  return rowCount;
}

export async function recoverStuckJobs({ stuckMinutes = 10 }) {
  const { rowCount } = await db.query(
    `UPDATE jobs
        SET status = 'RETRYING',
            locked_by = NULL,
            locked_at = NULL,
            updated_at = NOW()
      WHERE status = 'RUNNING'
        AND locked_at < NOW() - ($1 || ' minutes')::interval`,
    [stuckMinutes],
  );
  return rowCount;
}

export const jobRepository = {
  insertJob,
  findById,
  lockNextJob,
  completeJob,
  failJob,
  cancelJob,
  listJobs,
  countByStatus,
  countByJobType,
  purgeOldJobs,
  recoverStuckJobs,
};