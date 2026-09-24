/**
 * WebSocket Server
 *
 * Initializes a Socket.IO server attached to the Express HTTP server.
 * Handles connection authentication, room membership, and inbound
 * message routing.
 *
 * @module server/realtime/websocket.server
 */

import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../lib/logger';
import { authenticateWebSocket } from './websocket-auth';
import { joinRoom } from './websocket-rooms';
import { channelRegistry } from './websocket-channels';
import { attachBroadcaster } from './websocket-broadcaster';
import { websocketMetrics } from './websocket-metrics';
import { registerRealtimeListeners } from './register-listeners';

let io = null;

export async function initializeWebSocketServer({ httpServer, corsOrigins = '*' }) {
  if (io) {
    return { initialized: false, alreadyRunning: true };
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: corsOrigins,
      credentials: true,
    },
    path: '/realtime',
    pingTimeout: 25000,
    pingInterval: 20000,
    maxHttpBufferSize: 1e6,
  });

  io.use(async (socket, next) => {
    const token =
      (socket.handshake.auth && socket.handshake.auth.token) ||
      (socket.handshake.headers && socket.handshake.headers.authorization);

    const result = await authenticateWebSocket({ token });

    if (!result.authenticated) {
      logger.debug({ socketId: socket.id, reason: result.reason }, 'Realtime auth rejected');
      return next(new Error(result.reason));
    }

    socket.data.user = result.user;
    next();
  });

  io.on('connection', (socket) => {
    websocketMetrics.recordConnectionOpened();

    const user = socket.data.user;

    logger.debug({ socketId: socket.id, userId: user.id }, 'Realtime connection opened');

    joinRoom({ socket, scope: 'user', id: user.id });

    for (const channel of channelRegistry.listChannels()) {
      if (channel.scope === 'USER') {
        socket.join(channel.name);
      }
    }

    socket.on('message', (incoming) => {
      websocketMetrics.recordMessageReceived();

      if (!incoming || !incoming.channel) {
        return;
      }

      const channel = channelRegistry.getChannel({ name: incoming.channel });

      if (!channel) {
        socket.emit('error', { reason: 'UNKNOWN_CHANNEL' });
        return;
      }

      logger.debug({ socketId: socket.id, channel: incoming.channel }, 'Realtime message received');
    });

    socket.on('subscribe', ({ channel }) => {
      if (!channel || !channelRegistry.isRegisteredChannel({ name: channel })) {
        socket.emit('error', { reason: 'UNKNOWN_CHANNEL' });
        return;
      }

      socket.join(channel);
      socket.emit('subscribed', { channel });
    });

    socket.on('unsubscribe', ({ channel }) => {
      if (!channel) {
        return;
      }
      socket.leave(channel);
      socket.emit('unsubscribed', { channel });
    });

    socket.on('disconnect', (reason) => {
      websocketMetrics.recordConnectionClosed();
      logger.debug({ socketId: socket.id, reason }, 'Realtime connection closed');
    });

    socket.on('error', (err) => {
      websocketMetrics.recordError();
      logger.warn({ err, socketId: socket.id }, 'Realtime socket error');
    });

    socket.emit('connected', {
      userId: user.id,
      serverTime: new Date().toISOString(),
    });
  });

  attachBroadcaster({ server: io });

  registerRealtimeListeners();

  logger.info({ path: '/realtime' }, 'WebSocket server initialized');

  return { initialized: true, io };
}

export async function stopWebSocketServer() {
  if (!io) {
    return { stopped: false };
  }

  try {
    await new Promise((resolve) => io.close(resolve));
    logger.info('WebSocket server stopped');
  } catch (err) {
    logger.error({ err }, 'Error while stopping WebSocket server');
  } finally {
    io = null;
  }

  return { stopped: true };
}

export function getWebSocketServerStatus() {
  if (!io) {
    return { running: false };
  }

  return {
    running: true,
    connections: io.engine ? io.engine.clientsCount : 0,
    rooms: io.sockets.adapter.rooms ? io.sockets.adapter.rooms.size : 0,
  };
}

export const websocketServer = {
  initializeWebSocketServer,
  stopWebSocketServer,
  getWebSocketServerStatus,
};