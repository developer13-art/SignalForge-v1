/**
 * Verify Solana Payment Job
 *
 * @module server/jobs/job-types/verify-solana-payment.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';

async function handler(payload) {
  logger.debug('Verifying pending Solana payments');

  try {
    const { paymentConfirmationService } = await import(
      '../../modules/solana/payments/payment-confirmation.service'
    );

    if (paymentConfirmationService && typeof paymentConfirmationService.confirmPendingPayments === 'function') {
      const result = await paymentConfirmationService.confirmPendingPayments({ limit: 100 });
      logger.debug({ processed: result.processed }, 'Pending Solana payments verified');
    }
  } catch (err) {
    logger.warn({ err }, 'Solana payment verification failed');
  }
}

export function registerVerifySolanaPaymentJob() {
  registerJobHandler({
    jobType: 'VERIFY_SOLANA_PAYMENT',
    handler,
  });
}

export default handler;