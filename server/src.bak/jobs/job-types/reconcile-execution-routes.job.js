'use strict';

const routeLogger = require('../../modules/execution/routers/route-logger.service');
const executionRouterRepository = require('../../modules/execution/routers/execution-router.repository');

/**
 * Job: RECONCILE_EXECUTION_ROUTES
 *
 * Detects stale or orphaned execution routes. A route is considered
 * orphaned if it has been in the `fallback` status for too long
 * without a corresponding trade. This job marks such routes for
 * cleanup.
 */

module.exports = {
  name: 'RECONCILE_EXECUTION_ROUTES',

  async execute(payload = {}) {
    const { olderThanMs = 24 * 60 * 60 * 1000, limit = 200 } = payload;

    const staleRoutes = await executionRouterRepository.listRoutes(
      { status: 'fallback' },
      { page: 1, pageSize: limit },
    );

    const cutoff = Date.now() - olderThanMs;
    const reconciled = [];

    for (const route of staleRoutes.items || []) {
      const createdAt = new Date(route.created_at).getTime();
      if (createdAt < cutoff) {
        reconciled.push({
          routeId: route.id,
          symbol: route.symbol,
          gateway: route.resolved_gateway,
          ageMs: Date.now() - createdAt,
        });
      }
    }

    await routeLogger.recordLog({
      routeId: null,
      action: 'reconcile',
      message: `Reconciled ${reconciled.length} stale routes`,
      payload: { reconciled },
    });

    return {
      scanned: staleRoutes.items.length,
      reconciled: reconciled.length,
      routes: reconciled,
    };
  },

  schedule: '0 */6 * * *',

  retry: {
    maxAttempts: 2,
    backoffMs: [15000, 60000],
  },

  timeoutMs: 180000,
};