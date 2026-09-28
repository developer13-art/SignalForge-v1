/**
 * MetaApi Event Processor Service
 *
 * Normalizes MetaApi stream events and forwards them to the
 * platform Event Bus so downstream services can react.
 *
 * @module signalforge/server/modules/brokers/metaapi/event-processor
 */

import { getLogger } from '../../../bootstrap/initLogger.js';
import { AccountRepository } from '../accounts/account.repository.js';
import { emitStreamEvent } from '../broker.events.js';

const SUPPORTED_EVENT_TYPES = Object.freeze([
  'positions',
  'orders',
  'specifications',
  'accountInformation',
  'connected',
  'disconnected',
  'synchronization',
  'terminalState',
]);

export class MetaApiEventProcessorService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new AccountRepository();
    this.logger = getLogger('metaapi-event-processor');
  }

  async process(accountId, eventType, event) {
    if (!SUPPORTED_EVENT_TYPES.includes(eventType)) {
      this.logger.debug({ eventType }, 'Unsupported MetaApi event type');
      return { processed: false, reason: 'UNSUPPORTED_EVENT' };
    }

    const account = await this.repository.findById(accountId);
    if (!account) {
      return { processed: false, reason: 'ACCOUNT_NOT_FOUND' };
    }

    switch (eventType) {
      case 'positions':
        await this.handlePositions(account, event);
        break;
      case 'orders':
        await this.handleOrders(account, event);
        break;
      case 'accountInformation':
        await this.handleAccountInformation(account, event);
        break;
      case 'connected':
        await this.handleConnected(account, event);
        break;
      case 'disconnected':
        await this.handleDisconnected(account, event);
        break;
      case 'synchronization':
        await this.handleSynchronization(account, event);
        break;
      case 'terminalState':
        await this.handleTerminalState(account, event);
        break;
      default:
        break;
    }

    await emitStreamEvent(account.id, eventType, event);

    return { processed: true };
  }

  async handlePositions(account, event) {
    const positions = Array.isArray(event) ? event : event?.positions || [];
    this.logger.debug({ accountId: account.id, positions: positions.length }, 'Positions event');
  }

  async handleOrders(account, event) {
    const orders = Array.isArray(event) ? event : event?.orders || [];
    this.logger.debug({ accountId: account.id, orders: orders.length }, 'Orders event');
  }

  async handleAccountInformation(account, event) {
    if (!event) {
      return;
    }
    await this.repository.update(account.id, {
      balance: event.balance ?? account.balance,
      equity: event.equity ?? account.equity,
      margin: event.margin ?? account.margin,
      freeMargin: event.freeMargin ?? account.free_margin,
      marginLevel: event.marginLevel ?? account.margin_level,
      lastSyncAt: new Date(),
    });
  }

  async handleConnected(account) {
    await this.repository.update(account.id, {
      status: 'CONNECTED',
      connectedAt: new Date(),
    });
  }

  async handleDisconnected(account) {
    await this.repository.update(account.id, {
      status: 'DISCONNECTED',
      disconnectedAt: new Date(),
    });
  }

  async handleSynchronization(account, event) {
    this.logger.debug({ accountId: account.id, state: event?.state }, 'Synchronization event');
  }

  async handleTerminalState(account, event) {
    this.logger.debug({ accountId: account.id, state: event?.state }, 'Terminal state event');
  }
}

export default MetaApiEventProcessorService;