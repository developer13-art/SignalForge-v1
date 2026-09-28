/**
 * Process Discord Message Job
 *
 * @module server/jobs/job-types/process-discord-message.job
 */
const { registerJobHandler } = require('../job-registry');
const { logger } = require('../../lib/logger');

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
function registerProcessDiscordMessageJob() {
  registerJobHandler({
    jobType: 'PROCESS_DISCORD_MESSAGE',
    handler,
  });
}
module.exports = handler;
module.exports.registerProcessDiscordMessageJob = registerProcessDiscordMessageJob;
