/**
 * AI Log Repository
 *
 * @module signalforge/server/modules/ai-signal-intelligence/logs/repository
 */

import { AiRepository } from '../ai.repository.js';

export class AiLogRepository {
  constructor(db = null) {
    this.aiRepository = new AiRepository(db);
  }

  async create(data) {
    return this.aiRepository.createAiLog(data);
  }

  async list(filters, pagination) {
    return this.aiRepository.listAiLogs(filters, pagination);
  }

  async sumCost(filters) {
    return this.aiRepository.sumAiCost(filters);
  }
}

export default AiLogRepository;