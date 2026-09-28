/**
 * TradingView Signal Receiver Service
 *
 * @module signalforge/server/modules/signal-sources/tradingview/signal-receiver
 */
const { getLogger } = require('../../../bootstrap/initLogger.js');
const tradingViewConfig = require('../../../config/tradingview.config.js');
const { TradingViewRepository } = require('./tradingview.repository.js');
const { TradingViewAuthService } = require('./tradingview-auth.service.js');
const { TradingViewReplayProtectionService } = require('./tradingview-replay-protection.service.js');
const { MessageService } = require('../messages/message.service.js');
const { MessageNormalizerService } = require('../messages/message-normalizer.service.js');
const { TradingViewAdapter } = require('../adapters/tradingview.adapter.js');
const { emitMessageReceived } = require('../source.events.js');
const { SourceConnectionError } = require('../source.errors.js');

export class TradingViewSignalReceiverService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new TradingViewRepository();
    this.auth = dependencies.auth || new TradingViewAuthService();
    this.replayProtection =
      dependencies.replayProtection || new TradingViewReplayProtectionService();
    this.messageService = dependencies.messageService || new MessageService();
    this.normalizer = new MessageNormalizerService();
    this.adapter = new TradingViewAdapter();
    this.logger = getLogger('tradingview-receiver');
  }

  parsePayload(rawBody) {
    if (typeof rawBody === 'string') {
      try {
        return JSON.parse(rawBody);
      } catch {
        return { message: rawBody };
      }
    }
    if (Buffer.isBuffer(rawBody)) {
      try {
        return JSON.parse(rawBody.toString('utf8'));
      } catch {
        return { message: rawBody.toString('utf8') };
      }
    }
    if (typeof rawBody === 'object') {
      return rawBody;
    }
    throw new SourceConnectionError('TradingView payload is invalid');
  }

  async process(userId, payload, ip, providedSecret) {
    const webhook = await this.repository.findWebhooksByUser(userId);
    if (webhook.length === 0) {
      throw new SourceConnectionError('No TradingView webhook configured for user');
    }

    const targetWebhook = webhook.find((w) => w.enabled === true);
    if (!targetWebhook) {
      throw new SourceConnectionError('No active TradingView webhook configured');
    }

    const fullWebhook = await this.repository.findWebhookById(targetWebhook.id);

    if (!this.auth.verifySecret(providedSecret, fullWebhook.secret)) {
      throw new SourceConnectionError('TradingView webhook secret invalid');
    }

    if (
      tradingViewConfig.verifyIp &&
      !this.auth.isIpAllowed(ip, fullWebhook.allowed_ips)
    ) {
      throw new SourceConnectionError('TradingView request from unauthorized IP');
    }

    const replay = this.replayProtection.assertUnique(payload);
    if (!replay.unique) {
      this.logger.debug({ userId }, 'TradingView replay detected');
      return { processed: false, reason: 'replay' };
    }

    await this.repository.updateWebhook(fullWebhook.id, userId, {
      lastUsedAt: new Date(),
    });

    const normalized = this.adapter.normalizeMessage(payload);
    const message = this.normalizer.normalize(normalized);

    const result = await this.messageService.ingest(
      {
        id: fullWebhook.source_id || fullWebhook.id,
        user_id: userId,
        source_type: 'TRADINGVIEW',
      },
      message,
    );

    if (!result.duplicate) {
      await emitMessageReceived(userId, fullWebhook.id, result.messageId, {
        channelId: normalized.channelId,
      });
    }

    return { processed: true, messageId: result.messageId, duplicate: result.duplicate };
  }
}
module.exports = TradingViewSignalReceiverService;