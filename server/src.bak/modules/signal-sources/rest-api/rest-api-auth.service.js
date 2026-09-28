/**
 * REST API Auth Service
 *
 * @module signalforge/server/modules/signal-sources/rest-api/auth
 */

import crypto from 'node:crypto';

import { RestApiRepository } from './rest-api.repository.js';
import { SourceConnectionError } from '../source.errors.js';

const API_KEY_PREFIX = 'sf_src_';

export class RestApiAuthService {
  constructor(repository = null) {
    this.repository = repository || new RestApiRepository();
  }

  generateKey() {
    const random = crypto.randomBytes(24).toString('base64url');
    const prefix = API_KEY_PREFIX + crypto.randomBytes(4).toString('hex');
    const key = `${prefix}_${random}`;
    return { key, prefix: key.substring(0, 16) };
  }

  hashKey(key) {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  async authenticate(req) {
    const headerKey = req.headers['x-api-key'];
    const key = typeof headerKey === 'string' ? headerKey : req.query.api_key;

    if (!key) {
      throw new SourceConnectionError('API key is required');
    }

    const prefix = key.substring(0, 16);
    const record = await this.repository.findKeyByPrefix(prefix);
    if (!record) {
      throw new SourceConnectionError('API key is invalid');
    }
    if (!record.enabled) {
      throw new SourceConnectionError('API key is disabled');
    }

    const expected = this.hashKey(key);
    if (expected.length !== record.hashed_key.length) {
      throw new SourceConnectionError('API key is invalid');
    }
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(record.hashed_key))) {
      throw new SourceConnectionError('API key is invalid');
    }

    await this.repository.updateKey(record.id, record.user_id, {
      lastUsedAt: new Date(),
    });

    return record;
  }
}

export default RestApiAuthService;