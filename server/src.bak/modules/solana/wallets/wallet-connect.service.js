/**
 * Wallet Connect Service
 *
 * Orchestrates the wallet-link flow: SIWS nonce, message, signature
 * verification, and persistence of the verified wallet against the
 * user's SignalForge account.
 *
 * @module server/modules/solana/wallets/wallet-connect.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { walletRepository } from './wallet.repository';
import { siwsService } from './siws.service';
import { emitWalletConnected } from '../solana.events';

export async function beginConnect({ walletAddress }) {
  if (!walletAddress) {
    throw new AppError('walletAddress is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const result = await siwsService.createNonceAndMessage({ walletAddress });

  logger.debug({ walletAddress }, 'SIWS connect initiated');

  return result;
}

export async function completeConnect({
  userId,
  walletAddress,
  message,
  signatureBase58,
  isPrimary = false,
  label,
}) {
  if (!userId || !walletAddress || !message || !signatureBase58) {
    throw new AppError(
      'userId, walletAddress, message, and signatureBase58 are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const verification = await siwsService.verifySiwsSignature({
    walletAddress,
    message,
    signatureBase58,
  });

  if (!verification.valid) {
    throw new AppError(
      `Wallet ownership verification failed: ${verification.reason}`,
      ERROR_CODES.SOLANA_WALLET_VERIFICATION_FAILED,
      400,
    );
  }

  const existing = await walletRepository.findByAddress({ walletAddress });

  if (existing && existing.user_id !== userId) {
    throw new AppError(
      'This wallet is already linked to another account',
      ERROR_CODES.CONFLICT,
      409,
    );
  }

  const record = await walletRepository.insertWallet({
    userId,
    walletAddress,
    isPrimary,
    label,
    verifiedAt: new Date().toISOString(),
    signatureProof: signatureBase58,
  });

  await emitWalletConnected({
    userId,
    walletAddress,
    isPrimary,
  }).catch((err) => logger.warn({ err }, 'Failed to emit wallet connected event'));

  logger.info({ userId, walletAddress, walletId: record.id }, 'Wallet connected');

  return {
    walletId: record.id,
    userId: record.user_id,
    walletAddress: record.wallet_address,
    isPrimary: record.is_primary,
    label: record.label,
    verifiedAt: record.verified_at,
    createdAt: record.created_at,
  };
}

export async function disconnectWallet({ userId, walletId, reason }) {
  if (!userId || !walletId) {
    throw new AppError('userId and walletId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await walletRepository.findById({ walletId });

  if (!record || record.user_id !== userId) {
    throw new AppError('Wallet not found', ERROR_CODES.NOT_FOUND, 404);
  }

  await walletRepository.deleteWallet({ walletId, userId });

  const { emitWalletDisconnected } = await import('../solana.events');
  await emitWalletDisconnected({
    userId,
    walletAddress: record.wallet_address,
    reason: reason || null,
  }).catch((err) => logger.warn({ err }, 'Failed to emit wallet disconnected event'));

  logger.info({ userId, walletId, walletAddress: record.wallet_address }, 'Wallet disconnected');

  return { disconnected: true };
}

export const walletConnectService = {
  beginConnect,
  completeConnect,
  disconnectWallet,
};