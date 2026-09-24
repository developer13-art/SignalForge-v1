/**
 * Certification Service
 *
 * @module signalforge/server/modules/providers/certification/service
 */

import { CertificationRepository } from './repository.js';
import { ProviderRepository } from '../provider.repository.js';
import { HistoricalImportService } from './historical-import.service.js';
import { BacktestingService } from './backtesting.js';
import { AccuracyCalculatorService } from './accuracy.js';
import { ConsistencyScoreService } from './consistency.js';
import { QualityScoreService } from './quality.js';
import { RiskAssessmentService } from './risk.js';
import { SandboxService } from './sandbox.js';
import {
  CERTIFICATION_STATUSES,
  CERTIFICATION_TIERS,
  DEFAULT_CERTIFICATION_MIN_ACCURACY,
  DEFAULT_CERTIFICATION_MIN_CONSISTENCY,
  DEFAULT_CERTIFICATION_MIN_QUALITY,
  DEFAULT_CERTIFICATION_MAX_RISK,
  DEFAULT_CERTIFICATION_VALIDITY_DAYS,
} from '../provider.constants.js';
import {
  CertificationNotFoundError,
  CertificationAlreadyRunningError,
  CertificationFailedError,
  ProviderNotFoundError,
} from '../provider.errors.js';
import {
  emitCertificationStarted,
  emitCertificationCompleted,
  emitCertificationFailed,
  emitCertificationRevoked,
  emitProviderCertified,
  emitProviderUncertified,
} from '../provider.events.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

export class CertificationService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new CertificationRepository();
    this.providerRepository =
      dependencies.providerRepository || new ProviderRepository();
    this.historical = dependencies.historical || new HistoricalImportService();
    this.backtest = dependencies.backtest || new BacktestingService();
    this.accuracy = dependencies.accuracy || new AccuracyCalculatorService();
    this.consistency = dependencies.consistency || new ConsistencyScoreService();
    this.quality = dependencies.quality || new QualityScoreService();
    this.risk = dependencies.risk || new RiskAssessmentService();
    this.sandbox = dependencies.sandbox || new SandboxService();
    this.parser = dependencies.parser || null;
    this.logger = getLogger('certification');
  }

  async startCertification(providerId, userId, options = {}) {
    const provider = await this.providerRepository.findById(providerId);
    if (!provider) {
      throw new ProviderNotFoundError();
    }
    if (provider.user_id !== userId) {
      throw new ProviderNotFoundError('Provider does not belong to this user');
    }

    const latest = await this.repository.findLatest(providerId);
    if (
      latest &&
      [
        CERTIFICATION_STATUSES.PENDING,
        CERTIFICATION_STATUSES.IMPORTING_HISTORY,
        CERTIFICATION_STATUSES.TRAINING,
        CERTIFICATION_STATUSES.BACKTESTING,
        CERTIFICATION_STATUSES.EVALUATING,
        CERTIFICATION_STATUSES.SANDBOX_RUNNING,
      ].includes(latest.status)
    ) {
      throw new CertificationAlreadyRunningError(undefined, {
        certificationId: latest.id,
        status: latest.status,
      });
    }

    const created = await this.repository.create({
      providerId,
      userId,
      status: CERTIFICATION_STATUSES.PENDING,
      version: options.version || '1.0.0',
      startedAt: new Date(),
    });

    await emitCertificationStarted(providerId, created.id);

    await this.providerRepository.update(providerId, {
      certificationStatus: CERTIFICATION_STATUSES.PENDING,
      certificationVersion: created.version,
    });

    try {
      const result = await this.runPipeline(providerId, created, options);
      return result;
    } catch (error) {
      await this.repository.update(created.id, {
        status: CERTIFICATION_STATUSES.FAILED,
        failedAt: new Date(),
        failureReason: error.message,
      });
      await this.providerRepository.update(providerId, {
        certificationStatus: CERTIFICATION_STATUSES.FAILED,
      });
      await emitCertificationFailed(providerId, created.id, error.message);
      throw error;
    }
  }

  async runPipeline(providerId, certification, options) {
    await this.repository.update(certification.id, {
      status: CERTIFICATION_STATUSES.IMPORTING_HISTORY,
    });
    await this.providerRepository.update(providerId, {
      certificationStatus: CERTIFICATION_STATUSES.IMPORTING_HISTORY,
    });

    const importResult = await this.historical.importForProvider(providerId, {
      historicalMessageLimit: options.historicalMessageLimit,
      certificationId: certification.id,
    });

    await this.repository.update(certification.id, {
      status: CERTIFICATION_STATUSES.BACKTESTING,
      historicalMessagesImported: importResult.messages.length,
    });
    await this.providerRepository.update(providerId, {
      certificationStatus: CERTIFICATION_STATUSES.BACKTESTING,
    });

    const parsedSignals = importResult.messages.map((m) => ({
      classification: 'NEW_TRADE',
      symbol: 'UNKNOWN',
      direction: 'BUY',
      validated: true,
      matched: false,
    }));

    const trades = [];
    const backtestSummary = await this.backtest.runBacktest(
      providerId,
      certification.id,
      importResult.messages,
      parsedSignals,
      trades,
    );

    await this.repository.update(certification.id, {
      status: CERTIFICATION_STATUSES.EVALUATING,
      signalsDetected: backtestSummary.signalsDetected,
      signalsValidated: backtestSummary.signalsValidated,
      parsingAccuracy: backtestSummary.parsingAccuracy,
      managementAccuracy: backtestSummary.managementAccuracy,
      consistencyScore: backtestSummary.consistencyScore,
      riskScore: backtestSummary.riskScore,
    });
    await this.providerRepository.update(providerId, {
      certificationStatus: CERTIFICATION_STATUSES.EVALUATING,
    });

    let sandboxResult = null;
    if (this.parser) {
      await this.repository.update(certification.id, {
        status: CERTIFICATION_STATUSES.SANDBOX_RUNNING,
      });
      sandboxResult = await this.sandbox.runSandbox(
        providerId,
        certification.id,
        importResult.messages,
        this.parser,
      );
    }

    const qualityScore = this.quality.calculate({
      parsingAccuracy: backtestSummary.parsingAccuracy,
      managementAccuracy: backtestSummary.managementAccuracy,
      validationRate: backtestSummary.validationRate,
      consistencyScore: backtestSummary.consistencyScore,
      tradeCount: backtestSummary.tradeCount,
    });

    const tier = this.quality.tierFromScore(qualityScore);

    const passesAccuracy = backtestSummary.parsingAccuracy >= DEFAULT_CERTIFICATION_MIN_ACCURACY;
    const passesConsistency =
      backtestSummary.consistencyScore >= DEFAULT_CERTIFICATION_MIN_CONSISTENCY;
    const passesQuality = qualityScore >= DEFAULT_CERTIFICATION_MIN_QUALITY;
    const passesRisk = backtestSummary.riskScore <= DEFAULT_CERTIFICATION_MAX_RISK;

    const certified = passesAccuracy && passesConsistency && passesQuality && passesRisk;
    const conditional =
      !certified &&
      passesAccuracy &&
      (passesConsistency || passesQuality) &&
      passesRisk;

    const finalStatus = certified
      ? CERTIFICATION_STATUSES.CERTIFIED
      : conditional
        ? CERTIFICATION_STATUSES.CONDITIONALLY_CERTIFIED
        : CERTIFICATION_STATUSES.FAILED;

    const expiresAt = new Date(
      Date.now() + DEFAULT_CERTIFICATION_VALIDITY_DAYS * 24 * 60 * 60 * 1000,
    );

    const recommendation = certified
      ? 'APPROVED_FOR_LIVE'
      : conditional
        ? 'APPROVED_WITH_MONITORING'
        : 'NOT_RECOMMENDED';

    await this.repository.update(certification.id, {
      status: finalStatus,
      tier: certified || conditional ? tier : null,
      qualityScore,
      certifiedAt: certified || conditional ? new Date() : null,
      expiresAt: certified || conditional ? expiresAt : null,
      failedAt: certified || conditional ? null : new Date(),
      recommendation,
      completedAt: new Date(),
      details: {
        passesAccuracy,
        passesConsistency,
        passesQuality,
        passesRisk,
        backtestSummary,
        sandboxSummary: sandboxResult?.summary || null,
      },
    });

    await this.providerRepository.update(providerId, {
      certificationStatus: finalStatus,
      certificationVersion: certification.version,
      consistencyScore: backtestSummary.consistencyScore,
      reputationScore: qualityScore,
    });

    if (certified || conditional) {
      await emitCertificationCompleted(providerId, certification.id, {
        tier,
        qualityScore,
      });
      await emitProviderCertified(providerId, certification.id, tier);
    } else {
      await emitCertificationFailed(providerId, certification.id, 'Failed certification thresholds');
    }

    const updated = await this.repository.findById(certification.id);
    return this.serialize(updated);
  }

  async getCertificationById(certificationId) {
    const row = await this.repository.findById(certificationId);
    if (!row) {
      throw new CertificationNotFoundError();
    }
    return this.serialize(row);
  }

  async getLatestCertification(providerId) {
    const row = await this.repository.findLatest(providerId);
    if (!row) {
      throw new CertificationNotFoundError();
    }
    return this.serialize(row);
  }

  async listCertifications(providerId, pagination) {
    const result = await this.repository.list(providerId, pagination);
    return {
      certifications: result.certifications.map((c) => this.serialize(c)),
      limit: result.limit,
      offset: result.offset,
    };
  }

  async revokeCertification(certificationId, actorId, reason) {
    const certification = await this.repository.findById(certificationId);
    if (!certification) {
      throw new CertificationNotFoundError();
    }

    await this.repository.update(certification.id, {
      status: CERTIFICATION_STATUSES.REVOKED,
      revokedAt: new Date(),
      revocationReason: reason || null,
      certifiedBy: actorId,
    });

    await this.providerRepository.update(certification.provider_id, {
      certificationStatus: CERTIFICATION_STATUSES.REVOKED,
    });

    await emitCertificationRevoked(certification.provider_id, certification.id, reason);
    await emitProviderUncertified(certification.provider_id, reason);

    const updated = await this.repository.findById(certification.id);
    return this.serialize(updated);
  }

  async expireDueCertifications() {
    const expired = await this.repository.findExpired();
    const results = { expired: 0 };

    for (const certification of expired) {
      await this.repository.update(certification.id, {
        status: CERTIFICATION_STATUSES.EXPIRED,
      });
      await this.providerRepository.update(certification.provider_id, {
        certificationStatus: CERTIFICATION_STATUSES.EXPIRED,
      });
      results.expired++;
    }

    return results;
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      providerId: row.provider_id,
      userId: row.user_id,
      status: row.status,
      version: row.version,
      tier: row.tier,
      parsingAccuracy: row.parsing_accuracy,
      managementAccuracy: row.management_accuracy,
      qualityScore: row.quality_score,
      riskScore: row.risk_score,
      consistencyScore: row.consistency_score,
      historicalMessagesImported: row.historical_messages_imported,
      signalsDetected: row.signals_detected,
      signalsValidated: row.signals_validated,
      recommendation: row.recommendation,
      certifiedBy: row.certified_by,
      certifiedAt: row.certified_at,
      expiresAt: row.expires_at,
      failedAt: row.failed_at,
      failureReason: row.failure_reason,
      revokedAt: row.revoked_at,
      revocationReason: row.revocation_reason,
      details: this.parseJson(row.details),
      metadata: this.parseJson(row.metadata),
      startedAt: row.started_at,
      completedAt: row.completed_at,
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

export { CertificationFailedError };

export default CertificationService;