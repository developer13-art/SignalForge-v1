'use strict';

/**
 * SignalForge - Solana Actions Event Definitions
 *
 * Centralizes the event names and payload builders emitted by the
 * Solana Actions subsystem so that consumers subscribe to stable,
 * versioned event names rather than ad-hoc strings.
 */

const ACTIONS_EVENT_NAMES = Object.freeze({
  ACTIONS_GET_SERVED: 'solana.actions.get.served',
  ACTIONS_POST_SERVED: 'solana.actions.post.served',
  ACTIONS_REQUEST_INVALID: 'solana.actions.request.invalid',
  ACTIONS_RATE_LIMITED: 'solana.actions.request.rate_limited',

  BLINK_CREATED: 'solana.blink.created',
  BLINK_UPDATED: 'solana.blink.updated',
  BLINK_PAUSED: 'solana.blink.paused',
  BLINK_RESUMED: 'solana.blink.resumed',
  BLINK_ARCHIVED: 'solana.blink.archived',
  BLINK_SHARED: 'solana.blink.shared',
  BLINK_CLICKED: 'solana.blink.clicked',
  BLINK_VIEWED: 'solana.blink.viewed',

  BLINK_PAYMENT_SUBMITTED: 'solana.blink.payment.submitted',
  BLINK_PAYMENT_CONFIRMED: 'solana.blink.payment.confirmed',
  BLINK_PAYMENT_FAILED: 'solana.blink.payment.failed',
  BLINK_PAYMENT_EXPIRED: 'solana.blink.payment.expired',

  BLINK_SUBSCRIPTION_ACTIVATED: 'solana.blink.subscription.activated',
  BLINK_UPGRADE_ACTIVATED: 'solana.blink.upgrade.activated',
  BLINK_REFERRAL_ATTRIBUTED: 'solana.blink.referral.attributed',
  BLINK_TIP_RECEIVED: 'solana.blink.tip.received',

  BLINK_CONFIRMATION_ENQUEUED: 'solana.blink.confirmation.enqueued',
  BLINK_CONFIRMATION_RECONCILED: 'solana.blink.confirmation.reconciled',
  BLINK_CONFIRMATION_FAILED: 'solana.blink.confirmation.failed',
});

const ACTIONS_EVENT_VERSION = 1;

function buildEventEnvelope(name, payload, metadata = {}) {
  return {
    name,
    version: ACTIONS_EVENT_VERSION,
    emittedAt: new Date().toISOString(),
    payload,
    metadata: {
      source: 'solana-actions',
      ...metadata,
    },
  };
}

function buildGetServedEvent({ actionType, planId, referralCode, wallet, requestId }) {
  return buildEventEnvelope(ACTIONS_EVENT_NAMES.ACTIONS_GET_SERVED, {
    actionType,
    planId: planId || null,
    referralCode: referralCode || null,
    wallet: wallet || null,
    requestId: requestId || null,
  });
}

function buildPostServedEvent({ actionType, wallet, signature, requestId, amount, token }) {
  return buildEventEnvelope(ACTIONS_EVENT_NAMES.ACTIONS_POST_SERVED, {
    actionType,
    wallet: wallet || null,
    signature: signature || null,
    requestId: requestId || null,
    amount: amount || null,
    token: token || null,
  });
}

function buildBlinkCreatedEvent({ blinkId, providerId, templateType, createdBy }) {
  return buildEventEnvelope(ACTIONS_EVENT_NAMES.BLINK_CREATED, {
    blinkId,
    providerId,
    templateType,
    createdBy,
  });
}

function buildBlinkSharedEvent({ blinkId, channel, sharedBy, targetUrl }) {
  return buildEventEnvelope(ACTIONS_EVENT_NAMES.BLINK_SHARED, {
    blinkId,
    channel,
    sharedBy,
    targetUrl: targetUrl || null,
  });
}

function buildBlinkClickedEvent({ blinkId, channel, wallet, userAgent, ip, requestId }) {
  return buildEventEnvelope(ACTIONS_EVENT_NAMES.BLINK_CLICKED, {
    blinkId,
    channel,
    wallet: wallet || null,
    userAgent: userAgent || null,
    ip: ip || null,
    requestId: requestId || null,
  });
}

function buildPaymentSubmittedEvent({ blinkId, wallet, signature, amount, token, reference, requestId }) {
  return buildEventEnvelope(ACTIONS_EVENT_NAMES.BLINK_PAYMENT_SUBMITTED, {
    blinkId,
    wallet,
    signature,
    amount,
    token,
    reference,
    requestId,
  });
}

function buildPaymentConfirmedEvent({ blinkId, wallet, signature, subscriptionId, requestId }) {
  return buildEventEnvelope(ACTIONS_EVENT_NAMES.BLINK_PAYMENT_CONFIRMED, {
    blinkId,
    wallet,
    signature,
    subscriptionId: subscriptionId || null,
    requestId: requestId || null,
  });
}

function buildPaymentFailedEvent({ blinkId, wallet, signature, reason, requestId }) {
  return buildEventEnvelope(ACTIONS_EVENT_NAMES.BLINK_PAYMENT_FAILED, {
    blinkId,
    wallet,
    signature,
    reason,
    requestId: requestId || null,
  });
}

function buildSubscriptionActivatedEvent({ blinkId, wallet, subscriptionId, planId, requestId }) {
  return buildEventEnvelope(ACTIONS_EVENT_NAMES.BLINK_SUBSCRIPTION_ACTIVATED, {
    blinkId,
    wallet,
    subscriptionId,
    planId,
    requestId,
  });
}

function buildReferralAttributedEvent({ blinkId, wallet, referrerId, referralRelationshipId, requestId }) {
  return buildEventEnvelope(ACTIONS_EVENT_NAMES.BLINK_REFERRAL_ATTRIBUTED, {
    blinkId,
    wallet,
    referrerId,
    referralRelationshipId,
    requestId,
  });
}

function buildConfirmationEnqueuedEvent({ blinkId, signature, requestId }) {
  return buildEventEnvelope(ACTIONS_EVENT_NAMES.BLINK_CONFIRMATION_ENQUEUED, {
    blinkId,
    signature,
    requestId,
  });
}

function buildConfirmationReconciledEvent({ blinkId, signature, result, requestId }) {
  return buildEventEnvelope(ACTIONS_EVENT_NAMES.BLINK_CONFIRMATION_RECONCILED, {
    blinkId,
    signature,
    result,
    requestId,
  });
}

module.exports = {
  ACTIONS_EVENT_NAMES,
  ACTIONS_EVENT_VERSION,
  buildEventEnvelope,
  buildGetServedEvent,
  buildPostServedEvent,
  buildBlinkCreatedEvent,
  buildBlinkSharedEvent,
  buildBlinkClickedEvent,
  buildPaymentSubmittedEvent,
  buildPaymentConfirmedEvent,
  buildPaymentFailedEvent,
  buildSubscriptionActivatedEvent,
  buildReferralAttributedEvent,
  buildConfirmationEnqueuedEvent,
  buildConfirmationReconciledEvent,
};