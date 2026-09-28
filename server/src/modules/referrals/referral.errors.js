/**
 * Referrals Module Errors
 *
 * @module signalforge/server/modules/referrals/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
const { AuthorizationError } = require('../../lib/errors/authorization-error.js');
class ReferralNotFoundError extends NotFoundError {
  constructor(message = 'Referral not found', details = {}) {
    super(message, { code: 'REFERRAL_NOT_FOUND', details });
    this.name = 'ReferralNotFoundError';
  }
}
class ReferralCodeNotFoundError extends NotFoundError {
  constructor(message = 'Referral code not found', details = {}) {
    super(message, { code: 'REFERRAL_CODE_NOT_FOUND', details });
    this.name = 'ReferralCodeNotFoundError';
  }
}
class ReferralCodeAlreadyExistsError extends ConflictError {
  constructor(message = 'Referral code already exists') {
    super(message, { code: 'REFERRAL_CODE_ALREADY_EXISTS' });
    this.name = 'ReferralCodeAlreadyExistsError';
  }
}
class ReferralRelationshipNotFoundError extends NotFoundError {
  constructor(message = 'Referral relationship not found', details = {}) {
    super(message, { code: 'REFERRAL_RELATIONSHIP_NOT_FOUND', details });
    this.name = 'ReferralRelationshipNotFoundError';
  }
}
class ReferralRelationshipAlreadyExistsError extends ConflictError {
  constructor(message = 'Referral relationship already exists for this user') {
    super(message, { code: 'REFERRAL_RELATIONSHIP_ALREADY_EXISTS' });
    this.name = 'ReferralRelationshipAlreadyExistsError';
  }
}
class SelfReferralError extends ValidationError {
  constructor(message = 'Users cannot refer themselves') {
    super(message, { code: 'SELF_REFERRAL' });
    this.name = 'SelfReferralError';
  }
}
class InvalidReferralCodeError extends ValidationError {
  constructor(message = 'Referral code is invalid', details = {}) {
    super(message, { code: 'INVALID_REFERRAL_CODE', details });
    this.name = 'InvalidReferralCodeError';
  }
}
class ReferralRewardNotFoundError extends NotFoundError {
  constructor(message = 'Referral reward not found', details = {}) {
    super(message, { code: 'REFERRAL_REWARD_NOT_FOUND', details });
    this.name = 'ReferralRewardNotFoundError';
  }
}
class ReferralWalletNotFoundError extends NotFoundError {
  constructor(message = 'Referral wallet not found', details = {}) {
    super(message, { code: 'REFERRAL_WALLET_NOT_FOUND', details });
    this.name = 'ReferralWalletNotFoundError';
  }
}
class ReferralSettlementNotFoundError extends NotFoundError {
  constructor(message = 'Referral settlement not found', details = {}) {
    super(message, { code: 'REFERRAL_SETTLEMENT_NOT_FOUND', details });
    this.name = 'ReferralSettlementNotFoundError';
  }
}
class SettlementAlreadyRunningError extends ConflictError {
  constructor(message = 'A settlement is already running for this period') {
    super(message, { code: 'SETTLEMENT_ALREADY_RUNNING' });
    this.name = 'SettlementAlreadyRunningError';
  }
}
class InsufficientReferralBalanceError extends ConflictError {
  constructor(message = 'Insufficient referral wallet balance', details = {}) {
    super(message, { code: 'INSUFFICIENT_REFERRAL_BALANCE', details });
    this.name = 'InsufficientReferralBalanceError';
  }
}
class FraudFlagRaisedError extends AuthorizationError {
  constructor(message = 'Referral reward flagged for fraud review', details = {}) {
    super(message, { code: 'FRAUD_FLAG_RAISED', details });
    this.name = 'FraudFlagRaisedError';
  }
}
class RewardAlreadySettledError extends ConflictError {
  constructor(message = 'Reward has already been settled') {
    super(message, { code: 'REWARD_ALREADY_SETTLED' });
    this.name = 'RewardAlreadySettledError';
  }
}
class InvalidSettlementPeriodError extends ValidationError {
  constructor(message = 'Settlement period is invalid', details = {}) {
    super(message, { code: 'INVALID_SETTLEMENT_PERIOD', details });
    this.name = 'InvalidSettlementPeriodError';
  }
}
class ReferralRewardCalculationError extends Error {
  constructor(message = 'Referral reward calculation failed', details = {}) {
    super(message);
    this.name = 'ReferralRewardCalculationError';
    this.code = 'REFERRAL_REWARD_CALCULATION_FAILED';
    this.details = details;
  }
}
module.exports.ReferralNotFoundError = ReferralNotFoundError;
module.exports.ReferralCodeNotFoundError = ReferralCodeNotFoundError;
module.exports.ReferralCodeAlreadyExistsError = ReferralCodeAlreadyExistsError;
module.exports.ReferralRelationshipNotFoundError = ReferralRelationshipNotFoundError;
module.exports.ReferralRelationshipAlreadyExistsError = ReferralRelationshipAlreadyExistsError;
module.exports.SelfReferralError = SelfReferralError;
module.exports.InvalidReferralCodeError = InvalidReferralCodeError;
module.exports.ReferralRewardNotFoundError = ReferralRewardNotFoundError;
module.exports.ReferralWalletNotFoundError = ReferralWalletNotFoundError;
module.exports.ReferralSettlementNotFoundError = ReferralSettlementNotFoundError;
module.exports.SettlementAlreadyRunningError = SettlementAlreadyRunningError;
module.exports.InsufficientReferralBalanceError = InsufficientReferralBalanceError;
module.exports.FraudFlagRaisedError = FraudFlagRaisedError;
module.exports.RewardAlreadySettledError = RewardAlreadySettledError;
module.exports.InvalidSettlementPeriodError = InvalidSettlementPeriodError;
module.exports.ReferralRewardCalculationError = ReferralRewardCalculationError;
