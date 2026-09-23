/**
 * DNA Version Service
 *
 * @module signalforge/server/modules/provider-dna/versioning/service
 */

import { VersionRepository } from './version.repository.js';
import { VersionDiffService } from './version-diff.service.js';
import { DnaRepository } from '../dna.repository.js';
import { DnaVersionNotFoundError } from '../dna.errors.js';
import { DNA_VERSION_RETENTION } from '../dna.constants.js';
import { emitDnaVersionCreated } from '../dna.events.js';

export class VersionService {
  constructor(repository = null, dnaRepository = null) {
    this.repository = repository || new VersionRepository();
    this.dnaRepository = dnaRepository || new DnaRepository();
    this.diffService = new VersionDiffService();
  }

  async createVersion(providerId, changeSummary, createdBy = null) {
    const dna = await this.dnaRepository.findDnaByProviderId(providerId);
    if (!dna) {
      throw new Error('Provider DNA not found');
    }

    const nextVersion = this.nextVersion(dna.version);
    const snapshot = {
      version: nextVersion,
      language: dna.language,
      symbolMappings: dna.symbol_mappings,
      abbreviationMappings: dna.abbreviation_mappings,
      riskStyle: dna.risk_style,
      tradeManagementStyle: dna.trade_management_style,
      confidence: dna.confidence,
      ruleCount: dna.rule_count,
    };

    const created = await this.repository.create({
      dnaId: dna.id,
      providerId,
      version: nextVersion,
      snapshot,
      changeSummary,
      createdBy,
    });

    await this.dnaRepository.updateDna(providerId, { version: nextVersion });
    await this.repository.prune(providerId, DNA_VERSION_RETENTION);
    await emitDnaVersionCreated(providerId, nextVersion);

    return created;
  }

  nextVersion(currentVersion) {
    const parts = String(currentVersion || '1.0.0').split('.').map(Number);
    const major = parts[0] || 1;
    const minor = parts[1] || 0;
    const patch = (parts[2] || 0) + 1;
    return `${major}.${minor}.${patch}`;
  }

  async listVersions(providerId, limit = DNA_VERSION_RETENTION) {
    return this.repository.listByProvider(providerId, limit);
  }

  async getVersion(providerId, versionId) {
    const version = await this.repository.findById(versionId);
    if (!version || version.provider_id !== providerId) {
      throw new DnaVersionNotFoundError();
    }
    return version;
  }

  async compareVersions(providerId, versionIdA, versionIdB) {
    const a = await this.getVersion(providerId, versionIdA);
    const b = await this.getVersion(providerId, versionIdB);
    const snapshotA = typeof a.snapshot === 'string' ? JSON.parse(a.snapshot) : a.snapshot;
    const snapshotB = typeof b.snapshot === 'string' ? JSON.parse(b.snapshot) : b.snapshot;
    return this.diffService.diff(snapshotA, snapshotB);
  }
}

export default VersionService;