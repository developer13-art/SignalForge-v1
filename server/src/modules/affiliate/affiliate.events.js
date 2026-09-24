/**
 * Affiliate Event Helpers
 *
 * @module signalforge/server/modules/affiliate/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { AFFILIATE_EVENTS } from './affiliate.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'affiliate',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitPartnerRegistered(partnerId, userId, meta = {}) {
  return publish(AFFILIATE_EVENTS.PARTNER_REGISTERED, {
    partnerId,
    userId,
    registeredAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPartnerUpdated(partnerId, changes, meta = {}) {
  return publish(AFFILIATE_EVENTS.PARTNER_UPDATED, {
    partnerId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPartnerApproved(partnerId, actorId, meta = {}) {
  return publish(AFFILIATE_EVENTS.PARTNER_APPROVED, {
    partnerId,
    actorId,
    approvedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPartnerSuspended(partnerId, actorId, reason, meta = {}) {
  return publish(AFFILIATE_EVENTS.PARTNER_SUSPENDED, {
    partnerId,
    actorId,
    reason,
    suspendedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPartnerReinstated(partnerId, actorId, meta = {}) {
  return publish(AFFILIATE_EVENTS.PARTNER_REINSTATED, {
    partnerId,
    actorId,
    reinstatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitLinkCreated(linkId, partnerId, code, meta = {}) {
  return publish(AFFILIATE_EVENTS.LINK_CREATED, {
    linkId,
    partnerId,
    code,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitLinkUpdated(linkId, changes, meta = {}) {
  return publish(AFFILIATE_EVENTS.LINK_UPDATED, {
    linkId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitLinkDeleted(linkId, meta = {}) {
  return publish(AFFILIATE_EVENTS.LINK_DELETED, {
    linkId,
    deletedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitReferralAttributed(partnerId, referredUserId, referralId, meta = {}) {
  return publish(AFFILIATE_EVENTS.REFERRAL_ATTRIBUTED, {
    partnerId,
    referredUserId,
    referralId,
    attributedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitReferralStatusChanged(referralId, oldStatus, newStatus, meta = {}) {
  return publish(AFFILIATE_EVENTS.REFERRAL_STATUS_CHANGED, {
    referralId,
    oldStatus,
    newStatus,
    changedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitCommissionCalculated(partnerId, commissionId, amount, meta = {}) {
  return publish(AFFILIATE_EVENTS.COMMISSION_CALCULATED, {
    partnerId,
    commissionId,
    amount,
    calculatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitCommissionApproved(partnerId, commissionId, actorId, meta = {}) {
  return publish(AFFILIATE_EVENTS.COMMISSION_APPROVED, {
    partnerId,
    commissionId,
    actorId,
    approvedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitCommissionPaid(partnerId, commissionId, amount, meta = {}) {
  return publish(AFFILIATE_EVENTS.COMMISSION_PAID, {
    partnerId,
    commissionId,
    amount,
    paidAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitCommissionReversed(partnerId, commissionId, reason, meta = {}) {
  return publish(AFFILIATE_EVENTS.COMMISSION_REVERSED, {
    partnerId,
    commissionId,
    reason,
    reversedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPayoutRequested(partnerId, payoutId, amount, meta = {}) {
  return publish(AFFILIATE_EVENTS.PAYOUT_REQUESTED, {
    partnerId,
    payoutId,
    amount,
    requestedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPayoutCompleted(partnerId, payoutId, amount, meta = {}) {
  return publish(AFFILIATE_EVENTS.PAYOUT_COMPLETED, {
    partnerId,
    payoutId,
    amount,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

export { AFFILIATE_EVENTS };