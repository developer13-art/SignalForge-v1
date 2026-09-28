/**
 * White Label Validator
 *
 * Validation for white-label project payloads including branding,
 * domain, theme, and pricing updates.
 *
 * @module server/modules/white-label/white-label.validator
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';

const MAX_NAME_LENGTH = 128;
const MAX_BRAND_NAME_LENGTH = 128;
const MAX_DOMAIN_LENGTH = 253;
const MAX_COLOR_LENGTH = 32;
const MAX_URL_LENGTH = 512;
const DOMAIN_REGEX = /^(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}$/;

export function validateCreateProjectPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!payload.name || typeof payload.name !== 'string') {
    throw new AppError('Project name is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const name = payload.name.trim();

  if (name.length === 0 || name.length > MAX_NAME_LENGTH) {
    throw new AppError(`Project name must be between 1 and ${MAX_NAME_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let brandName = null;
  if (payload.brandName !== undefined && payload.brandName !== null) {
    if (typeof payload.brandName !== 'string') {
      throw new AppError('brandName must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    const trimmed = payload.brandName.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_BRAND_NAME_LENGTH) {
      throw new AppError(`brandName must be between 1 and ${MAX_BRAND_NAME_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
    }
    brandName = trimmed;
  }

  let brandDomain = null;
  if (payload.brandDomain !== undefined && payload.brandDomain !== null) {
    if (typeof payload.brandDomain !== 'string') {
      throw new AppError('brandDomain must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    const trimmed = payload.brandDomain.trim().toLowerCase();
    if (!DOMAIN_REGEX.test(trimmed)) {
      throw new AppError('brandDomain must be a valid domain', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    brandDomain = trimmed;
  }

  return { name, brandName, brandDomain };
}

export function validateBrandingPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const result = {};

  if (payload.brandName !== undefined) {
    if (typeof payload.brandName !== 'string') {
      throw new AppError('brandName must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    const trimmed = payload.brandName.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_BRAND_NAME_LENGTH) {
      throw new AppError(`brandName must be between 1 and ${MAX_BRAND_NAME_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
    }
    result.brandName = trimmed;
  }

  if (payload.logoUrl !== undefined) {
    if (payload.logoUrl === null) {
      result.logoUrl = null;
    } else if (typeof payload.logoUrl === 'string' && payload.logoUrl.length <= MAX_URL_LENGTH) {
      result.logoUrl = payload.logoUrl.trim();
    } else {
      throw new AppError('logoUrl is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
    }
  }

  if (payload.faviconUrl !== undefined) {
    if (payload.faviconUrl === null) {
      result.faviconUrl = null;
    } else if (typeof payload.faviconUrl === 'string' && payload.faviconUrl.length <= MAX_URL_LENGTH) {
      result.faviconUrl = payload.faviconUrl.trim();
    } else {
      throw new AppError('faviconUrl is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
    }
  }

  if (payload.primaryColor !== undefined) {
    result.primaryColor = validateColor(payload.primaryColor, 'primaryColor');
  }

  if (payload.secondaryColor !== undefined) {
    result.secondaryColor = validateColor(payload.secondaryColor, 'secondaryColor');
  }

  if (payload.supportEmail !== undefined) {
    if (payload.supportEmail === null) {
      result.supportEmail = null;
    } else if (typeof payload.supportEmail === 'string') {
      result.supportEmail = payload.supportEmail.trim();
    } else {
      throw new AppError('supportEmail is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
    }
  }

  return result;
}

function validateColor(value, fieldName) {
  if (value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    throw new AppError(`${fieldName} must be a string`, ERROR_CODES.VALIDATION_FAILED, 400);
  }
  const trimmed = value.trim();
  if (trimmed.length > MAX_COLOR_LENGTH) {
    throw new AppError(`${fieldName} is too long`, ERROR_CODES.VALIDATION_FAILED, 400);
  }
  if (!/^#?[0-9a-fA-F]{3,8}$/.test(trimmed)) {
    throw new AppError(`${fieldName} must be a valid hex color`, ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

export function validateThemePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const result = {};

  if (payload.mode !== undefined) {
    if (!['LIGHT', 'DARK', 'SYSTEM'].includes(payload.mode)) {
      throw new AppError('mode must be LIGHT, DARK, or SYSTEM', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    result.mode = payload.mode;
  }

  if (payload.fontFamily !== undefined) {
    if (typeof payload.fontFamily !== 'string' || payload.fontFamily.length > 64) {
      throw new AppError('fontFamily is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    result.fontFamily = payload.fontFamily.trim();
  }

  if (payload.customCss !== undefined) {
    if (payload.customCss === null) {
      result.customCss = null;
    } else if (typeof payload.customCss === 'string' && payload.customCss.length <= 20000) {
      result.customCss = payload.customCss;
    } else {
      throw new AppError('customCss is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
    }
  }

  if (payload.primaryColor !== undefined) {
    result.primaryColor = validateColor(payload.primaryColor, 'primaryColor');
  }

  if (payload.accentColor !== undefined) {
    result.accentColor = validateColor(payload.accentColor, 'accentColor');
  }

  return result;
}

export function validateDomainPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!payload.domain || typeof payload.domain !== 'string') {
    throw new AppError('domain is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const domain = payload.domain.trim().toLowerCase();

  if (domain.length > MAX_DOMAIN_LENGTH) {
    throw new AppError('domain is too long', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!DOMAIN_REGEX.test(domain)) {
    throw new AppError('domain is not a valid domain', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return { domain };
}

export function validatePricingPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const result = {};

  if (payload.monthlyPrice !== undefined) {
    const num = Number(payload.monthlyPrice);
    if (!Number.isFinite(num) || num < 0) {
      throw new AppError('monthlyPrice must be a non-negative number', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    result.monthlyPrice = num;
  }

  if (payload.yearlyPrice !== undefined) {
    const num = Number(payload.yearlyPrice);
    if (!Number.isFinite(num) || num < 0) {
      throw new AppError('yearlyPrice must be a non-negative number', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    result.yearlyPrice = num;
  }

  if (payload.currency !== undefined) {
    if (typeof payload.currency !== 'string' || payload.currency.length !== 3) {
      throw new AppError('currency must be a 3-letter code', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    result.currency = payload.currency.trim().toUpperCase();
  }

  return result;
}

export const WHITE_LABEL_VALIDATION_CONSTRAINTS = Object.freeze({
  maxNameLength: MAX_NAME_LENGTH,
  maxBrandNameLength: MAX_BRAND_NAME_LENGTH,
  maxDomainLength: MAX_DOMAIN_LENGTH,
  maxColorLength: MAX_COLOR_LENGTH,
  maxUrlLength: MAX_URL_LENGTH,
  domainPattern: DOMAIN_REGEX.source,
});