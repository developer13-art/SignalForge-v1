/**
 * Broker Validators
 *
 * @module signalforge/server/modules/brokers/validator
 */
const { BROKER_PLATFORM_VALUES } = require('./broker.constants.js');
function validateCreateBrokerPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.name || typeof body.name !== 'string') {
    errors.push('name is required');
  } else if (body.name.length > 128) {
    errors.push('name must not exceed 128 characters');
  }

  if (!body.platform || !BROKER_PLATFORM_VALUES.includes(body.platform)) {
    errors.push(`platform must be one of: ${BROKER_PLATFORM_VALUES.join(', ')}`);
  }

  if (body.server !== undefined && body.server !== null) {
    if (typeof body.server !== 'string' || body.server.length > 128) {
      errors.push('server must not exceed 128 characters');
    }
  }

  return { valid: errors.length === 0, errors };
}
function validateUpdateBrokerPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.name !== undefined && (typeof body.name !== 'string' || body.name.length > 128)) {
    errors.push('name must not exceed 128 characters');
  }

  if (body.platform !== undefined && !BROKER_PLATFORM_VALUES.includes(body.platform)) {
    errors.push(`platform must be one of: ${BROKER_PLATFORM_VALUES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}
module.exports.validateCreateBrokerPayload = validateCreateBrokerPayload;
module.exports.validateUpdateBrokerPayload = validateUpdateBrokerPayload;
