/**
 * Referral Code Service
 *
 * @module signalforge/server/modules/referrals/codes/service
 */

import { ReferralCodeRepository } from './repository.js';
import { CodeGeneratorService } from './generator.js';
import { ReferralCodeNotFoundError, ReferralCodeAlreadyExistsError } from '../referral.errors.js';
import { emitCodeCreated, emitCodeRegenerated } from '../referral.events.js';

export class ReferralCodeService {
  constructor(repository = null, generator = null) {
    this.repository = repository || new ReferralCodeRepository();
    this.generator = generator || new CodeGeneratorService();
  }

  async getOrCreateForUser(userId) {
    const existing = await this.repository.findByUserId(userId);
    if (existing) {
      return this.serialize(existing);
    }
    return this.createForUser(userId);
  }

  async createForUser(userId, payload = {}) {
    const requestedCode = payload.code ? this.generator.normalize(payload.code) : null;
    const candidate = requestedCode || this.generator.generate();

    if (!this.generator.isValidFormat(candidate)) {
      throw new ReferralCodeAlreadyExistsError('Referral code format is invalid');
    }

    const created = await this.repository.create({
      userId,
      code: candidate,
      isActive: true,
    });

    if (!created) {
      throw new ReferralCodeAlreadyExistsError();
    }

    await emitCodeCreated(userId, created.id, created.code);
    return this.serialize(created);
  }

  async regenerate(userId) {
    const existing = await this.repository.findByUserId(userId);
    if (!existing) {
      return this.createForUser(userId);
    }

    const newCode = this.generator.generate();

    await this.repository.update(existing.id, { isActive: false });
    const created = await this.repository.create({
      userId,
      code: newCode,
      isActive: true,
    });

    if (!created) {
      throw new ReferralCodeAlreadyExistsError();
    }

    await emitCodeRegenerated(userId, created.id, existing.code, created.code);

    return this.serialize(created);
  }

  async getByCode(code) {
    const normalized = this.generator.normalize(code);
    if (!normalized) {
      throw new ReferralCodeNotFoundError();
    }
    const found = await this.repository.findByCode(normalized);
    if (!found || found.is_active !== true) {
      throw new ReferralCodeNotFoundError();
    }
    return this.serialize(found);
  }

  async resolveReferrer(code) {
    const normalized = this.generator.normalize(code);
    if (!normalized) {
      throw new ReferralCodeNotFoundError();
    }
    const found = await this.repository.findByCode(normalized);
    if (!found || found.is_active !== true) {
      throw new ReferralCodeNotFoundError();
    }
    return found.user_id;
  }

  async listCodesForUser(userId) {
    const rows = await this.repository.listForUser(userId);
    return rows.map((row) => this.serialize(row));
  }

  async incrementUsage(codeId) {
    await this.repository.incrementUsage(codeId);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      code: row.code,
      isActive: row.is_active,
      usageCount: row.usage_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default ReferralCodeService;