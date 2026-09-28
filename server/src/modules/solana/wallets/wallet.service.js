/**
 * Wallet Service
 *
 * Business logic for wallets: listing, fetching, setting primary,
 * labelling, and removing. SIWS orchestration lives in the
 * wallet-connect service and is re-exported here for convenience.
 *
 * @module server/modules/solana/wallets/wallet.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { logger } = require('../../../lib/logger');
const { walletRepository } = require('./wallet.repository');
const { walletConnectService } = require('./wallet-connect.service');

function mapWallet(row) {
  return {
    walletId: row.id,
    userId: row.user_id,
    walletAddress: row.wallet_address,
    isPrimary: row.is_primary,
    label: row.label,
    verifiedAt: row.verified_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
async function listWallets({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const rows = await walletRepository.findByUserId({ userId });

  return rows.map(mapWallet);
}
async function getWallet({ userId, walletId }) {
  if (!userId || !walletId) {
    throw new AppError('userId and walletId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await walletRepository.findById({ walletId });

  if (!record || record.user_id !== userId) {
    throw new AppError('Wallet not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return mapWallet(record);
}
async function getPrimaryWallet({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await walletRepository.findPrimary({ userId });

  return record ? mapWallet(record) : null;
}
async function setPrimary({ userId, walletId }) {
  if (!userId || !walletId) {
    throw new AppError('userId and walletId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await walletRepository.findById({ walletId });

  if (!record || record.user_id !== userId) {
    throw new AppError('Wallet not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const updated = await walletRepository.setPrimary({ walletId, userId });

  if (!updated) {
    throw new AppError('Failed to set primary wallet', ERROR_CODES.INTERNAL_ERROR, 500);
  }

  logger.info({ userId, walletId }, 'Primary wallet updated');

  return { walletId, isPrimary: true };
}
async function updateLabel({ userId, walletId, label }) {
  if (!userId || !walletId) {
    throw new AppError('userId and walletId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await walletRepository.findById({ walletId });

  if (!record || record.user_id !== userId) {
    throw new AppError('Wallet not found', ERROR_CODES.NOT_FOUND, 404);
  }

  await walletRepository.updateLabel({ walletId, userId, label });

  return getWallet({ userId, walletId });
}
async function countWallets({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  const count = await walletRepository.countByUser({ userId });
  return { count };
}
const walletService = {
  listWallets,
  getWallet,
  getPrimaryWallet,
  setPrimary,
  updateLabel,
  countWallets,

  beginConnect: walletConnectService.beginConnect,
  completeConnect: walletConnectService.completeConnect,
  disconnectWallet: walletConnectService.disconnectWallet,
};
module.exports.walletService = walletService;

module.exports.listWallets = listWallets;

module.exports.getWallet = getWallet;

module.exports.getPrimaryWallet = getPrimaryWallet;

module.exports.setPrimary = setPrimary;

module.exports.updateLabel = updateLabel;

module.exports.countWallets = countWallets;
