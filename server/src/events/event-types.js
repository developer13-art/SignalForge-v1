'use strict';

/**
 * SignalForge - Event Type Registry
 *
 * Aggregates every event name emitted across the platform. Consumers
 * subscribe to these names; new features (Solana Actions, Proof of
 * Alpha, hybrid execution) add their events to the same registry so
 * that a single subscription point exists for the whole platform.
 */

const ACTIONS_EVENTS = require('../modules/solana/actions/actions.events');
const PROOF_EVENTS = require('../modules/solana/proof-of-alpha/proof.events');
const ROUTER_EVENTS = require('../modules/execution/routers/execution-router.events');

const CORE_EVENTS = Object.freeze({
  // Existing platform events.
  SIGNAL_RECEIVED: 'signal.received',
  SIGNAL_CLASSIFIED: 'signal.classified',
  SIGNAL_PARSED: 'signal.parsed',
  SIGNAL_VALIDATED: 'signal.validated',
  SIGNAL_FANOUT_REQUESTED: 'signal.fanout.requested',
  RISK_APPROVED: 'risk.approved',
  RISK_REJECTED: 'risk.rejected',
  TRADE_EXECUTED: 'trade.executed',
  TRADE_CLOSED: 'trade.closed',
  SUBSCRIPTION_CREATED: 'subscription.created',
  PAYMENT_COMPLETED: 'payment.completed',
  KYC_APPROVED: 'kyc.approved',
  REFERRAL_SETTLED: 'referral.settled',
  NOTIFICATION_SENT: 'notification.sent',
  MARKETPLACE_REVIEW_ADDED: 'marketplace.review.added',
  PROVIDER_DNA_LEARNED: 'provider.dna.learned',
  BROKER_ACCOUNT_CONNECTED: 'broker.account.connected',
  BROKER_ACCOUNT_DISCONNECTED: 'broker.account.disconnected',
});

function listAllEvents() {
  const all = {
    ...CORE_EVENTS,
    ...ACTIONS_EVENTS.ACTIONS_EVENT_NAMES,
    ...PROOF_EVENTS.PROOF_EVENT_NAMES,
    ...ROUTER_EVENTS.ROUTE_EVENT_NAMES,
  };

  const deduped = {};
  for (const [key, value] of Object.entries(all)) {
    deduped[value] = true;
  }

  return Object.keys(deduped).sort();
}

function isKnownEvent(name) {
  if (!name) {
    return false;
  }
  return listAllEvents().includes(name);
}

module.exports = {
  CORE_EVENTS,
  ACTIONS_EVENTS: ACTIONS_EVENTS.ACTIONS_EVENT_NAMES,
  PROOF_EVENTS: PROOF_EVENTS.PROOF_EVENT_NAMES,
  ROUTER_EVENTS: ROUTER_EVENTS.ROUTE_EVENT_NAMES,
  listAllEvents,
  isKnownEvent,
};