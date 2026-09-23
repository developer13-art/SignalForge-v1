/**
 * MetaApi WebSocket Service
 *
 * Low-level WebSocket wrapper for the MetaApi streaming API. Uses
 * the platform-native WebSocket when available, and falls back to a
 * no-op interface otherwise so that the application remains runnable.
 *
 * @module signalforge/server/modules/brokers/metaapi/websocket
 */

import { getLogger } from '../../../bootstrap/initLogger.js';
import metaApiConfig from '../../../config/metaapi.config.js';

export class MetaApiWebSocketService {
  constructor(config = null) {
    this.config = config || metaApiConfig;
    this.logger = getLogger('metaapi-websocket');
    this.sockets = new Map();
  }

  buildUrl(metaApiAccountId) {
    return `${this.config.wsUrl}/users/current/accounts/${metaApiAccountId}/stream`;
  }

  async connect(metaApiAccountId, handlers = {}) {
    if (typeof WebSocket === 'undefined') {
      this.logger.warn('WebSocket is not available in this runtime');
      return { connected: false, reason: 'WEBSOCKET_UNAVAILABLE' };
    }

    const url = this.buildUrl(metaApiAccountId);
    const ws = new WebSocket(url, {
      headers: {
        'auth-token': this.config.token,
      },
    });

    ws.onopen = () => {
      if (handlers.onConnected) {
        handlers.onConnected();
      }
    };

    ws.onclose = () => {
      this.sockets.delete(metaApiAccountId);
      if (handlers.onDisconnected) {
        handlers.onDisconnected();
      }
    };

    ws.onerror = (event) => {
      if (handlers.onError) {
        handlers.onError(new Error(`WebSocket error: ${event?.message || 'unknown'}`));
      }
    };

    ws.onmessage = (message) => {
      try {
        const parsed = JSON.parse(message.data);
        if (handlers.onMessage) {
          handlers.onMessage(parsed);
        }
      } catch (error) {
        this.logger.warn({ err: error }, 'Failed to parse WebSocket message');
      }
    };

    this.sockets.set(metaApiAccountId, ws);

    return { connected: true };
  }

  async disconnect(metaApiAccountId) {
    const ws = this.sockets.get(metaApiAccountId);
    if (!ws) {
      return { disconnected: false };
    }
    try {
      ws.close();
    } catch (error) {
      this.logger.warn({ err: error, metaApiAccountId }, 'Failed to close WebSocket');
    }
    this.sockets.delete(metaApiAccountId);
    return { disconnected: true };
  }

  async disconnectAll() {
    for (const metaApiAccountId of Array.from(this.sockets.keys())) {
      await this.disconnect(metaApiAccountId);
    }
  }

  isConnected(metaApiAccountId) {
    return this.sockets.has(metaApiAccountId);
  }
}

export default MetaApiWebSocketService;