/**
 * Symbol Matcher
 *
 * @module signalforge/server/modules/trade-matching/matchers/symbol
 */

import { normalizeSymbol } from '@signalforge/shared/validators/symbol.validator';

export class SymbolMatcher {
  extractSymbolFromMessage(message) {
    if (!message) {
      return null;
    }
    const symbol = message.symbol || message.normalizedSymbol;
    if (symbol) {
      return normalizeSymbol(symbol);
    }
    return null;
  }

  scoreTrade(trade, targetSymbol) {
    if (!trade || !targetSymbol) {
      return 0;
    }
    const tradeSymbol = normalizeSymbol(trade.normalized_symbol || trade.symbol);
    if (!tradeSymbol) {
      return 0;
    }
    if (tradeSymbol === targetSymbol) {
      return 1;
    }
    return 0;
  }

  scoreTrades(trades, targetSymbol) {
    if (!Array.isArray(trades)) {
      return [];
    }
    return trades.map((trade) => ({
      trade,
      score: this.scoreTrade(trade, targetSymbol),
      factors: { symbol: this.scoreTrade(trade, targetSymbol) },
    }));
  }
}

export default SymbolMatcher;