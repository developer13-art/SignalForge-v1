/**
 * Prompt Injection Guard Service
 *
 * Detects attempts to override the system prompt, extract hidden
 * instructions, or manipulate the AI pipeline through user content.
 *
 * @module signalforge/server/modules/ai-signal-intelligence/safety/prompt-injection-guard
 */

import aiConfig from '../../../config/ai.config.js';
import { PromptInjectionError } from '../ai.errors.js';
import { emitPromptInjectionDetected } from '../ai.events.js';

export class PromptInjectionGuardService {
  constructor(patterns = null) {
    this.patterns = patterns || aiConfig.safety.blocklistPatterns;
  }

  analyze(text) {
    if (typeof text !== 'string') {
      return { safe: true };
    }
    const lower = text.toLowerCase();
    const hits = [];
    for (const pattern of this.patterns) {
      if (lower.includes(pattern.toLowerCase())) {
        hits.push(pattern);
      }
    }
    return { safe: hits.length === 0, hits };
  }

  async assertSafe(text, meta = {}) {
    const result = this.analyze(text);
    if (!result.safe) {
      await emitPromptInjectionDetected(meta.messageId || null, result.hits.join(', '), meta);
      throw new PromptInjectionError('Potential prompt injection detected', {
        hits: result.hits,
      });
    }
    return { safe: true };
  }

  sanitize(text) {
    if (typeof text !== 'string') {
      return text;
    }
    let sanitized = text;
    for (const pattern of this.patterns) {
      const regex = new RegExp(pattern, 'gi');
      sanitized = sanitized.replace(regex, '[redacted]');
    }
    return sanitized;
  }
}

export default PromptInjectionGuardService;