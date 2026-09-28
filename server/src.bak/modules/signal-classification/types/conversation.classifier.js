/**
 * Conversation Classifier
 *
 * Determines whether a message is general conversation or chit-chat.
 * Conversation messages include greetings, thanks, social exchanges,
 * and short informal messages.
 *
 * @module server/modules/signal-classification/types/conversation.classifier
 */

import { SIGNAL_CLASSIFICATIONS } from '@signalforge/shared/constants/signal-classifications';

const GREETING_WORDS = Object.freeze([
  'hi',
  'hello',
  'hey',
  'good morning',
  'good afternoon',
  'good evening',
  'good night',
  'morning',
  'evening',
  'thanks',
  'thank you',
  'ty',
  'welcome',
  'welcome back',
  'how are you',
  'how are you doing',
  'hola',
  'buenos dias',
  'buenas tardes',
  'buenas noches',
  'gracias',
  'bienvenido',
  'bienvenidos',
]);

const SOCIAL_PATTERNS = Object.freeze([
  /^\s*(hi|hello|hey|hola|buenos|buenas)\b/i,
  /\b(thanks?|thank\s+you|gracias|ty)\b/i,
  /\b(good\s+(morning|afternoon|evening|night))\b/i,
  /\bhow\s+are\s+you\b/i,
  /\b(welcome|bienvenid[oa]s?)\b/i,
  /\b(happy|glad)\s+(to|that)\b/i,
  /\bcongrats|congratulations|felicidades\b/i,
  /\bhaha|hahaha|lol|jaja|jeje\b/i,
]);

const INFORMAL_INDICATORS = Object.freeze([
  'lol',
  'haha',
  'lmao',
  'omg',
  'wtf',
  'bro',
  'man',
  'guys',
  'fam',
  'jaja',
  'jeje',
  'xd',
]);

const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}]/u;

function hasGreeting(text) {
  if (typeof text !== 'string') {
    return false;
  }
  const lower = text.toLowerCase();
  return GREETING_WORDS.some((word) => {
    const pattern = new RegExp(`\\b${word}\\b`, 'i');
    return pattern.test(lower);
  });
}

function countSocialPatterns(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  let count = 0;
  for (const pattern of SOCIAL_PATTERNS) {
    if (pattern.test(text)) {
      count++;
    }
  }
  return count;
}

function countInformalIndicators(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  const lower = text.toLowerCase();
  let count = 0;
  for (const word of INFORMAL_INDICATORS) {
    const pattern = new RegExp(`\\b${word}\\b`, 'i');
    if (pattern.test(lower)) {
      count++;
    }
  }
  return count;
}

function hasEmojis(text) {
  if (typeof text !== 'string') {
    return false;
  }
  return EMOJI_REGEX.test(text);
}

function isShort(text, maxWords = 8) {
  if (typeof text !== 'string') {
    return false;
  }
  return text.trim().split(/\s+/).length <= maxWords;
}

export function classify(message) {
  const text = message && typeof message.text === 'string' ? message.text : '';

  if (text.length === 0) {
    return {
      classification: SIGNAL_CLASSIFICATIONS.CONVERSATION,
      confidence: 0.5,
      reason: 'EMPTY_TEXT',
      signals: { hasGreeting: false, socialPatterns: 0, informalCount: 0, hasEmojis: false },
    };
  }

  const greeting = hasGreeting(text);
  const socialPatterns = countSocialPatterns(text);
  const informalCount = countInformalIndicators(text);
  const emojis = hasEmojis(text);
  const short = isShort(text);

  let confidence = 0;
  const reasons = [];

  if (greeting) {
    confidence += 0.4;
    reasons.push('HAS_GREETING');
  }

  if (socialPatterns >= 1) {
    confidence += 0.3;
    reasons.push('SOCIAL_PATTERNS');
  }

  if (informalCount >= 1) {
    confidence += 0.2;
    reasons.push('INFORMAL_LANGUAGE');
  }

  if (emojis && short) {
    confidence += 0.15;
    reasons.push('EMOJI_SHORT_MESSAGE');
  }

  if (short && !greeting && socialPatterns === 0 && informalCount === 0) {
    confidence += 0.1;
    reasons.push('SHORT_MESSAGE');
  }

  confidence = Math.min(1, confidence);

  const isConversation = confidence >= 0.4 || (short && text.length < 30);

  return {
    classification: isConversation ? SIGNAL_CLASSIFICATIONS.CONVERSATION : SIGNAL_CLASSIFICATIONS.UNKNOWN,
    confidence: isConversation ? confidence : 0,
    reason: reasons.join(','),
    signals: { hasGreeting: greeting, socialPatterns, informalCount, hasEmojis: emojis, short },
  };
}

export function supports(message) {
  const result = classify(message);
  return result.classification === SIGNAL_CLASSIFICATIONS.CONVERSATION;
}

export const CONVERSATION_GREETINGS = GREETING_WORDS;