/**
 * Referral Relationship Repository
 *
 * @module signalforge/server/modules/referrals/relationships/repository
 */

import { ReferralRepository } from '../referral.repository.js';

export class ReferralRelationshipRepository {
  constructor(db = null) {
    this.referralRepository = new ReferralRepository(db);
  }

  async create(data) {
    return this.referralRepository.createRelationship(data);
  }

  async findById(relationshipId) {
    return this.referralRepository.findRelationshipById(relationshipId);
  }

  async findByReferredUser(referredUserId) {
    return this.referralRepository.findRelationshipByReferredUser(referredUserId);
  }

  async listByReferrer(referrerId, filters) {
    return this.referralRepository.listRelationshipsByReferrer(referrerId, filters);
  }

  async countActive(referrerId) {
    return this.referralRepository.countActiveReferredUsers(referrerId);
  }

  async update(relationshipId, data) {
    return this.referralRepository.updateRelationship(relationshipId, data);
  }
}

export default ReferralRelationshipRepository;