'use strict';

const {
  BLINK_TEMPLATE_DEFINITIONS,
  BLINK_ANALYTICS_WINDOWS,
  BLINK_ANALYTICS_GROUP_BY,
  BLINK_MAX_CONVERSIONS_PER_PAGE,
  BLINK_DEFAULT_CONVERSIONS_PER_PAGE,
} = require('./blink.constants');

const { InvalidParameterError } = require('../actions.errors');
const actionsValidator = require('../actions.validator');

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validateTemplateType(type) {
  if (!isNonEmptyString(type)) {
    throw new InvalidParameterError('Template type is required');
  }
  const normalized = String(type).trim().toLowerCase();
  if (!BLINK_TEMPLATE_DEFINITIONS[normalized]) {
    throw new InvalidParameterError(`Unsupported template type: ${normalized}`, {
      templateType: normalized,
      allowed: Object.keys(BLINK_TEMPLATE_DEFINITIONS),
    });
  }
  return normalized;
}

function validateTemplateDefinition(templateType, payload) {
  const definition = BLINK_TEMPLATE_DEFINITIONS[templateType];
  if (!definition) {
    throw new InvalidParameterError(`Unknown template type: ${templateType}`);
  }

  const missing = [];
  for (const field of definition.requiredFields) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw new InvalidParameterError(
      `Template ${templateType} is missing required fields: ${missing.join(', ')}`,
      { templateType, missing },
    );
  }

  return definition;
}

function validateCreateBlinkPayload(payload) {
  if (!isPlainObject(payload)) {
    throw new InvalidParameterError('Blink payload must be a JSON object');
  }

  const templateType = validateTemplateType(payload.templateType);
  validateTemplateDefinition(templateType, payload);

  const result = {
    templateType,
    title: actionsValidator.validateBlinkTitle(payload.title || BLINK_TEMPLATE_DEFINITIONS[templateType].defaultTitle),
    description: actionsValidator.validateBlinkDescription(
      payload.description || BLINK_TEMPLATE_DEFINITIONS[templateType].defaultDescription,
    ),
    label: actionsValidator.validateBlinkLabel(payload.label || BLINK_TEMPLATE_DEFINITIONS[templateType].defaultLabel),
    message: actionsValidator.validateBlinkMessage(payload.message),
  };

  if (payload.iconUrl) {
    result.iconUrl = actionsValidator.validateBlinkIconUrl(payload.iconUrl);
  }

  if (payload.website) {
    result.website = actionsValidator.validateBlinkWebsite(payload.website);
  }

  if (payload.planId) {
    result.planId = actionsValidator.validatePlanId(payload.planId);
  }

  if (payload.referralCode) {
    result.referralCode = actionsValidator.validateReferralCode(payload.referralCode);
  }

  if (payload.providerId) {
    result.providerId = String(payload.providerId).trim();
  }

  if (payload.tokenSymbol) {
    result.tokenSymbol = actionsValidator.validateTokenSymbol(payload.tokenSymbol);
  }

  if (payload.tokenMint) {
    result.tokenMint = actionsValidator.validateTokenMint(payload.tokenMint);
  }

  if (payload.amount !== undefined) {
    result.amount = actionsValidator.validateAmount(payload.amount, {
      min: 0.000001,
      max: 1000000,
      fieldName: 'amount',
    });
  }

  if (payload.amountDecimals !== undefined) {
    const decimals = Number.parseInt(payload.amountDecimals, 10);
    if (Number.isNaN(decimals) || decimals < 0 || decimals > 18) {
      throw new InvalidParameterError('amountDecimals must be an integer between 0 and 18');
    }
    result.amountDecimals = decimals;
  }

  if (payload.metadata !== undefined) {
    if (!isPlainObject(payload.metadata)) {
      throw new InvalidParameterError('metadata must be a JSON object');
    }
    result.metadata = payload.metadata;
  }

  return result;
}

function validateUpdateBlinkPayload(payload) {
  if (!isPlainObject(payload)) {
    throw new InvalidParameterError('Update payload must be a JSON object');
  }

  const result = {};

  if (payload.title !== undefined) {
    result.title = actionsValidator.validateBlinkTitle(payload.title);
  }
  if (payload.description !== undefined) {
    result.description = actionsValidator.validateBlinkDescription(payload.description);
  }
  if (payload.label !== undefined) {
    result.label = actionsValidator.validateBlinkLabel(payload.label);
  }
  if (payload.message !== undefined) {
    result.message = actionsValidator.validateBlinkMessage(payload.message);
  }
  if (payload.iconUrl !== undefined) {
    result.iconUrl = actionsValidator.validateBlinkIconUrl(payload.iconUrl);
  }
  if (payload.website !== undefined) {
    result.website = actionsValidator.validateBlinkWebsite(payload.website);
  }
  if (payload.planId !== undefined) {
    result.planId = actionsValidator.validatePlanId(payload.planId);
  }
  if (payload.referralCode !== undefined) {
    result.referralCode = actionsValidator.validateReferralCode(payload.referralCode);
  }
  if (payload.tokenSymbol !== undefined) {
    result.tokenSymbol = actionsValidator.validateTokenSymbol(payload.tokenSymbol);
  }
  if (payload.tokenMint !== undefined) {
    result.tokenMint = actionsValidator.validateTokenMint(payload.tokenMint);
  }
  if (payload.amount !== undefined) {
    result.amount = actionsValidator.validateAmount(payload.amount, {
      min: 0.000001,
      max: 1000000,
      fieldName: 'amount',
    });
  }
  if (payload.amountDecimals !== undefined) {
    const decimals = Number.parseInt(payload.amountDecimals, 10);
    if (Number.isNaN(decimals) || decimals < 0 || decimals > 18) {
      throw new InvalidParameterError('amountDecimals must be an integer between 0 and 18');
    }
    result.amountDecimals = decimals;
  }
  if (payload.metadata !== undefined) {
    if (!isPlainObject(payload.metadata)) {
      throw new InvalidParameterError('metadata must be a JSON object');
    }
    result.metadata = payload.metadata;
  }

  return result;
}

function validateBlinkId(blinkId) {
  if (!isNonEmptyString(blinkId)) {
    throw new InvalidParameterError('Blink identifier is required');
  }
  const trimmed = String(blinkId).trim();
  if (trimmed.length > 128) {
    throw new InvalidParameterError('Blink identifier is too long');
  }
  return trimmed;
}

function validateAnalyticsWindow(window) {
  if (!window) {
    return BLINK_ANALYTICS_WINDOWS.MONTH;
  }
  const normalized = String(window).trim().toLowerCase();
  const allowed = Object.values(BLINK_ANALYTICS_WINDOWS);
  if (!allowed.includes(normalized)) {
    throw new InvalidParameterError(`Invalid analytics window: ${normalized}`, {
      window: normalized,
      allowed,
    });
  }
  return normalized;
}

function validateAnalyticsGroupBy(groupBy) {
  if (!groupBy) {
    return BLINK_ANALYTICS_GROUP_BY.DAY;
  }
  const normalized = String(groupBy).trim().toLowerCase();
  const allowed = Object.values(BLINK_ANALYTICS_GROUP_BY);
  if (!allowed.includes(normalized)) {
    throw new InvalidParameterError(`Invalid analytics groupBy: ${normalized}`, {
      groupBy: normalized,
      allowed,
    });
  }
  return normalized;
}

function validateAnalyticsDateRange({ from, to }) {
  const result = { from: null, to: null };

  if (from) {
    const parsed = new Date(from);
    if (Number.isNaN(parsed.getTime())) {
      throw new InvalidParameterError('Invalid `from` date');
    }
    result.from = parsed.toISOString();
  }

  if (to) {
    const parsed = new Date(to);
    if (Number.isNaN(parsed.getTime())) {
      throw new InvalidParameterError('Invalid `to` date');
    }
    result.to = parsed.toISOString();
  }

  if (result.from && result.to && new Date(result.from) > new Date(result.to)) {
    throw new InvalidParameterError('`from` date must be earlier than `to` date');
  }

  return result;
}

function validatePagination({ page, pageSize } = {}) {
  const result = {
    page: Number.parseInt(page, 10) || 1,
    pageSize: Number.parseInt(pageSize, 10) || BLINK_DEFAULT_CONVERSIONS_PER_PAGE,
  };

  if (result.page < 1) {
    result.page = 1;
  }

  if (result.pageSize < 1) {
    result.pageSize = BLINK_DEFAULT_CONVERSIONS_PER_PAGE;
  }

  if (result.pageSize > BLINK_MAX_CONVERSIONS_PER_PAGE) {
    result.pageSize = BLINK_MAX_CONVERSIONS_PER_PAGE;
  }

  return result;
}

module.exports = {
  validateTemplateType,
  validateTemplateDefinition,
  validateCreateBlinkPayload,
  validateUpdateBlinkPayload,
  validateBlinkId,
  validateAnalyticsWindow,
  validateAnalyticsGroupBy,
  validateAnalyticsDateRange,
  validatePagination,
};