/**
 * Wallet Service
 *
 * Business logic for wallets: listing, fetching, setting primary,
 * labelling, and removing. SIWS orchestration lives in the
 * wallet-connect service and is re-exported here for convenience.
 *
 * @module server/modules/solana/wallets/wallet.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { walletRepository } from './wallet.repository';
import { walletConnectService } from './wallet-connect.service';

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

export async function listWallets({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const rows = await walletRepository.findByUserId({ userId });

  return rows.map(mapWallet);
}

export async function getWallet({ userId, walletId }) {
  if (!userId || !walletId) {
    throw new AppError('userId and walletId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await walletRepository.findById({ walletId });

  if (!record || record.user_id !== userId) {
    throw new AppError('Wallet not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return mapWallet(record);
}

export async function getPrimaryWallet({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await walletRepository.findPrimary({ userId });

  return record ? mapWallet(record) : null;
}

export async function setPrimary({ userId, walletId }) {
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

export async function updateLabel({ userId, walletId, label }) {
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

export async function countWallets({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  const count = await walletRepository.countByUser({ userId });
  return { count };
}

export const walletService = {
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