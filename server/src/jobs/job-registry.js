/**
 * Job Registry
 *
 * Maps job types to their handler functions. The runner resolves
 * handlers through this registry.
 *
 * @module server/jobs/job-registry
 */

import { logger } from '../lib/logger';

const HANDLERS = new Map();

export function registerJobHandler({ jobType, handler }) {
  if (!jobType || typeof handler !== 'function') {
    throw new Error('jobType and handler are required');
  }

  if (HANDLERS.has(jobType)) {
    logger.warn({ jobType }, 'Overriding existing job handler');
  }

  HANDLERS.set(jobType, handler);
}

export function getJobHandler({ jobType }) {
  return HANDLERS.get(jobType) || null;
}

export function hasJobHandler({ jobType }) {
  return HANDLERS.has(jobType);
}

export function listRegisteredJobTypes() {
  return Array.from(HANDLERS.keys()).sort();
}

export function clearJobRegistry() {
  HANDLERS.clear();
}

export const jobRegistry = {
  registerJobHandler,
  getJobHandler,
  hasJobHandler,
  listRegisteredJobTypes,
  clearJobRegistry,
};