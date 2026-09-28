/**
 * Affiliate Event Helpers
 *
 * @module signalforge/server/modules/affiliate/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { AFFILIATE_EVENTS } = require('./affiliate.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'affiliate',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitPartnerRegistered(partnerId, userId, meta = {}) {
  return publish(AFFILIATE_EVENTS.PARTNER_REGISTERED, {
    partnerId,
    userId,
    registeredAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPartnerUpdated(partnerId, changes, meta = {}) {
  return publish(AFFILIATE_EVENTS.PARTNER_UPDATED, {
    partnerId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPartnerApproved(partnerId, actorId, meta = {}) {
  return publish(AFFILIATE_EVENTS.PARTNER_APPROVED, {
    partnerId,
    actorId,
    approvedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPartnerSuspended(partnerId, actorId, reason, meta = {}) {
  return publish(AFFILIATE_EVENTS.PARTNER_SUSPENDED, {
    partnerId,
    actorId,
    reason,
    suspendedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPartnerReinstated(partnerId, actorId, meta = {}) {
  return publish(AFFILIATE_EVENTS.PARTNER_REINSTATED, {
    partnerId,
    actorId,
    reinstatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitLinkCreated(linkId, partnerId, code, meta = {}) {
  return publish(AFFILIATE_EVENTS.LINK_CREATED, {
    linkId,
    partnerId,
    code,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitLinkUpdated(linkId, changes, meta = {}) {
  return publish(AFFILIATE_EVENTS.LINK_UPDATED, {
    linkId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitLinkDeleted(linkId, meta = {}) {
  return publish(AFFILIATE_EVENTS.LINK_DELETED, {
    linkId,
    deletedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitReferralAttributed(partnerId, referredUserId, referralId, meta = {}) {
  return publish(AFFILIATE_EVENTS.REFERRAL_ATTRIBUTED, {
    partnerId,
    referredUserId,
    referralId,
    attributedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitReferralStatusChanged(referralId, oldStatus, newStatus, meta = {}) {
  return publish(AFFILIATE_EVENTS.REFERRAL_STATUS_CHANGED, {
    referralId,
    oldStatus,
    newStatus,
    changedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitCommissionCalculated(partnerId, commissionId, amount, meta = {}) {
  return publish(AFFILIATE_EVENTS.COMMISSION_CALCULATED, {
    partnerId,
    commissionId,
    amount,
    calculatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitCommissionApproved(partnerId, commissionId, actorId, meta = {}) {
  return publish(AFFILIATE_EVENTS.COMMISSION_APPROVED, {
    partnerId,
    commissionId,
    actorId,
    approvedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitCommissionPaid(partnerId, commissionId, amount, meta = {}) {
  return publish(AFFILIATE_EVENTS.COMMISSION_PAID, {
    partnerId,
    commissionId,
    amount,
    paidAt: new Date().toISOString(),
    ...meta,
  });
}
function emitCommissionReversed(partnerId, commissionId, reason, meta = {}) {
  return publish(AFFILIATE_EVENTS.COMMISSION_REVERSED, {
    partnerId,
    commissionId,
    reason,
    reversedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPayoutRequested(partnerId, payoutId, amount, meta = {}) {
  return publish(AFFILIATE_EVENTS.PAYOUT_REQUESTED, {
    partnerId,
    payoutId,
    amount,
    requestedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPayoutCompleted(partnerId, payoutId, amount, meta = {}) {
  return publish(AFFILIATE_EVENTS.PAYOUT_COMPLETED, {
    partnerId,
    payoutId,
    amount,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitPartnerRegistered = emitPartnerRegistered;
module.exports.emitPartnerUpdated = emitPartnerUpdated;
module.exports.emitPartnerApproved = emitPartnerApproved;
module.exports.emitPartnerSuspended = emitPartnerSuspended;
module.exports.emitPartnerReinstated = emitPartnerReinstated;
module.exports.emitLinkCreated = emitLinkCreated;
module.exports.emitLinkUpdated = emitLinkUpdated;
module.exports.emitLinkDeleted = emitLinkDeleted;
module.exports.emitReferralAttributed = emitReferralAttributed;
module.exports.emitReferralStatusChanged = emitReferralStatusChanged;
module.exports.emitCommissionCalculated = emitCommissionCalculated;
module.exports.emitCommissionApproved = emitCommissionApproved;
module.exports.emitCommissionPaid = emitCommissionPaid;
module.exports.emitCommissionReversed = emitCommissionReversed;
module.exports.emitPayoutRequested = emitPayoutRequested;
module.exports.emitPayoutCompleted = emitPayoutCompleted;
