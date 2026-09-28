/**
 * Process TradingView Webhook Job
 *
 * @module server/jobs/job-types/process-tradingview-webhook.job
 */
const { registerJobHandler } = require('../job-registry');
const { logger } = require('../../lib/logger');

async function handler(payload) {
  logger.debug(
    { storedMessageId: payload.storedMessageId, integrationId: payload.integrationId },
    'Processing TradingView webhook',
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
function registerProcessTradingViewWebhookJob() {
  registerJobHandler({
    jobType: 'PROCESS_TRADINGVIEW_WEBHOOK',
    handler,
  });
}
module.exports = handler;
module.exports.registerProcessTradingViewWebhookJob = registerProcessTradingViewWebhookJob;
