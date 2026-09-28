'use strict';

const {
  PROOF_LEADERBOARD_WINDOWS,
  PROOF_LEADERBOARD_SORTS,
} = require('../../constants/proof-of-alpha');

/**
 * SignalForge - Proof Query Schema
 */

const PROOF_QUERY_SCHEMA = Object.freeze({
  type: 'object',
  properties: {
    window: { type: 'string', enum: Object.values(PROOF_LEADERBOARD_WINDOWS) },
    sortBy: { type: 'string', enum: Object.values(PROOF_LEADERBOARD_SORTS) },
    limit: { type: 'integer', minimum: 1, maximum: 200 },
    offset: { type: 'integer', minimum: 0 },
    providerId: { type: 'string' },
    status: { type: 'string' },
    kind: { type: 'string' },
    from: { type: 'string', format: 'date-time' },
    to: { type: 'string', format: 'date-time' },
  },
  additionalProperties: false,
});

function normalizeQuery(query = {}) {
  const result = {};

  if (query.window) {
    result.window = String(query.window).trim().toLowerCase();
  }
  if (query.sortBy) {
    result.sortBy = String(query.sortBy).trim().toLowerCase();
  }
  if (query.limit !== undefined) {
    const parsed = Number.parseInt(query.limit, 10);
    result.limit = Number.isNaN(parsed) ? null : parsed;
  }
  if (query.offset !== undefined) {
    const parsed = Number.parseInt(query.offset, 10);
    result.offset = Number.isNaN(parsed) ? null : parsed;
  }
  if (query.providerId) {
    result.providerId = String(query.providerId).trim();
  }
  if (query.status) {
    result.status = String(query.status).trim().toLowerCase();
  }
  if (query.kind) {
    result.kind = String(query.kind).trim().toLowerCase();
  }
  if (query.from) {
    result.from = String(query.from).trim();
  }
  if (query.to) {
    result.to = String(query.to).trim();
  }

  return result;
}

function validateQuery(query = {}) {
  const errors = [];

  if (query.window && !Object.values(PROOF_LEADERBOARD_WINDOWS).includes(query.window)) {
    errors.push('window is invalid');
  }

  if (query.sortBy && !Object.values(PROOF_LEADERBOARD_SORTS).includes(query.sortBy)) {
    errors.push('sortBy is invalid');
  }

  if (query.limit !== undefined && query.limit !== null) {
    if (typeof query.limit !== 'number' || query.limit < 1) {
      errors.push('limit must be a positive integer');
    }
  }

  if (query.offset !== undefined && query.offset !== null) {
    if (typeof query.offset !== 'number' || query.offset < 0) {
      errors.push('offset must be a non-negative integer');
    }
  }

  return { valid: errors.length === 0, errors };
}

function buildQueryString(query = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  return params.toString();
}

module.exports = {
  PROOF_QUERY_SCHEMA,
  normalizeQuery,
  validateQuery,
  buildQueryString,
};