/**
 * Send Notification Job
 *
 * @module server/jobs/job-types/send-notification.job
 */
const { registerJobHandler } = require('../job-registry');
const { logger } = require('../../lib/logger');

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
function registerSendNotificationJob() {
  registerJobHandler({
    jobType: 'SEND_NOTIFICATION',
    handler,
  });
}
module.exports = handler;
module.exports.registerSendNotificationJob = registerSendNotificationJob;
