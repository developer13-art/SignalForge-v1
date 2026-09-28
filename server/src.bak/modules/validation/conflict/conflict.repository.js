/**
 * Conflict Repository
 *
 * @module signalforge/server/modules/validation/conflict/repository
 */

import { ValidationRepository } from '../validation.repository.js';

export class ConflictRepository {
  constructor(db = null) {
    this.validationRepository = new ValidationRepository(db);
  }

  async create(data) {
    return this.validationRepository.createConflict(data);
  }

  async findBySignal(signalId) {
    return this.validationRepository.findConflictsBySignal(signalId);
  }

  async findUnresolvedBySymbol(symbol, since) {
    return this.validationRepository.findUnresolvedConflictsBySymbol(symbol, since);
  }
}

export default ConflictRepository;