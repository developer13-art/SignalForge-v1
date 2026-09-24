/**
 * Unknown Classifier
 *
 * Fallback classifier for messages that do not match any of the
 * specialized classifiers. Provides a conservative confidence that
 * the message is unknown, ensuring it is not executed automatically.
 *
 * @module server/modules/signal-classification/types/unknown.classifier
 */

import { SIGNAL_CLASSIFICATIONS } from '@signalforge/shared/constants/signal-classifications';

const GIBBERISH_PATTERNS = Object.freeze([
  /^[\W_]+$/,
  /^[\d\W_]+$/,
  /^(.{1,3})\1{4,}$/,
  /^[a-z]{1,2}$/i,
]);

function isGibberish(text) {
  if (typeof text !== 'string') {
    return false;
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return true;
  }
  return GIBBERISH_PATTERNS.some((p) => p.test(trimmed));
}

function isTooShort(text) {
  if (typeof text !== 'string') {
    return true;
  }
  return text.trim().length < 3;
}

function hasKnownContent(text) {
  if (typeof text !== 'string') {
    return false;
  }
  const trimmed = text.trim();
  if (trimmed.length < 10) {
    return false;
  }
  const words = trimmed.split(/\s+/).filter((w) => w.length >= 3);
  return words.length >= 2;
}

export function classify(message) {
  const text = message && typeof message.text === 'string' ? message.text : '';

  const gibberish = isGibberish(text);
  const tooShort = isTooShort(text);
  const known = hasKnownContent(text);

  let confidence = 0.3;
  const reasons = [];

  if (gibberish) {
    confidence = 0.7;
    reasons.push('GIBBERISH');
  }

  if (tooShort) {
    confidence = Math.max(confidence, 0.6);
    reasons.push('TOO_SHORT');
  }

  if (known) {
    confidence = 0.2;
    reasons.push('HAS_CONTENT');
  }

  return {
    classification: SIGNAL_CLASSIFICATIONS.UNKNOWN,
    confidence,
    reason: reasons.join(',') || 'NO_CLASSIFIER_MATCH',
    signals: { gibberish, tooShort, hasKnownContent: known },
  };
}

export function supports() {
  return true;
}

export const UNKNOWN_CLASSIFIER_GIBBERISH_PATTERNS = GIBBERISH_PATTERNS;