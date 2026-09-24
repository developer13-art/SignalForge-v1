/**
 * Verification Helper
 *
 * Client-side helpers for verifying on-chain data returned by the
 * server. These checks are advisory — the server is the source of
 * truth — but they let the UI catch stale or mismatched data.
 *
 * @module client/src/lib/solana/verification-helper
 */

import { PublicKey } from '@solana/web3.js';
import { solanaConnection } from './connection.js';

export async function fetchAccountData(address) {
  if (!address) {
    return null;
  }
  try {
    const connection = solanaConnection.getConnection();
    const publicKey = new PublicKey(address);
    const info = await connection.getAccountInfo(publicKey, 'confirmed');
    if (!info) {
      return null;
    }
    return {
      address,
      owner: info.owner.toString(),
      lamports: info.lamports,
      dataLength: info.data.length,
    };
  } catch (err) {
    return null;
  }
}

export async function verifyTransactionExists(signature) {
  if (!signature) {
    return false;
  }
  try {
    const connection = solanaConnection.getConnection();
    const tx = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });
    return Boolean(tx);
  } catch (err) {
    return false;
  }
}

export async function verifyAccountExists(address) {
  const data = await fetchAccountData(address);
  return data !== null;
}

export const verificationHelper = {
  fetchAccountData,
  verifyTransactionExists,
  verifyAccountExists,
};

export default verificationHelper;