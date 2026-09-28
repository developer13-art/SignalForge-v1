/**
 * Compliance Constants
 *
 * Shared constants for the compliance module. Extends the KYC statuses
 * defined at the shared package level with compliance-specific values
 * used only inside this module.
 *
 * @module server/modules/compliance/compliance.constants
 */

import { KYC_STATUS_VALUES, KYC_STATUSES } from '@signalforge/shared/constants/kyc-statuses';

export const COMPLIANCE_DECISIONS = Object.freeze({
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  RESUBMIT: 'RESUBMIT',
  ESCALATE: 'ESCALATE',
  SUSPEND: 'SUSPEND',
});

export const COMPLIANCE_DECISION_VALUES = Object.freeze(Object.values(COMPLIANCE_DECISIONS));

export const RISK_FLAG_SEVERITIES = Object.freeze({
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
});

export const RISK_FLAG_SEVERITY_VALUES = Object.freeze(Object.values(RISK_FLAG_SEVERITIES));

export const RISK_FLAG_TYPES = Object.freeze({
  DOCUMENT_QUALITY: 'DOCUMENT_QUALITY',
  NAME_MISMATCH: 'NAME_MISMATCH',
  DOB_MISMATCH: 'DOB_MISMATCH',
  LIVENESS_FAILED: 'LIVENESS_FAILED',
  DUPLICATE_DOCUMENT: 'DUPLICATE_DOCUMENT',
  SANCTION_HIT: 'SANCTION_HIT',
  PEP_MATCH: 'PEP_MATCH',
  ADVERSE_MEDIA: 'ADVERSE_MEDIA',
  HIGH_RISK_COUNTRY: 'HIGH_RISK_COUNTRY',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
});

export const RISK_FLAG_TYPE_VALUES = Object.freeze(Object.values(RISK_FLAG_TYPES));

export const VERIFICATION_PROVIDER_TYPES = Object.freeze({
  SMILE_ID: 'SMILE_ID',
  VERIFYME: 'VERIFYME',
  MANUAL: 'MANUAL',
});

export const VERIFICATION_PROVIDER_TYPE_VALUES = Object.freeze(
  Object.values(VERIFICATION_PROVIDER_TYPES),
);

export const COMPLIANCE_QUEUE_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  AWAITING_RESUBMISSION: 'AWAITING_RESUBMISSION',
  COMPLETED: 'COMPLETED',
});

export const COMPLIANCE_QUEUE_STATUS_VALUES = Object.freeze(
  Object.values(COMPLIANCE_QUEUE_STATUSES),
);

export const MAX_QUEUE_BATCH_SIZE = 100;

export const SLA_REVIEW_HOURS = 48;

export function isValidKycStatus(status) {
  return KYC_STATUS_VALUES.includes(status);
}

export function isValidDecision(decision) {
  return COMPLIANCE_DECISION_VALUES.includes(decision);
}

export function isValidRiskFlagType(type) {
  return RISK_FLAG_TYPE_VALUES.includes(type);
}

export function isValidRiskFlagSeverity(severity) {
  return RISK_FLAG_SEVERITY_VALUES.includes(severity);
}

export function isValidVerificationProviderType(type) {
  return VERIFICATION_PROVIDER_TYPE_VALUES.includes(type);
}

export { KYC_STATUSES };