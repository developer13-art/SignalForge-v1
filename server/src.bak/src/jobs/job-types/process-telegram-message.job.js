/**
 * Process Telegram Message Job
 *
 * @module server/jobs/job-types/process-telegram-message.job
 */
const { registerJobHandler } = require('../job-registry');
const { logger } = require('../../lib/logger');

async function handler(payload, context) {
  logger.debug(
    { storedMessageId: payload.storedMessageId, sourceId: payload.sourceId },
    'Processing Telegram message',
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
function registerProcessTelegramMessageJob() {
  registerJobHandler({
    jobType: 'PROCESS_TELEGRAM_MESSAGE',
    handler,
  });
}
module.exports = handler;
module.exports.registerProcessTelegramMessageJob = registerProcessTelegramMessageJob;
