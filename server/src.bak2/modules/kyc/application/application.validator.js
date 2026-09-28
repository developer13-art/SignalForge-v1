/**
 * Application Validators
 *
 * @module signalforge/server/modules/kyc/application/validator
 */
const { validatePersonalInfoPayload } = require('../kyc.validator.js');
function validateCreateApplicationPayload(body) {
  const errors = [];

  if (body && body.personalInfo) {
    const infoResult = validatePersonalInfoPayload(body.personalInfo);
    if (!infoResult.valid) {
      errors.push(...infoResult.errors.map((e) => `personalInfo: ${e}`));
    }
  }

  return { valid: errors.length === 0, errors };
}
function validateSubmitApplicationPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.confirmAccuracy !== true) {
    errors.push('You must confirm the accuracy of the information provided');
  }

  if (body.acceptTerms !== true) {
    errors.push('You must accept the terms and conditions for KYC verification');
  }

  return { valid: errors.length === 0, errors };
}
function validateResubmitApplicationPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.personalInfo) {
    const infoResult = validatePersonalInfoPayload(body.personalInfo);
    if (!infoResult.valid) {
      errors.push(...infoResult.errors.map((e) => `personalInfo: ${e}`));
    }
  }

  if (body.confirmAccuracy !== true) {
    errors.push('You must confirm the accuracy of the information provided');
  }

  return { valid: errors.length === 0, errors };
}
module.exports.validateCreateApplicationPayload = validateCreateApplicationPayload;
module.exports.validateSubmitApplicationPayload = validateSubmitApplicationPayload;
module.exports.validateResubmitApplicationPayload = validateResubmitApplicationPayload;
