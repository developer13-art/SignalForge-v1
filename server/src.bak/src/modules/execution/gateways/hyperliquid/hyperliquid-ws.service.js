'use strict';

const {
  HYPERLIQUID_WS_CHANNELS,
} = require('./hyperliquid.constants');

const {
  ServiceUnavailableError,
} = require('./hyperliquid.errors');

const { config } = require('../../routers/execution-router.config');

/**
 * SignalForge - Hyperliquid WebSocket Service
 *
 * Manages a single shared websocket connection to Hyperliquid for
 * market data and user events. Subscriptions are reference-counted so
 * that adding and removing consumers does not create duplicate
 * subscriptions.
 */

let socket = null;
let reconnectAttempt = 0;
let reconnectTimer = null;
let heartbeatTimer = null;

const subscriptions = new Map();
const messageHandlers = new Set();
const openHandlers = new Set();
const closeHandlers = new Set();

const MAX_RECONNECT_ATTEMPTS = 12;

const BASE_RECONNECT_DELAY_MS = 1000;

const MAX_RECONNECT_DELAY_MS = 30000;

function resolveWsUrl() {
  const gatewayConfig = config.gateways.hyperliquid || {};
  return gatewayConfig.wsUrl || 'wss://api.hyperliquid.xyz/ws';
}

function resolveLogger() {
  if (global.__signalforgeLogger && typeof global.__signalforgeLogger.info === 'function') {
    return global.__signalforgeLogger;
  }
  return null;
}

function emitToHandlers(handlerSet, payload) {
  for (const handler of handlerSet) {
    try {
      handler(payload);
    } catch (_error) {
      // Never let a subscriber break the socket.
    }
  }
}

function send(payload) {
  if (!socket || socket.readyState !== 1) {
    throw new ServiceUnavailableError('Hyperliquid websocket is not connected');
  }
  socket.send(JSON.stringify(payload));
}

function subscribe({ channel, symbol, user, subscriber }) {
  const key = user ? `${channel}:${user}` : symbol ? `${channel}:${symbol}` : channel;

  const existing = subscriptions.get(key) || { channel, symbol, user, subscribers: new Set() };
  existing.subscribers.add(subscriber);
  subscriptions.set(key, existing);

  if (socket && socket.readyState === 1) {
    const subscription = { type: channel };
    if (symbol) {
      subscription.coin = symbol;
    }
    if (user) {
      subscription.user = user;
    }
    send({ method: 'subscribe', subscription });
  }

  return key;
}

function unsubscribe({ key, subscriber }) {
  const existing = subscriptions.get(key);
  if (!existing) {
    return false;
  }
  existing.subscribers.delete(subscriber);
  if (existing.subscribers.size === 0) {
    subscriptions.delete(key);
    if (socket && socket.readyState === 1) {
      const subscription = { type: existing.channel };
      if (existing.symbol) {
        subscription.coin = existing.symbol;
      }
      if (existing.user) {
        subscription.user = existing.user;
      }
      try {
        send({ method: 'unsubscribe', subscription });
      } catch (_error) {
        // Ignore if the socket closed mid-call.
      }
    }
  }
  return true;
}

function subscribeAll() {
  if (!socket || socket.readyState !== 1) {
    return;
  }
  for (const entry of subscriptions.values()) {
    const subscription = { type: entry.channel };
    if (entry.symbol) {
      subscription.coin = entry.symbol;
    }
    if (entry.user) {
      subscription.user = entry.user;
    }
    try {
      send({ method: 'subscribe', subscription });
    } catch (_error) {
      // Continue
    }
  }
}

function scheduleReconnect() {
  if (reconnectTimer) {
    return;
  }
  if (reconnectAttempt >= MAX_RECONNECT_ATTEMPTS) {
    const logger = resolveLogger();
    if (logger) {
      logger.error('Hyperliquid websocket exhausted reconnect attempts');
    }
    return;
  }
  const delay = Math.min(
    BASE_RECONNECT_DELAY_MS * Math.pow(2, reconnectAttempt),
    MAX_RECONNECT_DELAY_MS,
  );
  reconnectAttempt += 1;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, delay);
}

function clearHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

function startHeartbeat() {
  clearHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (socket && socket.readyState === 1) {
      try {
        socket.send(JSON.stringify({ method: 'ping' }));
      } catch (_error) {
        // Ignore
      }
    }
  }, 30000);
}

function handleMessage(data) {
  let parsed = null;
  try {
    parsed = JSON.parse(data);
  } catch (_error) {
    return;
  }
  emitToHandlers(messageHandlers, parsed);
}

function connect() {
  if (socket && (socket.readyState === 0 || socket.readyState === 1)) {
    return socket;
  }

  const url = resolveWsUrl();
  socket = new WebSocket(url);

  socket.addEventListener('open', () => {
    reconnectAttempt = 0;
    startHeartbeat();
    subscribeAll();
    emitToHandlers(openHandlers, { url, at: new Date().toISOString() });
  });

  socket.addEventListener('message', (event) => {
    handleMessage(event.data);
  });

  socket.addEventListener('close', () => {
    clearHeartbeat();
    emitToHandlers(closeHandlers, { at: new Date().toISOString() });
    scheduleReconnect();
  });

  socket.addEventListener('error', () => {
    emitToHandlers(closeHandlers, { at: new Date().toISOString(), error: true });
  });

  return socket;
}

function disconnect() {
  clearHeartbeat();
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (socket) {
    try {
      socket.close();
    } catch (_error) {
      // Ignore
    }
    socket = null;
  }
}

function onMessage(handler) {
  messageHandlers.add(handler);
  return () => messageHandlers.delete(handler);
}

function onOpen(handler) {
  openHandlers.add(handler);
  return () => openHandlers.delete(handler);
}

function onClose(handler) {
  closeHandlers.add(handler);
  return () => closeHandlers.delete(handler);
}

function subscribeToAllMids({ handler } = {}) {
  const key = subscribe({
    channel: HYPERLIQUID_WS_CHANNELS.ALL_MIDS,
    subscriber: handler || 'default',
  });
  return key;
}

function subscribeToUserFills({ user, handler }) {
  if (!user) {
    throw new ServiceUnavailableError('user is required to subscribe to user fills');
  }
  return subscribe({
    channel: HYPERLIQUID_WS_CHANNELS.USER_FILLS,
    user,
    subscriber: handler || 'default',
  });
}

function subscribeToOrderUpdates({ user, handler }) {
  if (!user) {
    throw new ServiceUnavailableError('user is required to subscribe to order updates');
  }
  return subscribe({
    channel: HYPERLIQUID_WS_CHANNELS.ORDER_UPDATES,
    user,
    subscriber: handler || 'default',
  });
}

function subscribeToL2Book({ symbol, handler }) {
  if (!symbol) {
    throw new ServiceUnavailableError('symbol is required to subscribe to L2 book');
  }
  return subscribe({
    channel: HYPERLIQUID_WS_CHANNELS.L2_BOOK,
    symbol,
    subscriber: handler || 'default',
  });
}

function status() {
  return {
    connected: Boolean(socket && socket.readyState === 1),
    readyState: socket ? socket.readyState : null,
    subscriptions: subscriptions.size,
    reconnectAttempt,
  };
}

module.exports = {
  connect,
  disconnect,
  send,
  subscribe,
  unsubscribe,
  onMessage,
  onOpen,
  onClose,
  subscribeToAllMids,
  subscribeToUserFills,
  subscribeToOrderUpdates,
  subscribeToL2Book,
  status,
};