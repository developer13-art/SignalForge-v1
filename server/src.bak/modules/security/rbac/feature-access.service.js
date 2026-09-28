/**
 * Feature Access Service
 *
 * Determines whether a user can access a specific feature based on
 * subscription status, KYC status, and any feature-specific
 * requirements. Centralizes the access rules so that middleware,
 * controllers, and UI can share the same evaluation.
 *
 * @module server/modules/security/rbac/feature-access.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { KYC_STATUSES } from '@signalforge/shared/constants/kyc-statuses';
import { ACCOUNT_STATUSES } from '@signalforge/shared/constants/account-statuses';
import { canExecuteTrades, canAccessPlatform } from '@signalforge/shared/constants/subscription-statuses';
import { db } from '../../../database';

const FEATURE_REQUIREMENTS = Object.freeze({
  VIEW_DASHBOARD: { requiresAuth: true, requiresKyc: false, requiresSubscription: false },
  VIEW_PUBLIC_SIGNALS: { requiresAuth: false, requiresKyc: false, requiresSubscription: false },
  MANAGE_PROFILE: { requiresAuth: true, requiresKyc: false, requiresSubscription: false },
  CONNECT_BROKER: { requiresAuth: true, requiresKyc: true, requiresSubscription: true },
  ACTIVATE_AUTOMATION: { requiresAuth: true, requiresKyc: true, requiresSubscription: true },
  EXECUTE_TRADES: { requiresAuth: true, requiresKyc: true, requiresSubscription: true, requiresTradingEnabled: true },
  SUBSCRIBE: { requiresAuth: true, requiresKyc: true, requiresSubscription: false },
  EARN_REFERRALS: { requiresAuth: true, requiresKyc: true, requiresSubscription: false },
  WITHDRAW_REFERRALS: { requiresAuth: true, requiresKyc: true, requiresSubscription: false },
  ACTIVATE_PROVIDER: { requiresAuth: true, requiresKyc: true, requiresSubscription: true },
  VIEW_ANALYTICS: { requiresAuth: true, requiresKyc: false, requiresSubscription: false },
  ACCESS_MARKETPLACE_FINANCIAL: { requiresAuth: true, requiresKyc: true, requiresSubscription: true },
  ACCESS_API: { requiresAuth: true, requiresKyc: true, requiresSubscription: true },
  MANAGE_SOLANA_WALLET: { requiresAuth: true, requiresKyc: false, requiresSubscription: false },
  ANCHOR_ATTESTATION: { requiresAuth: true, requiresKyc: true, requiresSubscription: false },
});

export async function loadUserContext({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows: userRows } = await db.query(
    `SELECT id, status, kyc_status, email_verified_at
       FROM users
      WHERE id = $1
      LIMIT 1`,
    [userId],
  );

  const user = userRows[0];

  if (!user) {
    throw new AppError('User not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const { rows: subRows } = await db.query(
    `SELECT status FROM subscriptions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1`,
    [userId],
  );

  const subscriptionStatus = subRows[0]?.status || null;

  return {
    userId: user.id,
    accountStatus: user.status,
    kycStatus: user.kyc_status,
    emailVerified: Boolean(user.email_verified_at),
    subscriptionStatus,
  };
}

export function evaluateFeatureAccess({ userContext, feature }) {
  const requirements = FEATURE_REQUIREMENTS[feature];

  if (!requirements) {
    return { allowed: false, reason: 'UNKNOWN_FEATURE' };
  }

  if (requirements.requiresAuth && !userContext) {
    return { allowed: false, reason: 'AUTHENTICATION_REQUIRED' };
  }

  if (requirements.requiresAuth) {
    if (userContext.accountStatus !== ACCOUNT_STATUSES.ACTIVE) {
      return { allowed: false, reason: 'ACCOUNT_INACTIVE' };
    }

    if (!userContext.emailVerified) {
      return { allowed: false, reason: 'EMAIL_NOT_VERIFIED' };
    }
  }

  if (requirements.requiresKyc && userContext.kycStatus !== KYC_STATUSES.VERIFIED) {
    return { allowed: false, reason: 'KYC_REQUIRED' };
  }

  if (requirements.requiresSubscription) {
    if (!userContext.subscriptionStatus) {
      return { allowed: false, reason: 'SUBSCRIPTION_REQUIRED' };
    }

    if (!canAccessPlatform(userContext.subscriptionStatus)) {
      return { allowed: false, reason: 'SUBSCRIPTION_INACTIVE' };
    }
  }

  if (requirements.requiresTradingEnabled) {
    if (!userContext.subscriptionStatus || !canExecuteTrades(userContext.subscriptionStatus)) {
      return { allowed: false, reason: 'TRADING_DISABLED' };
    }
  }

  return { allowed: true };
}

export async function checkFeatureAccess({ userId, feature }) {
  const requirements = FEATURE_REQUIREMENTS[feature];

  if (!requirements) {
    throw new AppError(`Unknown feature: ${feature}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!requirements.requiresAuth) {
    return { allowed: true, feature };
  }

  const userContext = await loadUserContext({ userId });

  const result = evaluateFeatureAccess({ userContext, feature });

  return { ...result, feature, userContext };
}

export async function assertFeatureAccess({ userId, feature }) {
  const result = await checkFeatureAccess({ userId, feature });

  if (!result.allowed) {
    const errorCode = mapReasonToErrorCode(result.reason);
    throw new AppError(`Feature access denied: ${result.reason}`, errorCode, 403);
  }

  return result;
}

function mapReasonToErrorCode(reason) {
  switch (reason) {
    case 'AUTHENTICATION_REQUIRED':
      return ERROR_CODES.AUTHENTICATION_REQUIRED;
    case 'KYC_REQUIRED':
      return ERROR_CODES.KYC_REQUIRED;
    case 'SUBSCRIPTION_REQUIRED':
    case 'SUBSCRIPTION_INACTIVE':
    case 'TRADING_DISABLED':
      return ERROR_CODES.SUBSCRIPTION_REQUIRED;
    default:
      return ERROR_CODES.AUTHORIZATION_FAILED;
  }
}

export async function listAccessibleFeatures({ userId }) {
  const userContext = await loadUserContext({ userId });

  const accessible = [];

  for (const feature of Object.keys(FEATURE_REQUIREMENTS)) {
    const result = evaluateFeatureAccess({ userContext, feature });
    if (result.allowed) {
      accessible.push(feature);
    }
  }

  return { userId, accessibleFeatures: accessible };
}

export const featureAccessService = {
  loadUserContext,
  evaluateFeatureAccess,
  checkFeatureAccess,
  assertFeatureAccess,
  listAccessibleFeatures,
  FEATURE_REQUIREMENTS,
};