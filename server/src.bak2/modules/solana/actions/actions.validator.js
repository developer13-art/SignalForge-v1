'use strict';

const {
  ACTIONS_BLINK_MAX_TITLE_LENGTH,
  ACTIONS_BLINK_MAX_DESCRIPTION_LENGTH,
  ACTIONS_BLINK_MAX_LABEL_LENGTH,
  ACTIONS_BLINK_MAX_MESSAGE_LENGTH,
  ACTIONS_SUPPORTED_METHODS,
  ACTIONS_SUPPORTED_COMMITMENTS,
  ACTIONS_BLINK_TEMPLATE_TYPES,
  ACTIONS_BLINK_SHARE_CHANNELS,
  ACTIONS_REFERENCE_KEY_MAX_LENGTH,
  ACTIONS_IDEMPOTENCY_KEY_MAX_LENGTH,
  ACTIONS_SIGNATURE_MAX_LENGTH,
  ACTIONS_SUPPORTED_MINTS,
} = require('./actions.constants');

const {
  InvalidParameterError,
  UnsupportedMethodError,
  InvalidWalletError,
  InvalidAmountError,
  UnsupportedTokenError,
  UnsupportedChainError,
} = require('./actions.errors');

const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const SIGNATURE_REGEX = /^[1-9A-HJ-NP-Za-km-z]{64,90}$/;
const URL_REGEX = /^https?:\/\/[^\s]+$/i;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z?$/;
const REFERRAL_CODE_REGEX = /^[A-Z0-9]{4,16}$/;
const PLAN_ID_REGEX = /^[A-Z0-9_-]{3,64}$/i;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isBase58(value) {
  return typeof value === 'string' && BASE58_REGEX.test(value.trim());
}

function isSignature(value) {
  return typeof value === 'string' && SIGNATURE_REGEX.test(value.trim());
}

function isUrl(value) {
  return typeof value === 'string' && URL_REGEX.test(value.trim());
}

function isIsoDate(value) {
  return typeof value === 'string' && ISO_DATE_REGEX.test(value);
}

function validateHttpMethod(method) {
  const normalized = String(method || '').toUpperCase();
  if (!ACTIONS_SUPPORTED_METHODS.includes(normalized)) {
    throw new UnsupportedMethodError(`HTTP method ${normalized} is not supported`, { method: normalized });
  }
  return normalized;
}

function validateWalletAddress(wallet, fieldName = 'wallet') {
  if (!isNonEmptyString(wallet)) {
    throw new InvalidParameterError(`${fieldName} is required`);
  }
  if (!isBase58(wallet)) {
    throw new InvalidWalletError(`${fieldName} must be a valid base58 Solana address`, { [fieldName]: wallet });
  }
  return wallet.trim();
}

function validateTransactionSignature(signature, fieldName = 'signature') {
  if (!isNonEmptyString(signature)) {
    throw new InvalidParameterError(`${fieldName} is required`);
  }
  if (!isSignature(signature)) {
    throw new InvalidParameterError(`${fieldName} must be a valid base58 transaction signature`, {
      [fieldName]: signature,
    });
  }
  return signature.trim();
}

function validateAmount(amount, { min = 0.000001, max = 1000000, fieldName = 'amount' } = {}) {
  const numeric = typeof amount === 'number' ? amount : Number(amount);
  if (!Number.isFinite(numeric)) {
    throw new InvalidAmountError(`${fieldName} must be a finite number`, { [fieldName]: amount });
  }
  if (numeric <= 0) {
    throw new InvalidAmountError(`${fieldName} must be greater than zero`, { [fieldName]: amount });
  }
  if (numeric < min) {
    throw new InvalidAmountError(`${fieldName} is below the minimum allowed`, {
      [fieldName]: amount,
      minimum: min,
    });
  }
  if (numeric > max) {
    throw new InvalidAmountError(`${fieldName} exceeds the maximum allowed`, {
      [fieldName]: amount,
      maximum: max,
    });
  }
  return numeric;
}

function validateTokenSymbol(symbol, allowedSymbols = []) {
  if (!isNonEmptyString(symbol)) {
    throw new UnsupportedTokenError('Token symbol is required');
  }
  const normalized = symbol.trim().toUpperCase();
  if (Array.isArray(allowedSymbols) && allowedSymbols.length > 0) {
    const allowedUpper = allowedSymbols.map((entry) => entry.toUpperCase());
    if (!allowedUpper.includes(normalized)) {
      throw new UnsupportedTokenError(`Token ${normalized} is not supported`, {
        symbol: normalized,
        allowed: allowedUpper,
      });
    }
  }
  return normalized;
}

function validateTokenMint(mint) {
  if (!isNonEmptyString(mint)) {
    throw new UnsupportedTokenError('Token mint is required');
  }
  const trimmed = mint.trim();
  if (!isBase58(trimmed)) {
    throw new UnsupportedTokenError('Token mint must be a valid base58 Solana address', { mint });
  }
  return trimmed;
}

function validateChainId(chainId, allowedChains) {
  if (!isNonEmptyString(chainId)) {
    throw new UnsupportedChainError('Chain identifier is required');
  }
  const trimmed = chainId.trim();
  if (Array.isArray(allowedChains) && allowedChains.length > 0 && !allowedChains.includes(trimmed)) {
    throw new UnsupportedChainError(`Chain ${trimmed} is not supported`, {
      chainId: trimmed,
      allowed: allowedChains,
    });
  }
  return trimmed;
}

function validateCommitment(commitment) {
  if (!isNonEmptyString(commitment)) {
    throw new InvalidParameterError('Commitment is required');
  }
  const normalized = commitment.trim().toLowerCase();
  if (!ACTIONS_SUPPORTED_COMMITMENTS.includes(normalized)) {
    throw new InvalidParameterError(`Commitment ${normalized} is not supported`, {
      commitment: normalized,
      allowed: ACTIONS_SUPPORTED_COMMITMENTS,
    });
  }
  return normalized;
}

function validateBlinkTitle(title) {
  if (!isNonEmptyString(title)) {
    throw new InvalidParameterError('Blink title is required');
  }
  const trimmed = title.trim();
  if (trimmed.length > ACTIONS_BLINK_MAX_TITLE_LENGTH) {
    throw new InvalidParameterError(
      `Blink title must not exceed ${ACTIONS_BLINK_MAX_TITLE_LENGTH} characters`,
      { length: trimmed.length, max: ACTIONS_BLINK_MAX_TITLE_LENGTH },
    );
  }
  return trimmed;
}

function validateBlinkDescription(description) {
  if (!isNonEmptyString(description)) {
    throw new InvalidParameterError('Blink description is required');
  }
  const trimmed = description.trim();
  if (trimmed.length > ACTIONS_BLINK_MAX_DESCRIPTION_LENGTH) {
    throw new InvalidParameterError(
      `Blink description must not exceed ${ACTIONS_BLINK_MAX_DESCRIPTION_LENGTH} characters`,
      { length: trimmed.length, max: ACTIONS_BLINK_MAX_DESCRIPTION_LENGTH },
    );
  }
  return trimmed;
}

function validateBlinkLabel(label) {
  if (!isNonEmptyString(label)) {
    throw new InvalidParameterError('Blink label is required');
  }
  const trimmed = label.trim();
  if (trimmed.length > ACTIONS_BLINK_MAX_LABEL_LENGTH) {
    throw new InvalidParameterError(
      `Blink label must not exceed ${ACTIONS_BLINK_MAX_LABEL_LENGTH} characters`,
      { length: trimmed.length, max: ACTIONS_BLINK_MAX_LABEL_LENGTH },
    );
  }
  return trimmed;
}

function validateBlinkMessage(message) {
  if (message === undefined || message === null) {
    return '';
  }
  if (typeof message !== 'string') {
    throw new InvalidParameterError('Blink message must be a string');
  }
  const trimmed = message.trim();
  if (trimmed.length > ACTIONS_BLINK_MAX_MESSAGE_LENGTH) {
    throw new InvalidParameterError(
      `Blink message must not exceed ${ACTIONS_BLINK_MAX_MESSAGE_LENGTH} characters`,
      { length: trimmed.length, max: ACTIONS_BLINK_MAX_MESSAGE_LENGTH },
    );
  }
  return trimmed;
}

function validateBlinkIconUrl(url) {
  if (!isNonEmptyString(url)) {
    throw new InvalidParameterError('Blink icon URL is required');
  }
  const trimmed = url.trim();
  if (!isUrl(trimmed)) {
    throw new InvalidParameterError('Blink icon URL must be an absolute http or https URL', { url: trimmed });
  }
  return trimmed;
}

function validateBlinkWebsite(url) {
  if (url === undefined || url === null || url === '') {
    return '';
  }
  if (typeof url !== 'string') {
    throw new InvalidParameterError('Blink website must be a string');
  }
  const trimmed = url.trim();
  if (!isUrl(trimmed)) {
    throw new InvalidParameterError('Blink website must be an absolute http or https URL', { url: trimmed });
  }
  return trimmed;
}

function validateTemplateType(type) {
  if (!isNonEmptyString(type)) {
    throw new InvalidParameterError('Blink template type is required');
  }
  const normalized = type.trim().toLowerCase();
  const allowed = Object.values(ACTIONS_BLINK_TEMPLATE_TYPES);
  if (!allowed.includes(normalized)) {
    throw new InvalidParameterError(`Blink template type ${normalized} is not supported`, {
      type: normalized,
      allowed,
    });
  }
  return normalized;
}

function validateShareChannel(channel) {
  if (!isNonEmptyString(channel)) {
    throw new InvalidParameterError('Share channel is required');
  }
  const normalized = channel.trim().toLowerCase();
  const allowed = Object.values(ACTIONS_BLINK_SHARE_CHANNELS);
  if (!allowed.includes(normalized)) {
    throw new InvalidParameterError(`Share channel ${normalized} is not supported`, {
      channel: normalized,
      allowed,
    });
  }
  return normalized;
}

function validateReferralCode(code) {
  if (!isNonEmptyString(code)) {
    throw new InvalidParameterError('Referral code is required');
  }
  const normalized = code.trim().toUpperCase();
  if (!REFERRAL_CODE_REGEX.test(normalized)) {
    throw new InvalidParameterError('Referral code has an invalid format', { code: normalized });
  }
  return normalized;
}

function validatePlanId(planId) {
  if (!isNonEmptyString(planId)) {
    throw new InvalidParameterError('Plan identifier is required');
  }
  const trimmed = planId.trim();
  if (!PLAN_ID_REGEX.test(trimmed)) {
    throw new InvalidParameterError('Plan identifier has an invalid format', { planId: trimmed });
  }
  return trimmed;
}

function validateReferenceKey(reference) {
  if (!isNonEmptyString(reference)) {
    throw new InvalidParameterError('Reference key is required');
  }
  const trimmed = reference.trim();
  if (trimmed.length > ACTIONS_REFERENCE_KEY_MAX_LENGTH) {
    throw new InvalidParameterError(
      `Reference key must not exceed ${ACTIONS_REFERENCE_KEY_MAX_LENGTH} characters`,
      { length: trimmed.length, max: ACTIONS_REFERENCE_KEY_MAX_LENGTH },
    );
  }
  return trimmed;
}

function validateIdempotencyKey(key) {
  if (key === undefined || key === null || key === '') {
    return null;
  }
  if (typeof key !== 'string') {
    throw new InvalidParameterError('Idempotency key must be a string');
  }
  const trimmed = key.trim();
  if (trimmed.length > ACTIONS_IDEMPOTENCY_KEY_MAX_LENGTH) {
    throw new InvalidParameterError(
      `Idempotency key must not exceed ${ACTIONS_IDEMPOTENCY_KEY_MAX_LENGTH} characters`,
      { length: trimmed.length, max: ACTIONS_IDEMPOTENCY_KEY_MAX_LENGTH },
    );
  }
  return trimmed;
}

function validateIsoDate(value, fieldName) {
  if (!isNonEmptyString(value)) {
    throw new InvalidParameterError(`${fieldName} is required`);
  }
  const trimmed = value.trim();
  if (!isIsoDate(trimmed)) {
    throw new InvalidParameterError(`${fieldName} must be an ISO 8601 timestamp`, {
      [fieldName]: trimmed,
    });
  }
  return trimmed;
}

function validateSolanaActionsGetQuery(query = {}) {
  const normalized = {};

  if (query.planId !== undefined) {
    normalized.planId = validatePlanId(query.planId);
  }

  if (query.referralCode !== undefined) {
    normalized.referralCode = validateReferralCode(query.referralCode);
  }

  if (query.providerId !== undefined) {
    normalized.providerId = String(query.providerId).trim();
  }

  if (query.token !== undefined) {
    normalized.token = String(query.token).trim().toUpperCase();
  }

  return normalized;
}

function validateSolanaActionsPostBody(body) {
  if (!isPlainObject(body)) {
    throw new InvalidParameterError('Request body must be a JSON object');
  }

  if (!isNonEmptyString(body.account)) {
    throw new InvalidParameterError('account field is required in the POST body');
  }

  const wallet = validateWalletAddress(body.account, 'account');

  return {
    wallet,
    raw: body,
  };
}

function resolveMintForSymbol(symbol, network = 'mainnet-beta') {
  const normalized = String(symbol || '').toUpperCase();
  const isDevnet = String(network).toLowerCase().includes('devnet');

  const map = {
    USDC: isDevnet ? ACTIONS_SUPPORTED_MINTS.USDC_DEVNET : ACTIONS_SUPPORTED_MINTS.USDC_MAINNET,
    USDT: ACTIONS_SUPPORTED_MINTS.USDT_MAINNET,
    SOL: isDevnet
      ? ACTIONS_SUPPORTED_MINTS.SOL_WRAPPED_DEVNET
      : ACTIONS_SUPPORTED_MINTS.SOL_WRAPPED_MAINNET,
    JUP: ACTIONS_SUPPORTED_MINTS.JUP_MAINNET,
    BONK: ACTIONS_SUPPORTED_MINTS.BONK_MAINNET,
    PYTH: ACTIONS_SUPPORTED_MINTS.PYTH_MAINNET,
    RAY: ACTIONS_SUPPORTED_MINTS.RAY_MAINNET,
    ORCA: ACTIONS_SUPPORTED_MINTS.ORCA_MAINNET,
  };

  const mint = map[normalized];
  if (!mint) {
    throw new UnsupportedTokenError(`No mint is configured for token ${normalized}`, {
      symbol: normalized,
      network,
    });
  }
  return mint;
}

module.exports = {
  isNonEmptyString,
  isPlainObject,
  isBase58,
  isSignature,
  isUrl,
  isIsoDate,
  validateHttpMethod,
  validateWalletAddress,
  validateTransactionSignature,
  validateAmount,
  validateTokenSymbol,
  validateTokenMint,
  validateChainId,
  validateCommitment,
  validateBlinkTitle,
  validateBlinkDescription,
  validateBlinkLabel,
  validateBlinkMessage,
  validateBlinkIconUrl,
  validateBlinkWebsite,
  validateTemplateType,
  validateShareChannel,
  validateReferralCode,
  validatePlanId,
  validateReferenceKey,
  validateIdempotencyKey,
  validateIsoDate,
  validateSolanaActionsGetQuery,
  validateSolanaActionsPostBody,
  resolveMintForSymbol,
};