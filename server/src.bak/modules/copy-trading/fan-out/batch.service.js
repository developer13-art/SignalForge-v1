/**
 * Batch Service
 *
 * @module signalforge/server/modules/copy-trading/fan-out/batch
 */

import { DEFAULT_BATCH_SIZE } from '../copy-trading.constants.js';

export class BatchService {
  constructor(batchSize = DEFAULT_BATCH_SIZE) {
    this.batchSize = batchSize;
  }

  buildBatches(subscribers, batchSize = null) {
    const size = batchSize || this.batchSize;
    if (!Array.isArray(subscribers) || subscribers.length === 0) {
      return [];
    }
    const batches = [];
    for (let i = 0; i < subscribers.length; i += size) {
      batches.push({
        index: Math.floor(i / size),
        subscribers: subscribers.slice(i, i + size),
      });
    }
    return batches;
  }

  getTotalBatches(subscriberCount, batchSize = null) {
    const size = batchSize || this.batchSize;
    if (subscriberCount <= 0 || size <= 0) {
      return 0;
    }
    return Math.ceil(subscriberCount / size);
  }
}

export default BatchService;