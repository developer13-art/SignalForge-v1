/**
 * Signal Classification Service
 *
 * @module signalforge/server/modules/signal-classification/service
 */

import { ClassificationRepository } from './classification.repository.js';
import { ClassifierRegistry } from './classifiers/classifier.registry.js';
import { ClassificationScorerService } from './scoring/classification-scorer.service.js';
import { ClassificationThresholdService } from './scoring/classification-threshold.service.js';
import {
  CLASSIFIER_KINDS,
  DEFAULT_CLASSIFIER_KIND,
  CLASSIFICATION_TIMEOUT_MS,
} from './classification.constants.js';
import {
  ClassificationInputError,
  ClassificationTimeoutError,
} from './classification.errors.js';
import {
  emitClassificationStarted,
  emitClassificationCompleted,
  emitClassificationFailed,
  emitClassificationUncertain,
} from './classification.events.js';

function withTimeout(promise, timeoutMs, label) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new ClassificationTimeoutError(`${label} exceeded ${timeoutMs}ms`));
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

export class ClassificationService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new ClassificationRepository();
    this.scorer = dependencies.scorer || new ClassificationScorerService();
    this.threshold = dependencies.threshold || new ClassificationThresholdService();
    this.llmGateway = dependencies.llmGateway || null;
    this.defaultKind = dependencies.defaultKind || DEFAULT_CLASSIFIER_KIND;
  }

  async classifyMessage(message, options = {}) {
    if (!message || typeof message !== 'object') {
      throw new ClassificationInputError('Message must be an object');
    }

    const text = message.text || message.messageText || '';
    if (!text || typeof text !== 'string') {
      throw new ClassificationInputError('Message text is required');
    }

    await emitClassificationStarted(message.id || null, {
      sourceId: message.sourceId || null,
      userId: message.userId || null,
    });

    try {
      const kind = options.classifierKind || this.defaultKind;
      const classifier = ClassifierRegistry.create(kind, {
        llmGateway: this.llmGateway,
        ...options.classifierOptions,
      });

      const rawResult = await withTimeout(
        classifier.classify(message, options),
        options.timeoutMs || CLASSIFICATION_TIMEOUT_MS,
        `classifier:${kind}`,
      );

      const scored = this.scorer.scoreResult(rawResult);
      const level = this.scorer.classifyConfidenceLevel(rawResult.confidence);

      const stored = await this.repository.create({
        messageId: message.id || null,
        sourceId: message.sourceId || null,
        userId: message.userId || null,
        classification: rawResult.classification,
        confidence: rawResult.confidence,
        classifierKind: rawResult.classifierKind,
        classifierVersion: rawResult.classifierVersion,
        durationMs: rawResult.durationMs,
        signals: rawResult.signals,
        metadata: rawResult.metadata,
      });

      const result = {
        id: stored.id,
        messageId: message.id || null,
        classification: rawResult.classification,
        confidence: rawResult.confidence,
        classifierKind: rawResult.classifierKind,
        classifierVersion: rawResult.classifierVersion,
        durationMs: rawResult.durationMs,
        scored,
        level,
        executable: this.threshold.isExecutable(rawResult, options),
        requiresManualReview: this.threshold.requiresManualReview(rawResult, options),
        signals: rawResult.signals,
        metadata: rawResult.metadata,
      };

      await emitClassificationCompleted(message.id || null, result, {
        sourceId: message.sourceId || null,
        userId: message.userId || null,
      });

      if (result.requiresManualReview) {
        await emitClassificationUncertain(message.id || null, result);
      }

      return result;
    } catch (error) {
      await emitClassificationFailed(message.id || null, error, {
        sourceId: message.sourceId || null,
        userId: message.userId || null,
      });
      throw error;
    }
  }

  async getByMessageId(messageId) {
    const row = await this.repository.findByMessageId(messageId);
    return this.serialize(row);
  }

  async listByMessageId(messageId) {
    const rows = await this.repository.listByMessageId(messageId);
    return rows.map((r) => this.serialize(r));
  }

  async list(filters, pagination) {
    const result = await this.repository.list(filters, pagination);
    return {
      classifications: result.classifications.map((c) => this.serialize(c)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async stats(filters) {
    const [byClassification, average] = await Promise.all([
      this.repository.countByClassification(filters),
      this.repository.averageConfidence(filters),
    ]);
    return { byClassification, averageConfidence: average };
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      messageId: row.message_id,
      sourceId: row.source_id,
      userId: row.user_id,
      classification: row.classification,
      confidence: row.confidence,
      classifierKind: row.classifier_kind,
      classifierVersion: row.classifier_version,
      durationMs: row.duration_ms,
      signals: row.signals,
      metadata: row.metadata,
      createdAt: row.created_at,
    };
  }
}

export { CLASSIFIER_KINDS };

export default ClassificationService;