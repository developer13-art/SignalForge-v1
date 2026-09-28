/**
 * Webhook Verification Middleware
 *
 * Dispatches signature verification to the appropriate provider
 * helper based on a `provider` option. Rejects unverified webhook
 * requests with HTTP 401.
 *
 * @module signalforge/server/middleware/webhook-verification
 */

import {
  verifyStripeSignature,
  verifyPaystackSignature,
} from '@signalforge/shared/validators/webhook-payload.validator';

import { AuthenticationError } from '../lib/errors/authentication-error.js';
import { getLogger } from '../bootstrap/initLogger.js';
import stripeConfig from '../config/stripe.config.js';
import paystackConfig from '../config/paystack.config.js';
import flutterwaveConfig from '../config/flutterwave.config.js';

export function webhookVerificationMiddleware(options = {}) {
  const provider = options.provider;
  const logger = getLogger('webhook-verification');

  return function verify(req, res, next) {
    try {
      const raw = req.rawBody || (Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '');

      switch (provider) {
        case 'stripe': {
          const signature = req.headers['stripe-signature'];
          const valid = verifyStripeSignature(raw, signature, stripeConfig.webhookSecret);
          if (!valid) {
            return next(
              new AuthenticationError('Stripe signature invalid', {
                code: 'WEBHOOK_SIGNATURE_INVALID',
              }),
            );
          }
          break;
        }

        case 'paystack': {
          const signature = req.headers['x-paystack-signature'];
          const valid = verifyPaystackSignature(raw, signature, paystackConfig.webhookSecret);
          if (!valid) {
            return next(
              new AuthenticationError('Paystack signature invalid', {
                code: 'WEBHOOK_SIGNATURE_INVALID',
              }),
            );
          }
          break;
        }

        case 'flutterwave': {
          const signature = req.headers['verif-hash'];
          if (signature !== flutterwaveConfig.webhookSecret) {
            return next(
              new AuthenticationError('Flutterwave signature invalid', {
                code: 'WEBHOOK_SIGNATURE_INVALID',
              }),
            );
          }
          break;
        }

        case 'generic': {
          const secret = options.secret;
          if (!secret) {
            return next(new Error('Webhook secret not configured'));
          }
          const provided = req.headers['x-webhook-signature'];
          if (typeof provided !== 'string' || provided !== secret) {
            return next(
              new AuthenticationError('Webhook signature invalid', {
                code: 'WEBHOOK_SIGNATURE_INVALID',
              }),
            );
          }
          break;
        }

        default:
          logger.warn({ provider }, 'Unknown webhook provider');
          return next(new Error(`Unknown webhook provider: ${provider}`));
      }

      req.webhook = {
        provider,
        verified: true,
      };

      return next();
    } catch (error) {
      logger.error({ err: error, provider }, 'Webhook verification failed');
      return next(
        new AuthenticationError('Webhook verification failed', {
          code: 'WEBHOOK_VERIFICATION_FAILED',
          cause: error,
        }),
      );
    }
  };
}

export default webhookVerificationMiddleware;