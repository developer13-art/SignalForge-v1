/**
 * Business Metrics
 *
 * @module server/lib/metrics/business-metrics
 */

const METRICS = {
  usersRegistered: 0,
  usersVerified: 0,
  signalsProcessed: 0,
  signalsExecuted: 0,
  tradesOpened: 0,
  tradesClosed: 0,
  paymentsReceived: 0,
  paymentsAmount: 0,
  referralsSettled: 0,
  solanaAnchors: 0,
};

function increment(key, amount = 1) {
  if (typeof METRICS[key] === 'number') {
    METRICS[key] += amount;
  }
}

export function recordUserRegistered() {
  increment('usersRegistered');
}

export function recordUserVerified() {
  increment('usersVerified');
}

export function recordSignalProcessed() {
  increment('signalsProcessed');
}

export function recordSignalExecuted() {
  increment('signalsExecuted');
}

export function recordTradeOpened() {
  increment('tradesOpened');
}

export function recordTradeClosed() {
  increment('tradesClosed');
}

export function recordPaymentReceived({ amount }) {
  increment('paymentsReceived');
  if (typeof amount === 'number') {
    METRICS.paymentsAmount += amount;
  }
}

export function recordReferralSettled() {
  increment('referralsSettled');
}

export function recordSolanaAnchor() {
  increment('solanaAnchors');
}

export function getBusinessMetrics() {
  return { ...METRICS };
}

export function resetBusinessMetrics() {
  for (const key of Object.keys(METRICS)) {
    METRICS[key] = 0;
  }
}

export const businessMetrics = {
  recordUserRegistered,
  recordUserVerified,
  recordSignalProcessed,
  recordSignalExecuted,
  recordTradeOpened,
  recordTradeClosed,
  recordPaymentReceived,
  recordReferralSettled,
  recordSolanaAnchor,
  getBusinessMetrics,
  resetBusinessMetrics,
};