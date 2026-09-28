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
function recordUserRegistered() {
  increment('usersRegistered');
}
function recordUserVerified() {
  increment('usersVerified');
}
function recordSignalProcessed() {
  increment('signalsProcessed');
}
function recordSignalExecuted() {
  increment('signalsExecuted');
}
function recordTradeOpened() {
  increment('tradesOpened');
}
function recordTradeClosed() {
  increment('tradesClosed');
}
function recordPaymentReceived({ amount }) {
  increment('paymentsReceived');
  if (typeof amount === 'number') {
    METRICS.paymentsAmount += amount;
  }
}
function recordReferralSettled() {
  increment('referralsSettled');
}
function recordSolanaAnchor() {
  increment('solanaAnchors');
}
function getBusinessMetrics() {
  return { ...METRICS };
}
function resetBusinessMetrics() {
  for (const key of Object.keys(METRICS)) {
    METRICS[key] = 0;
  }
}
const businessMetrics = {
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
module.exports.businessMetrics = businessMetrics;
module.exports.recordUserRegistered = recordUserRegistered;
module.exports.recordUserVerified = recordUserVerified;
module.exports.recordSignalProcessed = recordSignalProcessed;
module.exports.recordSignalExecuted = recordSignalExecuted;
module.exports.recordTradeOpened = recordTradeOpened;
module.exports.recordTradeClosed = recordTradeClosed;
module.exports.recordPaymentReceived = recordPaymentReceived;
module.exports.recordReferralSettled = recordReferralSettled;
module.exports.recordSolanaAnchor = recordSolanaAnchor;
module.exports.getBusinessMetrics = getBusinessMetrics;
module.exports.resetBusinessMetrics = resetBusinessMetrics;
