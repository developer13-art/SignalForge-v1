/**
 * Broker Module Errors
 *
 * @module signalforge/server/modules/brokers/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';
import { AuthorizationError } from '../../lib/errors/authorization-error.js';

export class BrokerNotFoundError extends NotFoundError {
  constructor(message = 'Broker not found', details = {}) {
    super(message, { code: 'BROKER_NOT_FOUND', details });
    this.name = 'BrokerNotFoundError';
  }
}

export class BrokerAccountNotFoundError extends NotFoundError {
  constructor(message = 'Broker account not found', details = {}) {
    super(message, { code: 'BROKER_ACCOUNT_NOT_FOUND', details });
    this.name = 'BrokerAccountNotFoundError';
  }
}

export class BrokerAccountAlreadyExistsError extends ConflictError {
  constructor(message = 'Broker account already exists') {
    super(message, { code: 'BROKER_ACCOUNT_ALREADY_EXISTS' });
    this.name = 'BrokerAccountAlreadyExistsError';
  }
}

export class BrokerAccountNotOwnedError extends AuthorizationError {
  constructor(message = 'Broker account does not belong to this user') {
    super(message, { code: 'BROKER_ACCOUNT_NOT_OWNED' });
    this.name = 'BrokerAccountNotOwnedError';
  }
}

export class BrokerConnectionError extends Error {
  constructor(message = 'Failed to connect to broker', details = {}) {
    super(message);
    this.name = 'BrokerConnectionError';
    this.code = 'BROKER_CONNECTION_ERROR';
    this.details = details;
  }
}

export class BrokerDeploymentError extends Error {
  constructor(message = 'Failed to deploy MetaApi account', details = {}) {
    super(message);
    this.name = 'BrokerDeploymentError';
    this.code = 'BROKER_DEPLOYMENT_ERROR';
    this.details = details;
  }
}

export class BrokerSyncError extends Error {
  constructor(message = 'Failed to sync broker account', details = {}) {
    super(message);
    this.name = 'BrokerSyncError';
    this.code = 'BROKER_SYNC_ERROR';
    this.details = details;
  }
}

export class BrokerCredentialError extends ValidationError {
  constructor(message = 'Broker credentials are invalid', details = {}) {
    super(message, { code: 'BROKER_CREDENTIAL_ERROR', details });
    this.name = 'BrokerCredentialError';
  }
}

export class UnsupportedBrokerPlatformError extends ValidationError {
  constructor(message = 'Unsupported broker platform', details = {}) {
    super(message, { code: 'UNSUPPORTED_BROKER_PLATFORM', details });
    this.name = 'UnsupportedBrokerPlatformError';
  }
}

export class BrokerRateLimitError extends Error {
  constructor(message = 'Broker gateway rate limit exceeded', details = {}) {
    super(message);
    this.name = 'BrokerRateLimitError';
    this.code = 'BROKER_RATE_LIMIT';
    this.details = details;
  }
}