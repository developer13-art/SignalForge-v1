/**
 * Auth Validators
 *
 * @module signalforge/server/modules/auth/validator
 */
const { isValidEmail, normalizeEmail } = require('@signalforge/shared/validators/email.validator');
const { isValidPhone, normalizePhone } = require('@signalforge/shared/validators/phone.validator');
const { validatePassword } = require('@signalforge/shared/validators/password.validator');
const { validateUsername } = require('@signalforge/shared/validators/username.validator');
function validateRegisterPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  const email = normalizeEmail(body.email);
  if (!email) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Email format is invalid');
  }

  const passwordValidation = validatePassword(body.password);
  if (!passwordValidation.valid) {
    errors.push(...passwordValidation.errors.map((e) => `password: ${e}`));
  }

  if (!body.firstName || String(body.firstName).trim().length === 0) {
    errors.push('First name is required');
  } else if (String(body.firstName).length > 128) {
    errors.push('First name must not exceed 128 characters');
  }

  if (!body.lastName || String(body.lastName).trim().length === 0) {
    errors.push('Last name is required');
  } else if (String(body.lastName).length > 128) {
    errors.push('Last name must not exceed 128 characters');
  }

  if (body.username) {
    const usernameValidation = validateUsername(body.username);
    if (!usernameValidation.valid) {
      errors.push(...usernameValidation.errors.map((e) => `username: ${e}`));
    }
  }

  if (body.phone) {
    const rawPhone = String(body.phone).trim();
    const normalizedPhone = normalizePhone(rawPhone);
    if (!normalizedPhone || !isValidPhone(normalizedPhone)) {
      errors.push('Phone number is invalid');
    }
  }

  // Accept either `acceptTerms` or `agree` — the browser sends `agree`.
  const termsAccepted = body.acceptTerms === true || body.agree === true;
  if (!termsAccepted) {
    errors.push('You must accept the terms of service');
  }

  return { valid: errors.length === 0, errors };
}

function validateLoginPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  const email = normalizeEmail(body.email);
  if (!email) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Email format is invalid');
  }

  if (!body.password || typeof body.password !== 'string') {
    errors.push('Password is required');
  }

  return { valid: errors.length === 0, errors };
}
function validatePasswordResetRequestPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  const email = normalizeEmail(body.email);
  if (!email) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Email format is invalid');
  }

  return { valid: errors.length === 0, errors };
}
function validatePasswordResetPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.token || typeof body.token !== 'string') {
    errors.push('Reset token is required');
  }

  const passwordValidation = validatePassword(body.password);
  if (!passwordValidation.valid) {
    errors.push(...passwordValidation.errors.map((e) => `password: ${e}`));
  }

  if (body.password !== body.passwordConfirm) {
    errors.push('Passwords do not match');
  }

  return { valid: errors.length === 0, errors };
}
function validatePasswordChangePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.currentPassword || typeof body.currentPassword !== 'string') {
    errors.push('Current password is required');
  }

  const passwordValidation = validatePassword(body.newPassword);
  if (!passwordValidation.valid) {
    errors.push(...passwordValidation.errors.map((e) => `newPassword: ${e}`));
  }

  if (body.newPassword !== body.newPasswordConfirm) {
    errors.push('Passwords do not match');
  }

  if (body.currentPassword && body.newPassword && body.currentPassword === body.newPassword) {
    errors.push('New password must be different from the current password');
  }

  return { valid: errors.length === 0, errors };
}
function validateEmailVerificationPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.token || typeof body.token !== 'string') {
    errors.push('Verification token is required');
  }

  return { valid: errors.length === 0, errors };
}
function validatePhoneVerificationPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.code || typeof body.code !== 'string') {
    errors.push('Verification code is required');
  }

  return { valid: errors.length === 0, errors };
}
function validatePhoneVerifyRequestPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  const phone = body.phone;
  if (!phone || typeof phone !== 'string') {
    errors.push('Phone number is required');
  } else if (!isValidPhone(phone)) {
    errors.push('Phone number is invalid');
  }

  return { valid: errors.length === 0, errors };
}
function validateTwoFactorSetupPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.method && !['TOTP', 'SMS', 'EMAIL'].includes(body.method)) {
    errors.push('Two-factor method is invalid');
  }

  return { valid: errors.length === 0, errors };
}
function validateTwoFactorVerifyPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.code || typeof body.code !== 'string') {
    errors.push('Verification code is required');
  } else if (!/^\d{6,8}$/.test(body.code)) {
    errors.push('Verification code must be 6 to 8 digits');
  }

  if (body.challengeToken && typeof body.challengeToken !== 'string') {
    errors.push('Challenge token is invalid');
  }

  return { valid: errors.length === 0, errors };
}
function validateTwoFactorDisablePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.password || typeof body.password !== 'string') {
    errors.push('Password is required to disable two-factor authentication');
  }

  if (!body.code || typeof body.code !== 'string') {
    errors.push('Verification code is required to disable two-factor authentication');
  }

  return { valid: errors.length === 0, errors };
}
function validateRefreshTokenPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.refreshToken || typeof body.refreshToken !== 'string') {
    errors.push('Refresh token is required');
  }

  return { valid: errors.length === 0, errors };
}
function validateApiKeyCreatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.name || typeof body.name !== 'string') {
    errors.push('API key name is required');
  } else if (body.name.length > 128) {
    errors.push('API key name must not exceed 128 characters');
  }

  if (body.permissions && !Array.isArray(body.permissions)) {
    errors.push('Permissions must be an array');
  }

  if (body.ipWhitelist && !Array.isArray(body.ipWhitelist)) {
    errors.push('IP whitelist must be an array');
  }

  return { valid: errors.length === 0, errors };
}
function validateSocialLoginPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.provider || typeof body.provider !== 'string') {
    errors.push('Provider is required');
  } else if (!['google', 'facebook', 'apple', 'github'].includes(body.provider)) {
    errors.push('Provider is not supported');
  }

  if (!body.token || typeof body.token !== 'string') {
    errors.push('Provider token is required');
  }

  return { valid: errors.length === 0, errors };
}
function validateSolanaSignInPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.walletAddress || typeof body.walletAddress !== 'string') {
    errors.push('Wallet address is required');
  }

  if (!body.signature || typeof body.signature !== 'string') {
    errors.push('Signature is required');
  }

  if (!body.message || typeof body.message !== 'string') {
    errors.push('Signed message is required');
  }

  return { valid: errors.length === 0, errors };
}
module.exports.validateRegisterPayload = validateRegisterPayload;
module.exports.validateLoginPayload = validateLoginPayload;
module.exports.validatePasswordResetRequestPayload = validatePasswordResetRequestPayload;
module.exports.validatePasswordResetPayload = validatePasswordResetPayload;
module.exports.validatePasswordChangePayload = validatePasswordChangePayload;
module.exports.validateEmailVerificationPayload = validateEmailVerificationPayload;
module.exports.validatePhoneVerificationPayload = validatePhoneVerificationPayload;
module.exports.validatePhoneVerifyRequestPayload = validatePhoneVerifyRequestPayload;
module.exports.validateTwoFactorSetupPayload = validateTwoFactorSetupPayload;
module.exports.validateTwoFactorVerifyPayload = validateTwoFactorVerifyPayload;
module.exports.validateTwoFactorDisablePayload = validateTwoFactorDisablePayload;
module.exports.validateRefreshTokenPayload = validateRefreshTokenPayload;
module.exports.validateApiKeyCreatePayload = validateApiKeyCreatePayload;
module.exports.validateSocialLoginPayload = validateSocialLoginPayload;
module.exports.validateSolanaSignInPayload = validateSolanaSignInPayload;
