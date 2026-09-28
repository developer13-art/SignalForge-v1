'use strict';

const handlerValidator = require('./handler-validator.service');
const handlerResponse = require('./handler-response.service');
const subscribeBuilder = require('../builders/subscribe-transaction.builder');

const { ACTIONS_BLINK_TEMPLATE_TYPES } = require('../actions.constants');
const { InvalidActionError } = require('../actions.errors');

/**
 * SignalForge - Subscribe Handler
 *
 * Handles POST requests for subscribe blinks. Validates the blink and
 * wallet, builds the transaction, and returns the Solana Actions
 * response envelope. Business logic is delegated to the builder.
 */

async function build(context) {
  const { blink, wallet, config } = context;

  const validated = handlerValidator.validateSubscriptionContext({
    blink,
    wallet,
  });

  if (blink.template_type !== ACTIONS_BLINK_TEMPLATE_TYPES.SUBSCRIBE) {
    throw new InvalidActionError('Blink is not a subscribe blink');
  }

  const result = await subscribeBuilder.build({
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