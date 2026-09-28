/**
 * Anthropic LLM Provider
 *
 * @module signalforge/server/modules/ai-signal-intelligence/llm/anthropic
 */

import { LlmProviderInterface } from './llm-provider.interface.js';
import llmConfig from '../../../config/llm.config.js';
import {
  LlmProviderError,
  LlmProviderNotConfiguredError,
  LlmRateLimitError,
  LlmTimeoutError,
} from '../ai.errors.js';

export class AnthropicProvider extends LlmProviderInterface {
  constructor(config = null) {
    super('anthropic');
    this.config = (config || llmConfig).providers.anthropic;
  }

  isConfigured() {
    return Boolean(this.config.apiKey);
  }

  assertConfigured() {
    if (!this.isConfigured()) {
      throw new LlmProviderNotConfiguredError('Anthropic is not configured');
    }
  }

  async complete(payload) {
    this.assertConfigured();

    const {
      system,
      user,
      temperature = llmConfig.defaults.temperature,
      maxTokens = llmConfig.defaults.maxTokens,
      model = this.config.model,
      purpose = null,
    } = payload;

    const start = Date.now();
    const body = {
      model,
      max_tokens: maxTokens,
      temperature,
      ...(system ? { system } : {}),
      messages: [{ role: 'user', content: user }],
    };

    let response;
    try {
      response = await this.fetchWithTimeout(`${this.config.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      if (error.code === 'TIMEOUT') {
        throw new LlmTimeoutError('Anthropic request timed out');
      }
      throw new LlmProviderError('Anthropic request failed', { cause: error.message });
    }

    if (response.status === 429) {
      throw new LlmRateLimitError('Anthropic rate limit exceeded');
    }

    if (!response.ok) {
      const text = await response.text();
      throw new LlmProviderError(`Anthropic request failed with status ${response.status}`, {
        status: response.status,
        body: text,
      });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    const latencyMs = Date.now() - start;

    return {
      provider: this.name,
      model,
      content,
      purpose,
      promptTokens: data.usage?.input_tokens || 0,
      completionTokens: data.usage?.output_tokens || 0,
      totalTokens:
        (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      latencyMs,
      finishReason: data.stop_reason || null,
      raw: data,
    };
  }

  async embed() {
    throw new LlmProviderError('Anthropic does not provide an embeddings API');
  }

  async fetchWithTimeout(url, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error('TIMEOUT')), this.config.timeoutMs);

    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } catch (error) {
      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timed out');
        timeoutError.code = 'TIMEOUT';
        throw timeoutError;
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
}

export default AnthropicProvider;