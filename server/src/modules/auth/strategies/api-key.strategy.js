/**
 * API Key Strategy
 *
 * Verifies API keys supplied via the `X-API-Key` header or the
 * `api_key` query parameter.
 *
 * @module signalforge/server/modules/auth/strategies/api-key
 */

import crypto from 'node:crypto';

import { InvalidTokenError } from '../auth.errors.js';

export class ApiKeyStrategy {
  constructor(repository) {
    this.repository = repository;
  }

  hashKey(key) {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  extractKey(req) {
    const header = req.headers['x-api-key'];
    if (typeof header === 'string' && header.length > 0) {
      return header;
    }
    if (typeof req.query.api_key === 'string' && req.query.api_key.length > 0) {
      return req.query.api_key;
    }
    return null;
  }

  async authenticate(req) {
    const key = this.extractKey(req);

    if (!key) {
      throw new InvalidTokenError('API key is missing');
    }

    const prefixLength = 8;
    const prefix = key.substring(0, prefixLength);

    const record = await this.repository.findApiKeyByPrefix(prefix);
    if (!record) {
      throw new InvalidTokenError('API key is invalid');
    }

    if (record.revoked_at) {
      throw new InvalidTokenError('API key has been revoked');
    }

    if (record.expires_at && new Date(record.expires_at).getTime() < Date.now()) {
      throw new InvalidTokenError('API key has expired');
    }

    const providedHash = this.hashKey(key);
    const storedHash = record.hashed_key;

    if (providedHash.length !== storedHash.length) {
      throw new InvalidTokenError('API key is invalid');
    }

    const valid = crypto.timingSafeEqual(
      Buffer.from(providedHash),
      Buffer.from(storedHash),
    );

    if (!valid) {
      throw new InvalidTokenError('API key is invalid');
    }

    const ip = req.ip;
    if (Array.isArray(record.ip_whitelist) && record.ip_whitelist.length > 0) {
      if (!record.ip_whitelist.includes(ip)) {
        throw new InvalidTokenError('IP address is not permitted for this API key');
      }
    }

    await this.repository.touchApiKey(record.id, ip);

    const user = await this.repository.findUserById(record.user_id);
    if (!user) {
      throw new InvalidTokenError('API key user not found');
    }

    return { user, apiKey: record };
  }
}

export default ApiKeyStrategy;