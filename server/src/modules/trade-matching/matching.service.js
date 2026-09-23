/**
 * Trade Matching Service
 *
 * Resolves which open trade a management instruction applies to,
 * and dispatches the instruction to the appropriate handler.
 *
 * @module signalforge/server/modules/trade-matching/service
 */

import { MatchingRepository } from './matching.repository.js';
import { HybridMatcher } from './matchers/hybrid.matcher.js';
import {
  ManagementInstructionRegistry,
} from './management-instructions/management-instruction.registry.js';
import {
  MATCH_OUTCOMES,
  MANAGEMENT_INSTRUCTION_TYPES,
  MIN_MATCH_CONFIDENCE,
  AMBIGUITY_MARGIN,
  DEFAULT_TIME_WINDOW_MS,
  MAX_OPEN_TRADES_TO_SCAN,
} from './matching.constants.js';
import {
  MatchNotFoundError,
  AmbiguousMatchError,
  ManagementInstructionInvalidError,
} from './matching.errors.js';
import {
  emitMatchAttempted,
  emitMatchSucceeded,
  emitMatchFailed,
  emitMatchAmbiguous,
  emitManagementInstructionParsed,
  emitManagementInstructionApplied,
  emitManagementInstructionFailed,
} from './matching.events.js';

export class MatchingService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new MatchingRepository();
    this.matcher = dependencies.matcher || new HybridMatcher();
  }

  async matchTrade(signal, context = {}) {
    if (!signal || typeof signal !== 'object') {
      throw new MatchNotFoundError('Signal is required');
    }

    const providerId = signal.providerId || context.providerId;
    const messageId = signal.rawMessageId || context.messageId || null;

    await emitMatchAttempted(messageId, providerId, {
      symbol: signal.symbol,
    });

    const referenceTime = signal.timestamp
      ? new Date(signal.timestamp).getTime()
      : Date.now();

    const openTrades = await this.repository.findOpenTradesByProvider(providerId, {
      symbol: signal.normalizedSymbol || signal.symbol,
      afterTimestamp: new Date(referenceTime - DEFAULT_TIME_WINDOW_MS).toISOString(),
      limit: context.limit || MAX_OPEN_TRADES_TO_SCAN,
    });

    if (openTrades.length === 0) {
      await emitMatchFailed(messageId, 'NO_OPEN_TRADES', { providerId });
      throw new MatchNotFoundError('No open trades found for provider', { providerId });
    }

    const matchContext = {
      ticket: context.ticket || signal.ticket || null,
      replyReference: context.replyReference || signal.replyTo || null,
      symbol: signal.normalizedSymbol || signal.symbol || null,
      referenceTime,
      providerId,
    };

    const scored = this.matcher.scoreTrades(openTrades, matchContext);

    if (scored.length === 0) {
      await emitMatchFailed(messageId, 'BELOW_THRESHOLD', { providerId });
      throw new MatchNotFoundError('No trade matched above threshold', { providerId });
    }

    const [best, second] = scored;

    if (
      second &&
      best.score - second.score < AMBIGUITY_MARGIN &&
      second.score >= MIN_MATCH_CONFIDENCE
    ) {
      await emitMatchAmbiguous(messageId, scored.slice(0, 5).map((s) => s.trade.id));
      throw new AmbiguousMatchError('Multiple candidate trades matched', {
        candidates: scored.slice(0, 5).map((s) => ({
          tradeId: s.trade.id,
          score: s.score,
          strategy: s.strategy,
        })),
      });
    }

    const stored = await this.repository.createMatch({
      tradeId: best.trade.id,
      signalId: signal.signalId || signal.id || null,
      messageId,
      providerId,
      userId: best.trade.user_id,
      matchStrategy: best.strategy,
      matchConfidence: best.score,
      matchedFactors: best.factors,
      status: MATCH_OUTCOMES.MATCHED,
    });

    await emitMatchSucceeded(messageId, best.trade.id, best.strategy, best.score);

    return {
      matchId: stored.id,
      trade: best.trade,
      strategy: best.strategy,
      confidence: best.score,
      factors: best.factors,
      outcome: MATCH_OUTCOMES.MATCHED,
    };
  }

  async applyManagementInstruction(signal, instruction, context = {}) {
    if (!instruction || !instruction.type) {
      throw new ManagementInstructionInvalidError('Instruction type is required');
    }

    const match = await this.matchTrade(signal, context);
    const handler = ManagementInstructionRegistry.create(instruction.type);

    if (!handler) {
      throw new ManagementInstructionInvalidError(
        `No handler for instruction type ${instruction.type}`,
      );
    }

    try {
      const built = handler.buildInstruction
        ? handler.buildInstruction({ text: instruction.text || '', ...instruction })
        : instruction;

      await emitManagementInstructionParsed(
        signal.rawMessageId || null,
        built.type,
      );

      const result = handler.apply(match.trade, built);

      await this.repository.createMatch({
        tradeId: match.trade.id,
        signalId: signal.signalId || signal.id || null,
        messageId: signal.rawMessageId || null,
        providerId: signal.providerId || context.providerId || null,
        userId: match.trade.user_id,
        matchStrategy: match.strategy,
        matchConfidence: match.confidence,
        matchedFactors: match.factors,
        status: 'APPLIED',
        instructionType: built.type,
        instructionPayload: built.parameters,
      });

      await emitManagementInstructionApplied(match.trade.id, built.type);

      return {
        match,
        instruction: built,
        result,
      };
    } catch (error) {
      await emitManagementInstructionFailed(
        match.trade.id,
        instruction.type,
        error,
      );
      throw error;
    }
  }

  async classifyInstruction(text) {
    if (!text || typeof text !== 'string') {
      return { type: MANAGEMENT_INSTRUCTION_TYPES.UNKNOWN };
    }
    const supported = ManagementInstructionRegistry.list();
    for (const type of supported) {
      const handler = ManagementInstructionRegistry.create(type);
      if (handler && handler.canHandle && handler.canHandle({ text })) {
        return handler.buildInstruction({ text });
      }
    }
    return { type: MANAGEMENT_INSTRUCTION_TYPES.UNKNOWN };
  }

  async listMatchesByTrade(tradeId) {
    return this.repository.listMatchesByTrade(tradeId);
  }

  async listMatchesBySignal(signalId) {
    return this.repository.listMatchesBySignal(signalId);
  }

  async listOpenTradesForUser(userId, filters = {}) {
    const rows = await this.repository.findOpenTradesByUser(userId, filters);
    return rows.map((row) => this.serializeTrade(row));
  }

  serializeTrade(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      tradeId: row.trade_id,
      userId: row.user_id,
      brokerAccountId: row.broker_account_id,
      providerId: row.provider_id,
      symbol: row.symbol,
      direction: row.direction,
      volume: row.volume,
      remainingVolume: row.remaining_volume,
      entryPrice: row.entry_price,
      stopLoss: row.stop_loss,
      takeProfit: row.take_profit,
      status: row.status,
      openedAt: row.opened_at,
    };
  }
}

export default MatchingService;