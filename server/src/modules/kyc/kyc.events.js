/**
 * KYC Event Helpers
 *
 * @module signalforge/server/modules/kyc/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { KYC_EVENTS } from './kyc.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'kyc',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitApplicationCreated(userId, applicationId, meta = {}) {
  return publish(KYC_EVENTS.APPLICATION_CREATED, {
    userId,
    applicationId,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitApplicationSubmitted(userId, applicationId, meta = {}) {
  return publish(KYC_EVENTS.APPLICATION_SUBMITTED, {
    userId,
    applicationId,
    submittedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitApplicationUpdated(userId, applicationId, changes, meta = {}) {
  return publish(KYC_EVENTS.APPLICATION_UPDATED, {
    userId,
    applicationId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitDocumentUploaded(userId, applicationId, documentId, documentType, meta = {}) {
  return publish(KYC_EVENTS.DOCUMENT_UPLOADED, {
    userId,
    applicationId,
    documentId,
    documentType,
    uploadedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitDocumentDeleted(userId, applicationId, documentId, meta = {}) {
  return publish(KYC_EVENTS.DOCUMENT_DELETED, {
    userId,
    applicationId,
    documentId,
    deletedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitDocumentQualityFailed(userId, applicationId, documentId, reason, meta = {}) {
  return publish(KYC_EVENTS.DOCUMENT_QUALITY_FAILED, {
    userId,
    applicationId,
    documentId,
    reason,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSelfieUploaded(userId, applicationId, selfieId, meta = {}) {
  return publish(KYC_EVENTS.SELFIE_UPLOADED, {
    userId,
    applicationId,
    selfieId,
    uploadedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitVerificationStarted(userId, applicationId, provider, meta = {}) {
  return publish(KYC_EVENTS.VERIFICATION_STARTED, {
    userId,
    applicationId,
    provider,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitVerificationCompleted(userId, applicationId, provider, result, meta = {}) {
  return publish(KYC_EVENTS.VERIFICATION_COMPLETED, {
    userId,
    applicationId,
    provider,
    result,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitVerificationFailed(userId, applicationId, provider, reason, meta = {}) {
  return publish(KYC_EVENTS.VERIFICATION_FAILED, {
    userId,
    applicationId,
    provider,
    reason,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitApplicationApproved(userId, applicationId, reviewerId, meta = {}) {
  return publish(KYC_EVENTS.APPLICATION_APPROVED, {
    userId,
    applicationId,
    reviewerId,
    approvedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitApplicationRejected(userId, applicationId, reviewerId, reason, meta = {}) {
  return publish(KYC_EVENTS.APPLICATION_REJECTED, {
    userId,
    applicationId,
    reviewerId,
    reason,
    rejectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitResubmissionRequested(userId, applicationId, reviewerId, reason, meta = {}) {
  return publish(KYC_EVENTS.RESUBMISSION_REQUESTED, {
    userId,
    applicationId,
    reviewerId,
    reason,
    requestedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitResubmissionCompleted(userId, applicationId, meta = {}) {
  return publish(KYC_EVENTS.RESUBMISSION_COMPLETED, {
    userId,
    applicationId,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitKycExpired(userId, applicationId, meta = {}) {
  return publish(KYC_EVENTS.KYC_EXPIRED, {
    userId,
    applicationId,
    expiredAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitKycSuspended(userId, applicationId, reason, meta = {}) {
  return publish(KYC_EVENTS.KYC_SUSPENDED, {
    userId,
    applicationId,
    reason,
    suspendedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitReverificationRequired(userId, applicationId, reason, meta = {}) {
  return publish(KYC_EVENTS.REVERIFICATION_REQUIRED, {
    userId,
    applicationId,
    reason,
    requiredAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitStatusChanged(userId, applicationId, oldStatus, newStatus, actorId, meta = {}) {
  return publish(KYC_EVENTS.STATUS_CHANGED, {
    userId,
    applicationId,
    oldStatus,
    newStatus,
    actorId,
    changedAt: new Date().toISOString(),
    ...meta,
  });
}

export { KYC_EVENTS };