/**
 * Direction Normalizer Service
 *
 * @module signalforge/server/modules/ai-signal-intelligence/normalization/direction
 */

import { normalizeDirection } from '@signalforge/shared/constants/order-directions';

const ADDITIONAL_ALIASES = Object.freeze({
  L: 'BUY',
  S: 'SELL',
  P: 'BUY',
  LONG: 'BUY',
  SHORT: 'SELL',
  BULL: 'BUY',
  BEAR: 'SELL',
  BUY: 'BUY',
  SELL: 'SELL',
});

export class DirectionNormalizerService {
  normalize(input) {
    if (!input || typeof input !== 'string') {
      return null;
    }
    const upper = input.trim().toUpperCase();
    if (ADDITIONAL_ALIASES[upper]) {
      return ADDITIONAL_ALIASES[upper];
    }
    return normalizeDirection(upper);
  }

  extractFromText(text) {
    if (typeof text !== 'string') {
      return null;
    }
    const words = text.toUpperCase().split(/[\s,.!?;:()\[\]{}"']+/);
    for (const word of words) {
      const direction = this.normalize(word);
      if (direction) {
        return direction;
      }
    }
    return null;
  }
}

export default DirectionNormalizerService;