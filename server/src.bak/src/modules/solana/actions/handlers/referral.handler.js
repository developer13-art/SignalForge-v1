'use strict';

const handlerValidator = require('./handler-validator.service');
const handlerResponse = require('./handler-response.service');
const referralBuilder = require('../builders/referral-transaction.builder');

const { ACTIONS_BLINK_TEMPLATE_TYPES } = require('../actions.constants');
const { InvalidActionError } = require('../actions.errors');

/**
 * SignalForge - Referral Handler
 *
 * Handles POST requests for referral blinks. Referral blinks may
 * require zero payment; in that case the builder produces a
 * memo-only transaction that records the referral intent on-chain.
 */

async function build(context) {
  const { blink, wallet, config } = context;

  const validated = handlerValidator.validateReferralContext({
    blink,
    wallet,
  });

  if (blink.template_type !== ACTIONS_BLINK_TEMPLATE_TYPES.REFERRAL) {
    throw new InvalidActionError('Blink is not a referral blink');
  }

  if (!validated.blink.referral_code) {
    throw new InvalidActionError('Referral blink requires a referral code');
  }

  const result = await referralBuilder.build({
    blink: validated.blink,
    wallet: validated.wallet,
    token: validated.token,
    config,
  });

  return {
    transaction: result.transaction,
    message: result.message,
    reference: result.reference,
    amount: result.amount,
    amountBaseUnits: result.amountBaseUnits,
    token: result.token,
    conversionId: result.conversionId,
    signature: result.signature,
  };
}

async function handle(context) {
  const result = await build(context);
  return handlerResponse.buildFromTransactionResult(result, { includeReference: true });
}

module.exports = {
  build,
  handle,
};