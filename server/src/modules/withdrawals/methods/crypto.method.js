/**
 * Crypto Withdrawal Method
 *
 * @module signalforge/server/modules/withdrawals/methods/crypto
 */

import { WithdrawalMethodInterface } from './withdrawal-method.interface.js';
import { WITHDRAWAL_METHOD_TYPES } from '../withdrawal.constants.js';
import { WithdrawalProcessingError } from '../withdrawal.errors.js';

const NETWORKS = Object.freeze({
  SOLANA: { fee: 0.01, min: 1 },
  ETHEREUM: { fee: 5, min: 20 },
  BITCOIN: { fee: 3, min: 30 },
  POLYGON: { fee: 0.1, min: 5 },
});

export class CryptoMethod extends WithdrawalMethodInterface {
  constructor() {
    super('CRYPTO');
  }

  supports(methodType) {
    return methodType === WITHDRAWAL_METHOD_TYPES.CRYPTO;
  }

  async validateAccountDetails(details) {
    const errors = [];

    if (!details) {
      return { valid: false, errors: ['details is required'] };
    }

    if (!details.walletAddress || typeof details.walletAddress !== 'string') {
      errors.push('walletAddress is required');
    } else if (details.walletAddress.length < 26 || details.walletAddress.length > 64) {
      errors.push('walletAddress length is invalid');
    }

    if (!details.network || typeof details.network !== 'string') {
      errors.push('network is required');
    } else if (!NETWORKS[details.network.toUpperCase()]) {
      errors.push(`network must be one of: ${Object.keys(NETWORKS).join(', ')}`);
    }

    if (details.token && typeof details.token !== 'string') {
      errors.push('token must be a string');
    }

    return { valid: errors.length === 0, errors };
  }

  calculateFee(amount, account) {
    const network = account?.details?.network?.toUpperCase() || 'SOLANA';
    const spec = NETWORKS[network];
    return spec ? Number(spec.fee.toFixed(4)) : 0;
  }

  async processPayout(request, account) {
    if (!account || !account.details) {
      throw new WithdrawalProcessingError('Withdrawal account is invalid');
    }

    const network = account.details.network?.toUpperCase();
    const spec = NETWORKS[network];
    if (!spec) {
      throw new WithdrawalProcessingError(`Unsupported network: ${network}`);
    }

    if (Number(request.net_amount || request.amount) < spec.min) {
      throw new WithdrawalProcessingError(
        `Withdrawal amount is below the minimum for ${network}: ${spec.min}`,
      );
    }

    const reference = `cw_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    return {
      processed: true,
      methodType: WITHDRAWAL_METHOD_TYPES.CRYPTO,
      externalReference: reference,
      externalTransactionId: null,
      status: 'PROCESSING',
      raw: {
        walletAddress: account.details.walletAddress,
        network,
        reference,
      },
    };
  }
}

export default CryptoMethod;