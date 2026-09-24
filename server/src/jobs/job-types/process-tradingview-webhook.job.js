/**
 * Process TradingView Webhook Job
 *
 * @module server/jobs/job-types/process-tradingview-webhook.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';

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

export function registerProcessTradingViewWebhookJob() {
  registerJobHandler({
    jobType: 'PROCESS_TRADINGVIEW_WEBHOOK',
    handler,
  });
}

export default handler;