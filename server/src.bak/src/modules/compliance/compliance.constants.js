/**
 * Compliance Constants
 *
 * Shared constants for the compliance module. Extends the KYC statuses
 * defined at the shared package level with compliance-specific values
 * used only inside this module.
 *
 * @module server/modules/compliance/compliance.constants
 */
const { KYC_STATUS_VALUES, KYC_STATUSES } = require('@signalforge/shared/constants/kyc-statuses');
const COMPLIANCE_DECISIONS = Object.freeze({
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  RESUBMIT: 'RESUBMIT',
  ESCALATE: 'ESCALATE',
  SUSPEND: 'SUSPEND',
});
const COMPLIANCE_DECISION_VALUES = Object.freeze(Object.values(COMPLIANCE_DECISIONS));
const RISK_FLAG_SEVERITIES = Object.freeze({
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
});
const RISK_FLAG_SEVERITY_VALUES = Object.freeze(Object.values(RISK_FLAG_SEVERITIES));
const RISK_FLAG_TYPES = Object.freeze({
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
const RISK_FLAG_TYPE_VALUES = Object.freeze(Object.values(RISK_FLAG_TYPES));
const VERIFICATION_PROVIDER_TYPES = Object.freeze({
  SMILE_ID: 'SMILE_ID',
  VERIFYME: 'VERIFYME',
  MANUAL: 'MANUAL',
});
const VERIFICATION_PROVIDER_TYPE_VALUES = Object.freeze(
  Object.values(VERIFICATION_PROVIDER_TYPES),
);
const COMPLIANCE_QUEUE_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  AWAITING_RESUBMISSION: 'AWAITING_RESUBMISSION',
  COMPLETED: 'COMPLETED',
});
const COMPLIANCE_QUEUE_STATUS_VALUES = Object.freeze(
  Object.values(COMPLIANCE_QUEUE_STATUSES),
);
const MAX_QUEUE_BATCH_SIZE = 100;
const SLA_REVIEW_HOURS = 48;
function isValidKycStatus(status) {
  return KYC_STATUS_VALUES.includes(status);
}
function isValidDecision(decision) {
  return COMPLIANCE_DECISION_VALUES.includes(decision);
}
function isValidRiskFlagType(type) {
  return RISK_FLAG_TYPE_VALUES.includes(type);
}
function isValidRiskFlagSeverity(severity) {
  return RISK_FLAG_SEVERITY_VALUES.includes(severity);
}
function isValidVerificationProviderType(type) {
  return VERIFICATION_PROVIDER_TYPE_VALUES.includes(type);
}

module.exports.COMPLIANCE_DECISIONS = COMPLIANCE_DECISIONS;
module.exports.COMPLIANCE_DECISION_VALUES = COMPLIANCE_DECISION_VALUES;
module.exports.RISK_FLAG_SEVERITIES = RISK_FLAG_SEVERITIES;
module.exports.RISK_FLAG_SEVERITY_VALUES = RISK_FLAG_SEVERITY_VALUES;
module.exports.RISK_FLAG_TYPES = RISK_FLAG_TYPES;
module.exports.RISK_FLAG_TYPE_VALUES = RISK_FLAG_TYPE_VALUES;
module.exports.VERIFICATION_PROVIDER_TYPES = VERIFICATION_PROVIDER_TYPES;
module.exports.VERIFICATION_PROVIDER_TYPE_VALUES = VERIFICATION_PROVIDER_TYPE_VALUES;
module.exports.COMPLIANCE_QUEUE_STATUSES = COMPLIANCE_QUEUE_STATUSES;
module.exports.COMPLIANCE_QUEUE_STATUS_VALUES = COMPLIANCE_QUEUE_STATUS_VALUES;
module.exports.MAX_QUEUE_BATCH_SIZE = MAX_QUEUE_BATCH_SIZE;
module.exports.SLA_REVIEW_HOURS = SLA_REVIEW_HOURS;
module.exports.isValidKycStatus = isValidKycStatus;
module.exports.isValidDecision = isValidDecision;
module.exports.isValidRiskFlagType = isValidRiskFlagType;
module.exports.isValidRiskFlagSeverity = isValidRiskFlagSeverity;
module.exports.isValidVerificationProviderType = isValidVerificationProviderType;
