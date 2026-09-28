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
function recordConnectionOpened() {
  METRICS.connectionsOpened++;
  METRICS.activeConnections++;
}
function recordConnectionClosed() {
  METRICS.connectionsClosed++;
  METRICS.activeConnections = Math.max(0, METRICS.activeConnections - 1);
}
function recordMessageReceived() {
  METRICS.messagesReceived++;
}
function recordMessageSent() {
  METRICS.messagesSent++;
}
function recordError() {
  METRICS.errors++;
}
function recordBroadcast({ channel, target }) {
  METRICS.broadcasts++;
  const key = `${target}:${channel}`;
  METRICS.broadcastsByChannel.set(key, (METRICS.broadcastsByChannel.get(key) || 0) + 1);
}
function getWebSocketMetrics() {
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
function resetWebSocketMetrics() {
  METRICS.connectionsOpened = 0;
  METRICS.connectionsClosed = 0;
  METRICS.activeConnections = 0;
  METRICS.messagesReceived = 0;
  METRICS.messagesSent = 0;
  METRICS.errors = 0;
  METRICS.broadcasts = 0;
  METRICS.broadcastsByChannel.clear();
}
const websocketMetrics = {
  recordConnectionOpened,
  recordConnectionClosed,
  recordMessageReceived,
  recordMessageSent,
  recordError,
  recordBroadcast,
  getWebSocketMetrics,
  resetWebSocketMetrics,
};
module.exports.websocketMetrics = websocketMetrics;
module.exports.recordConnectionOpened = recordConnectionOpened;
module.exports.recordConnectionClosed = recordConnectionClosed;
module.exports.recordMessageReceived = recordMessageReceived;
module.exports.recordMessageSent = recordMessageSent;
module.exports.recordError = recordError;
module.exports.recordBroadcast = recordBroadcast;
module.exports.getWebSocketMetrics = getWebSocketMetrics;
module.exports.resetWebSocketMetrics = resetWebSocketMetrics;
