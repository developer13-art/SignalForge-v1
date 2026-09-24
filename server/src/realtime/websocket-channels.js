/**
 * WebSocket Channels
 *
 * Defines the logical channels the platform broadcasts over. Channels
 * are grouped into user-scoped and room-scoped channels. Each
 * channel has a name and an authorization rule.
 *
 * @module server/realtime/websocket-channels
 */

import { logger } from '../lib/logger';

const CHANNELS = new Map();

export function registerChannel({ name, scope, description, authorize }) {
  if (!name || typeof name !== 'string') {
    throw new Error('channel name is required');
  }

  if (!['USER', 'ROOM', 'PUBLIC'].includes(scope)) {
    throw new Error('channel scope must be USER, ROOM, or PUBLIC');
  }

  CHANNELS.set(name, {
    name,
    scope,
    description: description || null,
    authorize: typeof authorize === 'function' ? authorize : null,
  });

  logger.debug({ name, scope }, 'WebSocket channel registered');
}

export function getChannel({ name }) {
  return CHANNELS.get(name) || null;
}

export function isRegisteredChannel({ name }) {
  return CHANNELS.has(name);
}

export function listChannels() {
  return Array.from(CHANNELS.values()).map((c) => ({
    name: c.name,
    scope: c.scope,
    description: c.description,
  }));
}

registerChannel({
  name: 'trade.events',
  scope: 'USER',
  description: 'Trade lifecycle events for the authenticated user',
});

registerChannel({
  name: 'signal.events',
  scope: 'USER',
  description: 'Signal pipeline events relevant to the authenticated user',
});

registerChannel({
  name: 'account.events',
  scope: 'USER',
  description: 'Broker account status and balance events',
});

registerChannel({
  name: 'notification.events',
  scope: 'USER',
  description: 'In-app notification deliveries',
});

registerChannel({
  name: 'solana.events',
  scope: 'USER',
  description: 'Solana wallet, attestation, and payment events',
});

registerChannel({
  name: 'admin.monitor',
  scope: 'ROOM',
  description: 'Live monitors for admin users',
});

export const channelRegistry = {
  registerChannel,
  getChannel,
  isRegisteredChannel,
  listChannels,
};