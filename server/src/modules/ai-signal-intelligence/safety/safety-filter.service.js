/**
 * Safety Filter Service
 *
 * @module signalforge/server/modules/ai-signal-intelligence/safety/safety-filter
 */

import aiConfig from '../../../config/ai.config.js';
import { SAFETY_FILTER_ACTIONS } from '../ai.constants.js';
import { SafetyFilterError } from '../ai.errors.js';
import { emitSafetyFilterTriggered } from '../ai.events.js';

export class SafetyFilterService {
  constructor(options = {}) {
    this.maxInputLength = options.maxInputLength || aiConfig.safety.maxInputLength;
    this.blockHarmful = options.blockHarmful ?? aiConfig.safety.blockHarmful;
  }

  async filter(text, meta = {}) {
    if (typeof text !== 'string') {
      return { allowed: false, reason: 'INVALID_INPUT' };
    }
    if (text.length > this.maxInputLength) {
      await emitSafetyFilterTriggered(meta.messageId || null, SAFETY_FILTER_ACTIONS.BLOCK, 'INPUT_TOO_LONG', meta);
      throw new SafetyFilterError('Input exceeds the maximum allowed length', {
        length: text.length,
        maxInputLength: this.maxInputLength,
      });
    }

    if (this.blockHarmful) {
      const harmful = this.detectHarmful(text);
      if (harmful.length > 0) {
        await emitSafetyFilterTriggered(meta.messageId || null, SAFETY_FILTER_ACTIONS.BLOCK, harmful.join(', '), meta);
        throw new SafetyFilterError('Content blocked by safety filter', {
          hits: harmful,
        });
      }
    }

    return { allowed: true };
  }

  detectHarmful(text) {
    const hits = [];
    const lower = text.toLowerCase();
    const blocklist = [
      'how to hack',
      'how to attack',
      'money laundering',
      'how to manipulate market',
    ];
    for (const item of blocklist) {
      if (lower.includes(item)) {
        hits.push(item);
      }
    }
    return hits;
  }
}

export default SafetyFilterService;