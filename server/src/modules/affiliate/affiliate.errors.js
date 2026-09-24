/**
 * Affiliate Module Errors
 *
 * @module signalforge/server/modules/affiliate/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';
import { AuthorizationError } from '../../lib/errors/authorization-error.js';

export class AffiliatePartnerNotFoundError extends NotFoundError {
  constructor(message = 'Affiliate partner not found', details = {}) {
    super(message, { code: 'AFFILIATE_PARTNER_NOT_FOUND', details });
    this.name = 'AffiliatePartnerNotFoundError';
  }
}

export class AffiliatePartnerAlreadyExistsError extends ConflictError {
  constructor(message = 'Affiliate partner already exists for this user') {
    super(message, { code: 'AFFILIATE_PARTNER_ALREADY_EXISTS' });
    this.name = 'AffiliatePartnerAlreadyExistsError';
  }
}

export class AffiliatePartnerNotActiveError extends AuthorizationError {
  constructor(message = 'Affiliate partner is not active', details = {}) {
    super(message, { code: 'AFFILIATE_PARTNER_NOT_ACTIVE', details });
    this.name = 'AffiliatePartnerNotActiveError';
  }
}

export class AffiliateLinkNotFoundError extends NotFoundError {
  constructor(message = 'Affiliate link not found', details = {}) {
    super(message, { code: 'AFFILIATE_LINK_NOT_FOUND', details });
    this.name = 'AffiliateLinkNotFoundError';
  }
}

export class AffiliateLinkAlreadyExistsError extends ConflictError {
  constructor(message = 'Affiliate link already exists with this code') {
    super(message, { code: 'AFFILIATE_LINK_ALREADY_EXISTS' });
    this.name = 'AffiliateLinkAlreadyExistsError';
  }
}

export class AffiliateReferralNotFoundError extends NotFoundError {
  constructor(message = 'Affiliate referral not found', details = {}) {
    super(message, { code: 'AFFILIATE_REFERRAL_NOT_FOUND', details });
    this.name = 'AffiliateReferralNotFoundError';
  }
}

export class AffiliateReferralAlreadyAttributedError extends ConflictError {
  constructor(message = 'Referral has already been attributed to a partner') {
    super(message, { code: 'AFFILIATE_REFERRAL_ALREADY_ATTRIBUTED' });
    this.name = 'AffiliateReferralAlreadyAttributedError';
  }
}

export class SelfReferralError extends ValidationError {
  constructor(message = 'Users cannot refer themselves') {
    super(message, { code: 'AFFILIATE_SELF_REFERRAL' });
    this.name = 'SelfReferralError';
  }
}

export class CommissionNotFoundError extends NotFoundError {
  constructor(message = 'Affiliate commission not found', details = {}) {
    super(message, { code: 'AFFILIATE_COMMISSION_NOT_FOUND', details });
    this.name = 'CommissionNotFoundError';
  }
}

export class CommissionAlreadyPaidError extends ConflictError {
  constructor(message = 'Commission has already been paid') {
    super(message, { code: 'AFFILIATE_COMMISSION_ALREADY_PAID' });
    this.name = 'CommissionAlreadyPaidError';
  }
}

export class PayoutNotFoundError extends NotFoundError {
  constructor(message = 'Affiliate payout not found', details = {}) {
    super(message, { code: 'AFFILIATE_PAYOUT_NOT_FOUND', details });
    this.name = 'PayoutNotFoundError';
  }
}

export class InsufficientAffiliateBalanceError extends ConflictError {
  constructor(message = 'Insufficient affiliate balance for payout', details = {}) {
    super(message, { code: 'INSUFFICIENT_AFFILIATE_BALANCE', details });
    this.name = 'InsufficientAffiliateBalanceError';
  }
}

export class PayoutBelowMinimumError extends ValidationError {
  constructor(message = 'Payout amount is below the minimum', details = {}) {
    super(message, { code: 'PAYOUT_BELOW_MINIMUM', details });
    this.name = 'PayoutBelowMinimumError';
  }
}

export class InvalidAffiliatePayloadError extends ValidationError {
  constructor(message = 'Affiliate payload is invalid', details = {}) {
    super(message, { code: 'INVALID_AFFILIATE_PAYLOAD', details });
    this.name = 'InvalidAffiliatePayloadError';
  }
}

export class CommissionCalculationError extends Error {
  constructor(message = 'Commission calculation failed', details = {}) {
    super(message);
    this.name = 'CommissionCalculationError';
    this.code = 'AFFILIATE_COMMISSION_CALCULATION_FAILED';
    this.details = details;
  }
}

export class AffiliateFraudFlagError extends AuthorizationError {
  constructor(message = 'Affiliate activity flagged for fraud review', details = {}) {
    super(message, { code: 'AFFILIATE_FRAUD_FLAG', details });
    this.name = 'AffiliateFraudFlagError';
  }
}