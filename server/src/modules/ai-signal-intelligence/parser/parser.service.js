/**
 * Parser Service
 *
 * Orchestrates parsing of a message into structured trade fields.
 * Uses the LLM gateway for full inference on the Learning Path and
 * a deterministic rule-based path as a first attempt.
 *
 * @module signalforge/server/modules/ai-signal-intelligence/parser/service
 */

import { ParserRepository } from './parser.repository.js';
import { PromptManagerService } from '../llm/prompt-manager.service.js';
import { LlmGatewayService } from '../llm/llm-gateway.service.js';
import { NormalizerService } from '../normalization/normalizer.service.js';
import { PromptInjectionGuardService } from '../safety/prompt-injection-guard.service.js';
import { SafetyFilterService } from '../safety/safety-filter.service.js';
import { SymbolExtractorService } from './symbol-extractor.service.js';
import { DirectionNormalizerService } from '../normalization/direction-normalizer.service.js';
import { EntryExtractorService } from './entry-extractor.service.js';
import { SlExtractorService } from './sl-extractor.service.js';
import { TpExtractorService } from './tp-extractor.service.js';
import { RiskExtractorService } from './risk-extractor.service.js';
import { TimeframeExtractorService } from './timeframe-extractor.service.js';
import { ContextExtractorService } from './context-extractor.service.js';
import { IntentExtractorService } from './intent-extractor.service.js';
import { OrderTypeExtractorService } from './order-type-extractor.service.js';
import { LanguageService } from './language.service.js';
import { PARSER_TYPES, DEFAULT_PARSER_TIMEOUT_MS } from '../ai.constants.js';
import {
  AiParsingTimeoutError,
  AiParsingError,
  AiParsingInvalidResponseError,
} from '../ai.errors.js';
import {
  emitParsingStarted,
  emitParsingCompleted,
  emitParsingFailed,
} from '../ai.events.js';

function withTimeout(promise, timeoutMs, label) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new AiParsingTimeoutError(`${label} exceeded ${timeoutMs}ms`));
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

export class ParserService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new ParserRepository();
    this.promptManager = dependencies.promptManager || new PromptManagerService();
    this.llmGateway = dependencies.llmGateway || new LlmGatewayService();
    this.normalizer = dependencies.normalizer || new NormalizerService();
    this.injectionGuard =
      dependencies.injectionGuard || new PromptInjectionGuardService();
    this.safetyFilter = dependencies.safetyFilter || new SafetyFilterService();

    this.symbolExtractor = new SymbolExtractorService();
    this.directionNormalizer = new DirectionNormalizerService();
    this.entryExtractor = new EntryExtractorService();
    this.slExtractor = new SlExtractorService();
    this.tpExtractor = new TpExtractorService();
    this.riskExtractor = new RiskExtractorService();
    this.timeframeExtractor = new TimeframeExtractorService();
    this.contextExtractor = new ContextExtractorService();
    this.intentExtractor = new IntentExtractorService();
    this.orderTypeExtractor = new OrderTypeExtractorService();
    this.language = new LanguageService();
  }

  async parseMessage(message, options = {}) {
    if (!message || typeof message !== 'object') {
      throw new AiParsingError('Message must be an object');
    }

    const text = message.text || message.messageText || '';
    if (!text || typeof text !== 'string') {
      throw new AiParsingError('Message text is required');
    }

    const messageId = message.id || message.messageId || null;

    await emitParsingStarted(messageId, options.provider || 'auto', {
      sourceId: message.sourceId || null,
      userId: message.userId || null,
    });

    try {
      await this.injectionGuard.assertSafe(text, { messageId });
      await this.safetyFilter.filter(text, { messageId });

      const context = this.contextExtractor.extractContext(message, options.history || []);
      const detectedLanguage = this.language.detect(text);

      const fastPathResult = this.tryFastPath(text, message);
      if (fastPathResult && fastPathResult.confidence >= (options.fastPathThreshold || 0.9)) {
        const stored = await this.persistResult({
          messageId,
          sourceId: message.sourceId || null,
          userId: message.userId || null,
          parserType: PARSER_TYPES.FAST_PATH,
          parserVersion: '1.0.0',
          aiModel: null,
          confidenceScore: fastPathResult.confidence,
          latencyMs: 0,
          extractedFields: fastPathResult.extracted,
          rawResponse: null,
          metadata: { language: detectedLanguage, context },
        });

        const result = {
          ...fastPathResult,
          parseId: stored.id,
          parserType: PARSER_TYPES.FAST_PATH,
          latencyMs: 0,
          language: detectedLanguage,
          context,
        };

        await emitParsingCompleted(messageId, result, {
          sourceId: message.sourceId || null,
          userId: message.userId || null,
        });

        return result;
      }

      return await withTimeout(
        this.runLearningPath({
          message,
          messageId,
          text,
          context,
          language: detectedLanguage,
          options,
        }),
        options.timeoutMs || DEFAULT_PARSER_TIMEOUT_MS,
        `parser:${messageId}`,
      );
    } catch (error) {
      await emitParsingFailed(messageId, error, {
        sourceId: message.sourceId || null,
        userId: message.userId || null,
      });
      throw error;
    }
  }

  tryFastPath(text, message) {
    const symbol = this.symbolExtractor.extract(text);
    const direction = this.directionNormalizer.extractFromText(text);
    const intent = this.intentExtractor.extract(text);

    if (!symbol || !direction) {
      return null;
    }

    const entryPrice = this.entryExtractor.extract(text);
    const stopLoss = this.slExtractor.extract(text);
    const takeProfits = this.tpExtractor.extract(text);
    const { riskPercent, lotSize } = this.riskExtractor.extract(text);
    const timeframe = this.timeframeExtractor.extract(text);
    const entryType = this.orderTypeExtractor.extract(text);

    const confidence = this.scoreFastPath({
      symbol,
      direction,
      intent,
      entryPrice,
      stopLoss,
      takeProfits,
    });

    const extracted = {
      intent,
      symbol,
      direction,
      entryType,
      entryPrice,
      stopLoss,
      takeProfits,
      riskPercent,
      lotSize,
      timeframe,
      confidence,
      reasoning: 'fast_path_regex_extraction',
    };

    const normalized = this.normalizer.normalize(extracted, {
      messageId: message?.id || null,
    });

    return {
      parsed: extracted,
      extracted: normalized,
      confidence,
      classifierKind: PARSER_TYPES.FAST_PATH,
    };
  }

  scoreFastPath(fields) {
    let score = 0.4;
    if (fields.symbol) {
      score += 0.15;
    }
    if (fields.direction) {
      score += 0.15;
    }
    if (fields.entryPrice !== null && fields.entryPrice !== undefined) {
      score += 0.1;
    }
    if (fields.stopLoss !== null && fields.stopLoss !== undefined) {
      score += 0.1;
    }
    if (Array.isArray(fields.takeProfits) && fields.takeProfits.length > 0) {
      score += 0.1;
    }
    return Math.min(1, Number(score.toFixed(4)));
  }

  async runLearningPath({ message, messageId, text, context, language, options }) {
    const request = this.promptManager.buildRequest('SIGNAL_PARSING', text, {
      purpose: 'signal_parsing',
      temperature: 0.1,
      maxTokens: 1000,
    });

    const response = await this.llmGateway.complete(request, {
      pricePer1kTokens: options.pricePer1kTokens,
    });

    const parsed = this.parseJsonResponse(response.content);
    if (!parsed) {
      throw new AiParsingInvalidResponseError('LLM did not return valid JSON', {
        content: response.content,
      });
    }

    const normalized = this.normalizer.normalize(parsed, { messageId });

    const stored = await this.persistResult({
      messageId,
      sourceId: message.sourceId || null,
      userId: message.userId || null,
      parserType: PARSER_TYPES.LEARNING_PATH,
      parserVersion: request.templateVersion,
      aiModel: response.model,
      confidenceScore: normalized.confidence ?? 0.5,
      latencyMs: response.latencyMs,
      extractedFields: normalized,
      rawResponse: parsed,
      metadata: {
        language,
        context,
        tokens: {
          prompt: response.promptTokens,
          completion: response.completionTokens,
          total: response.totalTokens,
        },
        estimatedCostUsd: response.estimatedCostUsd,
      },
    });

    const result = {
      parseId: stored.id,
      parsed,
      extracted: normalized,
      confidence: normalized.confidence ?? 0.5,
      classifierKind: PARSER_TYPES.LEARNING_PATH,
      parserType: PARSER_TYPES.LEARNING_PATH,
      parserVersion: request.templateVersion,
      aiModel: response.model,
      latencyMs: response.latencyMs,
      language,
      context,
    };

    await emitParsingCompleted(messageId, result, {
      sourceId: message.sourceId || null,
      userId: message.userId || null,
    });

    return result;
  }

  parseJsonResponse(content) {
    if (!content || typeof content !== 'string') {
      return null;
    }
    try {
      const start = content.indexOf('{');
      const end = content.lastIndexOf('}');
      if (start === -1 || end === -1) {
        return null;
      }
      return JSON.parse(content.substring(start, end + 1));
    } catch {
      return null;
    }
  }

  async persistResult(data) {
    return this.repository.create(data);
  }

  async getParseById(parseId) {
    const row = await this.repository.findById(parseId);
    return this.serialize(row);
  }

  async listByMessage(messageId) {
    const rows = await this.repository.findByMessage(messageId);
    return rows.map((r) => this.serialize(r));
  }

  async list(filters, pagination) {
    const result = await this.repository.list(filters, pagination);
    return {
      parses: result.parses.map((p) => this.serialize(p)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      signalId: row.signal_id,
      messageId: row.message_id,
      sourceId: row.source_id,
      userId: row.user_id,
      parserType: row.parser_type,
      parserVersion: row.parser_version,
      aiModel: row.ai_model,
      confidenceScore: row.confidence_score,
      latencyMs: row.latency_ms,
      extractedFields: row.extracted_fields,
      metadata: row.metadata,
      createdAt: row.created_at,
    };
  }
}

export default ParserService;