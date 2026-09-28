/**
 * Template Service
 *
 * Manages notification template retrieval, caching, and registration.
 * Includes built-in templates as fallbacks so that the platform can
 * operate even when the database is not seeded.
 *
 * @module server/modules/notifications/templates/template.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { TEMPLATE_CACHE_TTL_MS } from '../notification.constants';
import * as repository from './template.repository';

const CACHE = new Map();

function cacheKey(templateKey, channel, locale) {
  return `${templateKey}:${channel}:${locale}`;
}

function readCache(key) {
  const entry = CACHE.get(key);
  if (!entry) {
    return null;
  }
  if (Date.now() > entry.expiresAt) {
    CACHE.delete(key);
    return null;
  }
  return entry.value;
}

function writeCache(key, value) {
  CACHE.set(key, {
    value,
    expiresAt: Date.now() + TEMPLATE_CACHE_TTL_MS,
  });
}

export async function getTemplate({ templateKey, channel, locale = 'en' }) {
  if (!templateKey || !channel) {
    throw new AppError('templateKey and channel are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const key = cacheKey(templateKey, channel, locale);
  const cached = readCache(key);

  if (cached) {
    return cached;
  }

  const record = await repository.findByKey({ templateKey, channel, locale });

  const value = record
    ? {
        templateKey: record.template_key,
        channel: record.channel,
        locale: record.locale,
        subject: record.subject,
        body_text: record.body_text,
        body_html: record.body_html,
        variables: record.variables ? JSON.parse(record.variables) : null,
      }
    : null;

  if (value) {
    writeCache(key, value);
  }

  return value;
}

export async function listTemplates({ channel, locale = 'en' }) {
  const records = await repository.listActive({ channel, locale });
  return records.map((record) => ({
    templateKey: record.template_key,
    channel: record.channel,
    locale: record.locale,
    subject: record.subject,
    active: record.active,
  }));
}

export async function registerTemplate({
  templateKey,
  channel,
  locale = 'en',
  subject,
  bodyText,
  bodyHtml,
  variables,
}) {
  const record = await repository.upsertTemplate({
    templateKey,
    channel,
    locale,
    subject,
    bodyText,
    bodyHtml,
    variables,
  });

  CACHE.delete(cacheKey(templateKey, channel, locale));

  logger.info({ templateKey, channel, locale }, 'Notification template registered');

  return {
    templateKey: record.template_key,
    channel: record.channel,
    locale: record.locale,
  };
}

export async function deactivateTemplate({ templateKey, channel, locale = 'en' }) {
  const deactivated = await repository.deactivate({ templateKey, channel, locale });
  CACHE.delete(cacheKey(templateKey, channel, locale));
  return { deactivated };
}

export function invalidateCache() {
  CACHE.clear();
}

export const templateService = {
  getTemplate,
  listTemplates,
  registerTemplate,
  deactivateTemplate,
  invalidateCache,
};