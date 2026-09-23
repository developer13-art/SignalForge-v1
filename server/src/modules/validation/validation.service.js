/**
 * Signal Validation Service
 *
 * Runs the complete validation pipeline against a standardized signal:
 * symbol, direction, price, expiry, completeness, source trust,
 * market tradability, account permission, session, duplicates, and
 * conflicts.
 *
 * @module signalforge/server/modules/validation/service
 */

import { ValidationRepository } from './validation.repository.js';
import { SymbolCheck } from './validators/symbol.validator.js';
import { DirectionCheck } from './validators/direction.validator.js';
import { PriceCheck } from './validators/price.validator.js';
import { ExpiryCheck } from './validators/expiry.validator.js';
import { CompletenessCheck } from './validators/completeness.validator.js';
import { SourceTrustCheck } from './validators/source-trust.validator.js';
import { MarketTradableCheck } from './validators/market-tradable.validator.js';
import { AccountPermissionCheck } from './validators/account-permission.validator.js';
import { SessionCheck } from './validators/session.validator.js';
import { DuplicateDetectorService } from './duplicate/duplicate-detector.service.js';
import { ConflictDetectorService } from './conflict/conflict-detector.service.js';
import {
  VALIDATION_RESULTS,
  getCheckSeverity,
  FAILED_CHECK_SEVERITY,
} from './validation.constants.js';
import {
  emitValidationStarted,
  emitValidationCompleted,
  emitValidationFailed,
  emitValidationCheckPassed,
  emitValidationCheckFailed,
} from './validation.events.js';

export class ValidationService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new ValidationRepository();
    this.duplicateDetector =
      dependencies.duplicateDetector || new DuplicateDetectorService();
    this.conflictDetector =
      dependencies.conflictDetector || new ConflictDetectorService();

    this.checks = dependencies.checks || [
      new SymbolCheck(),
      new DirectionCheck(),
      new PriceCheck(),
      new ExpiryCheck(),
      new CompletenessCheck(),
      new SourceTrustCheck(),
      new MarketTradableCheck(),
      new AccountPermissionCheck(),
      new SessionCheck(),
    ];
  }

  async validate(signal, options = {}) {
    const start = Date.now();

    await emitValidationStarted(signal.signalId, {
      providerId: signal.providerId,
      sourceId: signal.sourceId,
    });

    try {
      const checkResults = [];

      for (const check of this.checks) {
        let result;
        try {
          result = await check.run(signal, options);
        } catch (error) {
          result = {
            name: check.name,
            result: VALIDATION_RESULTS.FAILED,
            reason: `Check error: ${error.message}`,
          };
        }
        checkResults.push(result);

        if (result.result === VALIDATION_RESULTS.PASSED) {
          await emitValidationCheckPassed(signal.signalId, check.name);
        } else if (result.result === VALIDATION_RESULTS.FAILED) {
          await emitValidationCheckFailed(signal.signalId, check.name, result.reason);
        }
      }

      const duplicate = await this.duplicateDetector.detect(signal, options);
      if (duplicate.duplicate) {
        checkResults.push({
          name: 'DUPLICATE',
          result: VALIDATION_RESULTS.FAILED,
          reason: `Duplicate of signal ${duplicate.duplicateSignalId}`,
          details: duplicate,
        });
      } else {
        checkResults.push({ name: 'DUPLICATE', result: VALIDATION_RESULTS.PASSED });
      }

      const conflict = await this.conflictDetector.detect(signal, options);
      if (conflict.conflicting) {
        checkResults.push({
          name: 'CONFLICT',
          result: VALIDATION_RESULTS.WARNING,
          reason: `Conflicts with ${conflict.conflictCount} signal(s)`,
          details: conflict,
        });
      } else {
        checkResults.push({ name: 'CONFLICT', result: VALIDATION_RESULTS.PASSED });
      }

      const failedChecks = checkResults.filter(
        (c) => c.result === VALIDATION_RESULTS.FAILED,
      );

      const criticalFailures = failedChecks.filter(
        (c) => getCheckSeverity(c.name) === FAILED_CHECK_SEVERITY.CRITICAL,
      );

      const overallResult =
        criticalFailures.length > 0 || failedChecks.length > 0
          ? VALIDATION_RESULTS.FAILED
          : checkResults.some((c) => c.result === VALIDATION_RESULTS.WARNING)
            ? VALIDATION_RESULTS.WARNING
            : VALIDATION_RESULTS.PASSED;

      const durationMs = Date.now() - start;

      const stored = await this.repository.createValidation({
        signalId: signal.signalId,
        providerId: signal.providerId,
        sourceId: signal.sourceId,
        userId: options.userId || null,
        result: overallResult,
        checks: checkResults,
        failedChecks: failedChecks.map((c) => c.name),
        reason:
          overallResult === VALIDATION_RESULTS.FAILED
            ? failedChecks.map((c) => `${c.name}: ${c.reason}`).join('; ')
            : null,
        durationMs,
      });

      await emitValidationCompleted(signal.signalId, {
        result: overallResult,
        failedChecks: failedChecks.map((c) => c.name),
        durationMs,
      });

      if (overallResult === VALIDATION_RESULTS.FAILED) {
        await emitValidationFailed(signal.signalId, failedChecks.map((c) => c.reason).join('; '));
      }

      return {
        validationId: stored.id,
        signalId: signal.signalId,
        result: overallResult,
        checks: checkResults,
        failedChecks: failedChecks.map((c) => ({ name: c.name, reason: c.reason })),
        duplicate,
        conflict,
        durationMs,
      };
    } catch (error) {
      await emitValidationFailed(signal.signalId, error.message);
      throw error;
    }
  }

  async getById(validationId) {
    const row = await this.repository.findById(validationId);
    return this.serialize(row);
  }

  async getLatestBySignal(signalId) {
    const row = await this.repository.findLatestBySignal(signalId);
    return this.serialize(row);
  }

  async listBySignal(signalId) {
    const rows = await this.repository.listBySignal(signalId);
    return rows.map((r) => this.serialize(r));
  }

  async list(filters, pagination) {
    const result = await this.repository.list(filters, pagination);
    return {
      validations: result.validations.map((v) => this.serialize(v)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async stats(filters) {
    const [byResult, duplicates, conflicts] = await Promise.all([
      this.repository.countByResult(filters),
      this.duplicateDetector.findBySignal ? { count: 0 } : null,
      this.conflictDetector.findBySignal ? { count: 0 } : null,
    ]);
    return { byResult, duplicates, conflicts };
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      signalId: row.signal_id,
      providerId: row.provider_id,
      sourceId: row.source_id,
      userId: row.user_id,
      result: row.result,
      checks: row.checks,
      failedChecks: row.failed_checks,
      reason: row.reason,
      durationMs: row.duration_ms,
      metadata: row.metadata,
      createdAt: row.created_at,
    };
  }
}

export default ValidationService;