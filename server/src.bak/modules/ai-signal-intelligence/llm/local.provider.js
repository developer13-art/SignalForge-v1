/**
 * Local LLM Provider
 *
 * Connects to a self-hosted, OpenAI-compatible endpoint.
 *
 * @module signalforge/server/modules/ai-signal-intelligence/llm/local
 */

import { LlmProviderInterface } from './llm-provider.interface.js';
import llmConfig from '../../../config/llm.config.js';
import {
  LlmProviderError,
  LlmProviderNotConfiguredError,
  LlmTimeoutError,
} from '../ai.errors.js';

export class LocalProvider extends LlmProviderInterface {
  constructor(config = null) {
    super('local');
    this.config = (config || llmConfig).providers.local;
  }

  isConfigured() {
    return Boolean(this.config.baseUrl);
  }

  assertConfigured() {
    if (!this.isConfigured()) {
      throw new LlmProviderNotConfiguredError('Local LLM is not configured');
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

    const headers = { 'Content-Type': 'application/json' };
    if (this.config.apiKey) {
      headers.Authorization = `Bearer ${this.config.apiKey}`;
    }

    let response;
    try {
      response = await this.fetchWithTimeout(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
    } catch (error) {
      if (error.code === 'TIMEOUT') {
        throw new LlmTimeoutError('Local LLM request timed out');
      }
      throw new LlmProviderError('Local LLM request failed', { cause: error.message });
    }

    if (!response.ok) {
      const text = await response.text();
      throw new LlmProviderError(`Local LLM request failed with status ${response.status}`, {
        status: response.status,
        body: text,
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const latencyMs = Date.now() - start;

    return {
      provider: this.name,
      model,
      content,
      purpose,
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0,
      latencyMs,
      finishReason: data.choices?.[0]?.finish_reason || null,
      raw: data,
    };
  }

  async embed() {
    throw new LlmProviderError('Local LLM embedding is not yet implemented');
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

export default LocalProvider;