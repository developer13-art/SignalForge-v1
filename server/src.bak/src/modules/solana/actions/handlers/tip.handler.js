'use strict';

const handlerValidator = require('./handler-validator.service');
const handlerResponse = require('./handler-response.service');
const tipBuilder = require('../builders/tip-transaction.builder');

const { ACTIONS_BLINK_TEMPLATE_TYPES } = require('../actions.constants');
const { InvalidActionError } = require('../actions.errors');

/**
 * SignalForge - Tip Handler
 *
 * Handles POST requests for tip blinks. The tip destination is
 * resolved from the provider record so tips are never routed to an
 * arbitrary address supplied by a client.
 */

async function build(context) {
  const { blink, wallet, config } = context;

  const validated = handlerValidator.validateTipContext({
    blink,
    wallet,
  });

  if (blink.template_type !== ACTIONS_BLINK_TEMPLATE_TYPES.TIP) {
    throw new InvalidActionError('Blink is not a tip blink');
  }

  if (!validated.blink.provider_id) {
    throw new InvalidActionError('Tip blink requires a provider');
  }

  const result = await tipBuilder.build({
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