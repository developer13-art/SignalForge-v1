/**
 * Signal Classifications
 *
 * Defines the message classifications produced by the Signal Classification
 * Engine. Only NEW_TRADE and TRADE_MANAGEMENT messages proceed into the
 * trading pipeline; all other classifications are archived but never
 * executed.
 *
 * @module @signalforge/shared/constants/signal-classifications
 */

export const SIGNAL_CLASSIFICATIONS = Object.freeze({
  NEW_TRADE: 'NEW_TRADE',
  TRADE_MANAGEMENT: 'TRADE_MANAGEMENT',
  MARKET_ANALYSIS: 'MARKET_ANALYSIS',
  NEWS: 'NEWS',
  EDUCATION: 'EDUCATION',
  ADVERTISEMENT: 'ADVERTISEMENT',
  CONVERSATION: 'CONVERSATION',
  UNKNOWN: 'UNKNOWN',
});

export const SIGNAL_CLASSIFICATION_VALUES = Object.freeze(
  Object.values(SIGNAL_CLASSIFICATIONS),
);

export const SIGNAL_CLASSIFICATION_LABELS = Object.freeze({
  [SIGNAL_CLASSIFICATIONS.NEW_TRADE]: 'New Trade Signal',
  [SIGNAL_CLASSIFICATIONS.TRADE_MANAGEMENT]: 'Trade Management',
  [SIGNAL_CLASSIFICATIONS.MARKET_ANALYSIS]: 'Market Analysis',
  [SIGNAL_CLASSIFICATIONS.NEWS]: 'News',
  [SIGNAL_CLASSIFICATIONS.EDUCATION]: 'Education',
  [SIGNAL_CLASSIFICATIONS.ADVERTISEMENT]: 'Advertisement',
  [SIGNAL_CLASSIFICATIONS.CONVERSATION]: 'Conversation',
  [SIGNAL_CLASSIFICATIONS.UNKNOWN]: 'Unknown',
});

export const SIGNAL_CLASSIFICATION_DESCRIPTIONS = Object.freeze({
  [SIGNAL_CLASSIFICATIONS.NEW_TRADE]:
    'Message contains a new trade signal that should proceed to parsing.',
  [SIGNAL_CLASSIFICATIONS.TRADE_MANAGEMENT]:
    'Message contains trade management instructions for an existing trade.',
  [SIGNAL_CLASSIFICATIONS.MARKET_ANALYSIS]:
    'Message contains market analysis or commentary. Not executable.',
  [SIGNAL_CLASSIFICATIONS.NEWS]:
    'Message contains market or financial news. Not executable.',
  [SIGNAL_CLASSIFICATIONS.EDUCATION]:
    'Message contains educational content. Not executable.',
  [SIGNAL_CLASSIFICATIONS.ADVERTISEMENT]:
    'Message is promotional or an advertisement. Not executable.',
  [SIGNAL_CLASSIFICATIONS.CONVERSATION]:
    'Message is general conversation or chit-chat. Not executable.',
  [SIGNAL_CLASSIFICATIONS.UNKNOWN]:
    'Message could not be classified with sufficient confidence.',
});

export const EXECUTABLE_CLASSIFICATIONS = Object.freeze([
  SIGNAL_CLASSIFICATIONS.NEW_TRADE,
  SIGNAL_CLASSIFICATIONS.TRADE_MANAGEMENT,
]);

export const NON_EXECUTABLE_CLASSIFICATIONS = Object.freeze([
  SIGNAL_CLASSIFICATIONS.MARKET_ANALYSIS,
  SIGNAL_CLASSIFICATIONS.NEWS,
  SIGNAL_CLASSIFICATIONS.EDUCATION,
  SIGNAL_CLASSIFICATIONS.ADVERTISEMENT,
  SIGNAL_CLASSIFICATIONS.CONVERSATION,
  SIGNAL_CLASSIFICATIONS.UNKNOWN,
]);

export function isExecutableClassification(classification) {
  return EXECUTABLE_CLASSIFICATIONS.includes(classification);
}

export function isNonExecutableClassification(classification) {
  return NON_EXECUTABLE_CLASSIFICATIONS.includes(classification);
}

export function isValidClassification(classification) {
  return SIGNAL_CLASSIFICATION_VALUES.includes(classification);
}