/**
 * Intent Extractor Service
 *
 * @module signalforge/server/modules/ai-signal-intelligence/parser/intent
 */

import { INTENT_TYPES } from '../ai.constants.js';

const INTENT_PATTERNS = Object.freeze([
  { pattern: /\b(close|exit)\s+(half|partial|some|all)\b/i, intent: INTENT_TYPES.PARTIAL_CLOSE },
  { pattern: /\bclose\s+(all|now|position|trade)\b/i, intent: INTENT_TYPES.CLOSE_POSITION },
  { pattern: /\bexit\s+(position|trade|now)\b/i, intent: INTENT_TYPES.CLOSE_POSITION },
  { pattern: /\b(move|shift)\s+(sl|stop\s*loss)\s+to\s+(be|breakeven|break even)\b/i, intent: INTENT_TYPES.BREAK_EVEN },
  { pattern: /\b(move|shift|adjust)\s+(sl|stop\s*loss)\b/i, intent: INTENT_TYPES.MOVE_STOP_LOSS },
  { pattern: /\b(move|shift|adjust)\s+(tp|target|take\s*profit)\b/i, intent: INTENT_TYPES.MOVE_TAKE_PROFIT },
  { pattern: /\btrail(ing)?\s+(sl|stop)\b/i, intent: INTENT_TYPES.TRAIL_STOP },
  { pattern: /\b(cancel|remove)\s+(order|pending)\b/i, intent: INTENT_TYPES.CANCEL_ORDER },
  { pattern: /\bmodify\s+(order|position|trade)\b/i, intent: INTENT_TYPES.MODIFY_POSITION },
  { pattern: /\b(buy|long|open\s+long|market\s+buy|place\s+a\s+buy)\b/i, intent: INTENT_TYPES.OPEN_POSITION },
  { pattern: /\b(sell|short|open\s+short|market\s+sell|place\s+a\s+sell)\b/i, intent: INTENT_TYPES.OPEN_POSITION },
  { pattern: /\b(analysis|outlook|bias|view)\b/i, intent: INTENT_TYPES.ANALYSIS_ONLY },
  { pattern: /\b(news|breaking|fed|fomc|cpi|nfp)\b/i, intent: INTENT_TYPES.INFORMATIONAL },
]);

export class IntentExtractorService {
  extract(text) {
    if (typeof text !== 'string' || text.length === 0) {
      return INTENT_TYPES.UNKNOWN;
    }
    for (const rule of INTENT_PATTERNS) {
      if (rule.pattern.test(text)) {
        return rule.intent;
      }
    }
    return INTENT_TYPES.UNKNOWN;
  }

  isExecutable(intent) {
    return [
      INTENT_TYPES.OPEN_POSITION,
      INTENT_TYPES.CLOSE_POSITION,
      INTENT_TYPES.MODIFY_POSITION,
      INTENT_TYPES.MOVE_STOP_LOSS,
      INTENT_TYPES.MOVE_TAKE_PROFIT,
      INTENT_TYPES.PARTIAL_CLOSE,
      INTENT_TYPES.TRAIL_STOP,
      INTENT_TYPES.BREAK_EVEN,
      INTENT_TYPES.CANCEL_ORDER,
    ].includes(intent);
  }
}

export default IntentExtractorService;