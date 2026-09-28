'use strict';

/**
 * Middleware Barrel Export
 *
 * @module signalforge/server/middleware
 */

module.exports = {
  ...require('./request-id.middleware'),
  ...require('./request-logger.middleware'),
  ...require('./response-time.middleware'),
  ...require('./cors.middleware'),
  ...require('./helmet.middleware'),
  ...require('./compression.middleware'),
  ...require('./rate-limit.middleware'),
  ...require('./body-parser.middleware'),
  ...require('./cookie-parser.middleware'),
  ...require('./session.middleware'),
  ...require('./authentication.middleware'),
  ...require('./optional-authentication.middleware'),
  ...require('./authorization.middleware'),
  ...require('./permission.middleware'),
  ...require('./role.middleware'),
  ...require('./require-active-account.middleware'),
  ...require('./require-email-verified.middleware'),
  ...require('./require-phone-verified.middleware'),
  ...require('./require-kyc-verified.middleware'),
  ...require('./require-feature-permission.middleware'),
  ...require('./require-subscription.middleware'),
  ...require('./require-provider.middleware'),
  ...require('./require-trader.middleware'),
  ...require('./require-admin.middleware'),
  ...require('./require-compliance.middleware'),
  ...require('./validation.middleware'),
  ...require('./idempotency.middleware'),
  ...require('./request-signature.middleware'),
  ...require('./webhook-verification.middleware'),
  ...require('./tenant-resolver.middleware'),
  ...require('./white-label-resolver.middleware'),
  ...require('./error-handler.middleware'),
  ...require('./not-found.middleware'),
};