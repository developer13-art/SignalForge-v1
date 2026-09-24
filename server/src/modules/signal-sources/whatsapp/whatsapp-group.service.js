/**
 * WhatsApp Group Service
 *
 * Manages the list of WhatsApp groups a user monitors. Groups are
 * identified by their WhatsApp JID and are only monitored when the
 * user explicitly opts in.
 *
 * @module server/modules/signal-sources/whatsapp/whatsapp-group.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../../database';
import {
  emitWhatsAppGroupsDiscovered,
  emitWhatsAppGroupOptIn,
  emitWhatsAppGroupOptOut,
} from './whatsapp.events';

export async function upsertDiscoveredGroups({ userId, groups }) {
  if (!userId || !Array.isArray(groups)) {
    throw new AppError('userId and groups array are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const now = nowIso();

  for (const group of groups) {
    if (!group.groupId) {
      continue;
    }

    await db.query(
      `INSERT INTO whatsapp_groups
         (user_id, group_id, name, participants_count, monitored, discovered_at, updated_at)
       VALUES ($1, $2, $3, $4, COALESCE(
         (SELECT monitored FROM whatsapp_groups WHERE user_id = $1 AND group_id = $2),
         FALSE
       ), $5, $5)
       ON CONFLICT (user_id, group_id) DO UPDATE
         SET name = EXCLUDED.name,
             participants_count = EXCLUDED.participants_count,
             updated_at = EXCLUDED.updated_at`,
      [
        userId,
        String(group.groupId),
        group.name || null,
        group.participantsCount ?? null,
        now,
      ],
    );
  }

  await emitWhatsAppGroupsDiscovered({
    userId,
    groupCount: groups.length,
  }).catch((err) => logger.warn({ err }, 'Failed to emit WhatsApp groups discovered event'));

  logger.info({ userId, groupCount: groups.length }, 'WhatsApp groups upserted');

  return { upserted: groups.length };
}

export async function listDiscoveredGroups({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT group_id, name, participants_count, monitored, discovered_at, opted_in_at
       FROM whatsapp_groups
      WHERE user_id = $1
      ORDER BY monitored DESC, name ASC NULLS LAST`,
    [userId],
  );

  return rows.map((row) => ({
    groupId: row.group_id,
    name: row.name,
    participantsCount: row.participants_count,
    monitored: row.monitored,
    discoveredAt: row.discovered_at,
    optedInAt: row.opted_in_at,
  }));
}

export async function listMonitoredGroups({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT group_id, name
       FROM whatsapp_groups
      WHERE user_id = $1 AND monitored = TRUE
      ORDER BY name ASC NULLS LAST`,
    [userId],
  );

  return rows.map((row) => ({
    groupId: row.group_id,
    name: row.name,
  }));
}

export async function optInGroups({ userId, groupIds }) {
  if (!userId || !Array.isArray(groupIds) || groupIds.length === 0) {
    throw new AppError('userId and non-empty groupIds are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const optedInAt = nowIso();
  const results = [];

  for (const groupId of groupIds) {
    const { rows } = await db.query(
      `UPDATE whatsapp_groups
          SET monitored = TRUE,
              opted_in_at = $1,
              updated_at = $1
        WHERE user_id = $2 AND group_id = $3
        RETURNING group_id, name`,
      [optedInAt, userId, String(groupId)],
    );

    if (rows[0]) {
      results.push(rows[0]);

      await emitWhatsAppGroupOptIn({
        userId,
        groupId: rows[0].group_id,
        groupName: rows[0].name,
      }).catch((err) => logger.warn({ err }, 'Failed to emit WhatsApp group opt-in event'));
    }
  }

  logger.info({ userId, count: results.length }, 'WhatsApp groups opted in');

  return { optedIn: results };
}

export async function optOutGroups({ userId, groupIds }) {
  if (!userId || !Array.isArray(groupIds) || groupIds.length === 0) {
    throw new AppError('userId and non-empty groupIds are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const results = [];

  for (const groupId of groupIds) {
    const { rows } = await db.query(
      `UPDATE whatsapp_groups
          SET monitored = FALSE,
              opted_in_at = NULL,
              updated_at = $1
        WHERE user_id = $2 AND group_id = $3
        RETURNING group_id, name`,
      [nowIso(), userId, String(groupId)],
    );

    if (rows[0]) {
      results.push(rows[0]);

      await emitWhatsAppGroupOptOut({
        userId,
        groupId: rows[0].group_id,
      }).catch((err) => logger.warn({ err }, 'Failed to emit WhatsApp group opt-out event'));
    }
  }

  logger.info({ userId, count: results.length }, 'WhatsApp groups opted out');

  return { optedOut: results };
}

export async function isGroupMonitored({ userId, groupId }) {
  if (!userId || !groupId) {
    return false;
  }

  const { rows } = await db.query(
    `SELECT monitored
       FROM whatsapp_groups
      WHERE user_id = $1 AND group_id = $2
      LIMIT 1`,
    [userId, String(groupId)],
  );

  return Boolean(rows[0] && rows[0].monitored);
}

export async function removeAllGroups({ userId }) {
  if (!userId) {
    return;
  }
  await db.query(`DELETE FROM whatsapp_groups WHERE user_id = $1`, [userId]);
}

export const whatsappGroupService = {
  upsertDiscoveredGroups,
  listDiscoveredGroups,
  listMonitoredGroups,
  optInGroups,
  optOutGroups,
  isGroupMonitored,
  removeAllGroups,
};