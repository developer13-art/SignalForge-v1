/**
 * Rule Extractor Service
 *
 * Extracts candidate DNA rules from a set of historical messages.
 * Uses deterministic pattern extraction on successfully parsed
 * messages so that learned rules remain explainable.
 *
 * @module signalforge/server/modules/provider-dna/learning/rule-extractor
 */

import { DNA_RULE_TYPES } from '../dna.constants.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

export class RuleExtractorService {
  constructor() {
    this.logger = getLogger('dna-rule-extractor');
  }

  extractSymbolMappings(messages, parsedSignals) {
    const mappings = {};
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const parsed = parsedSignals[i];
      if (!parsed || !parsed.symbol) {
        continue;
      }
      const text = message.message_text || '';
      const tokens = text.toUpperCase().split(/[\s,.;:!?()\[\]{}"']+/);
      for (const token of tokens) {
        if (token.length >= 3 && token.length <= 12 && /^[A-Z]+$/.test(token)) {
          if (token !== parsed.symbol) {
            mappings[token] = parsed.symbol;
          }
        }
      }
    }
    return mappings;
  }

  extractAbbreviations(messages, parsedSignals) {
    const abbreviations = {};
    const candidates = ['secure profit', 'secure profits', 'close some', 'close half', 'lock profit', 'book profit'];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const parsed = parsedSignals[i];
      if (!parsed || !parsed.intent) {
        continue;
      }
      const text = (message.message_text || '').toLowerCase();
      for (const candidate of candidates) {
        if (text.includes(candidate)) {
          abbreviations[candidate] = parsed.intent;
        }
      }
    }
    return abbreviations;
  }

  extractManagementPatterns(messages, parsedSignals) {
    const patterns = [];
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const parsed = parsedSignals[i];
      if (!parsed || !parsed.intent) {
        continue;
      }
      const intent = parsed.intent;
      if (!['MOVE_STOP_LOSS', 'MOVE_TAKE_PROFIT', 'BREAK_EVEN', 'TRAIL_STOP', 'PARTIAL_CLOSE', 'CLOSE_POSITION'].includes(intent)) {
        continue;
      }
      const text = (message.message_text || '').trim();
      if (text.length >= 3 && text.length <= 100) {
        patterns.push({
          pattern: text,
          intent,
          sourceMessageId: message.id,
        });
      }
    }
    return this.dedupePatterns(patterns);
  }

  dedupePatterns(patterns) {
    const seen = new Set();
    const result = [];
    for (const pattern of patterns) {
      const key = `${pattern.pattern.toLowerCase()}|${pattern.intent}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      result.push(pattern);
    }
    return result;
  }

  extractRiskStyle(parsedSignals) {
    const riskValues = parsedSignals
      .filter((p) => p && typeof p.riskPercent === 'number')
      .map((p) => p.riskPercent);
    if (riskValues.length === 0) {
      return null;
    }
    const sum = riskValues.reduce((a, b) => a + b, 0);
    const average = sum / riskValues.length;
    const sorted = [...riskValues].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    return {
      average,
      median,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      samples: riskValues.length,
    };
  }

  extractTradeManagementStyle(parsedSignals) {
    const intents = {};
    for (const parsed of parsedSignals) {
      if (!parsed || !parsed.intent) {
        continue;
      }
      intents[parsed.intent] = (intents[parsed.intent] || 0) + 1;
    }
    const total = Object.values(intents).reduce((a, b) => a + b, 0);
    const distribution = {};
    for (const [intent, count] of Object.entries(intents)) {
      distribution[intent] = total > 0 ? count / total : 0;
    }
    return { distribution, samples: total };
  }

  extractLanguageHints(messages) {
    const counts = {};
    for (const message of messages) {
      const lang = message.language || 'unknown';
      counts[lang] = (counts[lang] || 0) + 1;
    }
    const total = messages.length;
    const result = {};
    for (const [lang, count] of Object.entries(counts)) {
      result[lang] = total > 0 ? count / total : 0;
    }
    return result;
  }

  extract(messages, parsedSignals) {
    return {
      symbolMappings: this.extractSymbolMappings(messages, parsedSignals),
      abbreviationMappings: this.extractAbbreviations(messages, parsedSignals),
      managementPatterns: this.extractManagementPatterns(messages, parsedSignals),
      riskStyle: this.extractRiskStyle(parsedSignals),
      tradeManagementStyle: this.extractTradeManagementStyle(parsedSignals),
      languageHints: this.extractLanguageHints(messages),
    };
  }
}

export default RuleExtractorService;