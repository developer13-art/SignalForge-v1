/**
 * Safety Filter Service
 *
 * @module signalforge/server/modules/ai-signal-intelligence/safety/safety-filter
 */
const aiConfig = require('../../../config/ai.config.js');
const { SAFETY_FILTER_ACTIONS } = require('../ai.constants.js');
const { SafetyFilterError } = require('../ai.errors.js');
const { emitSafetyFilterTriggered } = require('../ai.events.js');
class SafetyFilterService {
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
module.exports = SafetyFilterService;
module.exports.SafetyFilterService = SafetyFilterService;
