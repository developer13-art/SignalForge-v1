/**
 * Process Telegram Message Job
 *
 * @module server/jobs/job-types/process-telegram-message.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';

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

export function registerProcessTelegramMessageJob() {
  registerJobHandler({
    jobType: 'PROCESS_TELEGRAM_MESSAGE',
    handler,
  });
}

export default handler;