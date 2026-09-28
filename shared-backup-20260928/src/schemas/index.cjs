'use strict';

/**
 * SignalForge - Shared Schemas Root
 *
 * Aggregates every schema module in the shared package so that
 * consumers import from a single location. Each feature keeps its
 * schemas under its own namespace so that collisions are impossible.
 */

const standardizedSignal = require('./standardized-signal.schema.js');
const signalEvent = require('./signal-event.schema.js');
const tradeObject = require('./trade-object.schema.js');
const riskDecision = require('./risk-decision.schema.js');
const automationRule = require('./automation-rule.schema.js');
const executionRequest = require('./execution-request.schema.js');
const providerDnaRule = require('./provider-dna-rule.schema.js');
const kycApplication = require('./kyc-application.schema.js');
const referralReward = require('./referral-reward.schema.js');
const ledgerEntry = require('./ledger-entry.schema.js');
const notificationPayload = require('./notification-payload.schema.js');
const eventPayload = require('./event-payload.schema.js');
const solanaAttestation = require('./solana-attestation.schema.js');
const solanaProvenance = require('./solana-provenance.schema.js');
const solanaPayment = require('./solana-payment.schema.js');

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