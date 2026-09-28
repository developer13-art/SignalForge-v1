/**
 * MetaApi Error Handler Service
 *
 * @module signalforge/server/modules/brokers/metaapi/error-handler
 */

import { getLogger } from '../../../bootstrap/initLogger.js';
import {
  BrokerConnectionError,
  BrokerDeploymentError,
  BrokerRateLimitError,
  BrokerSyncError,
} from '../broker.errors.js';

const RETRYABLE_ERROR_PATTERNS = [
  'timeout',
  'rate limit',
  'connection',
  'network',
  'temporarily unavailable',
  'ECONNRESET',
  'ETIMEDOUT',
];

export class MetaApiErrorHandlerService {
  constructor() {
    this.logger = getLogger('metaapi-error-handler');
  }

  isRetryable(error) {
    if (error instanceof BrokerRateLimitError) {
      return true;
    }
    if (error instanceof BrokerConnectionError) {
      return true;
    }
    const message = String(error?.message || '').toLowerCase();
    return RETRYABLE_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
  }

  categorize(error) {
    if (error instanceof BrokerRateLimitError) {
      return 'RATE_LIMIT';
    }
    if (error instanceof BrokerDeploymentError) {
      return 'DEPLOYMENT';
    }
    if (error instanceof BrokerSyncError) {
      return 'SYNC';
    }
    if (error instanceof BrokerConnectionError) {
      return 'CONNECTION';
    }
    return 'UNKNOWN';
  }

  normalize(error) {
    if (
      error instanceof BrokerConnectionError ||
      error instanceof BrokerDeploymentError ||
      error instanceof BrokerRateLimitError ||
      error instanceof BrokerSyncError
    ) {
      return error;
    }
    return new BrokerConnectionError(error.message, { cause: error.message });
  }
}

export default MetaApiErrorHandlerService;