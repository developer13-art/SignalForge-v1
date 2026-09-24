/**
 * Program Client Service
 *
 * Shared configuration for Solana program clients: connection,
 * program IDs, and common utilities for building instructions. Each
 * specific program client (attestation, provenance, payment) extends
 * this service.
 *
 * @module server/modules/solana/programs/program-client.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { connectionService } from '../config/connection.service';
import { programConfigService } from '../config/program-config.service';

async function loadWeb3() {
  try {
    const module = await import('@solana/web3.js');
    if (!module) {
      throw new Error('Module missing');
    }
    return module;
  } catch (err) {
    throw new AppError('Solana web3 library is not available', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }
}

export async function getProgramContext({ programKey }) {
  if (!programKey) {
    throw new AppError('programKey is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const web3 = await loadWeb3();
  const connection = await connectionService.getConnection();
  const programId = programConfigService.getProgramId({ key: programKey });

  return {
    web3,
    connection,
    programId,
    programPublicKey: new web3.PublicKey(programId),
  };
}

export async function getProgramAccountInfo({ programKey, accountAddress }) {
  if (!accountAddress) {
    throw new AppError('accountAddress is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { web3, connection } = await getProgramContext({ programKey });

  const publicKey = new web3.PublicKey(accountAddress);

  const info = await connection.getAccountInfo(publicKey, 'confirmed');

  if (!info) {
    return null;
  }

  return {
    address: accountAddress,
    executable: info.executable,
    lamports: info.lamports,
    owner: info.owner.toString(),
    data: info.data,
    dataLength: info.data.length,
  };
}

export async function confirmTransaction({ txSignature, commitment = 'confirmed' }) {
  if (!txSignature) {
    throw new AppError('txSignature is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const connection = await connectionService.getConnection();

  const latest = await connection.getLatestBlockhash(commitment);

  const result = await connection.confirmTransaction(
    {
      signature: txSignature,
      blockhash: latest.blockhash,
      lastValidBlockHeight: latest.lastValidBlockHeight,
    },
    commitment,
  );

  return { confirmed: !result.value.err, error: result.value.err };
}

export async function getAccountBalance({ accountAddress }) {
  if (!accountAddress) {
    throw new AppError('accountAddress is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { web3, connection } = await getProgramContext({ programKey: 'payment' });

  const publicKey = new web3.PublicKey(accountAddress);

  const lamports = await connection.getBalance(publicKey);

  return { accountAddress, lamports, sol: lamports / 1_000_000_000 };
}

export async function buildInstruction({
  programKey,
  keys,
  data,
}) {
  if (!Array.isArray(keys) || !data) {
    throw new AppError('keys and data are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { web3, programPublicKey } = await getProgramContext({ programKey });

  const accountMetas = keys.map((k) => {
    if (k.pubkey instanceof web3.PublicKey) {
      return k;
    }
    return {
      pubkey: new web3.PublicKey(k.pubkey),
      isSigner: Boolean(k.isSigner),
      isWritable: Boolean(k.isWritable),
    };
  });

  return new web3.TransactionInstruction({
    keys: accountMetas,
    programId: programPublicKey,
    data: Buffer.isBuffer(data) ? data : Buffer.from(data),
  });
}

export const programClientService = {
  getProgramContext,
  getProgramAccountInfo,
  confirmTransaction,
  getAccountBalance,
  buildInstruction,
};