'use strict';

/**
 * SignalForge - Event Registry
 *
 * Registers every event listener the platform attaches to the event
 * bus. Listeners are grouped by domain so operators can enable or
 * disable entire domains at once.
 */

const actionsEvents = require('../modules/solana/actions/actions.events');
const proofEvents = require('../modules/solana/proof-of-alpha/proof.events');
const routerEvents = require('../modules/execution/routers/execution-router.events');

const coreListeners = require('./listeners');

function registerCoreListeners(eventBus) {
  coreListeners.registerAll(eventBus);
}

function registerActionsListeners(eventBus) {
  if (!eventBus || typeof eventBus.subscribe !== 'function') {
    return;
  }

  // Solana Actions GET/POST events are read-only observability hooks.
  eventBus.subscribe(actionsEvents.ACTIONS_EVENT_NAMES.ACTIONS_GET_SERVED, (payload) => {
    // Analytics and metrics hooks subscribe to this event.
    void payload;
  });

  eventBus.subscribe(actionsEvents.ACTIONS_EVENT_NAMES.ACTIONS_POST_SERVED, (payload) => {
    void payload;
  });

  eventBus.subscribe(actionsEvents.ACTIONS_EVENT_NAMES.BLINK_CREATED, (payload) => {
    void payload;
  });

  eventBus.subscribe(actionsEvents.ACTIONS_EVENT_NAMES.BLINK_SHARED, (payload) => {
    void payload;
  });

  eventBus.subscribe(actionsEvents.ACTIONS_EVENT_NAMES.BLINK_CLICKED, (payload) => {
    void payload;
  });

  eventBus.subscribe(actionsEvents.ACTIONS_EVENT_NAMES.BLINK_PAYMENT_SUBMITTED, (payload) => {
    void payload;
  });

  eventBus.subscribe(actionsEvents.ACTIONS_EVENT_NAMES.BLINK_PAYMENT_CONFIRMED, (payload) => {
    void payload;
  });

  eventBus.subscribe(actionsEvents.ACTIONS_EVENT_NAMES.BLINK_SUBSCRIPTION_ACTIVATED, (payload) => {
    void payload;
  });

  eventBus.subscribe(actionsEvents.ACTIONS_EVENT_NAMES.BLINK_REFERRAL_ATTRIBUTED, (payload) => {
    void payload;
  });
}

function registerProofListeners(eventBus) {
  if (!eventBus || typeof eventBus.subscribe !== 'function') {
    return;
  }

  eventBus.subscribe(proofEvents.PROOF_EVENT_NAMES.PROOF_REQUESTED, (payload) => {
    void payload;
  });

  eventBus.subscribe(proofEvents.PROOF_EVENT_NAMES.PROOF_MEMO_SUBMITTED, (payload) => {
    void payload;
  });

  eventBus.subscribe(proofEvents.PROOF_EVENT_NAMES.PROOF_MEMO_CONFIRMED, (payload) => {
    void payload;
  });

  eventBus.subscribe(proofEvents.PROOF_EVENT_NAMES.PROOF_MEMO_FAILED, (payload) => {
    void payload;
  });

  eventBus.subscribe(proofEvents.PROOF_EVENT_NAMES.PROOF_VERIFICATION_COMPLETED, (payload) => {
    void payload;
  });

  eventBus.subscribe(proofEvents.PROOF_EVENT_NAMES.PROOF_VERIFICATION_FAILED, (payload) => {
    void payload;
  });

  eventBus.subscribe(proofEvents.PROOF_EVENT_NAMES.PROOF_LEADERBOARD_REFRESHED, (payload) => {
    void payload;
  });

  eventBus.subscribe(proofEvents.PROOF_EVENT_NAMES.PROOF_PROVIDER_CERTIFIED, (payload) => {
    void payload;
  });

  eventBus.subscribe(proofEvents.PROOF_EVENT_NAMES.PROOF_MILESTONE_REACHED, (payload) => {
    void payload;
  });
}

function registerRouterListeners(eventBus) {
  if (!eventBus || typeof eventBus.subscribe !== 'function') {
    return;
  }

  eventBus.subscribe(routerEvents.ROUTE_EVENT_NAMES.ROUTE_RESOLVED, (payload) => {
    void payload;
  });

  eventBus.subscribe(routerEvents.ROUTE_EVENT_NAMES.ROUTE_FALLBACK_TRIGGERED, (payload) => {
    void payload;
  });

  eventBus.subscribe(routerEvents.ROUTE_EVENT_NAMES.ROUTE_REJECTED, (payload) => {
    void payload;
  });

  eventBus.subscribe(routerEvents.ROUTE_EVENT_NAMES.ROUTE_SIMULATED, (payload) => {
    void payload;
  });

  eventBus.subscribe(routerEvents.ROUTE_EVENT_NAMES.ROUTE_POLICY_UPDATED, (payload) => {
    void payload;
  });

  eventBus.subscribe(routerEvents.ROUTE_EVENT_NAMES.GATEWAY_HEALTH_CHANGED, (payload) => {
    void payload;
  });
}

function registerAll(eventBus) {
  registerCoreListeners(eventBus);
  registerActionsListeners(eventBus);
  registerProofListeners(eventBus);
  registerRouterListeners(eventBus);
  return true;
}

module.exports = {
  registerCoreListeners,
  registerActionsListeners,
  registerProofListeners,
  registerRouterListeners,
  registerAll,
};