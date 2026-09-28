/**
 * Base Signal Source Adapter
 *
 * Provides the contract and shared utilities for all source adapters.
 *
 * @module signalforge/server/modules/signal-sources/adapters/base
 */

import { getLogger } from '../../../bootstrap/initLogger.js';

export class BaseAdapter {
  constructor(config = {}) {
    this.config = config;
    this.name = 'base';
    this.logger = getLogger(`source-${this.name}`);
  }

  async connect() {
    throw new Error('Adapter must implement connect()');
  }

  async disconnect() {
    throw new Error('Adapter must implement disconnect()');
  }

  async startListener() {
    throw new Error('Adapter must implement startListener()');
  }

  async stopListener() {
    throw new Error('Adapter must implement stopListener()');
  }

  async discoverChannels() {
    throw new Error('Adapter must implement discoverChannels()');
  }

  async optInChannel(channelId) {
    throw new Error('Adapter must implement optInChannel()');
  }

  async optOutChannel(channelId) {
    throw new Error('Adapter must implement optOutChannel()');
  }

  async sendMessage(channelId, content) {
    throw new Error('Adapter must implement sendMessage()');
  }

  normalizeMessage(rawMessage) {
    throw new Error('Adapter must implement normalizeMessage()');
  }

  async healthCheck() {
    return { healthy: true, adapter: this.name };
  }
}

export default BaseAdapter;