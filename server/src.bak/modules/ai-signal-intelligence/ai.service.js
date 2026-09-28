/**
 * AI Signal Intelligence Service (facade)
 *
 * @module signalforge/server/modules/ai-signal-intelligence/service
 */

import { AiRepository } from './ai.repository.js';
import { ParserService } from './parser/parser.service.js';
import { NormalizerService } from './normalization/normalizer.service.js';
import { ConfidenceService } from './confidence/confidence.service.js';
import { LlmGatewayService } from './llm/llm-gateway.service.js';
import { PromptManagerService } from './llm/prompt-manager.service.js';
import { EmbeddingService } from './llm/embedding.service.js';
import { PromptInjectionGuardService } from './safety/prompt-injection-guard.service.js';
import { SafetyFilterService } from './safety/safety-filter.service.js';
import { AiLogService } from './logs/ai-log.service.js';
import { AiMetricsService } from './logs/ai-metrics.service.js';
import { LlmProviderFactory } from './llm/provider.factory.js';

export class AiService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new AiRepository();

    this.llmGateway = dependencies.llmGateway || new LlmGatewayService();
    this.promptManager =
      dependencies.promptManager || new PromptManagerService();
    this.injectionGuard =
      dependencies.injectionGuard || new PromptInjectionGuardService();
    this.safetyFilter = dependencies.safetyFilter || new SafetyFilterService();

    const embeddingProvider = this.tryEmbeddingProvider();
    this.embeddingService =
      dependencies.embeddingService || new EmbeddingService(embeddingProvider);

    this.parser = dependencies.parser || new ParserService({
      repository: this.repository,
      promptManager: this.promptManager,
      llmGateway: this.llmGateway,
      normalizer: dependencies.normalizer || new NormalizerService(),
      injectionGuard: this.injectionGuard,
      safetyFilter: this.safetyFilter,
    });

    this.confidence = dependencies.confidence || new ConfidenceService();
    this.logs = dependencies.logs || new AiLogService(this.repository);
    this.metrics = dependencies.metrics || new AiMetricsService(this.repository);
  }

  tryEmbeddingProvider() {
    try {
      return LlmProviderFactory.createIfConfigured('openai');
    } catch {
      return null;
    }
  }

  async parseMessage(message, options = {}) {
    return this.parser.parseMessage(message, options);
  }

  async getParseById(parseId) {
    return this.parser.getParseById(parseId);
  }

  async listParsesByMessage(messageId) {
    return this.parser.listByMessage(messageId);
  }

  async listParses(filters, pagination) {
    return this.parser.list(filters, pagination);
  }

  async scoreConfidence(signalId, messageId, fields, parserConfidence, meta) {
    return this.confidence.scoreAndPersist(
      signalId,
      messageId,
      fields,
      parserConfidence,
      meta,
    );
  }

  async getConfidenceBySignal(signalId) {
    return this.confidence.getBySignal(signalId);
  }

  async averageConfidence(filters) {
    return this.confidence.average(filters);
  }

  async embed(text) {
    return this.embeddingService.embed(text);
  }

  cosineSimilarity(a, b) {
    return this.embeddingService.cosineSimilarity(a, b);
  }

  async summarizeMetrics(filters) {
    return this.metrics.summarize(filters);
  }

  async listLogs(filters, pagination) {
    return this.logs.list(filters, pagination);
  }

  async sumCost(filters) {
    return this.logs.sumCost(filters);
  }
}

export default AiService;