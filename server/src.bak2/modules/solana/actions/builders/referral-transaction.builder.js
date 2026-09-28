'use strict';

const crypto = require('crypto');

const baseBuilder = require('./base-transaction.builder');
const tokenResolver = require('./token-resolver.service');
const referenceKeyService = require('./reference-key.service');

const { InvalidActionError } = require('../actions.errors');
const { ACTIONS_BLINK_TEMPLATE_TYPES } = require('../actions.constants');

/**
 * SignalForge - Referral Transaction Builder
 *
 * Builds the transaction that a wallet signs to enter SignalForge
 * through a referral. If the referral blink does not require payment
 * (amount is zero or absent), the builder produces a minimal memo-only
 * transaction that records the referral intent on-chain.
 */

function resolveReferralAmount(blink, token) {
  const amount = Number(blink.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    return 0;
  }
  if (amount === 0) {
    return 0;
  }
  const decimals = Number.isInteger(blink.amount_decimals) && blink.amount_decimals >= 0
    ? blink.amount_decimals
    : token.decimals;
  return tokenResolver.toBaseUnits(amount, decimals);
}

async function build({ blink, wallet, token, config }) {
  void config;

  if (blink.template_type !== ACTIONS_BLINK_TEMPLATE_TYPES.REFERRAL) {
    throw new InvalidActionError('This builder only handles referral blinks');
  }

  const amountBaseUnits = resolveReferralAmount(blink, token);
  const reference = referenceKeyService.generateReferenceKey();

  const memo = referenceKeyService.buildReferenceMemo({
    blinkId: blink.id,
    templateType: blink.template_type,
    wallet,
    referralCode: blink.referral_code,
  });

  if (amountBaseUnits === 0) {
    const { transaction, serialized } = await baseBuilder.buildAndSerialize({
      blink,
      wallet,
      token: {
        ...token,
        symbol: 'SOL',
      },
      memo,
      reference,
      amountBaseUnits: 0,
    });

    const conversionId = `conv_${crypto.randomBytes(8).toString('hex')}`;

    return {
      transaction: serialized,
      signature: null,
      reference,
      amount: 0,
      amountBaseUnits: 0,
      token: {
        symbol: 'SOL',
        mint: token.mint,
        decimals: 9,
      },
      message: 'Register your referral on SignalForge',
      conversionId,
      versionedTransaction: transaction,
    };
  }

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
    amount: Number(blink.amount),
    amountBaseUnits,
    token: {
      symbol: token.symbol,
      mint: token.mint,
      decimals: token.decimals,
    },
    message: 'Register your referral on SignalForge',
    conversionId,
    versionedTransaction: transaction,
  };
}

module.exports = {
  build,
  resolveReferralAmount,
};