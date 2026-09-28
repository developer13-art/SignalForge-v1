/**
 * Process Email Message Job
 *
 * @module server/jobs/job-types/process-email-message.job
 */
const { registerJobHandler } = require('../job-registry');
const { logger } = require('../../lib/logger');

async function handler(payload) {
  logger.debug(
    { storedMessageId: payload.storedMessageId, mailbox: payload.mailbox },
    'Processing email message',
  );

  if (!payload.storedMessageId) {
    return;
  }

  const { messageRawStoreService } = await import(
    '../../modules/signal-sources/messages/message-raw-store.service'
  );

  await messageRawStoreService.getMessageById({
    userId: payload.userId,
    messageId: payload.storedMessageId,
  });
}
function registerProcessEmailMessageJob() {
  registerJobHandler({
    jobType: 'PROCESS_EMAIL_MESSAGE',
    handler,
  });
}
module.exports = handler;
module.exports.registerProcessEmailMessageJob = registerProcessEmailMessageJob;
