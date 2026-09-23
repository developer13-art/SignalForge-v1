/**
 * Failure Notification Service
 *
 * @module signalforge/server/modules/execution/retry/failure-notification
 */

import { getLogger } from '../../../bootstrap/initLogger.js';

export class FailureNotificationService {
  constructor(notificationService = null) {
    this.notificationService = notificationService;
    this.logger = getLogger('execution-failure-notification');
  }

  async notify(userId, request, error) {
    if (!this.notificationService) {
      this.logger.warn({ userId, requestId: request.id }, 'Notification service unavailable');
      return { notified: false };
    }

    try {
      await this.notificationService.send({
        userId,
        type: 'EXECUTION_FAILED',
        priority: 'HIGH',
        title: 'Execution failed',
        body: `Failed to execute ${request.symbol} ${request.direction}: ${error.message}`,
        referenceType: 'execution_request',
        referenceId: request.id,
      });
      return { notified: true };
    } catch (err) {
      this.logger.error({ err }, 'Failed to send execution failure notification');
      return { notified: false };
    }
  }
}

export default FailureNotificationService;