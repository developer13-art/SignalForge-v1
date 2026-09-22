/**
 * Referral Reward Schema
 *
 * Defines the structure of a referral reward calculated for a specific
 * referrer, referred user, and settlement period.
 *
 * @module @signalforge/shared/schemas/referral-reward
 */

import { REFERRAL_REWARD_STATUS_VALUES } from '../constants/referral-statuses.js';

export const REFERRAL_REWARD_SCHEMA = Object.freeze({
  type: 'object',
  required: [
    'rewardId',
    'referrerId',
    'referredUserId',
    'settlementPeriod',
    'eligibleNetProfit',
    'rewardRate',
    'rewardAmount',
    'status',
  ],
  properties: {
    rewardId: { type: 'string', format: 'uuid' },
    referrerId: { type: 'string', format: 'uuid' },
    referredUserId: { type: 'string', format: 'uuid' },
    settlementPeriod: { type: 'string', pattern: '^\\d{4}-\\d{2}$' },
    currency: { type: 'string', default: 'USD', maxLength: 8 },
    grossProfit: { type: 'number', nullable: true },
    grossLoss: { type: 'number', nullable: true },
    eligibleCosts: { type: 'number', nullable: true },
    eligibleNetProfit: { type: 'number', minimum: 0 },
    rewardRate: { type: 'number', minimum: 0, maximum: 1 },
    rewardAmount: { type: 'number', minimum: 0 },
    status: { type: 'string', enum: REFERRAL_REWARD_STATUS_VALUES },
    fraudScore: { type: 'number', nullable: true, minimum: 0, maximum: 1 },
    fraudFlags: { type: 'array', items: { type: 'string' }, default: [] },
    reviewedById: { type: 'string', format: 'uuid', nullable: true },
    approvedAt: { type: 'string', format: 'date-time', nullable: true },
    settledAt: { type: 'string', format: 'date-time', nullable: true },
    rejectedAt: { type: 'string', format: 'date-time', nullable: true },
    rejectionReason: { type: 'string', nullable: true, maxLength: 1024 },
    ledgerEntryId: { type: 'string', format: 'uuid', nullable: true },
    metadata: { type: 'object', nullable: true },
  },
  additionalProperties: false,
});

export function buildReferralReward(input) {
  return {
    rewardId: input.rewardId,
    referrerId: input.referrerId,
    referredUserId: input.referredUserId,
    settlementPeriod: input.settlementPeriod,
    currency: input.currency || 'USD',
    grossProfit: input.grossProfit ?? null,
    grossLoss: input.grossLoss ?? null,
    eligibleCosts: input.eligibleCosts ?? null,
    eligibleNetProfit: input.eligibleNetProfit ?? 0,
    rewardRate: input.rewardRate,
    rewardAmount: input.rewardAmount ?? 0,
    status: input.status,
    fraudScore: input.fraudScore ?? null,
    fraudFlags: input.fraudFlags || [],
    reviewedById: input.reviewedById || null,
    approvedAt: input.approvedAt || null,
    settledAt: input.settledAt || null,
    rejectedAt: input.rejectedAt || null,
    rejectionReason: input.rejectionReason || null,
    ledgerEntryId: input.ledgerEntryId || null,
    metadata: input.metadata || null,
  };
}

export function validateReferralReward(reward) {
  const errors = [];

  if (!reward || typeof reward !== 'object') {
    return { valid: false, errors: ['Referral reward must be an object'] };
  }

  for (const field of REFERRAL_REWARD_SCHEMA.required) {
    if (reward[field] === undefined || reward[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (reward.status && !REFERRAL_REWARD_STATUS_VALUES.includes(reward.status)) {
    errors.push(`Invalid status: ${reward.status}`);
  }

  if (typeof reward.eligibleNetProfit === 'number' && reward.eligibleNetProfit < 0) {
    errors.push('Eligible net profit cannot be negative');
  }

  if (typeof reward.rewardAmount === 'number' && reward.rewardAmount < 0) {
    errors.push('Reward amount cannot be negative');
  }

  return { valid: errors.length === 0, errors };
}

export function calculateReferralReward(eligibleNetProfit, rewardRate) {
  if (eligibleNetProfit <= 0 || rewardRate <= 0) {
    return 0;
  }
  return Number((eligibleNetProfit * rewardRate).toFixed(8));
}

export const REFERRAL_REWARD_FIELDS = Object.freeze(
  Object.keys(REFERRAL_REWARD_SCHEMA.properties),
);