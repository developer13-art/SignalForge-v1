/**
 * Process WhatsApp Message Job
 *
 * @module server/jobs/job-types/process-whatsapp-message.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';

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

export function registerProcessWhatsAppMessageJob() {
  registerJobHandler({
    jobType: 'PROCESS_WHATSAPP_MESSAGE',
    handler,
  });
}

export default handler;