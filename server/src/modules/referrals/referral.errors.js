/**
 * Referrals Module Errors
 *
 * @module signalforge/server/modules/referrals/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';
import { AuthorizationError } from '../../lib/errors/authorization-error.js';

export class ReferralNotFoundError extends NotFoundError {
  constructor(message = 'Referral not found', details = {}) {
    super(message, { code: 'REFERRAL_NOT_FOUND', details });
    this.name = 'ReferralNotFoundError';
  }
}

export class ReferralCodeNotFoundError extends NotFoundError {
  constructor(message = 'Referral code not found', details = {}) {
    super(message, { code: 'REFERRAL_CODE_NOT_FOUND', details });
    this.name = 'ReferralCodeNotFoundError';
  }
}

export class ReferralCodeAlreadyExistsError extends ConflictError {
  constructor(message = 'Referral code already exists') {
    super(message, { code: 'REFERRAL_CODE_ALREADY_EXISTS' });
    this.name = 'ReferralCodeAlreadyExistsError';
  }
}

export class ReferralRelationshipNotFoundError extends NotFoundError {
  constructor(message = 'Referral relationship not found', details = {}) {
    super(message, { code: 'REFERRAL_RELATIONSHIP_NOT_FOUND', details });
    this.name = 'ReferralRelationshipNotFoundError';
  }
}

export class ReferralRelationshipAlreadyExistsError extends ConflictError {
  constructor(message = 'Referral relationship already exists for this user') {
    super(message, { code: 'REFERRAL_RELATIONSHIP_ALREADY_EXISTS' });
    this.name = 'ReferralRelationshipAlreadyExistsError';
  }
}

export class SelfReferralError extends ValidationError {
  constructor(message = 'Users cannot refer themselves') {
    super(message, { code: 'SELF_REFERRAL' });
    this.name = 'SelfReferralError';
  }
}

export class InvalidReferralCodeError extends ValidationError {
  constructor(message = 'Referral code is invalid', details = {}) {
    super(message, { code: 'INVALID_REFERRAL_CODE', details });
    this.name = 'InvalidReferralCodeError';
  }
}

export class ReferralRewardNotFoundError extends NotFoundError {
  constructor(message = 'Referral reward not found', details = {}) {
    super(message, { code: 'REFERRAL_REWARD_NOT_FOUND', details });
    this.name = 'ReferralRewardNotFoundError';
  }
}

export class ReferralWalletNotFoundError extends NotFoundError {
  constructor(message = 'Referral wallet not found', details = {}) {
    super(message, { code: 'REFERRAL_WALLET_NOT_FOUND', details });
    this.name = 'ReferralWalletNotFoundError';
  }
}

export class ReferralSettlementNotFoundError extends NotFoundError {
  constructor(message = 'Referral settlement not found', details = {}) {
    super(message, { code: 'REFERRAL_SETTLEMENT_NOT_FOUND', details });
    this.name = 'ReferralSettlementNotFoundError';
  }
}

export class SettlementAlreadyRunningError extends ConflictError {
  constructor(message = 'A settlement is already running for this period') {
    super(message, { code: 'SETTLEMENT_ALREADY_RUNNING' });
    this.name = 'SettlementAlreadyRunningError';
  }
}

export class InsufficientReferralBalanceError extends ConflictError {
  constructor(message = 'Insufficient referral wallet balance', details = {}) {
    super(message, { code: 'INSUFFICIENT_REFERRAL_BALANCE', details });
    this.name = 'InsufficientReferralBalanceError';
  }
}

export class FraudFlagRaisedError extends AuthorizationError {
  constructor(message = 'Referral reward flagged for fraud review', details = {}) {
    super(message, { code: 'FRAUD_FLAG_RAISED', details });
    this.name = 'FraudFlagRaisedError';
  }
}

export class RewardAlreadySettledError extends ConflictError {
  constructor(message = 'Reward has already been settled') {
    super(message, { code: 'REWARD_ALREADY_SETTLED' });
    this.name = 'RewardAlreadySettledError';
  }
}

export class InvalidSettlementPeriodError extends ValidationError {
  constructor(message = 'Settlement period is invalid', details = {}) {
    super(message, { code: 'INVALID_SETTLEMENT_PERIOD', details });
    this.name = 'InvalidSettlementPeriodError';
  }
}

export class ReferralRewardCalculationError extends Error {
  constructor(message = 'Referral reward calculation failed', details = {}) {
    super(message);
    this.name = 'ReferralRewardCalculationError';
    this.code = 'REFERRAL_REWARD_CALCULATION_FAILED';
    this.details = details;
  }
}