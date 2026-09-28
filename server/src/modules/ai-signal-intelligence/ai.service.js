/**
 * AI Signal Intelligence Service (facade)
 *
 * @module signalforge/server/modules/ai-signal-intelligence/service
 */
const { AiRepository } = require('./ai.repository.js');
const { ParserService } = require('./parser/parser.service.js');
const { NormalizerService } = require('./normalization/normalizer.service.js');
const { ConfidenceService } = require('./confidence/confidence.service.js');
const { LlmGatewayService } = require('./llm/llm-gateway.service.js');
const { PromptManagerService } = require('./llm/prompt-manager.service.js');
const { EmbeddingService } = require('./llm/embedding.service.js');
const { PromptInjectionGuardService } = require('./safety/prompt-injection-guard.service.js');
const { SafetyFilterService } = require('./safety/safety-filter.service.js');
const { AiLogService } = require('./logs/ai-log.service.js');
const { AiMetricsService } = require('./logs/ai-metrics.service.js');
const { LlmProviderFactory } = require('./llm/provider.factory.js');
class AiService {
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
module.exports = AiService;
module.exports.AiService = AiService;
