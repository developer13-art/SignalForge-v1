/**
 * Retry Service
 *
 * @module signalforge/server/modules/execution/retry/service
 */
const { getLogger } = require('../../../bootstrap/initLogger.js');
const { ExecutionRepository } = require('../execution.repository.js');
const { BackoffService } = require('./backoff.service.js');
const { DeadLetterService } = require('./dead-letter.service.js');
const { FailureNotificationService } = require('./failure-notification.service.js');
const { GatewayError, isRetryableGatewayError } = require('../execution.constants.js');
const { emitRequestRetried } = require('../execution.events.js');

export class RetryService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new ExecutionRepository();
    this.backoff = dependencies.backoff || new BackoffService();
    this.deadLetter = dependencies.deadLetter || new DeadLetterService(this.repository);
    this.failureNotification =
      dependencies.failureNotification || new FailureNotificationService();
    this.logger = getLogger('execution-retry');
  }

  isRetryable(error) {
    if (error instanceof GatewayError) {
      return isRetryableGatewayError(error.errorType);
    }
    return false;
  }

  async retry(request, error, executor) {
    if (!this.isRetryable(error)) {
      return { retried: false, reason: 'NOT_RETRYABLE' };
    }

    if (request.attempt >= request.max_attempts) {
      await this.deadLetter.moveToDeadLetter(request.id, error);
      await this.failureNotification.notify(request.user_id, request, error);
      return { retried: false, reason: 'MAX_ATTEMPTS_EXCEEDED' };
    }

    const nextAttempt = request.attempt + 1;
    const delay = await this.backoff.sleep(request.attempt);

    await this.repository.incrementAttempt(request.id);
    await emitRequestRetried(request.id, nextAttempt);

    this.logger.info(
      { requestId: request.id, nextAttempt, delay },
      'Retrying execution request',
    );

    try {
      return await executor(request);
    } catch (retryError) {
      return this.retry({ ...request, attempt: nextAttempt }, retryError, executor);
    }
  }
}
module.exports = RetryService;