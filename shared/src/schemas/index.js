'use strict';

/**
 * SignalForge - Shared Schemas Root
 *
 * Aggregates every schema module in the shared package so that
 * consumers import from a single location. Each feature keeps its
 * schemas under its own namespace so that collisions are impossible.
 */

const standardizedSignal = require('./standardized-signal.schema');
const signalEvent = require('./signal-event.schema');
const tradeObject = require('./trade-object.schema');
const riskDecision = require('./risk-decision.schema');
const automationRule = require('./automation-rule.schema');
const executionRequest = require('./execution-request.schema');
const providerDnaRule = require('./provider-dna-rule.schema');
const kycApplication = require('./kyc-application.schema');
const referralReward = require('./referral-reward.schema');
const ledgerEntry = require('./ledger-entry.schema');
const notificationPayload = require('./notification-payload.schema');
const eventPayload = require('./event-payload.schema');
const solanaAttestation = require('./solana-attestation.schema');
const solanaProvenance = require('./solana-provenance.schema');
const solanaPayment = require('./solana-payment.schema');

// Feature A
const actionsSchemas = require('./actions');

// Feature B
const proofOfAlphaSchemas = require('./proof-of-alpha');

// Feature C
const executionRoutingSchemas = require('./execution-routing');

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