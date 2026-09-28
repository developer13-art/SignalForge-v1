'use strict';

const {
  ACTIONS_BLINK_TEMPLATE_TYPES,
  ACTIONS_HANDLER_NAMES,
} = require('../actions.constants');

const {
  InvalidActionError,
  InvalidParameterError,
  UnsupportedTokenError,
} = require('../actions.errors');

const actionsValidator = require('../actions.validator');
const tokenResolver = require('../builders/token-resolver.service');

/**
 * SignalForge - Handler Validator Service
 *
 * Centralizes all validation that must occur before a handler builds
 * a transaction. Every handler calls into this service so that
 * validation rules remain identical across subscribe, upgrade,
 * referral, and tip flows.
 */

function resolveHandlerName(templateType) {
  if (!templateType) {
    throw new InvalidParameterError('Template type is required');
  }
  const normalized = String(templateType).trim().toLowerCase();
  const allowed = Object.values(ACTIONS_HANDLER_NAMES);
  if (!allowed.includes(normalized)) {
    throw new InvalidActionError(`Unsupported handler: ${normalized}`, {
      handler: normalized,
      allowed,
    });
  }
  return normalized;
}

function validateBlinkActive(blink) {
  if (!blink) {
    throw new InvalidActionError('Blink was not found');
  }
  if (blink.status !== 'active') {
    throw new InvalidActionError(`Blink is not active (status: ${blink.status})`, {
      blinkId: blink.id,
      status: blink.status,
    });
  }
  return blink;
}

function validateBlinkType(blink, expectedTemplateType) {
  if (blink.template_type !== expectedTemplateType) {
    throw new InvalidActionError(
      `Blink type mismatch: expected ${expectedTemplateType}, got ${blink.template_type}`,
      { expected: expectedTemplateType, actual: blink.template_type },
    );
  }
  return blink;
}

function validateBlinkToken(blink, token) {
  if (!token || !token.mint) {
    throw new UnsupportedTokenError('Blink token could not be resolved');
  }
  if (!blink.token_symbol) {
    throw new UnsupportedTokenError('Blink has no token symbol');
  }
  if (blink.token_mint && blink.token_mint !== token.mint) {
    throw new UnsupportedTokenError('Blink token mint mismatch', {
      expected: blink.token_mint,
      resolved: token.mint,
    });
  }
  return token;
}

function validateBlinkAmount(blink, { allowZero = false } = {}) {
  const amount = Number(blink.amount);
  if (!Number.isFinite(amount)) {
    throw new InvalidActionError('Blink amount is not a valid number');
  }
  if (!allowZero && amount <= 0) {
    throw new InvalidActionError('Blink amount must be greater than zero');
  }
  if (amount < 0) {
    throw new InvalidActionError('Blink amount must not be negative');
  }
  return amount;
}

function validateWalletForBlink(blink, wallet) {
  const validated = actionsValidator.validateWalletAddress(wallet, 'account');
  return validated;
}

function resolveBlinkToken(blink) {
  const symbol = actionsValidator.validateTokenSymbol(blink.token_symbol);
  const mint = blink.token_mint
    ? actionsValidator.validateTokenMint(blink.token_mint)
    : tokenResolver.resolveMintForSymbol(symbol);

  const decimals =
    Number.isInteger(blink.amount_decimals) && blink.amount_decimals >= 0
      ? blink.amount_decimals
      : tokenResolver.resolveStaticDecimals(symbol);

  return {
    symbol,
    mint,
    decimals,
  };
}

function validateReferralCodeForBlink(blink) {
  if (!blink.referral_code) {
    return null;
  }
  return actionsValidator.validateReferralCode(blink.referral_code);
}

function validatePlanForBlink(blink) {
  if (!blink.plan_id) {
    return null;
  }
  return actionsValidator.validatePlanId(blink.plan_id);
}

function validateProviderForBlink(blink, { required = false } = {}) {
  if (!blink.provider_id && required) {
    throw new InvalidActionError('Blink requires a provider identifier');
  }
  return blink.provider_id || null;
}

function validate(context, { expectedTemplateType, allowZeroAmount = false, requireProvider = false }) {
  const { blink, wallet } = context;

  validateBlinkActive(blink);
  validateBlinkType(blink, expectedTemplateType);
  validateWalletForBlink(blink, wallet);
  validateBlinkAmount(blink, { allowZero: allowZeroAmount });
  validateProviderForBlink(blink, { required: requireProvider });
  validatePlanForBlink(blink);
  validateReferralCodeForBlink(blink);

  const token = resolveBlinkToken(blink);
  validateBlinkToken(blink, token);

  return {
    blink,
    wallet,
    token,
    templateType: blink.template_type,
  };
}

function validateSubscriptionContext(context) {
  return validate(context, {
    expectedTemplateType: ACTIONS_BLINK_TEMPLATE_TYPES.SUBSCRIBE,
    allowZeroAmount: false,
    requireProvider: false,
  });
}

function validateUpgradeContext(context) {
  return validate(context, {
    expectedTemplateType: ACTIONS_BLINK_TEMPLATE_TYPES.UPGRADE,
    allowZeroAmount: false,
    requireProvider: false,
  });
}

function validateReferralContext(context) {
  return validate(context, {
    expectedTemplateType: ACTIONS_BLINK_TEMPLATE_TYPES.REFERRAL,
    allowZeroAmount: true,
    requireProvider: false,
  });
}

function validateTipContext(context) {
  return validate(context, {
    expectedTemplateType: ACTIONS_BLINK_TEMPLATE_TYPES.TIP,
    allowZeroAmount: false,
    requireProvider: true,
  });
}

module.exports = {
  resolveHandlerName,
  validateBlinkActive,
  validateBlinkType,
  validateBlinkToken,
  validateBlinkAmount,
  validateWalletForBlink,
  resolveBlinkToken,
  validateReferralCodeForBlink,
  validatePlanForBlink,
  validateProviderForBlink,
  validate,
  validateSubscriptionContext,
  validateUpgradeContext,
  validateReferralContext,
  validateTipContext,
};