/**
 * Process Email Message Job
 *
 * @module server/jobs/job-types/process-email-message.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';

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

export function registerProcessEmailMessageJob() {
  registerJobHandler({
    jobType: 'PROCESS_EMAIL_MESSAGE',
    handler,
  });
}

export default handler;