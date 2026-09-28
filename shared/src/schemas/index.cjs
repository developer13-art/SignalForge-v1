'use strict';

/**
 * SignalForge - Shared Schemas Root
 *
 * Aggregates every schema module in the shared package so that
 * consumers import from a single location. Each feature keeps its
 * schemas under its own namespace so that collisions are impossible.
 */

const standardizedSignal = require('./standardized-signal.schema.cjs');
const signalEvent = require('./signal-event.schema.cjs');
const tradeObject = require('./trade-object.schema.cjs');
const riskDecision = require('./risk-decision.schema.cjs');
const automationRule = require('./automation-rule.schema.cjs');
const executionRequest = require('./execution-request.schema.cjs');
const providerDnaRule = require('./provider-dna-rule.schema.cjs');
const kycApplication = require('./kyc-application.schema.cjs');
const referralReward = require('./referral-reward.schema.cjs');
const ledgerEntry = require('./ledger-entry.schema.cjs');
const notificationPayload = require('./notification-payload.schema.cjs');
const eventPayload = require('./event-payload.schema.cjs');
const solanaAttestation = require('./solana-attestation.schema.cjs');
const solanaProvenance = require('./solana-provenance.schema.cjs');
const solanaPayment = require('./solana-payment.schema.cjs');

// Feature A
const actionsSchemas = require('./actions/index.cjs');

// Feature B
const proofOfAlphaSchemas = require('./proof-of-alpha/index.cjs');

// Feature C
const executionRoutingSchemas = require('./execution-routing/index.cjs');

module.exports = {
  ...standardizedSignal,
  ...signalEvent,
  ...tradeObject,
  ...riskDecision,
  ...automationRule,
  ...executionRequest,
  ...providerDnaRule,
  ...kycApplication,
  ...referralReward,
  ...ledgerEntry,
  ...notificationPayload,
  ...eventPayload,
  ...solanaAttestation,
  ...solanaProvenance,
  ...solanaPayment,

  // Feature A
  ...actionsSchemas,

  // Feature B
  ...proofOfAlphaSchemas,

  // Feature C
  ...executionRoutingSchemas,
};