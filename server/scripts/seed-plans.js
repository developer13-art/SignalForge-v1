#!/usr/bin/env node
/**
 * Seed Plans Script
 *
 * @module server/scripts/seed-plans
 */

import { db } from '../src/database';
import { closePool } from '../src/database/connection';
import { logger } from '../src/lib/logger';

const PLANS = [
  {
    code: 'MONTHLY',
    name: 'Monthly Plan',
    description: 'Access to full SignalForge platform on a monthly basis.',
    price: 19,
    billingInterval: 'MONTHLY',
    features: {
      signalSources: 10,
      brokerAccounts: 3,
      automationEnabled: true,
      copyTrading: true,
    },
  },
  {
    code: 'YEARLY',
    name: 'Yearly Plan',
    description: 'Access to full SignalForge platform for a full year.',
    price: 190,
    billingInterval: 'YEARLY',
    features: {
      signalSources: 25,
      brokerAccounts: 10,
      automationEnabled: true,
      copyTrading: true,
    },
  },
  {
    code: 'LIFETIME',
    name: 'Lifetime Plan',
    description: 'One-time payment, lifetime access.',
    price: 999,
    billingInterval: 'LIFETIME',
    features: {
      signalSources: 100,
      brokerAccounts: 25,
      automationEnabled: true,
      copyTrading: true,
    },
  },
  {
    code: 'ENTERPRISE',
    name: 'Enterprise Plan',
    description: 'Custom enterprise pricing and features.',
    price: 0,
    billingInterval: 'CUSTOM',
    features: {
      signalSources: -1,
      brokerAccounts: -1,
      automationEnabled: true,
      copyTrading: true,
    },
  },
];

(async () => {
  try {
    for (const plan of PLANS) {
      await db.query(
        `INSERT INTO subscription_plans
           (code, name, description, price, currency, billing_interval, features, active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'USD', $5, $6, TRUE, NOW(), NOW())
         ON CONFLICT (code) DO UPDATE
           SET name = EXCLUDED.name,
               description = EXCLUDED.description,
               price = EXCLUDED.price,
               billing_interval = EXCLUDED.billing_interval,
               features = EXCLUDED.features,
               updated_at = NOW()`,
        [
          plan.code,
          plan.name,
          plan.description,
          plan.price,
          plan.billingInterval,
          JSON.stringify(plan.features),
        ],
      );
    }

    logger.info('Subscription plans seeded');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Failed to seed plans');
    process.exit(1);
  } finally {
    await closePool();
  }
})();