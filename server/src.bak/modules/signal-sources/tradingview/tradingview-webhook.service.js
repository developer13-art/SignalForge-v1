/**
 * TradingView Webhook Service
 *
 * Handles inbound TradingView webhook deliveries: secret verification,
 * payload normalization, replay protection, and dispatch to the
 * message pipeline. Each TradingView alert targets a per-user webhook
 * URL that includes a unique route token.
 *
 * @module server/modules/signal-sources/tradingview/tradingview-webhook.service
 */

import crypto from 'node:crypto';
import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { config } from '../../../config';
import { SOURCE_TYPES } from '@signalforge/shared/constants/source-types';
import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { buildMessageFingerprint } from '@signalforge/shared/utils/fingerprint.util';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { publishEvent } from '../../../events/event-publisher';
import { db } from '../../../database';
import { messageRawStoreService } from '../messages/message-raw-store.service';
import {
  validateWebhookPayload,
  validatePayloadSize,
  validateReplayProtection,
  validateSecret,
} from './tradingview.validator';
import {
  emitTradingViewWebhookReceived,
  emitTradingViewWebhookRejected,
  emitTradingViewAlertRegistered,
  emitTradingViewAlertRemoved,
} from './tradingview.events';

function generateRouteToken() {
  return crypto.randomBytes(24).toString('base64url');
}

function generateSecret() {
  return crypto.randomBytes(32).toString('hex');
}

export async function registerIntegration({ userId, label }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const routeToken = generateRouteToken();
  const secret = generateSecret();

  const { rows } = await db.query(
    `INSERT INTO tradingview_integrations
       (user_id, route_token, secret, label, active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, TRUE, $5, $5)
     RETURNING id`,
    [userId, routeToken, secret, label || null, nowIso()],
  );

  const integrationId = rows[0]?.id;

  await emitTradingViewAlertRegistered({
    userId,
    alertId: integrationId,
    symbol: null,
  }).catch((err) => logger.warn({ err }, 'Failed to emit TradingView alert registered event'));

  const baseUrl = config.app?.url || 'http://localhost:4000';
  const webhookUrl = `${baseUrl}/api/webhooks/tradingview/${routeToken}`;

  logger.info({ userId, integrationId }, 'TradingView integration registered');

  return { integrationId, routeToken, secret, webhookUrl };
}

export async function listIntegrations({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT id, route_token, label, active, created_at, updated_at, last_delivered_at
       FROM tradingview_integrations
      WHERE user_id = $1
      ORDER BY created_at DESC`,
    [userId],
  );

  const baseUrl = config.app?.url || 'http://localhost:4000';

  return rows.map((row) => ({
    integrationId: row.id,
    label: row.label,
    active: row.active,
    webhookUrl: `${baseUrl}/api/webhooks/tradingview/${row.route_token}`,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastDeliveredAt: row.last_delivered_at,
  }));
}

export async function removeIntegration({ userId, integrationId }) {
  if (!userId || !integrationId) {
    throw new AppError('userId and integrationId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rowCount } = await db.query(
    `DELETE FROM tradingview_integrations WHERE id = $1 AND user_id = $2`,
    [integrationId, userId],
  );

  if (rowCount === 0) {
    throw new AppError('TradingView integration not found', ERROR_CODES.NOT_FOUND, 404);
  }

  await emitTradingViewAlertRemoved({
    userId,
    alertId: integrationId,
  }).catch((err) => logger.warn({ err }, 'Failed to emit TradingView alert removed event'));

  logger.info({ userId, integrationId }, 'TradingView integration removed');

  return { removed: true };
}

async function findIntegrationByRouteToken({ routeToken }) {
  if (!routeToken) {
    return null;
  }

  const { rows } = await db.query(
    `SELECT id, user_id, route_token, secret, label, active
       FROM tradingview_integrations
      WHERE route_token = $1
      LIMIT 1`,
    [String(routeToken)],
  );

  return rows[0] || null;
}

export async function handleDelivery({ routeToken, rawBody, querySecret }) {
  if (!routeToken) {
    throw new AppError('TradingView route token is required', ERROR_CODES.TRADINGVIEW_WEBHOOK_INVALID, 400);
  }

  validatePayloadSize(rawBody);

  const integration = await findIntegrationByRouteToken({ routeToken });

  if (!integration) {
    await emitTradingViewWebhookRejected({ userId: null, reason: 'ROUTE_NOT_FOUND', alertId: null }).catch(() => {});
    throw new AppError('TradingView integration route not found', ERROR_CODES.TRADINGVIEW_WEBHOOK_INVALID, 404);
  }

  if (!integration.active) {
    await emitTradingViewWebhookRejected({ userId: integration.user_id, reason: 'INTEGRATION_INACTIVE', alertId: integration.id }).catch(() => {});
    throw new AppError('TradingView integration is inactive', ERROR_CODES.TRADINGVIEW_WEBHOOK_INVALID, 403);
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody));
  } catch (err) {
    await emitTradingViewWebhookRejected({ userId: integration.user_id, reason: 'INVALID_JSON', alertId: integration.id }).catch(() => {});
    throw new AppError('TradingView webhook payload is not valid JSON', ERROR_CODES.TRADINGVIEW_WEBHOOK_INVALID, 400);
  }

  const providedSecret = querySecret || payload.secret || payload.token || null;

  try {
    validateSecret(providedSecret, integration.secret);
  } catch (err) {
    await emitTradingViewWebhookRejected({ userId: integration.user_id, reason: 'INVALID_SECRET', alertId: integration.id }).catch(() => {});
    throw err;
  }

  const normalized = validateWebhookPayload(payload);

  validateReplayProtection({
    alertId: normalized.alertId,
    timestamp: normalized.timestamp,
  });

  const timestamp = normalized.timestamp
    ? (Number.isFinite(Number(normalized.timestamp))
        ? new Date(Number(normalized.timestamp) > 1e12 ? Number(normalized.timestamp) : Number(normalized.timestamp) * 1000).toISOString()
        : String(normalized.timestamp))
    : new Date().toISOString();

  const externalMessageId = normalized.alertId || crypto.randomUUID();

  const idempotencyKey = `tradingview:${integration.id}:${externalMessageId}:${timestamp}`;

  const fingerprint = buildMessageFingerprint({
    sourceType: SOURCE_TYPES.TRADINGVIEW,
    sourceId: String(integration.id),
    externalMessageId: String(externalMessageId),
    timestamp,
  });

  const envelope = {
    sourceType: SOURCE_TYPES.TRADINGVIEW,
    sourceId: String(integration.id),
    channelId: String(integration.id),
    externalMessageId: String(externalMessageId),
    userId: integration.user_id,
    alertName: normalized.alertName,
    symbol: normalized.symbol,
    direction: normalized.direction,
    entryType: normalized.entryType,
    entryPrice: normalized.entry,
    stopLoss: normalized.stopLoss,
    takeProfits: normalized.takeProfits,
    timeframe: normalized.timeframe,
    notes: normalized.notes,
    text: normalized.notes || `${normalized.direction} ${normalized.symbol}`,
    timestamp,
    idempotencyKey,
    fingerprint,
    rawPayload: payload,
  };

  const stored = await messageRawStoreService.persistIncoming({
    userId: integration.user_id,
    envelope,
  });

  if (stored && stored.duplicate) {
    logger.debug({ userId: integration.user_id, idempotencyKey }, 'Duplicate TradingView webhook skipped');
    return { handled: false, duplicate: true, messageId: envelope.externalMessageId };
  }

  await db.query(
    `UPDATE tradingview_integrations
        SET last_delivered_at = $1,
            updated_at = $1
      WHERE id = $2`,
    [nowIso(), integration.id],
  );

  await publishEvent({
    eventType: EVENT_TYPES.MESSAGE_RECEIVED,
    source: 'tradingview.webhook',
    actorId: integration.user_id,
    payload: {
      ...envelope,
      storedMessageId: stored ? stored.id : null,
    },
  });

  await emitTradingViewWebhookReceived({
    userId: integration.user_id,
    alertId: integration.id,
    symbol: normalized.symbol,
    direction: normalized.direction,
  }).catch((err) => logger.warn({ err }, 'Failed to emit TradingView webhook received event'));

  logger.info(
    {
      userId: integration.user_id,
      integrationId: integration.id,
      symbol: normalized.symbol,
      direction: normalized.direction,
    },
    'TradingView webhook processed',
  );

  return {
    handled: true,
    storedMessageId: stored ? stored.id : null,
    messageId: envelope.externalMessageId,
    symbol: normalized.symbol,
    direction: normalized.direction,
  };
}

export const tradingViewWebhookService = {
  registerIntegration,
  listIntegrations,
  removeIntegration,
  handleDelivery,
};