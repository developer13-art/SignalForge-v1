/**
 * TradingView Service (facade)
 *
 * @module signalforge/server/modules/signal-sources/tradingview/service
 */
const { TradingViewRepository } = require('./tradingview.repository.js');
const { TradingViewAuthService } = require('./tradingview-auth.service.js');
const { TradingViewSignalReceiverService } = require('./tradingview-signal-receiver.service.js');
class TradingViewService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new TradingViewRepository();
    this.auth = dependencies.auth || new TradingViewAuthService();
    this.receiver =
      dependencies.receiver ||
      new TradingViewSignalReceiverService({ repository: this.repository });
  }

  async createWebhook(userId, payload) {
    const secret = this.auth.generateSecret();
    const created = await this.repository.createWebhook({
      userId,
      sourceId: payload.sourceId || null,
      name: payload.name,
      secret,
      allowedIps: payload.allowedIps || [],
      enabled: payload.enabled !== false,
    });
    return { ...created, secret };
  }

  async listWebhooks(userId) {
    return this.repository.findWebhooksByUser(userId);
  }

  async rotateSecret(userId, webhookId) {
    const existing = await this.repository.findWebhookById(webhookId);
    if (!existing || existing.user_id !== userId) {
      throw new Error('TradingView webhook not found');
    }
    const newSecret = this.auth.generateSecret();
    await this.repository.updateWebhook(webhookId, userId, { secret: newSecret });
    return { secret: newSecret };
  }

  async updateWebhook(userId, webhookId, payload) {
    return this.repository.updateWebhook(webhookId, userId, payload);
  }

  async deleteWebhook(userId, webhookId) {
    await this.repository.deleteWebhook(webhookId, userId);
    return { deleted: true };
  }

  async processIncoming(userId, payload, ip, providedSecret) {
    return this.receiver.process(userId, payload, ip, providedSecret);
  }
}
module.exports = TradingViewService;
module.exports.TradingViewService = TradingViewService;
