'use strict';

/**
 * Crypto Trading Controller
 *
 * HTTP layer for crypto positions, orders, history, and settings.
 * Every handler is thin: it reads from the request, delegates to the
 * service, and formats the response. Errors propagate to the
 * middleware chain.
 *
 * @module signalforge/server/modules/crypto-trading/controller
 */

const service = require('./crypto-trading.service');

function resolveUserId(req) {
  return (req.user && req.user.id) || null;
}

async function listPositions(req, res, next) {
  try {
    const userId = resolveUserId(req);
    const result = await service.listPositions(userId, {
      status: req.query.status,
      page: Number.parseInt(req.query.page, 10) || 1,
      pageSize: Number.parseInt(req.query.pageSize, 10) || 50,
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getPosition(req, res, next) {
  try {
    const userId = resolveUserId(req);
    const position = await service.getPosition(userId, req.params.positionId);
    if (!position) {
      return res.status(404).json({
        message: 'Position not found',
        error: { code: 'NOT_FOUND' },
      });
    }
    return res.status(200).json(position);
  } catch (error) {
    return next(error);
  }
}

async function closePosition(req, res, next) {
  try {
    const userId = resolveUserId(req);
    const result = await service.closePosition(userId, req.params.positionId, req.body || {});
    return res.status(202).json(result);
  } catch (error) {
    return next(error);
  }
}

async function listOrders(req, res, next) {
  try {
    const userId = resolveUserId(req);
    const result = await service.listOrders(userId, {
      status: req.query.status,
      page: Number.parseInt(req.query.page, 10) || 1,
      pageSize: Number.parseInt(req.query.pageSize, 10) || 50,
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getOrder(req, res, next) {
  try {
    const userId = resolveUserId(req);
    const order = await service.getOrder(userId, req.params.orderId);
    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
        error: { code: 'NOT_FOUND' },
      });
    }
    return res.status(200).json(order);
  } catch (error) {
    return next(error);
  }
}

async function cancelOrder(req, res, next) {
  try {
    const userId = resolveUserId(req);
    const result = await service.cancelOrder(userId, req.params.orderId);
    return res.status(202).json(result);
  } catch (error) {
    return next(error);
  }
}

async function listHistory(req, res, next) {
  try {
    const userId = resolveUserId(req);
    const result = await service.listHistory(userId, {
      page: Number.parseInt(req.query.page, 10) || 1,
      pageSize: Number.parseInt(req.query.pageSize, 10) || 25,
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function listSwaps(req, res, next) {
  try {
    const userId = resolveUserId(req);
    const result = await service.listSwaps(userId, {
      status: req.query.status,
      page: Number.parseInt(req.query.page, 10) || 1,
      pageSize: Number.parseInt(req.query.pageSize, 10) || 25,
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function quoteSwap(req, res, next) {
  try {
    const userId = resolveUserId(req);
    const result = await service.quoteSwap(userId, req.body || {});
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function buildSwap(req, res, next) {
  try {
    const userId = resolveUserId(req);
    const result = await service.buildSwap(userId, req.body || {});
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function submitSwap(req, res, next) {
  try {
    const userId = resolveUserId(req);
    const result = await service.submitSwap(userId, req.body || {});
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function confirmSwap(req, res, next) {
  try {
    const userId = resolveUserId(req);
    const result = await service.confirmSwap(userId, req.body || {});
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getTradingWallet(req, res, next) {
  try {
    const userId = resolveUserId(req);
    const wallet = await service.getTradingWallet(userId);
    return res.status(200).json(wallet);
  } catch (error) {
    return next(error);
  }
}

async function registerTradingWallet(req, res, next) {
  try {
    const userId = resolveUserId(req);
    const wallet = await service.registerTradingWallet(userId, req.body || {});
    return res.status(201).json(wallet);
  } catch (error) {
    return next(error);
  }
}

async function unregisterTradingWallet(req, res, next) {
  try {
    const userId = resolveUserId(req);
    await service.unregisterTradingWallet(userId);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

async function getRiskSettings(req, res, next) {
  try {
    const userId = resolveUserId(req);
    const settings = await service.getRiskSettings(userId);
    return res.status(200).json(settings);
  } catch (error) {
    return next(error);
  }
}

async function updateRiskSettings(req, res, next) {
  try {
    const userId = resolveUserId(req);
    const settings = await service.updateRiskSettings(userId, req.body || {});
    return res.status(200).json(settings);
  } catch (error) {
    return next(error);
  }
}

async function getAutomation(req, res, next) {
  try {
    const userId = resolveUserId(req);
    const rules = await service.getAutomation(userId);
    return res.status(200).json(rules);
  } catch (error) {
    return next(error);
  }
}

async function updateAutomation(req, res, next) {
  try {
    const userId = resolveUserId(req);
    const rules = await service.updateAutomation(userId, req.body || []);
    return res.status(200).json(rules);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listPositions,
  getPosition,
  closePosition,
  listOrders,
  getOrder,
  cancelOrder,
  listHistory,
  listSwaps,
  quoteSwap,
  buildSwap,
  submitSwap,
  confirmSwap,
  getTradingWallet,
  registerTradingWallet,
  unregisterTradingWallet,
  getRiskSettings,
  updateRiskSettings,
  getAutomation,
  updateAutomation,
};