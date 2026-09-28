/**
 * Risk Decision Repository
 *
 * @module signalforge/server/modules/risk/decision/repository
 */

import { RiskRepository } from '../risk.repository.js';

export class DecisionRepository {
  constructor(db = null) {
    this.riskRepository = new RiskRepository(db);
  }

  async create(data) {
    return this.riskRepository.createDecision(data);
  }

  async findById(decisionId) {
    return this.riskRepository.findDecisionById(decisionId);
  }

  async findBySignal(signalId) {
    return this.riskRepository.findDecisionsBySignal(signalId);
  }

  async list(filters, pagination) {
    return this.riskRepository.listDecisions(filters, pagination);
  }

  async countByResult(filters) {
    return this.riskRepository.countDecisionsByResult(filters);
  }

  async createEvent(data) {
    return this.riskRepository.createRiskEvent(data);
  }

  async listEvents(filters, pagination) {
    return this.riskRepository.listRiskEvents(filters, pagination);
  }
}

export default DecisionRepository;