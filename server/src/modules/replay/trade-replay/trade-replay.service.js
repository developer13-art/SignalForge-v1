/**
 * Trade Replay Service
 *
 * Reconstructs the full lifecycle of a single trade from entry to
 * exit, including all trade events and execution attempts.
 *
 * @module server/modules/replay/trade-replay/trade-replay.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { replayRepository } from '../replay.repository';
import { timelineBuilderService } from '../signal-replay/timeline-builder.service';
import { tradeTimelineService } from './trade-timeline.service';

export async function buildTradeReplay({ tradeId, userId }) {
  if (!tradeId) {
    throw new AppError('tradeId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const trade = await replayRepository.findTradeById({ tradeId });

  if (!trade) {
    throw new AppError('Trade not found', ERROR_CODES.NOT_FOUND, 404);
  }

  if (userId && trade.user_id && trade.user_id !== userId) {
    throw new AppError('Trade does not belong to the requesting user', ERROR_CODES.AUTHORIZATION_FAILED, 403);
  }

  const events = await tradeTimelineService.buildTradeTimeline({ tradeId });

  const summary = timelineBuilderService.buildTimelineSummary({ events });
  const durations = timelineBuilderService.calculateDurations({ events });

  return {
    tradeId,
    trade: {
      id: trade.id,
      signalId: trade.signal_id,
      userId: trade.user_id,
      brokerAccountId: trade.broker_account_id,
      symbol: trade.symbol,
      direction: trade.direction,
      volume: trade.volume,
      entryPrice: trade.entry_price,
      exitPrice: trade.exit_price,
      stopLoss: trade.stop_loss,
      takeProfit: trade.take_profit,
      realizedProfit: trade.realized_profit,
      status: trade.status,
      openedAt: trade.opened_at,
      closedAt: trade.closed_at,
    },
    timeline: events,
    summary,
    durations,
  };
}

export const tradeReplayService = {
  buildTradeReplay,
};