/**
 * Process Discord Message Job
 *
 * @module server/jobs/job-types/process-discord-message.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';

async function handler(payload, context) {
  logger.debug(
    { storedMessageId: payload.storedMessageId, channelId: payload.channelId },
    'Processing Discord message',
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

export function registerProcessDiscordMessageJob() {
  registerJobHandler({
    jobType: 'PROCESS_DISCORD_MESSAGE',
    handler,
  });
}

export default handler;