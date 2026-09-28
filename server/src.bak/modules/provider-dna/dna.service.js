/**
 * Provider DNA Service (facade)
 *
 * @module signalforge/server/modules/provider-dna/service
 */

import { DnaRepository } from './dna.repository.js';
import { LearningService } from './learning/learning.service.js';
import { RuleService } from './rules/rule.service.js';
import { ProfileService } from './profile/profile.service.js';
import { DnaTestService } from './testing/dna-test.service.js';
import { VersionService } from './versioning/version.service.js';
import { DnaNotFoundError } from './dna.errors.js';
import { emitDnaCreated, emitDnaUpdated } from './dna.events.js';

export class DnaService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new DnaRepository();
    this.learning = dependencies.learning || new LearningService({
      repository: this.repository,
    });
    this.rules = dependencies.rules || new RuleService(null, this.repository);
    this.profile = dependencies.profile || new ProfileService();
    this.tests = dependencies.tests || new DnaTestService();
    this.versions = dependencies.versions || new VersionService(null, this.repository);
  }

  async getDnaByProviderId(providerId) {
    const dna = await this.repository.findDnaByProviderId(providerId);
    if (!dna) {
      throw new DnaNotFoundError();
    }
    return this.serialize(dna);
  }

  async ensureDna(providerId, options = {}) {
    let dna = await this.repository.findDnaByProviderId(providerId);
    if (dna) {
      return this.serialize(dna);
    }
    dna = await this.repository.createDna({
      providerId,
      version: '1.0.0',
      language: options.language || null,
    });
    await emitDnaCreated(providerId, dna.id);
    return this.serialize(dna);
  }

  async updateDna(providerId, payload) {
    await this.repository.updateDna(providerId, payload);
    const updated = await this.repository.findDnaByProviderId(providerId);
    await emitDnaUpdated(providerId, Object.keys(payload));
    return this.serialize(updated);
  }

  async tryFastPath(providerId, message, options) {
    return this.learning.tryFastPath(providerId, message, options);
  }

  async learnFromHistory(providerId, messages, parsedSignals, options) {
    return this.learning.learnFromHistory(providerId, messages, parsedSignals, options);
  }

  async applyReinforcement(providerId) {
    return this.learning.applyReinforcement(providerId);
  }

  async recordOutcome(providerId, ruleId, success) {
    return this.learning.recordOutcome(providerId, ruleId, success);
  }

  async buildFullProfile(providerId) {
    return this.profile.buildFullProfile(providerId);
  }

  async runTest(providerId, inputText, meta) {
    return this.tests.runTest(providerId, inputText, meta);
  }

  async listTests(providerId, limit) {
    return this.tests.listTests(providerId, limit);
  }

  async createVersion(providerId, changeSummary, createdBy) {
    return this.versions.createVersion(providerId, changeSummary, createdBy);
  }

  async listVersions(providerId, limit) {
    return this.versions.listVersions(providerId, limit);
  }

  async getVersion(providerId, versionId) {
    return this.versions.getVersion(providerId, versionId);
  }

  async compareVersions(providerId, versionIdA, versionIdB) {
    return this.versions.compareVersions(providerId, versionIdA, versionIdB);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      providerId: row.provider_id,
      version: row.version,
      language: row.language,
      symbolMappings: row.symbol_mappings,
      abbreviationMappings: row.abbreviation_mappings,
      riskStyle: row.risk_style,
      tradeManagementStyle: row.trade_management_style,
      confidence: row.confidence,
      ruleCount: row.rule_count,
      active: row.active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default DnaService;