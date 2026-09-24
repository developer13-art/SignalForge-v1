/**
 * Referral Relationship Service
 *
 * @module signalforge/server/modules/referrals/relationships/service
 */

import { ReferralRelationshipRepository } from './repository.js';
import { ReferralCodeService } from '../codes/service.js';
import {
  REFERRAL_RELATIONSHIP_STATUSES,
} from '../referral.constants.js';
import {
  ReferralRelationshipAlreadyExistsError,
  SelfReferralError,
  ReferralCodeNotFoundError,
} from '../referral.errors.js';
import {
  emitRelationshipCreated,
  emitRelationshipSuspended,
  emitRelationshipTerminated,
} from '../referral.events.js';

export class ReferralRelationshipService {
  constructor(repository = null, codeService = null) {
    this.repository = repository || new ReferralRelationshipRepository();
    this.codes = codeService || new ReferralCodeService();
  }

  async createRelationship(referredUserId, referralCode, context = {}) {
    const existing = await this.repository.findByReferredUser(referredUserId);
    if (existing) {
      return this.serialize(existing);
    }

    let referrerId;
    try {
      referrerId = await this.codes.resolveReferrer(referralCode);
    } catch (error) {
      if (error instanceof ReferralCodeNotFoundError) {
        throw error;
      }
      throw error;
    }

    if (String(referrerId) === String(referredUserId)) {
      throw new SelfReferralError();
    }

    const created = await this.repository.create({
      referrerId,
      referredUserId,
      referralCode,
      status: REFERRAL_RELATIONSHIP_STATUSES.ACTIVE,
      attributionSource: context.attributionSource || 'SIGNUP',
      attributionContext: context.attributionContext || null,
    });

    if (!created) {
      throw new ReferralRelationshipAlreadyExistsError();
    }

    await emitRelationshipCreated(referrerId, referredUserId, created.id, {
      referralCode,
    });

    return this.serialize(created);
  }

  async getRelationshipForUser(referredUserId) {
    const row = await this.repository.findByReferredUser(referredUserId);
    return this.serialize(row);
  }

  async listRelationshipsForReferrer(referrerId, filters = {}) {
    const rows = await this.repository.listByReferrer(referrerId, filters);
    return rows.map((row) => this.serialize(row));
  }

  async suspend(referrerId, referredUserId, reason) {
    const relationship = await this.repository.findByReferredUser(referredUserId);
    if (!relationship || relationship.referrer_id !== referrerId) {
      return null;
    }
    await this.repository.update(relationship.id, {
      status: REFERRAL_RELATIONSHIP_STATUSES.SUSPENDED,
      suspendedAt: new Date(),
    });
    await emitRelationshipSuspended(referrerId, referredUserId, reason);
    return this.serialize(await this.repository.findById(relationship.id));
  }

  async terminate(referrerId, referredUserId, reason) {
    const relationship = await this.repository.findByReferredUser(referredUserId);
    if (!relationship || relationship.referrer_id !== referrerId) {
      return null;
    }
    await this.repository.update(relationship.id, {
      status: REFERRAL_RELATIONSHIP_STATUSES.TERMINATED,
      terminatedAt: new Date(),
    });
    await emitRelationshipTerminated(referrerId, referredUserId, reason);
    return this.serialize(await this.repository.findById(relationship.id));
  }

  async countActiveReferredUsers(referrerId) {
    return this.repository.countActive(referrerId);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      referrerId: row.referrer_id,
      referredUserId: row.referred_user_id,
      referralCode: row.referral_code,
      status: row.status,
      attributionSource: row.attribution_source,
      attributionContext: this.parseJson(row.attribution_context),
      suspendedAt: row.suspended_at,
      terminatedAt: row.terminated_at,
      metadata: this.parseJson(row.metadata),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  parseJson(input) {
    if (!input) {
      return null;
    }
    if (typeof input === 'string') {
      try {
        return JSON.parse(input);
      } catch {
        return null;
      }
    }
    return input;
  }
}

export default ReferralRelationshipService;