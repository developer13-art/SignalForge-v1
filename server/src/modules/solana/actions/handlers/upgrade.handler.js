'use strict';

const handlerValidator = require('./handler-validator.service');
const handlerResponse = require('./handler-response.service');
const upgradeBuilder = require('../builders/upgrade-transaction.builder');

const { ACTIONS_BLINK_TEMPLATE_TYPES } = require('../actions.constants');
const { InvalidActionError } = require('../actions.errors');

/**
 * SignalForge - Upgrade Handler
 *
 * Handles POST requests for upgrade blinks. Validates the blink and
 * wallet, builds the transaction, and returns the Solana Actions
 * response envelope.
 */

async function build(context) {
  const { blink, wallet, config } = context;

  const validated = handlerValidator.validateUpgradeContext({
    blink,
    wallet,
  });

  if (blink.template_type !== ACTIONS_BLINK_TEMPLATE_TYPES.UPGRADE) {
    throw new InvalidActionError('Blink is not an upgrade blink');
  }

  const result = await upgradeBuilder.build({
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