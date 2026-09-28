'use strict';

const actionsService = require('./actions.service');
const actionsValidator = require('./actions.validator');
const { ACTIONS_HANDLER_NAMES, ACTIONS_BLINK_TEMPLATE_TYPES } = require('./actions.constants');
const { InvalidActionError } = require('./actions.errors');

/**
 * SignalForge - Solana Actions HTTP Controller
 *
 * Thin translation layer that maps HTTP requests to service calls and
 * service results back to Solana Actions-compatible JSON responses.
 * All business rules live in the service layer.
 */

function resolveTemplateType(value) {
  if (!value) {
    throw new InvalidActionError('Action type is required');
  }
  const normalized = String(value).trim().toLowerCase();
  const allowed = Object.values(ACTIONS_BLINK_TEMPLATE_TYPES);
  if (!allowed.includes(normalized)) {
    throw new InvalidActionError(`Unsupported action type: ${normalized}`, {
      type: normalized,
      allowed,
    });
  }
  return normalized;
}

async function handleGet(req, res, next) {
  try {
    const templateType = resolveTemplateType(req.params.actionType);
    const query = actionsValidator.validateSolanaActionsGetQuery(req.query || {});

    const metadata = await actionsService.getActionMetadata({
      templateType,
      planId: query.planId,
      referralCode: query.referralCode,
      providerId: query.providerId,
      token: query.token,
    });

    return res.status(200).json(metadata);
  } catch (error) {
    return next(error);
  }
}

async function handlePost(req, res, next) {
  try {
    const templateType = resolveTemplateType(req.params.actionType);
    const body = req.body || {};
    const validatedBody = actionsValidator.validateSolanaActionsPostBody(body);

    const query = actionsValidator.validateSolanaActionsGetQuery(req.query || {});
    const idempotencyKey = actionsValidator.validateIdempotencyKey(
      req.headers['x-idempotency-key'] || req.headers['idempotency-key'] || null,
    );

    const result = await actionsService.handleActionPost({
      templateType,
      planId: query.planId,
      referralCode: query.referralCode,
      providerId: query.providerId,
      wallet: validatedBody.wallet,
      body: validatedBody.raw,
      requestId: req.actionsRequestId,
      idempotencyKey,
    });

    return res.status(200).json({
      transaction: result.transaction,
      message: result.message,
      conversionId: result.conversionId,
      reference: result.reference,
    });
  } catch (error) {
    return next(error);
  }
}

async function handleCreateBlink(req, res, next) {
  try {
    const payload = req.body || {};
    const templateType = resolveTemplateType(payload.templateType);
    const currentUser = req.user;

    const blink = await actionsService.createBlink({
      templateType,
      ownerUserId: currentUser?.id || null,
      providerId: payload.providerId || currentUser?.providerId || null,
      title: payload.title,
      description: payload.description,
      label: payload.label,
      message: payload.message,
      iconUrl: payload.iconUrl,
      website: payload.website,
      planId: payload.planId,
      referralCode: payload.referralCode,
      tokenSymbol: payload.tokenSymbol,
      tokenMint: payload.tokenMint,
      amount: payload.amount,
      amountDecimals: payload.amountDecimals,
      metadata: payload.metadata,
    });

    return res.status(201).json(blink);
  } catch (error) {
    return next(error);
  }
}

async function handleListBlinks(req, res, next) {
  try {
    const ownerUserId = req.user?.id || null;
    const providerId = req.query.providerId || null;
    const templateType = req.query.templateType || null;
    const status = req.query.status || null;
    const page = Number.parseInt(req.query.page, 10) || 1;
    const pageSize = Number.parseInt(req.query.pageSize, 10) || 20;

    const result = await actionsService.listBlinks({
      ownerUserId,
      providerId,
      templateType,
      status,
      page,
      pageSize,
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function handleGetBlink(req, res, next) {
  try {
    const blink = await actionsService.getBlink(req.params.blinkId);
    return res.status(200).json(blink);
  } catch (error) {
    return next(error);
  }
}

async function handlePauseBlink(req, res, next) {
  try {
    const blink = await actionsService.pauseBlink(req.params.blinkId);
    return res.status(200).json(blink);
  } catch (error) {
    return next(error);
  }
}

async function handleResumeBlink(req, res, next) {
  try {
    const blink = await actionsService.resumeBlink(req.params.blinkId);
    return res.status(200).json(blink);
  } catch (error) {
    return next(error);
  }
}

async function handleArchiveBlink(req, res, next) {
  try {
    const blink = await actionsService.archiveBlink(req.params.blinkId);
    return res.status(200).json(blink);
  } catch (error) {
    return next(error);
  }
}

async function handleRecordShare(req, res, next) {
  try {
    const share = await actionsService.recordShare({
      blinkId: req.params.blinkId,
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

async function handleRecordClick(req, res, next) {
  try {
    const click = await actionsService.recordClick({
      blinkId: req.params.blinkId,
      channel: req.body?.channel || req.query.channel || null,
      wallet: req.body?.wallet || null,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      requestId: req.actionsRequestId,
      metadata: req.body?.metadata || {},
    });
    return res.status(201).json(click);
  } catch (error) {
    return next(error);
  }
}

async function handleGetBlinkStats(req, res, next) {
  try {
    const stats = await actionsService.getBlinkStats(req.params.blinkId);
    return res.status(200).json(stats);
  } catch (error) {
    return next(error);
  }
}

async function handleGetOwnerStats(req, res, next) {
  try {
    const ownerUserId = req.user?.id || null;
    const stats = await actionsService.getOwnerStats(ownerUserId);
    return res.status(200).json(stats);
  } catch (error) {
    return next(error);
  }
}

async function handleListConversions(req, res, next) {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const pageSize = Number.parseInt(req.query.pageSize, 10) || 20;
    const status = req.query.status || null;
    const result = await actionsService.listConversions({
      blinkId: req.params.blinkId,
      status,
      page,
      pageSize,
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  handleGet,
  handlePost,
  handleCreateBlink,
  handleListBlinks,
  handleGetBlink,
  handlePauseBlink,
  handleResumeBlink,
  handleArchiveBlink,
  handleRecordShare,
  handleRecordClick,
  handleGetBlinkStats,
  handleGetOwnerStats,
  handleListConversions,
  ACTIONS_HANDLER_NAMES,
};