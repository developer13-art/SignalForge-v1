/**
 * Wallet Event Helpers
 *
 * @module signalforge/server/modules/wallets/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { WALLET_EVENTS } = require('./wallet.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'wallets',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitWalletCreated(userId, walletId, walletType, meta = {}) {
  return publish(WALLET_EVENTS.WALLET_CREATED, {
    userId,
    walletId,
    walletType,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitWalletUpdated(userId, walletId, changes, meta = {}) {
  return publish(WALLET_EVENTS.WALLET_UPDATED, {
    userId,
    walletId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitWalletFrozen(userId, walletId, reason, meta = {}) {
  return publish(WALLET_EVENTS.WALLET_FROZEN, {
    userId,
    walletId,
    reason,
    frozenAt: new Date().toISOString(),
    ...meta,
  });
}
function emitWalletUnfrozen(userId, walletId, meta = {}) {
  return publish(WALLET_EVENTS.WALLET_UNFROZEN, {
    userId,
    walletId,
    unfrozenAt: new Date().toISOString(),
    ...meta,
  });
}
function emitWalletCredited(userId, walletId, amount, balanceAfter, meta = {}) {
  return publish(WALLET_EVENTS.WALLET_CREDITED, {
    userId,
    walletId,
    amount,
    balanceAfter,
    creditedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitWalletDebited(userId, walletId, amount, balanceAfter, meta = {}) {
  return publish(WALLET_EVENTS.WALLET_DEBITED, {
    userId,
    walletId,
    amount,
    balanceAfter,
    debitedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitLedgerEntryCreated(userId, walletId, entryId, entryType, amount, direction, meta = {}) {
  return publish(WALLET_EVENTS.LEDGER_ENTRY_CREATED, {
    userId,
    walletId,
    entryId,
    entryType,
    amount,
    direction,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitLedgerReversed(userId, walletId, entryId, reversalEntryId, meta = {}) {
  return publish(WALLET_EVENTS.LEDGER_REVERSED, {
    userId,
    walletId,
    entryId,
    reversalEntryId,
    reversedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitLedgerIntegrityCheck(walletId, summary, meta = {}) {
  return publish(WALLET_EVENTS.LEDGER_INTEGRITY_CHECK, {
    walletId,
    summary,
    checkedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitBalanceRecalculated(userId, walletId, previousBalance, newBalance, meta = {}) {
  return publish(WALLET_EVENTS.BALANCE_RECALCULATED, {
    userId,
    walletId,
    previousBalance,
    newBalance,
    recalculatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitInsufficientBalance(userId, walletId, requested, available, meta = {}) {
  return publish(WALLET_EVENTS.INSUFFICIENT_BALANCE, {
    userId,
    walletId,
    requested,
    available,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitWalletCreated = emitWalletCreated;
module.exports.emitWalletUpdated = emitWalletUpdated;
module.exports.emitWalletFrozen = emitWalletFrozen;
module.exports.emitWalletUnfrozen = emitWalletUnfrozen;
module.exports.emitWalletCredited = emitWalletCredited;
module.exports.emitWalletDebited = emitWalletDebited;
module.exports.emitLedgerEntryCreated = emitLedgerEntryCreated;
module.exports.emitLedgerReversed = emitLedgerReversed;
module.exports.emitLedgerIntegrityCheck = emitLedgerIntegrityCheck;
module.exports.emitBalanceRecalculated = emitBalanceRecalculated;
module.exports.emitInsufficientBalance = emitInsufficientBalance;
