/**
 * Duplicate Repository
 *
 * @module signalforge/server/modules/validation/duplicate/repository
 */

import { ValidationRepository } from '../validation.repository.js';

export class DuplicateRepository {
  constructor(db = null) {
    this.validationRepository = new ValidationRepository(db);
  }

  async create(data) {
    return this.validationRepository.createDuplicate(data);
  }

  async findBySignal(signalId) {
    return this.validationRepository.findDuplicatesBySignal(signalId);
  }
}

export default DuplicateRepository;