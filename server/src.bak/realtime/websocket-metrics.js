/**
 * WebSocket Metrics
 *
 * @module server/realtime/websocket-metrics
 */

const METRICS = {
  connectionsOpened: 0,
  connectionsClosed: 0,
  activeConnections: 0,
  messagesReceived: 0,
  messagesSent: 0,
  errors: 0,
  broadcasts: 0,
  broadcastsByChannel: new Map(),
};

export function recordConnectionOpened() {
  METRICS.connectionsOpened++;
  METRICS.activeConnections++;
}

export function recordConnectionClosed() {
  METRICS.connectionsClosed++;
  METRICS.activeConnections = Math.max(0, METRICS.activeConnections - 1);
}

export function recordMessageReceived() {
  METRICS.messagesReceived++;
}

export function recordMessageSent() {
  METRICS.messagesSent++;
}

export function recordError() {
  METRICS.errors++;
}

export function recordBroadcast({ channel, target }) {
  METRICS.broadcasts++;
  const key = `${target}:${channel}`;
  METRICS.broadcastsByChannel.set(key, (METRICS.broadcastsByChannel.get(key) || 0) + 1);
}

export function getWebSocketMetrics() {
  return {
    connectionsOpened: METRICS.connectionsOpened,
    connectionsClosed: METRICS.connectionsClosed,
    activeConnections: METRICS.activeConnections,
    messagesReceived: METRICS.messagesReceived,
    messagesSent: METRICS.messagesSent,
    errors: METRICS.errors,
    broadcasts: METRICS.broadcasts,
    broadcastsByChannel: Array.from(METRICS.broadcastsByChannel.entries()).map(
      ([key, count]) => ({ key, count }),
    ),
  };
}

export function resetWebSocketMetrics() {
  METRICS.connectionsOpened = 0;
  METRICS.connectionsClosed = 0;
  METRICS.activeConnections = 0;
  METRICS.messagesReceived = 0;
  METRICS.messagesSent = 0;
  METRICS.errors = 0;
  METRICS.broadcasts = 0;
  METRICS.broadcastsByChannel.clear();
}

export const websocketMetrics = {
  recordConnectionOpened,
  recordConnectionClosed,
  recordMessageReceived,
  recordMessageSent,
  recordError,
  recordBroadcast,
  getWebSocketMetrics,
  resetWebSocketMetrics,
};