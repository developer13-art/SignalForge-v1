/**
 * WebSocket Initialization
 *
 * Attaches a socket.io WebSocket server to the HTTP server for
 * real-time updates. Authenticates connections via JWT, subscribes
 * clients to channels (trade, signal, account, notification), and
 * forwards events from the Event Bus.
 *
 * @module signalforge/server/bootstrap/initWebSocket
 */

import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';

import webSocketConfig from '../config/websocket.config.js';
import jwtConfig from '../config/jwt.config.js';
import { getLogger } from './initLogger.js';
import { getEventBus } from './initEventBus.js';

let wsState = null;

export async function initWebSocket(httpServer, dependencies = {}) {
  const logger = getLogger('websocket');

  if (!webSocketConfig.enabled) {
    logger.info('WebSocket disabled by configuration');
    return { enabled: false, close: async () => {} };
  }

  if (wsState) {
    logger.warn('WebSocket already initialized');
    return wsState;
  }

  const eventBus = dependencies.eventBus || getEventBus();

  const io = new SocketIOServer(httpServer, {
    path: webSocketConfig.path,
    cors: {
      origin: webSocketConfig.corsOrigin,
      credentials: true,
    },
    transports: webSocketConfig.transports,
    allowUpgrades: webSocketConfig.allowUpgrades,
    perMessageDeflate: webSocketConfig.perMessageDeflate,
    pingInterval: webSocketConfig.pingIntervalMs,
    pingTimeout: webSocketConfig.pingTimeoutMs,
    upgradeTimeout: webSocketConfig.upgradeTimeoutMs,
    maxHttpBufferSize: webSocketConfig.maxHttpBufferSize,
  });

  const userConnections = new Map();

  io.use((socket, next) => {
    if (!webSocketConfig.auth.required) {
      return next();
    }

    const headerToken = socket.handshake.headers?.[webSocketConfig.auth.tokenHeader];
    const queryToken = socket.handshake.query?.[webSocketConfig.auth.tokenQueryParam];
    let token = null;

    if (typeof headerToken === 'string') {
      token = headerToken.startsWith('Bearer ')
        ? headerToken.substring(7)
        : headerToken;
    } else if (typeof queryToken === 'string') {
      token = queryToken;
    }

    if (!token) {
      return next(new Error('Authentication token missing'));
    }

    try {
      const decoded = jwt.verify(token, jwtConfig.secret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
        algorithms: [jwtConfig.algorithm],
        clockTolerance: jwtConfig.clockToleranceSeconds,
      });

      socket.userId = decoded.sub || decoded.userId;
      socket.userRole = decoded.role || null;
      socket.sessionId = decoded.sessionId || null;

      return next();
    } catch (error) {
      return next(new Error('Authentication token invalid'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;

    if (!userConnections.has(userId)) {
      userConnections.set(userId, new Set());
    }
    userConnections.get(userId).add(socket.id);

    if (webSocketConfig.logging.logConnections) {
      logger.info({ userId, socketId: socket.id }, 'WebSocket client connected');
    }

    socket.join(`${webSocketConfig.rooms.userPrefix}${userId}`);

    if (socket.userRole === 'ADMIN' || socket.userRole === 'SUPER_ADMIN') {
      socket.join(webSocketConfig.rooms.adminRoom);
    }
    if (socket.userRole === 'COMPLIANCE_OFFICER') {
      socket.join(webSocketConfig.rooms.complianceRoom);
    }

    socket.on(webSocketConfig.events.subscribe, (channel) => {
      if (typeof channel !== 'string') {
        return;
      }
      if (!webSocketConfig.channels.includes(channel)) {
        return;
      }
      socket.join(`${webSocketConfig.rooms.userPrefix}${userId}:${channel}`);
    });

    socket.on(webSocketConfig.events.unsubscribe, (channel) => {
      if (typeof channel !== 'string') {
        return;
      }
      socket.leave(`${webSocketConfig.rooms.userPrefix}${userId}:${channel}`);
    });

    socket.on('disconnect', () => {
      const connections = userConnections.get(userId);
      if (connections) {
        connections.delete(socket.id);
        if (connections.size === 0) {
          userConnections.delete(userId);
        }
      }
      if (webSocketConfig.logging.logConnections) {
        logger.info({ userId, socketId: socket.id }, 'WebSocket client disconnected');
      }
    });
  });

  const listeners = [];

  function forwardEvent(eventType, channel, target) {
    const unsubscribe = eventBus.subscribe(eventType, (envelope) => {
      const payload = {
        eventId: envelope.eventId,
        eventType: envelope.eventType,
        timestamp: envelope.timestamp,
        payload: envelope.payload,
      };
      io.emit(channel, payload);
      if (target && envelope.payload && envelope.payload.userId) {
        io.to(`${webSocketConfig.rooms.userPrefix}${envelope.payload.userId}`).emit(
          channel,
          payload,
        );
      }
    });
    listeners.push(unsubscribe);
  }

  forwardEvent('trade:update', webSocketConfig.events.tradeUpdate, true);
  forwardEvent('signal:update', webSocketConfig.events.signalUpdate, true);
  forwardEvent('account:update', webSocketConfig.events.accountUpdate, true);
  forwardEvent('notification:created', webSocketConfig.events.notification, true);
  forwardEvent('risk:alert', 'risk:alert', true);
  forwardEvent('solana:update', 'solana:update', false);

  async function close() {
    for (const unsubscribe of listeners) {
      try {
        unsubscribe();
      } catch {
        // ignore
      }
    }
    listeners.length = 0;

    await new Promise((resolve) => {
      io.close(() => resolve());
    });

    userConnections.clear();
    wsState = null;
  }

  wsState = {
    enabled: true,
    io,
    close,
    get connectedUsers() {
      return userConnections.size;
    },
    get connectedSockets() {
      return io.sockets.sockets.size;
    },
    emitToUser(userId, event, payload) {
      io.to(`${webSocketConfig.rooms.userPrefix}${userId}`).emit(event, payload);
    },
    emitToChannel(channel, event, payload) {
      io.to(channel).emit(event, payload);
    },
    emitToAll(event, payload) {
      io.emit(event, payload);
    },
    emitToAdmins(event, payload) {
      io.to(webSocketConfig.rooms.adminRoom).emit(event, payload);
    },
  };

  logger.info({ path: webSocketConfig.path }, 'WebSocket initialized');

  return wsState;
}

export function getWebSocket() {
  return wsState;
}

export default initWebSocket;