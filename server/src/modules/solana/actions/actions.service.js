'use strict';

const crypto = require('crypto');

const { config } = require('./actions.config');

const {
  ACTIONS_HANDLER_NAMES,
  ACTIONS_BLINK_TEMPLATE_TYPES,
  ACTIONS_BLINK_CONVERSION_STATUSES,
  ACTIONS_BLINK_STATUSES,
  ACTIONS_CHAIN_IDS,
  ACTIONS_DEFAULT_TOKEN,
  ACTIONS_BLINK_DEFAULT_TITLE,
  ACTIONS_BLINK_DEFAULT_DESCRIPTION,
  ACTIONS_BLINK_DEFAULT_ICON_PATH,
  ACTIONS_BLINK_DEFAULT_WEBSITE,
} = require('./actions.constants');

const {
  InvalidActionError,
  InvalidParameterError,
  UnsupportedTokenError,
  ServiceUnavailableError,
  NotFoundError,
} = require('./actions.errors');

const actionsRepository = require('./actions.repository');
const actionsValidator = require('./actions.validator');

const { buildGetServedEvent, buildPostServedEvent } = require('./actions.events');

/**
 * SignalForge - Solana Actions Service
 *
 * The service layer for the Solana Actions and Blinks subsystem. It is
 * intentionally free of Express constructs so that it can be consumed
 * by HTTP controllers, background workers, or the reconciliation job
 * without modification.
 */

function generateId(prefix) {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
}

function resolveBaseUrl() {
  const base = config.publicBaseUrl || 'https://signalforge.ai';
  return base.replace(/\/+$/, '');
}

function resolveIconUrl() {
  const path = config.icon.path || ACTIONS_BLINK_DEFAULT_ICON_PATH;
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${resolveBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}

function resolveWebsite() {
  return config.icon.website || ACTIONS_BLINK_DEFAULT_WEBSITE;
}

function emitEvent(event, payload) {
  const bus = global.__signalforgeEventBus;
  if (bus && typeof bus.publish === 'function') {
    bus.publish(event, payload);
  }
}

function normalizeChainId() {
  const network = String(config.network || 'mainnet-beta').toLowerCase();
  if (network.includes('devnet')) {
    return ACTIONS_CHAIN_IDS.SOLANA_DEVNET;
  }
  if (network.includes('testnet')) {
    return ACTIONS_CHAIN_IDS.SOLANA_TESTNET;
  }
  return ACTIONS_CHAIN_IDS.SOLANA_MAINNET;
}

async function ensureEnabled() {
  if (!config.enabled) {
    throw new ServiceUnavailableError('Solana Actions are currently disabled');
  }
  const enabled = await actionsRepository.isEnabled();
  if (!enabled) {
    throw new ServiceUnavailableError('Solana Actions are currently unavailable');
  }
}

function assertTemplateEnabled(templateType) {
  const flags = config.featureFlags || {};
  if (templateType === ACTIONS_BLINK_TEMPLATE_TYPES.SUBSCRIBE && !flags.enableSubscribeBlinks) {
    throw new InvalidActionError('Subscribe blinks are disabled');
  }
  if (templateType === ACTIONS_BLINK_TEMPLATE_TYPES.UPGRADE && !flags.enableUpgradeBlinks) {
    throw new InvalidActionError('Upgrade blinks are disabled');
  }
  if (templateType === ACTIONS_BLINK_TEMPLATE_TYPES.REFERRAL && !flags.enableReferralBlinks) {
    throw new InvalidActionError('Referral blinks are disabled');
  }
  if (templateType === ACTIONS_BLINK_TEMPLATE_TYPES.TIP && !flags.enableTipBlinks) {
    throw new InvalidActionError('Tip blinks are disabled');
  }
}

function resolveTokenConfig(blink) {
  const symbol = actionsValidator.validateTokenSymbol(
    blink.token_symbol || ACTIONS_DEFAULT_TOKEN,
    config.token.allowedSymbols,
  );

  const mint =
    blink.token_mint && blink.token_mint.trim()
      ? actionsValidator.validateTokenMint(blink.token_mint)
      : actionsValidator.resolveMintForSymbol(symbol, config.network);

  if (!mint) {
    throw new UnsupportedTokenError(`No mint available for token ${symbol}`);
  }

  return {
    symbol,
    mint,
    decimals:
      Number.isInteger(blink.amount_decimals) && blink.amount_decimals >= 0
        ? blink.amount_decimals
        : undefined,
  };
}

function buildMetadataForBlink(blink, options = {}) {
  const iconUrl = blink.icon_url && blink.icon_url.trim() ? blink.icon_url : resolveIconUrl();
  const website = blink.website && blink.website.trim() ? blink.website : resolveWebsite();
  const title = blink.title || ACTIONS_BLINK_DEFAULT_TITLE;
  const description = blink.description || ACTIONS_BLINK_DEFAULT_DESCRIPTION;
  const label = blink.label || 'Continue';

  const baseUrl = resolveBaseUrl();
  const href = `${baseUrl}${config.basePath}/${blink.template_type}`;

  const metadata = {
    icon: iconUrl,
    title: title.slice(0, 80),
    description: description.slice(0, 300),
    label: label.slice(0, 40),
  };

  if (website) {
    metadata.website = website;
  }

  if (options.disabled) {
    metadata.disabled = true;
  }

  if (blink.message) {
    metadata.message = String(blink.message).slice(0, 200);
  }

  return {
    type: 'action',
    title: metadata.title,
    icon: metadata.icon,
    description: metadata.description,
    label: metadata.label,
    website: metadata.website,
    disabled: metadata.disabled || false,
    message: metadata.message,
    links: {
      actions: [
        {
          type: 'transaction',
          label: metadata.label,
          href,
        },
      ],
    },
  };
}

async function getActionMetadata({ templateType, planId, referralCode, providerId, token }) {
  await ensureEnabled();
  assertTemplateEnabled(templateType);

  const metadata = {
    type: 'action',
    icon: resolveIconUrl(),
    title: ACTIONS_BLINK_DEFAULT_TITLE,
    description: ACTIONS_BLINK_DEFAULT_DESCRIPTION,
    label: 'Continue',
    website: resolveWebsite(),
    links: {
      actions: [
        {
          type: 'transaction',
          label: 'Continue',
          href: `${resolveBaseUrl()}${config.basePath}/${templateType}`,
        },
      ],
    },
  };

  if (templateType === ACTIONS_BLINK_TEMPLATE_TYPES.SUBSCRIBE) {
    const blink = await actionsRepository.findActiveBlinkByTemplateAndOwner({
      templateType,
      ownerUserId: null,
      providerId: providerId || null,
    });

    if (blink) {
      const built = buildMetadataForBlink(blink);
      const enriched = {
        ...built,
        title: blink.title,
        description: blink.description,
        label: blink.label,
      };

      emitEvent(
        'solana.actions.get.served',
        buildGetServedEvent({
          actionType: templateType,
          planId: planId || blink.plan_id,
          referralCode: referralCode || blink.referral_code,
          wallet: null,
          requestId: null,
        }).payload,
      );

      return enriched;
    }

    if (planId) {
      metadata.title = 'Subscribe to SignalForge';
      metadata.description = `Subscribe to plan ${planId} using Solana.`;
      metadata.label = 'Subscribe';
      metadata.links.actions[0].label = 'Subscribe';
    }
  }

  if (templateType === ACTIONS_BLINK_TEMPLATE_TYPES.UPGRADE) {
    metadata.title = 'Upgrade your SignalForge plan';
    metadata.description = 'Upgrade your SignalForge subscription using Solana.';
    metadata.label = 'Upgrade';
    metadata.links.actions[0].label = 'Upgrade';
  }

  if (templateType === ACTIONS_BLINK_TEMPLATE_TYPES.REFERRAL) {
    metadata.title = 'Join SignalForge via referral';
    metadata.description = 'Create your SignalForge account through this referral.';
    metadata.label = 'Join';
    metadata.links.actions[0].label = 'Join';
  }

  if (templateType === ACTIONS_BLINK_TEMPLATE_TYPES.TIP) {
    metadata.title = 'Support this provider';
    metadata.description = 'Send a tip to the provider through Solana.';
    metadata.label = 'Tip';
    metadata.links.actions[0].label = 'Tip';
  }

  if (token) {
    metadata.description = `${metadata.description} Token: ${token}.`;
  }

  emitEvent(
    'solana.actions.get.served',
    buildGetServedEvent({
      actionType: templateType,
      planId: planId || null,
      referralCode: referralCode || null,
      wallet: null,
      requestId: null,
    }).payload,
  );

  return metadata;
}

async function createBlink({
  templateType,
  ownerUserId,
  providerId,
  title,
  description,
  label,
  message,
  iconUrl,
  website,
  planId,
  referralCode,
  tokenSymbol,
  tokenMint,
  amount,
  amountDecimals,
  metadata,
}) {
  await ensureEnabled();
  assertTemplateEnabled(templateType);

  const validatedTitle = actionsValidator.validateBlinkTitle(
    title || ACTIONS_BLINK_DEFAULT_TITLE,
  );
  const validatedDescription = actionsValidator.validateBlinkDescription(
    description || ACTIONS_BLINK_DEFAULT_DESCRIPTION,
  );
  const validatedLabel = actionsValidator.validateBlinkLabel(label || 'Continue');
  const validatedMessage = actionsValidator.validateBlinkMessage(message);
  const validatedIcon = iconUrl
    ? actionsValidator.validateBlinkIconUrl(iconUrl)
    : resolveIconUrl();
  const validatedWebsite = website ? actionsValidator.validateBlinkWebsite(website) : resolveWebsite();

  const validatedPlanId = planId ? actionsValidator.validatePlanId(planId) : null;
  const validatedReferralCode = referralCode
    ? actionsValidator.validateReferralCode(referralCode)
    : null;

  const validatedToken = actionsValidator.validateTokenSymbol(
    tokenSymbol || config.token.defaultSymbol || ACTIONS_DEFAULT_TOKEN,
    config.token.allowedSymbols,
  );

  const validatedMint = tokenMint
    ? actionsValidator.validateTokenMint(tokenMint)
    : actionsValidator.resolveMintForSymbol(validatedToken, config.network);

  const validatedAmount =
    templateType === ACTIONS_BLINK_TEMPLATE_TYPES.REFERRAL &&
    (amount === undefined || amount === null || amount === '' || Number(amount) === 0)
      ? 0
      : actionsValidator.validateAmount(amount, {
          min: 0.000001,
          max: 1000000,
          fieldName: 'amount',
        });

  const decimals =
    Number.isInteger(amountDecimals) && amountDecimals >= 0 ? amountDecimals : config.token.decimalsOverride
      ? Number.parseInt(config.token.decimalsOverride, 10)
      : undefined;

  const blink = await actionsRepository.createBlink(null, {
    id: generateId('blink'),
    providerId: providerId || null,
    ownerUserId: ownerUserId || null,
    templateType,
    status: ACTIONS_BLINK_STATUSES.ACTIVE,
    title: validatedTitle,
    description: validatedDescription,
    label: validatedLabel,
    message: validatedMessage,
    iconUrl: validatedIcon,
    website: validatedWebsite,
    planId: validatedPlanId,
    referralCode: validatedReferralCode,
    tokenSymbol: validatedToken,
    tokenMint: validatedMint,
    amount: validatedAmount,
    amountDecimals: decimals,
    chainId: normalizeChainId(),
    network: config.network,
    metadata: metadata || {},
  });

  emitEvent('solana.blink.created', {
    blinkId: blink.id,
    templateType: blink.template_type,
    ownerUserId: blink.owner_user_id,
    providerId: blink.provider_id,
  });

  return blink;
}

async function getBlink(blinkId) {
  await ensureEnabled();
  return actionsRepository.findBlinkByIdOrFail(blinkId);
}

async function listBlinks(filters) {
  await ensureEnabled();
  return actionsRepository.listBlinks(filters);
}

async function pauseBlink(blinkId) {
  await ensureEnabled();
  const blink = await actionsRepository.findBlinkByIdOrFail(blinkId);
  if (blink.status === ACTIONS_BLINK_STATUSES.PAUSED) {
    return blink;
  }
  const updated = await actionsRepository.updateBlinkStatus(blinkId, ACTIONS_BLINK_STATUSES.PAUSED);
  emitEvent('solana.blink.paused', { blinkId });
  return updated;
}

async function resumeBlink(blinkId) {
  await ensureEnabled();
  const blink = await actionsRepository.findBlinkByIdOrFail(blinkId);
  if (blink.status === ACTIONS_BLINK_STATUSES.ACTIVE) {
    return blink;
  }
  const updated = await actionsRepository.updateBlinkStatus(blinkId, ACTIONS_BLINK_STATUSES.ACTIVE);
  emitEvent('solana.blink.resumed', { blinkId });
  return updated;
}

async function archiveBlink(blinkId) {
  await ensureEnabled();
  await actionsRepository.findBlinkByIdOrFail(blinkId);
  const updated = await actionsRepository.updateBlinkStatus(blinkId, ACTIONS_BLINK_STATUSES.ARCHIVED);
  emitEvent('solana.blink.archived', { blinkId });
  return updated;
}

async function recordShare({ blinkId, channel, sharedByUserId, targetUrl, userAgent, ip, metadata }) {
  await ensureEnabled();
  await actionsRepository.findBlinkByIdOrFail(blinkId);
  const share = await actionsRepository.recordBlinkShare({
    id: generateId('share'),
    blinkId,
    channel: actionsValidator.validateShareChannel(channel),
    sharedByUserId: sharedByUserId || null,
    targetUrl: targetUrl || null,
    userAgent: userAgent || null,
    ip: ip || null,
    metadata: metadata || {},
  });

  emitEvent('solana.blink.shared', { blinkId, channel: share.channel, sharedByUserId });
  return share;
}

async function recordClick({ blinkId, channel, wallet, userAgent, ip, requestId, metadata }) {
  await ensureEnabled();
  await actionsRepository.findBlinkByIdOrFail(blinkId);
  const click = await actionsRepository.recordBlinkClick({
    id: generateId('click'),
    blinkId,
    channel: channel || null,
    wallet: wallet || null,
    userAgent: userAgent || null,
    ip: ip || null,
    requestId: requestId || null,
    metadata: metadata || {},
  });
  emitEvent('solana.blink.clicked', { blinkId, channel, wallet });
  return click;
}

async function buildTransactionForBlink({ blink, wallet }) {
  await ensureEnabled();
  if (!blink) {
    throw new NotFoundError('Blink was not found');
  }
  if (blink.status !== ACTIONS_BLINK_STATUSES.ACTIVE) {
    throw new InvalidActionError('Blink is not active');
  }

  const validatedWallet = actionsValidator.validateWalletAddress(wallet, 'account');
  const token = resolveTokenConfig(blink);

  const handlerName = blink.template_type;
  const handler = require('./handlers/handler.registry').getHandler(handlerName);

  if (!handler) {
    throw new InvalidActionError(`No handler registered for ${handlerName}`);
  }

  const result = await handler.build({
    blink,
    wallet: validatedWallet,
    token,
    config,
  });

  return result;
}

async function recordPostSubmission({
  blink,
  wallet,
  signature,
  amount,
  token,
  reference,
  requestId,
  idempotencyKey,
  metadata,
}) {
  await ensureEnabled();
  const existing = await actionsRepository.findConversionByIdempotencyKey(idempotencyKey);
  if (existing) {
    return existing;
  }

  const conversion = await actionsRepository.createConversion(null, {
    id: generateId('conv'),
    blinkId: blink.id,
    wallet,
    tokenSymbol: token.symbol,
    tokenMint: token.mint,
    amount,
    signature,
    reference,
    status: ACTIONS_BLINK_CONVERSION_STATUSES.PENDING,
    subscriptionId: null,
    referralRelationshipId: null,
    providerId: blink.provider_id,
    requestId: requestId || null,
    idempotencyKey: idempotencyKey || null,
    metadata: metadata || {},
  });

  emitEvent('solana.blink.payment.submitted', {
    blinkId: blink.id,
    wallet,
    signature,
    amount,
    token: token.symbol,
    reference,
  });

  return conversion;
}

async function handleActionPost({ templateType, planId, referralCode, providerId, wallet, body, requestId, idempotencyKey }) {
  await ensureEnabled();
  assertTemplateEnabled(templateType);

  const validatedWallet = actionsValidator.validateWalletAddress(wallet, 'account');

  const blink = await actionsRepository.findActiveBlinkByTemplateAndOwner({
    templateType,
    ownerUserId: null,
    providerId: providerId || null,
  });

  const effectiveBlink =
    blink ||
    (await actionsRepository.findActiveBlinkByTemplateAndOwner({
      templateType,
      ownerUserId: null,
      providerId: null,
    }));

  if (!effectiveBlink && templateType !== ACTIONS_BLINK_TEMPLATE_TYPES.SUBSCRIBE) {
    throw new NotFoundError(`No active blink available for ${templateType}`);
  }

  const blinkForUse =
    effectiveBlink ||
    (await actionsRepository.createBlink(null, {
      id: generateId('blink'),
      providerId: providerId || null,
      ownerUserId: null,
      templateType,
      status: ACTIONS_BLINK_STATUSES.ACTIVE,
      title: ACTIONS_BLINK_DEFAULT_TITLE,
      description: ACTIONS_BLINK_DEFAULT_DESCRIPTION,
      label: 'Continue',
      message: '',
      iconUrl: resolveIconUrl(),
      website: resolveWebsite(),
      planId: planId ? actionsValidator.validatePlanId(planId) : null,
      referralCode: referralCode ? actionsValidator.validateReferralCode(referralCode) : null,
      tokenSymbol: config.token.defaultSymbol,
      tokenMint: actionsValidator.resolveMintForSymbol(
        config.token.defaultSymbol,
        config.network,
      ),
      amount: 1,
      amountDecimals: undefined,
      chainId: normalizeChainId(),
      network: config.network,
      metadata: {},
    }));

  const built = await buildTransactionForBlink({
    blink: blinkForUse,
    wallet: validatedWallet,
  });

  const conversion = await recordPostSubmission({
    blink: blinkForUse,
    wallet: validatedWallet,
    signature: built.signature,
    amount: built.amount,
    token: built.token,
    reference: built.reference,
    requestId,
    idempotencyKey,
    metadata: {
      templateType,
      planId: planId || null,
      referralCode: referralCode || null,
      providerId: providerId || null,
    },
  });

  emitEvent(
    'solana.actions.post.served',
    buildPostServedEvent({
      actionType: templateType,
      wallet: validatedWallet,
      signature: built.signature,
      requestId,
      amount: built.amount,
      token: built.token.symbol,
    }).payload,
  );

  return {
    transaction: built.transaction,
    message: built.message || 'Complete the transaction in your wallet.',
    conversionId: conversion.id,
    reference: built.reference,
  };
}

async function getBlinkStats(blinkId) {
  await ensureEnabled();
  const stats = await actionsRepository.aggregateBlinkStats(blinkId);
  if (!stats) {
    throw new NotFoundError(`Blink ${blinkId} was not found`);
  }
  return stats;
}

async function getOwnerStats(ownerUserId) {
  await ensureEnabled();
  if (!ownerUserId) {
    throw new InvalidParameterError('ownerUserId is required');
  }
  return actionsRepository.aggregateOwnerStats(ownerUserId);
}

async function listConversions(filters) {
  await ensureEnabled();
  return actionsRepository.listConversionsByBlink(filters);
}

module.exports = {
  ensureEnabled,
  getActionMetadata,
  createBlink,
  getBlink,
  listBlinks,
  pauseBlink,
  resumeBlink,
  archiveBlink,
  recordShare,
  recordClick,
  handleActionPost,
  buildTransactionForBlink,
  getBlinkStats,
  getOwnerStats,
  listConversions,
  resolveIconUrl,
  resolveWebsite,
  normalizeChainId,
  resolveTokenConfig,
  ACTIONS_HANDLER_NAMES,
};