/**
 * Conversion Service
 *
 * Computes funnel conversion metrics for the executive dashboard:
 * registration to email verification, email verification to KYC,
 * KYC to subscription, and subscription to active trading.
 *
 * @module server/modules/executive/analytics/conversion.service
 */

import { db } from '../../../database';

function normalizeRange({ from, to }) {
  const toDate = to || new Date().toISOString();
  const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  return { from: fromDate, to: toDate };
}

function safeRate(numerator, denominator) {
  if (!denominator || denominator === 0) {
    return null;
  }
  return numerator / denominator;
}

export async function getConversion({ from, to }) {
  const range = normalizeRange({ from, to });

  const { rows: registrationRows } = await db.query(
    `SELECT COUNT(*)::int AS total
       FROM users
      WHERE created_at >= $1 AND created_at <= $2`,
    [range.from, range.to],
  );

  const { rows: emailRows } = await db.query(
    `SELECT COUNT(*)::int AS total
       FROM users
      WHERE created_at >= $1 AND created_at <= $2
        AND email_verified_at IS NOT NULL`,
    [range.from, range.to],
  );

  const { rows: kycRows } = await db.query(
    `SELECT COUNT(*)::int AS total
       FROM users
      WHERE created_at >= $1 AND created_at <= $2
        AND kyc_status = 'VERIFIED'`,
    [range.from, range.to],
  );

  const { rows: subscriptionRows } = await db.query(
    `SELECT COUNT(DISTINCT u.id)::int AS total
       FROM users u
       JOIN subscriptions s ON s.user_id = u.id
      WHERE u.created_at >= $1 AND u.created_at <= $2
        AND s.status IN ('ACTIVE', 'TRIAL')`,
    [range.from, range.to],
  );

  const { rows: brokerRows } = await db.query(
    `SELECT COUNT(DISTINCT u.id)::int AS total
       FROM users u
       JOIN broker_accounts ba ON ba.user_id = u.id
      WHERE u.created_at >= $1 AND u.created_at <= $2`,
    [range.from, range.to],
  );

  const { rows: tradeRows } = await db.query(
    `SELECT COUNT(DISTINCT u.id)::int AS total
       FROM users u
       JOIN trades t ON t.user_id = u.id
      WHERE u.created_at >= $1 AND u.created_at <= $2`,
    [range.from, range.to],
  );

  const registrations = registrationRows[0]?.total || 0;
  const emailVerified = emailRows[0]?.total || 0;
  const kycVerified = kycRows[0]?.total || 0;
  const subscribed = subscriptionRows[0]?.total || 0;
  const brokerConnected = brokerRows[0]?.total || 0;
  const traded = tradeRows[0]?.total || 0;

  return {
    range,
    funnel: {
      registrations,
      emailVerified,
      kycVerified,
      subscribed,
      brokerConnected,
      traded,
    },
    conversionRates: {
      registrationToEmail: safeRate(emailVerified, registrations),
      emailToKyc: safeRate(kycVerified, emailVerified),
      kycToSubscription: safeRate(subscribed, kycVerified),
      subscriptionToBroker: safeRate(brokerConnected, subscribed),
      brokerToTrade: safeRate(traded, brokerConnected),
      registrationToTrade: safeRate(traded, registrations),
    },
  };
}

export async function getSignupSourceBreakdown({ from, to }) {
  const range = normalizeRange({ from, to });

  const { rows } = await db.query(
    `SELECT COALESCE(signup_source, 'UNKNOWN') AS source, COUNT(*)::int AS count
       FROM users
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY source
      ORDER BY count DESC`,
    [range.from, range.to],
  );

  return rows.map((row) => ({
    source: row.source,
    count: row.count,
  }));
}

export const conversionService = {
  getConversion,
  getSignupSourceBreakdown,
};