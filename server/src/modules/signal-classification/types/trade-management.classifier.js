/**
 * Trade Management Classifier
 *
 * Determines whether an incoming message contains trade management
 * instructions for an existing trade (close, move SL, partial close,
 * trailing, etc.).
 *
 * @module server/modules/signal-classification/types/trade-management.classifier
 */

import { SIGNAL_CLASSIFICATIONS } from '@signalforge/shared/constants/signal-classifications';

const MANAGEMENT_PATTERNS = Object.freeze([
  {
    instruction: 'CLOSE_ALL',
    patterns: [
      /\bclose\s+(all|everything|positions|trades|it)\b/i,
      /\bclose\s+the\s+trade\b/i,
      /\bexit\s+all\b/i,
      /\bcall\s+it\b/i,
      /\bcerrar\s+todo\b/i,
      /\bcerrar\s+operacion(es)?\b/i,
    ],
  },
  {
    instruction: 'CLOSE_HALF',
    patterns: [
      /\bclose\s+(half|50%|fifty|one\s+half)\b/i,
      /\bclose\s+some\b/i,
      /\bpartial\s+close\b/i,
      /\btake\s+(partial|half)\b/i,
      /\bsecure\s+(some|half)\b/i,
      /\bcerrar\s+(mitad|parte)\b/i,
    ],
  },
  {
    instruction: 'MOVE_SL_BREAKEVEN',
    patterns: [
      /\bmove\s+(sl|stop|stop\s*loss)\s+to\s+(be|break\s*even|entry|be)\b/i,
      /\bsecure\s+profit\b/i,
      /\bsecure\s+the\s+trade\b/i,
      /\bset\s+(sl|stop)\s+to\s+(be|breakeven)\b/i,
      /\bbreakeven\b/i,
      /\bbreak\s*even\b/i,
      /\bmover\s+sl\s+a\s+(be|breakeven)\b/i,
    ],
  },
  {
    instruction: 'MOVE_SL',
    patterns: [
      /\bmove\s+(sl|stop|stop\s*loss)\s+to\b/i,
      /\bnew\s+(sl|stop)\b/i,
      /\bset\s+(sl|stop)\s+at\b/i,
      /\bupdate\s+stop\b/i,
      /\bmover\s+sl\s+a\b/i,
    ],
  },
  {
    instruction: 'MOVE_TP',
    patterns: [
      /\bmove\s+(tp|take\s*profit|target)\s+to\b/i,
      /\bnew\s+(tp|target)\b/i,
      /\bset\s+(tp|target)\s+at\b/i,
      /\bupdate\s+target\b/i,
    ],
  },
  {
    instruction: 'TRAILING_STOP',
    patterns: [
      /\btrailing\s+stop\b/i,
      /\btrail\s+(sl|stop)\b/i,
      /\bstart\s+trailing\b/i,
      /\bactivar\s+trailing\b/i,
    ],
  },
  {
    instruction: 'CANCEL_PENDING',
    patterns: [
      /\bcancel\s+(the\s+)?order\b/i,
      /\bremove\s+(the\s+)?order\b/i,
      /\bcancelar\s+orden\b/i,
    ],
  },
  {
    instruction: 'CLOSE_PROFIT',
    patterns: [
      /\bsecure\s+profit(s)?\b/i,
      /\btake\s+profit\s+now\b/i,
      /\bbook\s+profit(s)?\b/i,
      /\bcash\s+out\b/i,
    ],
  },
]);

function detectInstruction(text) {
  if (typeof text !== 'string') {
    return null;
  }

  for (const entry of MANAGEMENT_PATTERNS) {
    for (const pattern of entry.patterns) {
      if (pattern.test(text)) {
        return entry.instruction;
      }
    }
  }

  return null;
}

function detectManagementContext(text) {
  if (typeof text !== 'string') {
    return { hasManagementWords: false, isShortMessage: false };
  }

  const lower = text.toLowerCase();

  const managementWords = [
    'close',
    'move',
    'sl',
    'tp',
    'stop',
    'target',
    'trail',
    'secure',
    'breakeven',
    'partial',
    'half',
    'cancel',
    'exit',
    'cerrar',
    'mover',
  ];

  const hasManagementWords = managementWords.some((word) => lower.includes(word));
  const isShortMessage = text.trim().split(/\s+/).length <= 20;

  return { hasManagementWords, isShortMessage };
}

export function classify(message) {
  const text = message && typeof message.text === 'string' ? message.text : '';

  if (text.length === 0) {
    return {
      classification: SIGNAL_CLASSIFICATIONS.UNKNOWN,
      confidence: 0,
      reason: 'EMPTY_TEXT',
      signals: { instruction: null },
    };
  }

  const instruction = detectInstruction(text);
  const context = detectManagementContext(text);

  let confidence = 0;
  const reasons = [];

  if (instruction) {
    confidence += 0.6;
    reasons.push(`INSTRUCTION_${instruction}`);
  }

  if (context.hasManagementWords) {
    confidence += 0.2;
    reasons.push('HAS_MANAGEMENT_WORDS');
  }

  if (context.isShortMessage) {
    confidence += 0.1;
    reasons.push('SHORT_MESSAGE');
  }

  confidence = Math.min(1, confidence);

  const isManagement = instruction !== null && confidence >= 0.6;

  return {
    classification: isManagement ? SIGNAL_CLASSIFICATIONS.TRADE_MANAGEMENT : SIGNAL_CLASSIFICATIONS.UNKNOWN,
    confidence: isManagement ? confidence : 0,
    reason: reasons.join(','),
    signals: { instruction, context },
  };
}

export function supports(message) {
  const result = classify(message);
  return result.classification === SIGNAL_CLASSIFICATIONS.TRADE_MANAGEMENT;
}

export const TRADE_MANAGEMENT_PATTERNS = MANAGEMENT_PATTERNS;