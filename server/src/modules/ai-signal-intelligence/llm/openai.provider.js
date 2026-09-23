/**
 * OpenAI LLM Provider
 *
 * @module signalforge/server/modules/ai-signal-intelligence/llm/openai
 */

import { LlmProviderInterface } from './llm-provider.interface.js';
import llmConfig from '../../../config/llm.config.js';
import {
  LlmProviderError,
  LlmProviderNotConfiguredError,
  LlmRateLimitError,
  LlmTimeoutError,
} from '../ai.errors.js';

export class OpenAiProvider extends LlmProviderInterface {
  constructor(config = null) {
    super('openai');
    this.config = (config || llmConfig).providers.openai;
  }

  isConfigured() {
    return Boolean(this.config.apiKey);
  }

  assertConfigured() {
    if (!this.isConfigured()) {
      throw new LlmProviderNotConfiguredError('OpenAI is not configured');
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
      temperature,
      max_tokens: maxTokens,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: user },
      ],
    };

    let response;
    try {
      response = await this.fetchWithTimeout(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
          ...(this.config.organization ? { 'OpenAI-Organization': this.config.organization } : {}),
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      if (error.code === 'TIMEOUT') {
        throw new LlmTimeoutError('OpenAI request timed out');
      }
      throw new LlmProviderError('OpenAI request failed', { cause: error.message });
    }

    if (response.status === 429) {
      throw new LlmRateLimitError('OpenAI rate limit exceeded');
    }

    if (!response.ok) {
      const text = await response.text();
      throw new LlmProviderError(`OpenAI request failed with status ${response.status}`, {
        status: response.status,
        body: text,
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const latencyMs = Date.now() - start;

    const promptTokens = data.usage?.prompt_tokens || 0;
    const completionTokens = data.usage?.completion_tokens || 0;
    const totalTokens = data.usage?.total_tokens || promptTokens + completionTokens;

    return {
      provider: this.name,
      model,
      content,
      purpose,
      promptTokens,
      completionTokens,
      totalTokens,
      latencyMs,
      finishReason: data.choices?.[0]?.finish_reason || null,
      raw: data,
    };
  }

  async embed(text) {
    this.assertConfigured();

    const response = await this.fetchWithTimeout(`${this.config.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.embeddingModel,
        input: text,
      }),
    });

    if (!response.ok) {
      throw new LlmProviderError('OpenAI embedding request failed');
    }

    const data = await response.json();
    return data.data?.[0]?.embedding || null;
  }

  async fetchWithTimeout(url, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort(new Error('TIMEOUT'));
    }, this.config.timeoutMs);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      return response;
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

export default OpenAiProvider;