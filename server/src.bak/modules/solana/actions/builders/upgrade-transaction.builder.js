'use strict';

const crypto = require('crypto');

const baseBuilder = require('./base-transaction.builder');
const tokenResolver = require('./token-resolver.service');
const referenceKeyService = require('./reference-key.service');

const { InvalidActionError } = require('../actions.errors');
const { ACTIONS_BLINK_TEMPLATE_TYPES } = require('../actions.constants');

/**
 * SignalForge - Upgrade Transaction Builder
 *
 * Builds the transaction that a wallet signs to upgrade an existing
 * subscription. The upgrade amount is derived from the Blink, never
 * from the client payload.
 */

function resolveUpgradeAmount(blink) {
  const amount = Number(blink.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new InvalidActionError('Blink does not define a valid upgrade amount');
  }
  return amount;
}

function resolveDecimals(blink, token) {
  if (Number.isInteger(blink.amount_decimals) && blink.amount_decimals >= 0) {
    return blink.amount_decimals;
  }
  if (Number.isInteger(token.decimals) && token.decimals >= 0) {
    return token.decimals;
  }
  return tokenResolver.resolveStaticDecimals(token.symbol);
}

async function build({ blink, wallet, token, config }) {
  void config;

  if (blink.template_type !== ACTIONS_BLINK_TEMPLATE_TYPES.UPGRADE) {
    throw new InvalidActionError('This builder only handles upgrade blinks');
  }

  const amount = resolveUpgradeAmount(blink);
  const decimals = resolveDecimals(blink, token);
  const amountBaseUnits = tokenResolver.toBaseUnits(amount, decimals);

  const reference = referenceKeyService.generateReferenceKey();

  const memo = referenceKeyService.buildReferenceMemo({
    blinkId: blink.id,
    templateType: blink.template_type,
    wallet,
    planId: blink.plan_id,
    amount,
    token: token.symbol,
  });

  const { transaction, serialized } = await baseBuilder.buildAndSerialize({
    blink,
    wallet,
    token,
    memo,
    reference,
    amountBaseUnits,
  });

  const conversionId = `conv_${crypto.randomBytes(8).toString('hex')}`;

  return {
    transaction: serialized,
    signature: null,
    reference,
    amount,
    amountBaseUnits,
    token: {
      symbol: token.symbol,
      mint: token.mint,
      decimals,
    },
    message: `Upgrade to ${blink.title} for ${amount} ${token.symbol}`,
    conversionId,
    versionedTransaction: transaction,
  };
}

module.exports = {
  build,
  resolveUpgradeAmount,
  resolveDecimals,
};