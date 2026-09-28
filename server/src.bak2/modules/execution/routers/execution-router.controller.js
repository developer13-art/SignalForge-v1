'use strict';

/**
 * Execution Router Controller
 *
 * HTTP layer for the execution router. Handlers delegate to the
 * execution router service; when the service is not yet available
 * (during early boot), handlers return a safe, well-formed response
 * so the platform can continue loading.
 *
 * @module signalforge/server/modules/execution/routers/controller
 */

let service = null;

try {
  // The service is optional at boot; if it is not yet present we
  // fall back to returning stub responses below.
  // eslint-disable-next-line global-require
  service = require('./execution-router.service');
} catch (_error) {
  service = null;
}

function resolveUserId(req) {
  return (req.user && req.user.id) || null;
}

async function resolveRoute(req, res, next) {
  try {
    const userId = resolveUserId(req);
    const payload = { ...(req.body || {}), userId };

    if (service && typeof service.resolveRoute === 'function') {
      const result = await service.resolveRoute({
        payload,
        context: {
          account: req.body?.account || null,
          kycVerified: req.user?.kycVerified === true,
        },
        requestId: req.requestId || null,
      });
      return res.status(200).json(result);
    }

    return res.status(200).json({
      resolved: false,
      reason: 'service_unavailable',
      message: 'Execution router service is not yet available.',
    });
  } catch (error) {
    return next(error);
  }
}

async function simulateRoute(req, res, next) {
  try {
    const userId = resolveUserId(req);
    const payload = { ...(req.body || {}), userId };

    if (service && typeof service.simulateRoute === 'function') {
      const result = await service.simulateRoute({
        payload,
        context: {
          account: req.body?.account || null,
          kycVerified: req.user?.kycVerified === true,
        },
      });
      return res.status(200).json(result);
    }

    return res.status(200).json({
      simulated: true,
      resolved: false,
      reason: 'service_unavailable',
      message: 'Execution router simulation is not yet available.',
    });
  } catch (error) {
    return next(error);
  }
}

async function explainRoute(req, res, next) {
  try {
    const userId = resolveUserId(req);
    const payload = { ...(req.body || {}), userId };

    if (service && typeof service.explainRoute === 'function') {
      const result = await service.explainRoute({
        symbol: req.body?.symbol,
        payload,
        context: {
          account: req.body?.account || null,
          kycVerified: req.user?.kycVerified === true,
        },
      });
      return res.status(200).json(result);
    }

    return res.status(200).json({
      symbol: req.body?.symbol || null,
      resolution: null,
      reason: 'service_unavailable',
      message: 'Execution router explanation is not yet available.',
    });
  } catch (error) {
    return next(error);
  }
}

async function listSupportedGateways(_req, res, next) {
  try {
    if (service && typeof service.listSupportedGateways === 'function') {
      const result = await service.listSupportedGateways();
      return res.status(200).json(result);
    }
    return res.status(200).json([]);
  } catch (error) {
    return next(error);
  }
}

async function getMetrics(_req, res, next) {
  try {
    if (service && typeof service.getMetricsSnapshot === 'function') {
      const result = await service.getMetricsSnapshot();
      return res.status(200).json(result);
    }
    return res.status(200).json({
      routesResolved: 0,
      routesFallback: 0,
      routesRejected: 0,
      latency: { samples: 0, averageMs: 0, minMs: 0, maxMs: 0 },
      gatewayCounts: {},
    });
  } catch (error) {
    return next(error);
  }
}

async function listPolicies(req, res, next) {
  try {
    const userId = resolveUserId(req);
    if (service && typeof service.listPolicies === 'function') {
      const result = await service.listPolicies(userId);
      return res.status(200).json(result);
    }
    return res.status(200).json([]);
  } catch (error) {
    return next(error);
  }
}

async function getPolicy(req, res, next) {
  try {
    const userId = resolveUserId(req);
    if (service && typeof service.getPolicyForUser === 'function') {
      const result = await service.getPolicyForUser(userId);
      return res.status(200).json(result);
    }
    return res.status(200).json({
      mode: 'auto',
      fallbackBehavior: 'retry_next',
    });
  } catch (error) {
    return next(error);
  }
}

async function savePolicy(req, res, next) {
  try {
    const userId = resolveUserId(req);
    if (service && typeof service.savePolicy === 'function') {
      const result = await service.savePolicy({
        userId,
        payload: req.body || {},
        requestId: req.requestId || null,
      });
      return res.status(200).json(result);
    }
    return res.status(200).json({
      accepted: false,
      reason: 'service_unavailable',
      message: 'Policy saving is not yet available.',
    });
  } catch (error) {
    return next(error);
  }
}

async function setDefaultPolicy(req, res, next) {
  try {
    const userId = resolveUserId(req);
    if (service && typeof service.setDefaultPolicy === 'function') {
      const result = await service.setDefaultPolicy({
        policyId: req.params.policyId,
        userId,
      });
      return res.status(200).json(result);
    }
    return res.status(200).json({
      accepted: false,
      reason: 'service_unavailable',
    });
  } catch (error) {
    return next(error);
  }
}

async function deletePolicy(req, res, next) {
  try {
    const userId = resolveUserId(req);
    if (service && typeof service.deletePolicy === 'function') {
      const result = await service.deletePolicy({
        id: req.params.policyId,
        userId,
      });
      return res.status(200).json({ deleted: result });
    }
    return res.status(200).json({ deleted: false, reason: 'service_unavailable' });
  } catch (error) {
    return next(error);
  }
}

async function listRoutes(req, res, next) {
  try {
    if (service && typeof service.listRoutes === 'function') {
      const result = await service.listRoutes({
        filters: {
          userId: resolveUserId(req),
          status: req.query.status,
          symbol: req.query.symbol,
        },
        pagination: {
          page: Number.parseInt(req.query.page, 10) || 1,
          pageSize: Number.parseInt(req.query.pageSize, 10) || 25,
        },
      });
      return res.status(200).json(result);
    }
    return res.status(200).json({ items: [], total: 0, page: 1, pageSize: 25 });
  } catch (error) {
    return next(error);
  }
}

async function getRoute(req, res, next) {
  try {
    if (service && typeof service.getRoute === 'function') {
      const result = await service.getRoute(req.params.routeId);
      if (!result) {
        return res.status(404).json({
          message: 'Route not found',
          error: { code: 'NOT_FOUND' },
        });
      }
      return res.status(200).json(result);
    }
    return res.status(404).json({
      message: 'Route not found',
      error: { code: 'NOT_FOUND' },
    });
  } catch (error) {
    return next(error);
  }
}

async function listRouteLogs(req, res, next) {
  try {
    if (service && typeof service.listLogs === 'function') {
      const result = await service.listLogs(req.params.routeId, {
        page: Number.parseInt(req.query.page, 10) || 1,
        pageSize: Number.parseInt(req.query.pageSize, 10) || 50,
      });
      return res.status(200).json(result);
    }
    return res.status(200).json({ items: [], total: 0, page: 1, pageSize: 50 });
  } catch (error) {
    return next(error);
  }
}

async function getUsage(req, res, next) {
  try {
    if (service && typeof service.aggregateUsage === 'function') {
      const result = await service.aggregateUsage({
        from: req.query.from,
        to: req.query.to,
      });
      return res.status(200).json(result);
    }
    return res.status(200).json({ results: [] });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  resolveRoute,
  simulateRoute,
  explainRoute,
  listSupportedGateways,
  getMetrics,
  listPolicies,
  getPolicy,
  savePolicy,
  setDefaultPolicy,
  deletePolicy,
  listRoutes,
  getRoute,
  listRouteLogs,
  getUsage,
};