/**
 * Reply Reference Matcher
 *
 * @module signalforge/server/modules/trade-matching/matchers/reply-reference
 */

export class ReplyReferenceMatcher {
  scoreTrade(trade, replyReference) {
    if (!trade || !replyReference) {
      return 0;
    }
    const tradeSignalRaw = trade.signal_id;
    const tradeRawMessage = trade.raw_message_id;
    if (tradeSignalRaw && String(tradeSignalRaw) === String(replyReference)) {
      return 1;
    }
    if (tradeRawMessage && String(tradeRawMessage) === String(replyReference)) {
      return 0.9;
    }
    return 0;
  }

  scoreTrades(trades, replyReference) {
    if (!Array.isArray(trades)) {
      return [];
    }
    return trades.map((trade) => {
      const score = this.scoreTrade(trade, replyReference);
      return { trade, score, factors: { replyReference: score } };
    });
  }
}

export default ReplyReferenceMatcher;