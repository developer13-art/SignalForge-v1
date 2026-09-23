/**
 * LLM Gateway Service
 *
 * Central entry point for all LLM calls. Handles provider selection,
 * fallback, rate limiting, cost tracking, and logging.
 *
 * @module signalforge/server/modules/ai-signal-intelligence/llm/gateway
 */

import { getLogger } from '../../../bootstrap/initLogger.js';
import llmConfig from '../../../config/llm.config.js';
import { LlmProviderFactory } from './provider.factory.js';
import { LlmRateLimiterService } from './rate-limiter.service.js';
import { TokenCounterService } from './token-counter.service.js';
import {
  LlmProviderError,
  LlmRateLimitError,
} from '../ai.errors.js';
import { emitLlmRequest, emitLlmResponse, emitLlmError, emitLlmRateLimited } from '../ai.events.js';

export class LlmGatewayService {
  constructor(dependencies = {}) {
    this.logger = getLogger('llm-gateway');
    this.primaryProvider =
      dependencies.primaryProvider || llmConfig.routing.primary;
    this.fallbackProvider =
      dependencies.fallbackProvider || llmConfig.routing.fallback;
    this.rateLimiter = dependencies.rateLimiter || new LlmRateLimiterService({
      requestsPerMinute: llmConfig.rateLimit.requestsPerMinute,
      tokensPerMinute: llmConfig.rateLimit.tokensPerMinute,
      concurrentRequests: llmConfig.rateLimit.concurrentRequests,
    });
    this.tokenCounter = dependencies.tokenCounter || new TokenCounterService();
    this.costTracker = dependencies.costTracker || { total: 0 };
  }

  async complete(payload, options = {}) {
    const providers = [this.primaryProvider, this.fallbackProvider].filter(Boolean);
    let lastError = null;

    for (const providerName of providers) {
      let provider;
      try {
        provider = LlmProviderFactory.create(providerName);
      } catch (error) {
        this.logger.warn({ err: error, provider: providerName }, 'Provider not available');
        lastError = error;
        continue;
      }

      const key = `${providerName}:${payload.purpose || 'default'}`;
      const estimatedTokens =
        this.tokenCounter.estimateTokens(payload.system) +
        this.tokenCounter.estimateTokens(payload.user);

      const requestCheck = this.rateLimiter.checkRequests(key);
      if (!requestCheck.allowed) {
        await emitLlmRateLimited(providerName, provider.config?.model, { reason: 'requests' });
        lastError = new LlmRateLimitError('LLM request rate limit exceeded', requestCheck);
        continue;
      }

      const tokenCheck = this.rateLimiter.checkTokens(key, estimatedTokens);
      if (!tokenCheck.allowed) {
        await emitLlmRateLimited(providerName, provider.config?.model, { reason: 'tokens' });
        lastError = new LlmRateLimitError('LLM token rate limit exceeded', tokenCheck);
        continue;
      }

      const concurrency = this.rateLimiter.checkConcurrency();
      if (!concurrency.allowed) {
        lastError = new LlmRateLimitError('LLM concurrency limit reached');
        continue;
      }

      await emitLlmRequest(providerName, provider.config?.model, payload);

      this.rateLimiter.beginRequest();
      try {
        const response = await provider.complete(payload);
        this.rateLimiter.commit(key, response.totalTokens || estimatedTokens);
        this.rateLimiter.endRequest();

        await emitLlmResponse(providerName, response.model, response);

        const cost = this.tokenCounter.estimateCostUsd(
          response.totalTokens || 0,
          options.pricePer1kTokens,
        );
        this.costTracker.total += cost;

        return {
          ...response,
          estimatedCostUsd: cost,
          fallbackUsed: providerName !== this.primaryProvider,
        };
      } catch (error) {
        this.rateLimiter.endRequest();
        this.logger.warn({ err: error, provider: providerName }, 'Provider failed');
        await emitLlmError(providerName, provider.config?.model, error);
        lastError = error;
      }
    }

    throw lastError || new LlmProviderError('No LLM provider available');
  }

  getCostSummary() {
    return {
      totalCostUsd: this.costTracker.total,
    };
  }
}

export default LlmGatewayService;