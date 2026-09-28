/**
 * DNA Rule Repository
 *
 * @module signalforge/server/modules/provider-dna/rules/repository
 */

import { DnaRepository } from '../dna.repository.js';

export class RuleRepository {
  constructor(db = null) {
    this.dnaRepository = new DnaRepository(db);
  }

  async create(data) {
    return this.dnaRepository.createRule(data);
  }

  async findById(ruleId) {
    return this.dnaRepository.findRuleById(ruleId);
  }

  async listByProvider(providerId, filters) {
    return this.dnaRepository.findRulesByProvider(providerId, filters);
  }

  async listEnabledByProvider(providerId) {
    return this.dnaRepository.findEnabledRulesByProvider(providerId);
  }

  async update(ruleId, data) {
    return this.dnaRepository.updateRule(ruleId, data);
  }

  async delete(ruleId) {
    return this.dnaRepository.deleteRule(ruleId);
  }

  async incrementUsage(ruleId, success) {
    return this.dnaRepository.incrementRuleUsage(ruleId, success);
  }

  async countByProvider(providerId) {
    return this.dnaRepository.countRulesByProvider(providerId);
  }
}

export default RuleRepository;