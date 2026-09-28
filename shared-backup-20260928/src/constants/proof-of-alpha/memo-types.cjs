'use strict';

/**
 * SignalForge - Proof of Alpha Memo Types
 */

const PROOF_KINDS = Object.freeze({
  TRADE_CLOSED: 'trade_closed',
  PROVIDER_CERTIFIED: 'provider_certified',
  PROVIDER_MILESTONE: 'provider_milestone',
  PERFORMANCE_PERIOD: 'performance_period',
});

const PROOF_KIND_LABELS = Object.freeze({
  trade_closed: 'Trade Closed',
  provider_certified: 'Provider Certified',
  provider_milestone: 'Provider Milestone',
  performance_period: 'Performance Period',
});

const PROOF_KIND_DESCRIPTIONS = Object.freeze({
  trade_closed: 'A completed trade attributed to a provider.',
  provider_certified: 'A certification event that upgrades the provider quality score.',
  provider_milestone: 'A milestone reached by a provider.',
  performance_period: 'An aggregated performance record for a defined window.',
});

const PROOF_MEMO_FIELDS = Object.freeze({
  VERSION: 'v',
  KIND: 'k',
  PROVIDER_ID: 'p',
  TRADE_ID: 't',
  SYMBOL: 's',
  DIRECTION: 'd',
  PNL_USD: 'u',
  PNL_PERCENT: 'r',
  RESULT: 'o',
  OPENED_AT: 'oa',
  CLOSED_AT: 'ca',
  CONFIDENCE: 'c',
  SIGNAL_ID: 'sig',
  ISSUED_AT: 'i',
  QUALITY_SCORE: 'q',
  MILESTONE_KEY: 'm',
  PERIOD_START: 'ps',
  PERIOD_END: 'pe',
});

const PROOF_RESULT_VALUES = Object.freeze({
  WIN: 'W',
  LOSS: 'L',
  BREAK_EVEN: 'B',
});

const PROOF_RESULT_LABELS = Object.freeze({
  W: 'Win',
  L: 'Loss',
  B: 'Break Even',
});

module.exports = Object.freeze({
  PROOF_KINDS,
  PROOF_KIND_LABELS,
  PROOF_KIND_DESCRIPTIONS,
  PROOF_MEMO_FIELDS,
  PROOF_RESULT_VALUES,
  PROOF_RESULT_LABELS,
});