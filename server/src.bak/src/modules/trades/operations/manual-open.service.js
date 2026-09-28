/**
 * Manual Open Service
 *
 * @module signalforge/server/modules/trades/operations/manual-open
 */
const crypto = require('node:crypto');
const { TradeRepository } = require('../trade.repository.js');
const { TradeTimelineService } = require('../timeline/trade-timeline.service.js');
const { AccountRepository } = require('../../brokers/accounts/account.repository.js');
const { emitManualOpen, emitTradeCreated } = require('../trade.events.js');
const { BrokerAccountNotFoundError } = require('../../brokers/broker.errors.js');
const { normalizeSymbol } = require('@signalforge/shared/validators/symbol.validator');
const { TRADE_STATUSES, TRADE_ACTORS } = require('../trade.constants.js');

export class ManualOpenService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new TradeRepository();
    this.timeline = dependencies.timeline || new TradeTimelineService();
    this.accounts = dependencies.accounts || new AccountRepository();
    this.executionService = dependencies.executionService || null;
  }

  async open(userId, payload) {
    const account = await this.accounts.findByIdForUser(payload.brokerAccountId, userId);
    if (!account) {
      throw new BrokerAccountNotFoundError();
    }

    const symbol = normalizeSymbol(payload.symbol);
    const tradeId = crypto.randomUUID();

    const created = await this.repository.create({
      tradeId,
      userId,
      brokerAccountId: account.id,
      signalId: payload.signalId || null,
      providerId: payload.providerId || null,
      symbol,
      normalizedSymbol: symbol,
      direction: payload.direction,
      entryType: payload.entryType || 'MARKET',
      requestedPrice: payload.entryPrice ?? null,
      volume: payload.volume,
      remainingVolume: payload.volume,
      stopLoss: payload.stopLoss ?? null,
      takeProfit: payload.takeProfit ?? null,
      platform: account.platform,
      accountType: account.account_type,
      status: TRADE_STATUSES.SIGNAL_RECEIVED,
      openedBy: TRADE_ACTORS.USER,
    });

    await this.timeline.record({
      tradeId: created.trade_id,
      userId,
      eventType: 'SIGNAL_RECEIVED',
      actor: TRADE_ACTORS.USER,
      actorId: userId,
      newState: created.status,
      payload: { symbol, direction: payload.direction, volume: payload.volume },
    });

    await emitTradeCreated(created.trade_id, userId, {
      symbol,
      direction: payload.direction,
      manual: true,
    });

    let executionResult = null;

    if (this.executionService) {
      try {
        executionResult = await this.executionService.openPosition({
          tradeId: created.trade_id,
          userId,
          brokerAccountId: account.id,
          metaApiAccountId: account.metaapi_account_id,
          platform: account.platform,
          symbol,
          direction: payload.direction,
          entryType: payload.entryType || 'MARKET',
          volume: payload.volume,
          price: payload.entryPrice ?? null,
          stopLoss: payload.stopLoss ?? null,
          takeProfit: payload.takeProfit ?? null,
          comment: 'SignalForge manual',
        });

        const finalStatus = executionResult.status === 'COMPLETED'
          ? TRADE_STATUSES.OPEN
          : TRADE_STATUSES.FAILED;

        await this.repository.update(created.id, {
          status: finalStatus,
          brokerOrderId: executionResult.brokerOrderId || null,
          brokerPositionId: executionResult.brokerPositionId || null,
          brokerTicket: executionResult.brokerTicket || null,
          entryPrice: executionResult.executedPrice ?? payload.entryPrice ?? null,
          openedAt: finalStatus === TRADE_STATUSES.OPEN ? new Date() : null,
        });

        await this.timeline.record({
          tradeId: created.trade_id,
          userId,
          eventType: finalStatus === TRADE_STATUSES.OPEN ? 'POSITION_OPENED' : 'EXECUTION_FAILED',
          actor: TRADE_ACTORS.BROKER,
          previousState: created.status,
          newState: finalStatus,
          payload: executionResult,
        });
      } catch (error) {
        await this.repository.update(created.id, {
          status: TRADE_STATUSES.FAILED,
          rejectionReason: error.message,
        });
      }
    }

    const finalTrade = await this.repository.findById(created.id);
    await emitManualOpen(created.trade_id, userId, { symbol, direction: payload.direction });

    return { trade: finalTrade, execution: executionResult };
  }
}
module.exports = ManualOpenService;