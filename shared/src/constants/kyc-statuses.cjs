/**
 * KYC Statuses
 *
 * Defines the lifecycle states of a KYC application in the SignalForge
 * platform. KYC is a mandatory gate for subscriptions, trading account
 * connections, automated trading, referral rewards, and withdrawals.
 *
 * @module @signalforge/shared/constants/kyc-statuses
 */const KYC_STATUSES = Object.freeze({
  NOT_STARTED: 'NOT_STARTED',
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  SUSPENDED: 'SUSPENDED',
});const KYC_STATUS_VALUES = Object.freeze(Object.values(KYC_STATUSES));const KYC_STATUS_LABELS = Object.freeze({
  [KYC_STATUSES.NOT_STARTED]: 'Not Started',
  [KYC_STATUSES.PENDING]: 'Pending Submission',
  [KYC_STATUSES.UNDER_REVIEW]: 'Under Review',
  [KYC_STATUSES.VERIFIED]: 'Verified',
  [KYC_STATUSES.REJECTED]: 'Rejected',
  [KYC_STATUSES.EXPIRED]: 'Expired',
  [KYC_STATUSES.SUSPENDED]: 'Suspended',
});const KYC_STATUS_DESCRIPTIONS = Object.freeze({
  [KYC_STATUSES.NOT_STARTED]: 'User has not started KYC verification.',
  [KYC_STATUSES.PENDING]: 'User has started KYC but has not submitted required documents.',
  [KYC_STATUSES.UNDER_REVIEW]: 'KYC application is under review by the compliance team or automated system.',
  [KYC_STATUSES.VERIFIED]: 'KYC verification completed successfully. User can access all permitted features.',
  [KYC_STATUSES.REJECTED]: 'KYC verification was rejected. User may resubmit.',
  [KYC_STATUSES.EXPIRED]: 'KYC verification has expired and requires re-verification.',
  [KYC_STATUSES.SUSPENDED]: 'KYC verification has been suspended pending investigation.',
});const KYC_TERMINAL_STATUSES = Object.freeze([
  KYC_STATUSES.VERIFIED,
  KYC_STATUSES.REJECTED,
  KYC_STATUSES.EXPIRED,
  KYC_STATUSES.SUSPENDED,
]);const KYC_VERIFIED_STATUS = KYC_STATUSES.VERIFIED;function isKycVerified(status) {
  return status === KYC_STATUSES.VERIFIED;
}function canSubmitKyc(status) {
  return [
    KYC_STATUSES.NOT_STARTED,
    KYC_STATUSES.PENDING,
    KYC_STATUSES.REJECTED,
    KYC_STATUSES.EXPIRED,
  ].includes(status);
}function requiresResubmission(status) {
  return [
    KYC_STATUSES.REJECTED,
    KYC_STATUSES.EXPIRED,
  ].includes(status);
}

module.exports.isKycVerified = isKycVerified;
module.exports.canSubmitKyc = canSubmitKyc;
module.exports.requiresResubmission = requiresResubmission;
module.exports.KYC_STATUSES = KYC_STATUSES;
module.exports.KYC_STATUS_VALUES = KYC_STATUS_VALUES;
module.exports.KYC_STATUS_LABELS = KYC_STATUS_LABELS;
module.exports.KYC_STATUS_DESCRIPTIONS = KYC_STATUS_DESCRIPTIONS;
module.exports.KYC_TERMINAL_STATUSES = KYC_TERMINAL_STATUSES;
module.exports.KYC_VERIFIED_STATUS = KYC_VERIFIED_STATUS;
