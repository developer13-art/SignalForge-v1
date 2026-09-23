/**
 * Parser Repository
 *
 * Thin wrapper around the AI repository for parser-specific queries.
 *
 * @module signalforge/server/modules/ai-signal-intelligence/parser/repository
 */

import { AiRepository } from '../ai.repository.js';

export class ParserRepository {
  constructor(db = null) {
    this.aiRepository = new AiRepository(db);
  }

  async create(data) {
    return this.aiRepository.createSignalParse(data);
  }

  async findById(parseId) {
    return this.aiRepository.findSignalParseById(parseId);
  }

  async findByMessage(messageId) {
    return this.aiRepository.findSignalParsesByMessage(messageId);
  }

  async findLatestBySignal(signalId) {
    return this.aiRepository.findLatestSignalParseBySignal(signalId);
  }

  async list(filters, pagination) {
    return this.aiRepository.listSignalParses(filters, pagination);
  }
}

export default ParserRepository;