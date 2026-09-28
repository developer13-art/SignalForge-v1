/**
 * Broker Module Errors
 *
 * @module signalforge/server/modules/brokers/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
const { AuthorizationError } = require('../../lib/errors/authorization-error.js');
class BrokerNotFoundError extends NotFoundError {
  constructor(message = 'Broker not found', details = {}) {
    super(message, { code: 'BROKER_NOT_FOUND', details });
    this.name = 'BrokerNotFoundError';
  }
}
class BrokerAccountNotFoundError extends NotFoundError {
  constructor(message = 'Broker account not found', details = {}) {
    super(message, { code: 'BROKER_ACCOUNT_NOT_FOUND', details });
    this.name = 'BrokerAccountNotFoundError';
  }
}
class BrokerAccountAlreadyExistsError extends ConflictError {
  constructor(message = 'Broker account already exists') {
    super(message, { code: 'BROKER_ACCOUNT_ALREADY_EXISTS' });
    this.name = 'BrokerAccountAlreadyExistsError';
  }
}
class BrokerAccountNotOwnedError extends AuthorizationError {
  constructor(message = 'Broker account does not belong to this user') {
    super(message, { code: 'BROKER_ACCOUNT_NOT_OWNED' });
    this.name = 'BrokerAccountNotOwnedError';
  }
}
class BrokerConnectionError extends Error {
  constructor(message = 'Failed to connect to broker', details = {}) {
    super(message);
    this.name = 'BrokerConnectionError';
    this.code = 'BROKER_CONNECTION_ERROR';
    this.details = details;
  }
}
class BrokerDeploymentError extends Error {
  constructor(message = 'Failed to deploy MetaApi account', details = {}) {
    super(message);
    this.name = 'BrokerDeploymentError';
    this.code = 'BROKER_DEPLOYMENT_ERROR';
    this.details = details;
  }
}
class BrokerSyncError extends Error {
  constructor(message = 'Failed to sync broker account', details = {}) {
    super(message);
    this.name = 'BrokerSyncError';
    this.code = 'BROKER_SYNC_ERROR';
    this.details = details;
  }
}
class BrokerCredentialError extends ValidationError {
  constructor(message = 'Broker credentials are invalid', details = {}) {
    super(message, { code: 'BROKER_CREDENTIAL_ERROR', details });
    this.name = 'BrokerCredentialError';
  }
}
class UnsupportedBrokerPlatformError extends ValidationError {
  constructor(message = 'Unsupported broker platform', details = {}) {
    super(message, { code: 'UNSUPPORTED_BROKER_PLATFORM', details });
    this.name = 'UnsupportedBrokerPlatformError';
  }
}
class BrokerRateLimitError extends Error {
  constructor(message = 'Broker gateway rate limit exceeded', details = {}) {
    super(message);
    this.name = 'BrokerRateLimitError';
    this.code = 'BROKER_RATE_LIMIT';
    this.details = details;
  }
}
module.exports.BrokerNotFoundError = BrokerNotFoundError;
module.exports.BrokerAccountNotFoundError = BrokerAccountNotFoundError;
module.exports.BrokerAccountAlreadyExistsError = BrokerAccountAlreadyExistsError;
module.exports.BrokerAccountNotOwnedError = BrokerAccountNotOwnedError;
module.exports.BrokerConnectionError = BrokerConnectionError;
module.exports.BrokerDeploymentError = BrokerDeploymentError;
module.exports.BrokerSyncError = BrokerSyncError;
module.exports.BrokerCredentialError = BrokerCredentialError;
module.exports.UnsupportedBrokerPlatformError = UnsupportedBrokerPlatformError;
module.exports.BrokerRateLimitError = BrokerRateLimitError;
