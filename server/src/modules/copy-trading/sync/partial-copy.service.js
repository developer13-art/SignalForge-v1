/**
 * Partial Copy Service
 *
 * @module signalforge/server/modules/copy-trading/sync/partial-copy
 */

import { normalizeSymbol } from '@signalforge/shared/validators/symbol.validator';
import { getLogger } from '../../../bootstrap/initLogger.js';

export class PartialCopyService {
  constructor() {
    this.logger = getLogger('copy-trading-partial-copy');
  }

  buildPartialCloseInstruction(providerInstruction, trade) {
    if (!providerInstruction || !trade) {
      return null;
    }
    const symbol = normalizeSymbol(trade.symbol);
    if (symbol !== normalizeSymbol(providerInstruction.symbol)) {
      return null;
    }
    return {
      tradeId: trade.id,
      subscriberId: trade.user_id,
      percentage: providerInstruction.percentage || 50,
      reason: 'PARTIAL_COPY_FROM_PROVIDER',
    };
  }

  async applyToSubscribers(providerInstruction, userTrades, executor) {
    const applied = [];
    const skipped = [];

    for (const trade of userTrades) {
      const instruction = this.buildPartialCloseInstruction(providerInstruction, trade);
      if (!instruction) {
        skipped.push({ tradeId: trade.id, reason: 'SYMBOL_MISMATCH' });
        continue;
      }

      try {
        if (executor) {
          await executor(instruction);
        }
        applied.push(instruction);
      } catch (error) {
        this.logger.error({ err: error, tradeId: trade.id }, 'Partial copy failed');
        skipped.push({ tradeId: trade.id, reason: error.message });
      }
    }

    return { applied, skipped };
  }
}

export default PartialCopyService;