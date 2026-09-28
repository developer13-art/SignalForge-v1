/**
 * Process WhatsApp Message Job
 *
 * @module server/jobs/job-types/process-whatsapp-message.job
 */
const { registerJobHandler } = require('../job-registry');
const { logger } = require('../../lib/logger');

async function handler(payload) {
  logger.debug(
    { storedMessageId: payload.storedMessageId, phoneNumberId: payload.phoneNumberId },
    'Processing WhatsApp message',
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
function registerProcessWhatsAppMessageJob() {
  registerJobHandler({
    jobType: 'PROCESS_WHATSAPP_MESSAGE',
    handler,
  });
}
module.exports = handler;
module.exports.registerProcessWhatsAppMessageJob = registerProcessWhatsAppMessageJob;
