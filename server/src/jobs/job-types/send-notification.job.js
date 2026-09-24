/**
 * Send Notification Job
 *
 * @module server/jobs/job-types/send-notification.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';

async function handler(payload) {
  if (!payload.notificationId) {
    return;
  }

  logger.debug({ notificationId: payload.notificationId }, 'Sending notification');

  try {
    const { notificationService } = await import(
      '../../modules/notifications/notification.service'
    );

    if (notificationService && typeof notificationService.dispatch === 'function') {
      await notificationService.dispatch({ notificationId: payload.notificationId });
    }
  } catch (err) {
    logger.warn({ err, notificationId: payload.notificationId }, 'Notification dispatch failed');
  }
}

export function registerSendNotificationJob() {
  registerJobHandler({
    jobType: 'SEND_NOTIFICATION',
    handler,
  });
}

export default handler;