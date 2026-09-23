/**
 * Token Counter Service
 *
 * Provides an approximate token count for prompt sizing and cost
 * estimation. Uses a simple heuristic when a tokenizer is not
 * available.
 *
 * @module signalforge/server/modules/ai-signal-intelligence/llm/token-counter
 */

export class TokenCounterService {
  estimateTokens(text) {
    if (!text || typeof text !== 'string') {
      return 0;
    }
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return 0;
    }
    const words = trimmed.split(/\s+/).length;
    const chars = trimmed.length;
    const byWords = Math.ceil(words * 1.3);
    const byChars = Math.ceil(chars / 4);
    return Math.max(byWords, byChars);
  }

  estimateMessages(messages) {
    if (!Array.isArray(messages)) {
      return 0;
    }
    return messages.reduce((total, message) => {
      const contentTokens = this.estimateTokens(message?.content);
      return total + contentTokens + 4;
    }, 0);
  }

  estimateCostUsd(tokens, pricePer1kTokens = 0.01) {
    if (typeof tokens !== 'number' || tokens <= 0) {
      return 0;
    }
    return (tokens / 1000) * pricePer1kTokens;
  }
}

export default TokenCounterService;