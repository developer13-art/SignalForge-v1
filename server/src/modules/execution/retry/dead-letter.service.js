/**
 * Dead Letter Service
 *
 * @module signalforge/server/modules/execution/retry/dead-letter
 */

import { ExecutionRepository } from '../execution.repository.js';
import { getLogger } from '../../../bootstrap/initLogger.js';
import { emitRequestDeadLettered } from '../execution.events.js';

export class DeadLetterService {
  constructor(repository = null) {
    this.repository = repository || new ExecutionRepository();
    this.logger = getLogger('execution-dead-letter');
  }

  async moveToDeadLetter(requestId, error) {
    await this.repository.update(requestId, {
      status: 'DEAD_LETTER',
      error: typeof error === 'string' ? error : error.message,
      failedAt: new Date(),
    });

    await emitRequestDeadLettered(requestId, error);

    this.logger.warn({ requestId, error: error?.message }, 'Execution request moved to dead letter');
    return { deadLettered: true };
  }

  async retryDeadLetter(requestId) {
    const request = await this.repository.findRequestById(requestId);
    if (!request || request.status !== 'DEAD_LETTER') {
      return { retried: false, reason: 'NOT_IN_DEAD_LETTER' };
    }

    await this.repository.update(requestId, {
      status: 'PENDING',
      attempt: 0,
      error: null,
      failedAt: null,
    });

    return { retried: true };
  }
}

export default DeadLetterService;