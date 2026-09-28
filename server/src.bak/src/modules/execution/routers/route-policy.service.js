'use strict';

const crypto = require('crypto');

const routePolicyRepository = require('./route-policy.repository');
const validator = require('./execution-router.validator');
const instrumentClass = require('./instrument-class.service');

const {
  ROUTE_POLICY_MODES,
  ROUTE_FALLBACK_BEHAVIOR,
  EXECUTION_GATEWAYS,
} = require('./execution-router.constants');

const {
  InvalidPolicyError,
  NoGatewayAvailableError,
} = require('./execution-router.errors');

const {
  config,
  isGatewayEnabled,
} = require('./execution-router.config');

/**
 * SignalForge - Route Policy Service
 *
 * Manages per-user routing policies. The service translates a user
 * intent ("prefer DEX") into an ordered list of gateways to try, so
 * the router does not have to encode business preferences.
 */

function generatePolicyId() {
  return `policy_${crypto.randomBytes(10).toString('hex')}`;
}

function buildDefaultPolicy(userId) {
  return {
    id: generatePolicyId(),
    userId,
    name: 'default',
    mode: config.defaultMode,
    fallbackBehavior: config.fallbackBehavior,
    preferredGateway: null,
    preferredInstrumentClass: null,
    allowedGateways: null,
    blockedGateways: null,
    maxSlippageBps: null,
    priorityFeesMicroLamports: null,
    isDefault: true,
    metadata: {},
  };
}

async function getPolicyForUser(userId) {
  const policy = await routePolicyRepository.findDefaultForUser(userId);
  if (policy) {
    return policy;
  }
  return buildDefaultPolicy(userId);
}

async function savePolicy({ userId, payload }) {
  const validated = validator.validatePolicy(payload);
  const id = payload.id || generatePolicyId();

  return routePolicyRepository.upsertPolicy(null, {
    id,
    userId,
    name: payload.name || 'default',
    mode: validated.mode,
    fallbackBehavior: validated.fallback,
    preferredGateway: validated.preferredGateway,
    preferredInstrumentClass: validated.preferredInstrumentClass,
    allowedGateways: validated.allowedGateways,
    blockedGateways: validated.blockedGateways,
    maxSlippageBps: validated.maxSlippageBps,
    priorityFeesMicroLamports: validated.priorityFeesMicroLamports,
    isDefault: payload.isDefault === true,
    metadata: payload.metadata || {},
  });
}

async function listPolicies(userId) {
  return routePolicyRepository.listForUser(userId);
}

async function deletePolicy({ id, userId }) {
  const policy = await routePolicyRepository.findById(id);
  if (!policy || policy.user_id !== userId) {
    throw new InvalidPolicyError('Policy was not found', { id });
  }
  return routePolicyRepository.deleteById(id);
}

async function setDefaultPolicy({ policyId, userId }) {
  return routePolicyRepository.setDefault({ policyId, userId });
}

function filterEnabledGateways(gateways) {
  return gateways.filter((gateway) => isGatewayEnabled(gateway));
}

function applyAllowedBlocked(gateways, { allowedGateways, blockedGateways }) {
  let result = [...gateways];

  if (Array.isArray(allowedGateways) && allowedGateways.length > 0) {
    result = result.filter((gateway) => allowedGateways.includes(gateway));
  }

  if (Array.isArray(blockedGateways) && blockedGateways.length > 0) {
    result = result.filter((gateway) => !blockedGateways.includes(gateway));
  }

  return result;
}

function resolveGatewayPreferenceOrder({ policy, symbol }) {
  const classification = instrumentClass.classify(symbol);
  const enabledDex = filterEnabledGateways(config.dexPriority);
  const enabledPerp = filterEnabledGateways(config.perpPriority);

  const brokerPreferred = instrumentClass.preferGateway(classification.instrumentClass);

  let order = [];

  switch (policy.mode) {
    case ROUTE_POLICY_MODES.BROKER_ONLY:
      order = [EXECUTION_GATEWAYS.METAAPI];
      break;
    case ROUTE_POLICY_MODES.DEX_ONLY:
      order = enabledDex;
      break;
    case ROUTE_POLICY_MODES.PERP_ONLY:
      order = enabledPerp;
      break;
    case ROUTE_POLICY_MODES.PREFER_BROKER:
      order = [EXECUTION_GATEWAYS.METAAPI, ...enabledDex, ...enabledPerp];
      break;
    case ROUTE_POLICY_MODES.PREFER_DEX:
      order = [...enabledDex, ...enabledPerp, EXECUTION_GATEWAYS.METAAPI];
      break;
    case ROUTE_POLICY_MODES.PREFER_PERP:
      order = [...enabledPerp, ...enabledDex, EXECUTION_GATEWAYS.METAAPI];
      break;
    case ROUTE_POLICY_MODES.MANUAL:
      if (policy.preferredGateway) {
        order = [policy.preferredGateway];
      } else {
        order = [brokerPreferred === 'dex' ? enabledDex[0] : EXECUTION_GATEWAYS.METAAPI];
      }
      break;
    case ROUTE_POLICY_MODES.AUTO:
    default:
      if (brokerPreferred === 'metaapi') {
        order = [EXECUTION_GATEWAYS.METAAPI, ...enabledDex, ...enabledPerp];
      } else if (brokerPreferred === 'perp') {
        order = [...enabledPerp, ...enabledDex, EXECUTION_GATEWAYS.METAAPI];
      } else {
        order = [...enabledDex, ...enabledPerp, EXECUTION_GATEWAYS.METAAPI];
      }
      break;
  }

  order = applyAllowedBlocked(order, policy);

  if (policy.preferredGateway) {
    order = [policy.preferredGateway, ...order.filter((gateway) => gateway !== policy.preferredGateway)];
  }

  if (order.length === 0) {
    throw new NoGatewayAvailableError('No gateway available for the requested policy and symbol', {
      policy: policy.mode,
      symbol,
    });
  }

  return {
    order,
    classification,
  };
}

function mergeSystemDefaults(policy) {
  return {
    ...policy,
    mode: policy.mode || config.defaultMode,
    fallbackBehavior: policy.fallbackBehavior || config.fallbackBehavior,
  };
}

async function resolvePolicyForUser({ userId, overridePolicy }) {
  if (overridePolicy) {
    const merged = mergeSystemDefaults({
      ...overridePolicy,
      userId,
      isDefault: false,
    });
    return merged;
  }
  if (!userId) {
    return mergeSystemDefaults(buildDefaultPolicy(null));
  }
  const stored = await getPolicyForUser(userId);
  return mergeSystemDefaults({
    ...stored,
    mode: stored.mode,
    fallbackBehavior: stored.fallbackBehavior || ROUTE_FALLBACK_BEHAVIOR.RETRY_NEXT,
  });
}

module.exports = {
  generatePolicyId,
  buildDefaultPolicy,
  getPolicyForUser,
  savePolicy,
  listPolicies,
  deletePolicy,
  setDefaultPolicy,
  filterEnabledGateways,
  applyAllowedBlocked,
  resolveGatewayPreferenceOrder,
  mergeSystemDefaults,
  resolvePolicyForUser,
};