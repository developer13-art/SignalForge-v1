/**
 * Payment Event Service
 *
 * @module signalforge/server/modules/payments/events/service
 */

import { PaymentEventRepository } from './repository.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

export class PaymentEventService {
  constructor(repository = null) {
    this.repository = repository || new PaymentEventRepository();
    this.logger = getLogger('payment-events');
  }

  async recordEvent(data) {
    const existing = await this.repository.find(data.provider, data.externalEventId);
    if (existing) {
      return existing;
    }
    return this.repository.create(data);
  }

  async markProcessed(eventId) {
    return this.repository.update(eventId, {
      status: 'COMPLETED',
      processed: true,
    });
  }

  async markFailed(eventId, error) {
    return this.repository.update(eventId, {
      status: 'FAILED',
      error: typeof error === 'string' ? error : error.message,
    });
  }

  async listEvents(filters, pagination) {
    return this.repository.list(filters, pagination);
  }
}

export default PaymentEventService;