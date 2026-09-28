/**
 * WebSocket Broadcaster
 *
 * Central dispatch for sending messages to specific sockets, users,
 * rooms, or channels. All realtime publishers should go through this
 * module so that metrics and authentication rules are applied
 * consistently.
 *
 * @module server/realtime/websocket-broadcaster
 */
const { logger } = require('../lib/logger');
const { websocketMetrics } = require('./websocket-metrics');
const { channelRegistry } = require('./websocket-channels');

let io = null;
function attachBroadcaster({ server }) {
  if (!server) {
    throw new Error('server is required');
  }
  io = server;
}

function ensureIo() {
  if (!io) {
    logger.debug('Broadcaster invoked before WebSocket server was initialized');
    return null;
  }
  return io;
}
function broadcastToUser({ userId, channel, event, payload }) {
  const server = ensureIo();
  if (!server) {
    return { delivered: false, reason: 'NO_SERVER' };
  }

  if (channel && !channelRegistry.isRegisteredChannel({ name: channel })) {
    logger.warn({ channel }, 'Broadcast to unregistered channel');
    return { delivered: false, reason: 'UNKNOWN_CHANNEL' };
  }

  const room = `user:${userId}`;
  const message = { event, payload, channel: channel || null, sentAt: new Date().toISOString() };

  server.to(room).emit('message', message);

  websocketMetrics.recordBroadcast({ channel: channel || 'direct', target: 'USER' });

  return { delivered: true, room };
}
function broadcastToRoom({ room, event, payload }) {
  const server = ensureIo();
  if (!server) {
    return { delivered: false, reason: 'NO_SERVER' };
  }

  const message = { event, payload, sentAt: new Date().toISOString() };

  server.to(room).emit('message', message);

  websocketMetrics.recordBroadcast({ channel: 'room', target: room });

  return { delivered: true, room };
}
function broadcastToChannel({ channel, event, payload }) {
  const server = ensureIo();
  if (!server) {
    return { delivered: false, reason: 'NO_SERVER' };
  }

  if (!channelRegistry.isRegisteredChannel({ name: channel })) {
    logger.warn({ channel }, 'Broadcast to unregistered channel');
    return { delivered: false, reason: 'UNKNOWN_CHANNEL' };
  }

  const message = { event, payload, channel, sentAt: new Date().toISOString() };

  server.to(channel).emit('message', message);

  websocketMetrics.recordBroadcast({ channel, target: 'CHANNEL' });

  return { delivered: true, channel };
}
function broadcastToAll({ event, payload }) {
  const server = ensureIo();
  if (!server) {
    return { delivered: false, reason: 'NO_SERVER' };
  }

  const message = { event, payload, sentAt: new Date().toISOString() };

  server.emit('message', message);

  websocketMetrics.recordBroadcast({ channel: 'global', target: 'ALL' });

  return { delivered: true };
}
const broadcaster = {
  attachBroadcaster,
  broadcastToUser,
  broadcastToRoom,
  broadcastToChannel,
  broadcastToAll,
};
module.exports.broadcaster = broadcaster;
module.exports.attachBroadcaster = attachBroadcaster;
module.exports.broadcastToUser = broadcastToUser;
module.exports.broadcastToRoom = broadcastToRoom;
module.exports.broadcastToChannel = broadcastToChannel;
module.exports.broadcastToAll = broadcastToAll;
