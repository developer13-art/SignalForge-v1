/**
 * Advertisement Classifier
 *
 * Determines whether a message is promotional or advertising content.
 * Advertisement messages typically include broker promotions, signal
 * service ads, or affiliate marketing.
 *
 * @module server/modules/signal-classification/types/advertisement.classifier
 */

import { SIGNAL_CLASSIFICATIONS } from '@signalforge/shared/constants/signal-classifications';

const AD_INDICATORS = Object.freeze([
  'promo',
  'promotion',
  'discount',
  'offer',
  'deal',
  'special',
  'limited',
  'subscribe',
  'subscription',
  'join',
  'register',
  'sign up',
  'signup',
  'free trial',
  'bonus',
  'giveaway',
  'affiliate',
  'partner',
  'sponsor',
  'sponsored',
  'broker',
  'exclusive',
  'guaranteed',
  'risk-free',
  'no risk',
  'passive income',
  'make money',
  'earn money',
  'profit daily',
  'promocion',
  'descuento',
  'oferta',
  'suscribete',
  'unete',
  'regalo',
  'ganar dinero',
]);

const AD_PATTERNS = Object.freeze([
  /\buse\s+(my|our)\s+(link|code|referral)\b/i,
  /\bjoin\s+(now|today|us)\b/i,
  /\bsign\s+up\s+(now|today)\b/i,
  /\blimited\s+time\b/i,
  /\bclick\s+(here|the\s+link)\b/i,
  /\b(buy|get)\s+now\b/i,
  /\bdm\s+(me|us)\b/i,
  /\bmessage\s+me\s+(for|to)\b/i,
  /\bcontact\s+(me|us)\s+(for|to)\b/i,
  /\bwhatsapp\s+me\b/i,
  /\btelegram\s+me\b/i,
  /@\w+\s+(for|to)\s+(more|join|info)/i,
  /\b\d+%\s+(off|discount)\b/i,
  /\bguaranteed\s+(profit|returns|results)\b/i,
]);

function countIndicators(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  const lower = text.toLowerCase();
  let count = 0;
  for (const word of AD_INDICATORS) {
    const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(lower)) {
      count++;
    }
  }
  return count;
}

function countPatterns(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  let count = 0;
  for (const pattern of AD_PATTERNS) {
    if (pattern.test(text)) {
      count++;
    }
  }
  return count;
}

function hasUrl(text) {
  if (typeof text !== 'string') {
    return false;
  }
  return /https?:\/\/[^\s]+/i.test(text) || /t\.me\/[^\s]+/i.test(text);
}

function hasPhoneNumber(text) {
  if (typeof text !== 'string') {
    return false;
  }
  return /\+\d{7,15}\b/.test(text);
}

export function classify(message) {
  const text = message && typeof message.text === 'string' ? message.text : '';

  if (text.length === 0) {
    return {
      classification: SIGNAL_CLASSIFICATIONS.UNKNOWN,
      confidence: 0,
      reason: 'EMPTY_TEXT',
      signals: { indicatorCount: 0, patternCount: 0, hasUrl: false, hasPhone: false },
    };
  }

  const indicatorCount = countIndicators(text);
  const patternCount = countPatterns(text);
  const hasLink = hasUrl(text);
  const hasPhone = hasPhoneNumber(text);

  let confidence = 0;
  const reasons = [];

  if (indicatorCount >= 4) {
    confidence += 0.4;
    reasons.push('MANY_AD_INDICATORS');
  } else if (indicatorCount >= 2) {
    confidence += 0.2;
    reasons.push('SOME_AD_INDICATORS');
  }

  if (patternCount >= 2) {
    confidence += 0.4;
    reasons.push('MULTIPLE_AD_PATTERNS');
  } else if (patternCount === 1) {
    confidence += 0.2;
    reasons.push('SINGLE_AD_PATTERN');
  }

  if (hasLink && (indicatorCount >= 2 || patternCount >= 1)) {
    confidence += 0.15;
    reasons.push('HAS_LINK');
  }

  if (hasPhone && indicatorCount >= 2) {
    confidence += 0.1;
    reasons.push('HAS_PHONE');
  }

  confidence = Math.min(1, confidence);

  const isAd = confidence >= 0.5;

  return {
    classification: isAd ? SIGNAL_CLASSIFICATIONS.ADVERTISEMENT : SIGNAL_CLASSIFICATIONS.UNKNOWN,
    confidence: isAd ? confidence : 0,
    reason: reasons.join(','),
    signals: { indicatorCount, patternCount, hasUrl: hasLink, hasPhone },
  };
}

export function supports(message) {
  const result = classify(message);
  return result.classification === SIGNAL_CLASSIFICATIONS.ADVERTISEMENT;
}

export const AD_INDICATORS = AD_INDICATORS;