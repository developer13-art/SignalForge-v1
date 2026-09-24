/**
 * Template Repository
 *
 * Persistence layer for notification templates.
 *
 * @module server/modules/notifications/templates/template.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function findByKey({ templateKey, channel, locale = 'en' }) {
  const { rows } = await db.query(
    `SELECT * FROM notification_templates
      WHERE template_key = $1 AND channel = $2 AND locale = $3 AND active = TRUE
      LIMIT 1`,
    [templateKey, channel, locale],
  );
  return rows[0] || null;
}

export async function listActive({ channel, locale = 'en' }) {
  const conditions = [`active = TRUE`, `locale = $1`];
  const params = [locale];

  if (channel) {
    params.push(channel);
    conditions.push(`channel = $${params.length}`);
  }

  const { rows } = await db.query(
    `SELECT * FROM notification_templates
      WHERE ${conditions.join(' AND ')}
      ORDER BY template_key ASC`,
    params,
  );

  return rows;
}

export async function upsertTemplate({
  templateKey,
  channel,
  locale,
  subject,
  bodyText,
  bodyHtml,
  variables,
}) {
  const { rows } = await db.query(
    `INSERT INTO notification_templates
       (template_key, channel, locale, subject, body_text, body_html, variables, active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, $8, $8)
     ON CONFLICT (template_key, channel, locale) DO UPDATE
       SET subject = EXCLUDED.subject,
           body_text = EXCLUDED.body_text,
           body_html = EXCLUDED.body_html,
           variables = EXCLUDED.variables,
           updated_at = EXCLUDED.updated_at
     RETURNING *`,
    [
      templateKey,
      channel,
      locale,
      subject || null,
      bodyText || null,
      bodyHtml || null,
      variables ? JSON.stringify(variables) : null,
      nowIso(),
    ],
  );
  return rows[0];
}

export async function deactivate({ templateKey, channel, locale = 'en' }) {
  const { rowCount } = await db.query(
    `UPDATE notification_templates
        SET active = FALSE, updated_at = $1
      WHERE template_key = $2 AND channel = $3 AND locale = $4`,
    [nowIso(), templateKey, channel, locale],
  );
  return rowCount > 0;
}

export const templateRepository = {
  findByKey,
  listActive,
  upsertTemplate,
  deactivate,
};