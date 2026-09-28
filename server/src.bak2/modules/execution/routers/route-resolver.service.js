'use strict';

const crypto = require('crypto');

const instrumentClass = require('./instrument-class.service');
const instrumentClassRepository = require('./instrument-class.repository');
const routePolicyService = require('./route-policy.service');
const validator = require('./execution-router.validator');

const {
  EXECUTION_GATEWAYS,
  GATEWAY_METADATA,
  ROUTE_STATUS,
  ROUTE_REASONS,
} = require('./execution-router.constants');

const {
  config,
  isGatewayEnabled,
} = require('./execution-router.config');

const {
  NoGatewayAvailableError,
  UnsupportedSymbolError,
  UnsupportedOrderTypeError,
  UnsupportedAccountError,
  KycRequiredError,
} = require('./execution-router.errors');

/**
 * SignalForge - Route Resolver Service
 *
 * Given a symbol, order type, direction, and user policy, the resolver
 * determines which gateway should execute the trade. The resolver is
 * a pure decision function: it does not invoke any gateway, only
 * returns the resolution so that the caller can hand off execution.
 */

function generateRouteId() {
  return `route_${crypto.randomBytes(10).toString('hex')}`;
}

function resolveAccountType(account) {
  if (!account) {
    return null;
  }
  return account.account_type || account.accountType || null;
}

function isAccountCompatibleWithGateway({ account, gateway, classification }) {
  if (!account) {
    return true;
  }

  const accountType = resolveAccountType(account);

  const gatewayMeta = GATEWAY_METADATA[gateway];
  if (!gatewayMeta) {
    return false;
  }

  if (gatewayMeta.type === 'broker') {
    return accountType === 'broker' || accountType === 'mt4' || accountType === 'mt5' || accountType === 'live' || accountType === 'demo';
  }

  if (gatewayMeta.type === 'dex' || gatewayMeta.type === 'perp') {
    if (accountType !== 'wallet' && accountType !== 'solana_wallet') {
      return false;
    }
    if (classification.isPerp && !gatewayMeta.supportsPerps) {
      return false;
    }
    if (!classification.isPerp && !gatewayMeta.supportsSpot && !gatewayMeta.supportsPerps) {
      return false;
    }
    return true;
  }

  return true;
}

function isOrderTypeSupported({ gateway, orderType }) {
  const meta = GATEWAY_METADATA[gateway];
  if (!meta) {
    return false;
  }
  if (orderType === 'market') {
    return meta.supportsMarketOrders;
  }
  if (orderType === 'limit') {
    return meta.supportsLimitOrders;
  }
  if (orderType === 'stop' || orderType === 'stop_limit') {
    return meta.supportsLimitOrders;
  }
  if (orderType === 'trailing_stop') {
    return meta.supportsTrailingStop;
  }
  return meta.supportsMarketOrders;
}

async function isSymbolSupportedByGateway({ symbol, gateway, classification }) {
  try {
    const instrument = await instrumentClassRepository.findInstrument({
      symbol,
      gateway,
    });

    if (instrument) {
      return true;
    }
  } catch (_error) {
    // Fall through to metadata-based checks
  }

  const meta = GATEWAY_METADATA[gateway];
  if (!meta) {
    return false;
  }

  if (meta.type === 'broker') {
    return (
      instrumentClass.isTraditional(classification.instrumentClass) ||
      classification.instrumentClass === instrumentClass.INSTRUMENT_CLASSES.UNKNOWN
    );
  }

  if (meta.type === 'dex') {
    return (
      classification.isCrypto &&
      !classification.isPerp &&
      classification.instrumentClass !== instrumentClass.INSTRUMENT_CLASSES.CRYPTO_LP
    );
  }

  if (meta.type === 'perp') {
    return classification.isPerp || classification.instrumentClass === instrumentClass.INSTRUMENT_CLASSES.CRYPTO_PERP;
  }

  return false;
}

function requireKycCheckForGateway({ gateway, context }) {
  const meta = GATEWAY_METADATA[gateway];
  if (!meta) {
    return false;
  }
  if (meta.type === 'dex') {
    return config.policy.requireKycForDex;
  }
  if (meta.type === 'perp') {
    return config.policy.requireKycForPerp;
  }
  return false;
}

function assertKycIfRequired({ gateway, context }) {
  if (!config.policy.requireKycForDex && !config.policy.requireKycForPerp) {
    return;
  }
  const requiresKyc = requireKycCheckForGateway({ gateway, context });
  if (!requiresKyc) {
    return;
  }
  if (!context.kycVerified) {
    throw new KycRequiredError('KYC verification is required to use this gateway', {
      gateway,
    });
  }
}

async function resolveSingleGateway({ symbol, orderType, gateway, classification, context }) {
  const meta = GATEWAY_METADATA[gateway];
  if (!meta) {
    return { supported: false, reason: ROUTE_REASONS.UNSUPPORTED_SYMBOL };
  }

  if (!isGatewayEnabled(gateway)) {
    return { supported: false, reason: ROUTE_REASONS.GATEWAY_UNAVAILABLE, gateway };
  }

  if (!isOrderTypeSupported({ gateway, orderType })) {
    return { supported: false, reason: ROUTE_REASONS.UNSUPPORTED_ORDER_TYPE, gateway };
  }

  const symbolSupported = await isSymbolSupportedByGateway({
    symbol,
    gateway,
    classification,
  });

  if (!symbolSupported) {
    return { supported: false, reason: ROUTE_REASONS.UNSUPPORTED_SYMBOL, gateway };
  }

  if (!isAccountCompatibleWithGateway({ account: context.account, gateway, classification })) {
    return { supported: false, reason: ROUTE_REASONS.UNSUPPORTED_ACCOUNT, gateway };
  }

  assertKycIfRequired({ gateway, context });

  return { supported: true, gateway };
}

async function resolve({ payload, context = {} }) {
  const validated = validator.validateRouteRequest(payload);
  const classification = instrumentClass.classify(validated.symbol);

  if (classification.instrumentClass === instrumentClass.INSTRUMENT_CLASSES.UNKNOWN) {
    // Unknown symbols are allowed to try broker; DEX is not attempted.
    classification.isCrypto = false;
    classification.isPerp = false;
  }

  const policy = await routePolicyService.resolvePolicyForUser({
    userId: validated.userId,
    overridePolicy: context.overridePolicy,
  });

  const { order } = routePolicyService.resolveGatewayPreferenceOrder({
    policy,
    symbol: validated.symbol,
  });

  const attempts = [];

  for (let index = 0; index < order.length; index += 1) {
    const gateway = order[index];

    const result = await resolveSingleGateway({
      symbol: validated.symbol,
      orderType: validated.orderType,
      gateway,
      classification,
      context: {
        account: context.account,
        kycVerified: context.kycVerified === true,
      },
    });

    attempts.push({
      gateway,
      supported: result.supported,
      reason: result.reason || null,
    });

    if (result.supported) {
      const status = index === 0 ? ROUTE_STATUS.RESOLVED : ROUTE_STATUS.FALLBACK;
      const reason = index === 0 ? ROUTE_REASONS.SYSTEM_DEFAULT : ROUTE_REASONS.GATEWAY_UNAVAILABLE;

      return {
        routeId: generateRouteId(),
        symbol: validated.symbol,
        orderType: validated.orderType,
        direction: validated.direction,
        instrumentClass: classification.instrumentClass,
        base: classification.base,
        quote: classification.quote,
        isPerp: classification.isPerp,
        isCrypto: classification.isCrypto,
        gateway,
        status,
        reason,
        policyMode: policy.mode,
        fallbackBehavior: policy.fallbackBehavior,
        attempts,
        allowedGateways: order,
      };
    }
  }

  const rejectionReasons = attempts.map((attempt) => attempt.reason).filter(Boolean);

  if (rejectionReasons.length === 0) {
    throw new NoGatewayAvailableError('No gateway is available for the requested symbol', {
      symbol: validated.symbol,
    });
  }

  throw new NoGatewayAvailableError('No gateway supports the requested symbol and order type', {
    symbol: validated.symbol,
    orderType: validated.orderType,
    attempts,
  });
}

async function simulate({ payload, context = {} }) {
  const started = Date.now();
  const resolution = await resolve({ payload, context });
  const elapsed = Date.now() - started;
  return {
    ...resolution,
    simulated: true,
    latencyMs: elapsed,
  };
}

async function resolveWithFallbackChain({ payload, context = {} }) {
  const resolution = await resolve({ payload, context });

  const chain = [];
  const allowed = Array.isArray(resolution.allowedGateways) ? resolution.allowedGateways : [];

  let started = false;
  for (const gateway of allowed) {
    if (gateway === resolution.gateway) {
      started = true;
    }
    if (started) {
      chain.push(gateway);
    }
  }

  return {
    ...resolution,
    chain,
  };
}

function summarizeResolution(resolution) {
  if (!resolution) {
    return null;
  }
  return {
    routeId: resolution.routeId,
    symbol: resolution.symbol,
    gateway: resolution.gateway,
    instrumentClass: resolution.instrumentClass,
    status: resolution.status,
    reason: resolution.reason,
    policyMode: resolution.policyMode,
    attempts: resolution.attempts,
  };
}

module.exports = {
  generateRouteId,
  resolveAccountType,
  isAccountCompatibleWithGateway,
  isOrderTypeSupported,
  isSymbolSupportedByGateway,
  requireKycCheckForGateway,
  assertKycIfRequired,
  resolveSingleGateway,
  resolve,
  simulate,
  resolveWithFallbackChain,
  summarizeResolution,
};