/**
 * Hybrid Matcher
 *
 * @module signalforge/server/modules/trade-matching/matchers/hybrid
 */

import { SymbolMatcher } from './symbol.matcher.js';
import { TimeMatcher } from './time.matcher.js';
import { TicketMatcher } from './ticket.matcher.js';
import { ReplyReferenceMatcher } from './reply-reference.matcher.js';
import { ProviderMatcher } from './provider.matcher.js';
import { MATCH_STRATEGIES, MIN_MATCH_CONFIDENCE } from '../matching.constants.js';

const WEIGHTS = Object.freeze({
  ticket: 1.0,
  replyReference: 0.9,
  symbol: 0.4,
  time: 0.2,
  provider: 0.15,
});

export class HybridMatcher {
  constructor(dependencies = {}) {
    this.symbolMatcher = dependencies.symbolMatcher || new SymbolMatcher();
    this.timeMatcher = dependencies.timeMatcher || new TimeMatcher();
    this.ticketMatcher = dependencies.ticketMatcher || new TicketMatcher();
    this.replyMatcher = dependencies.replyMatcher || new ReplyReferenceMatcher();
    this.providerMatcher = dependencies.providerMatcher || new ProviderMatcher();
  }

  scoreTrade(trade, context) {
    const factors = {};

    if (context.ticket) {
      factors.ticket = this.ticketMatcher.scoreTrade(trade, context.ticket);
    }
    if (context.replyReference) {
      factors.replyReference = this.replyMatcher.scoreTrade(trade, context.replyReference);
    }
    if (context.symbol) {
      factors.symbol = this.symbolMatcher.scoreTrade(trade, context.symbol);
    }
    if (context.referenceTime) {
      factors.time = this.timeMatcher.scoreTrade(trade, context.referenceTime);
    }
    if (context.providerId) {
      factors.provider = this.providerMatcher.scoreTrade(trade, context.providerId);
    }

    const strategy = this.determineStrategy(factors);

    let total = 0;
    let weightSum = 0;
    for (const [key, value] of Object.entries(factors)) {
      const weight = WEIGHTS[key] || 0.1;
      total += value * weight;
      weightSum += weight;
    }

    const score = weightSum > 0 ? total / weightSum : 0;

    return {
      trade,
      score: Number(score.toFixed(4)),
      factors,
      strategy,
    };
  }

  determineStrategy(factors) {
    if (factors.ticket >= 1) {
      return MATCH_STRATEGIES.TICKET;
    }
    if (factors.replyReference >= 0.9) {
      return MATCH_STRATEGIES.REPLY_REFERENCE;
    }
    if (factors.symbol >= 1 && factors.time > 0) {
      return MATCH_STRATEGIES.SYMBOL_TIME;
    }
    if (factors.symbol >= 1) {
      return MATCH_STRATEGIES.SYMBOL_ONLY;
    }
    if (factors.provider >= 1) {
      return MATCH_STRATEGIES.PROVIDER_RECENT;
    }
    return MATCH_STRATEGIES.HYBRID;
  }

  scoreTrades(trades, context) {
    if (!Array.isArray(trades)) {
      return [];
    }
    const scored = trades.map((trade) => this.scoreTrade(trade, context));
    return scored.filter((s) => s.score >= MIN_MATCH_CONFIDENCE).sort((a, b) => b.score - a.score);
  }
}

export default HybridMatcher;