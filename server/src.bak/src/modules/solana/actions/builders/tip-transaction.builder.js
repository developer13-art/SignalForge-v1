'use strict';

const crypto = require('crypto');

const baseBuilder = require('./base-transaction.builder');
const tokenResolver = require('./token-resolver.service');
const referenceKeyService = require('./reference-key.service');

const { InvalidActionError } = require('../actions.errors');
const { ACTIONS_BLINK_TEMPLATE_TYPES } = require('../actions.constants');

/**
 * SignalForge - Tip Transaction Builder
 *
 * Builds the transaction that a wallet signs to send a tip to a
 * provider. The recipient is resolved from the provider record and
 * verified against the Blink's provider identifier before the
 * transaction is built.
 */

function resolveTipAmount(blink) {
  const amount = Number(blink.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new InvalidActionError('Blink does not define a valid tip amount');
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

async function resolveProviderTreasury(providerId) {
  if (!providerId) {
    throw new InvalidActionError('Provider identifier is required for tip blinks');
  }
  const { query } = require('../../../../database/connection');
  const sql = `
    SELECT id, user_id, solana_wallet_address
    FROM providers
    WHERE id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [providerId]);
  const provider = result.rows[0];
  if (!provider || !provider.solana_wallet_address) {
    throw new InvalidActionError('Provider does not have a Solana wallet configured');
  }
  const { PublicKey } = require('@solana/web3.js');
  try {
    // eslint-disable-next-line no-new
    new PublicKey(provider.solana_wallet_address);
  } catch (error) {
    throw new InvalidActionError('Provider Solana wallet address is invalid', {
      reason: error.message,
    });
  }
  return provider.solana_wallet_address;
}

async function build({ blink, wallet, token, config }) {
  void config;

  if (blink.template_type !== ACTIONS_BLINK_TEMPLATE_TYPES.TIP) {
    throw new InvalidActionError('This builder only handles tip blinks');
  }

  const amount = resolveTipAmount(blink);
  const decimals = resolveDecimals(blink, token);
  const amountBaseUnits = tokenResolver.toBaseUnits(amount, decimals);

  const reference = referenceKeyService.generateReferenceKey();

  const memo = referenceKeyService.buildReferenceMemo({
    blinkId: blink.id,
    templateType: blink.template_type,
    wallet,
    providerId: blink.provider_id,
    amount,
    token: token.symbol,
  });

  const destination = await resolveProviderTreasury(blink.provider_id);
  const { PublicKey } = require('@solana/web3.js');
  const destinationPublicKey = new PublicKey(destination);

  const { transaction, serialized } = await baseBuilder.buildAndSerialize({
    blink,
    wallet,
    token,
    memo,
    reference,
    amountBaseUnits,
    destination: destinationPublicKey,
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
    message: `Send a ${amount} ${token.symbol} tip to the provider`,
    conversionId,
    versionedTransaction: transaction,
  };
}

module.exports = {
  build,
  resolveTipAmount,
  resolveDecimals,
  resolveProviderTreasury,
};