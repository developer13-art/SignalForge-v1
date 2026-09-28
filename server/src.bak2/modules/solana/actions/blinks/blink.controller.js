'use strict';

const blinkService = require('./blink.service');
const blinkShareService = require('./blink-share.service');
const blinkAnalyticsService = require('./blink-analytics.service');
const blinkTemplateService = require('./blink-template.service');
const blinkValidator = require('./blink.validator');
const { InvalidParameterError } = require('../actions.errors');

/**
 * SignalForge - Blink HTTP Controller
 *
 * Translates HTTP requests for Blinks, shares, analytics, and templates
 * into service calls. Business rules live exclusively in services.
 */

function resolveOwnerContext(req) {
  if (!req.user) {
    return { ownerUserId: null, providerId: null };
  }
  return {
    ownerUserId: req.user.id || null,
    providerId: req.user.providerId || req.query.providerId || null,
  };
}

async function create(req, res, next) {
  try {
    const context = resolveOwnerContext(req);
    const blink = await blinkService.createBlink({
      ownerUserId: context.ownerUserId,
      providerId: context.providerId,
      payload: req.body || {},
    });
    return res.status(201).json(blink);
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    const context = resolveOwnerContext(req);
    const pagination = blinkValidator.validatePagination({
      page: req.query.page,
      pageSize: req.query.pageSize,
    });

    const result = await blinkService.listBlinks({
      ownerUserId: context.ownerUserId,
      providerId: context.providerId,
      templateType: req.query.templateType || null,
      status: req.query.status || null,
      page: pagination.page,
      pageSize: pagination.pageSize,
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    const blinkId = blinkValidator.validateBlinkId(req.params.blinkId);
    const blink = await blinkService.getBlinkWithUrl(blinkId);
    return res.status(200).json(blink);
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const blinkId = blinkValidator.validateBlinkId(req.params.blinkId);
    const updated = await blinkService.updateBlink(blinkId, req.body || {});
    return res.status(200).json(updated);
  } catch (error) {
    return next(error);
  }
}

async function pause(req, res, next) {
  try {
    const blinkId = blinkValidator.validateBlinkId(req.params.blinkId);
    const blink = await blinkService.pauseBlink(blinkId);
    return res.status(200).json(blink);
  } catch (error) {
    return next(error);
  }
}

async function resume(req, res, next) {
  try {
    const blinkId = blinkValidator.validateBlinkId(req.params.blinkId);
    const blink = await blinkService.resumeBlink(blinkId);
    return res.status(200).json(blink);
  } catch (error) {
    return next(error);
  }
}

async function archive(req, res, next) {
  try {
    const blinkId = blinkValidator.validateBlinkId(req.params.blinkId);
    const blink = await blinkService.archiveBlink(blinkId);
    return res.status(200).json(blink);
  } catch (error) {
    return next(error);
  }
}

async function recordShare(req, res, next) {
  try {
    const blinkId = blinkValidator.validateBlinkId(req.params.blinkId);
    const share = await blinkShareService.recordShare({
      blinkId,
      channel: req.body?.channel,
      sharedByUserId: req.user?.id || null,
      targetUrl: req.body?.targetUrl,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      metadata: req.body?.metadata || {},
    });
    return res.status(201).json(share);
  } catch (error) {
    return next(error);
  }
}

async function listShares(req, res, next) {
  try {
    const blinkId = blinkValidator.validateBlinkId(req.params.blinkId);
    const pagination = blinkValidator.validatePagination({
      page: req.query.page,
      pageSize: req.query.pageSize,
    });
    const result = await blinkShareService.listSharesByBlink({
      blinkId,
      page: pagination.page,
      pageSize: pagination.pageSize,
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function buildShareLinks(req, res, next) {
  try {
    const blinkId = blinkValidator.validateBlinkId(req.params.blinkId);
    const links = await blinkShareService.buildShareLinks({
      blinkId,
      text: req.body?.text,
      via: req.body?.via,
      hashtags: req.body?.hashtags,
      channels: req.body?.channels,
    });
    return res.status(200).json(links);
  } catch (error) {
    return next(error);
  }
}

async function getAnalytics(req, res, next) {
  try {
    const blinkId = blinkValidator.validateBlinkId(req.params.blinkId);
    const analytics = await blinkAnalyticsService.getBlinkAnalytics({
      blinkId,
      window: req.query.window,
      groupBy: req.query.groupBy,
      from: req.query.from,
      to: req.query.to,
    });
    return res.status(200).json(analytics);
  } catch (error) {
    return next(error);
  }
}

async function getFunnel(req, res, next) {
  try {
    const blinkId = blinkValidator.validateBlinkId(req.params.blinkId);
    const funnel = await blinkAnalyticsService.getBlinkFunnel({
      blinkId,
      window: req.query.window,
      from: req.query.from,
      to: req.query.to,
    });
    return res.status(200).json(funnel);
  } catch (error) {
    return next(error);
  }
}

async function getOwnerAnalytics(req, res, next) {
  try {
    if (!req.user?.id) {
      throw new InvalidParameterError('Authentication is required');
    }
    const analytics = await blinkAnalyticsService.getOwnerAnalytics({
      ownerUserId: req.user.id,
      window: req.query.window,
      from: req.query.from,
      to: req.query.to,
    });
    return res.status(200).json(analytics);
  } catch (error) {
    return next(error);
  }
}

async function getTopConversions(req, res, next) {
  try {
    const blinkId = blinkValidator.validateBlinkId(req.params.blinkId);
    const limit = Number.parseInt(req.query.limit, 10) || 20;
    const conversions = await blinkAnalyticsService.getTopConversions({
      blinkId,
      window: req.query.window,
      from: req.query.from,
      to: req.query.to,
      limit,
    });
    return res.status(200).json(conversions);
  } catch (error) {
    return next(error);
  }
}

async function createTemplate(req, res, next) {
  try {
    const context = resolveOwnerContext(req);
    const template = await blinkTemplateService.createTemplate({
      ownerUserId: context.ownerUserId,
      providerId: context.providerId,
      payload: req.body || {},
    });
    return res.status(201).json(template);
  } catch (error) {
    return next(error);
  }
}

async function listTemplates(req, res, next) {
  try {
    const context = resolveOwnerContext(req);
    const pagination = blinkValidator.validatePagination({
      page: req.query.page,
      pageSize: req.query.pageSize,
    });
    const result = await blinkTemplateService.listTemplates({
      ownerUserId: context.ownerUserId,
      providerId: context.providerId,
      templateType: req.query.templateType || null,
      page: pagination.page,
      pageSize: pagination.pageSize,
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getTemplate(req, res, next) {
  try {
    const template = await blinkTemplateService.getTemplate(req.params.templateId);
    return res.status(200).json(template);
  } catch (error) {
    return next(error);
  }
}

async function updateTemplate(req, res, next) {
  try {
    const template = await blinkTemplateService.updateTemplate(
      req.params.templateId,
      req.body || {},
    );
    return res.status(200).json(template);
  } catch (error) {
    return next(error);
  }
}

async function deleteTemplate(req, res, next) {
  try {
    const result = await blinkTemplateService.deleteTemplate(req.params.templateId);
    return res.status(200).json({ deleted: result });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  create,
  list,
  getById,
  update,
  pause,
  resume,
  archive,
  recordShare,
  listShares,
  buildShareLinks,
  getAnalytics,
  getFunnel,
  getOwnerAnalytics,
  getTopConversions,
  createTemplate,
  listTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
};