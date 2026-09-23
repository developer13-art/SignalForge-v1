/**
 * Google Gemini LLM Provider
 *
 * @module signalforge/server/modules/ai-signal-intelligence/llm/google
 */

import { LlmProviderInterface } from './llm-provider.interface.js';
import llmConfig from '../../../config/llm.config.js';
import {
  LlmProviderError,
  LlmProviderNotConfiguredError,
  LlmRateLimitError,
  LlmTimeoutError,
} from '../ai.errors.js';

export class GoogleProvider extends LlmProviderInterface {
  constructor(config = null) {
    super('google');
    this.config = (config || llmConfig).providers.google;
  }

  isConfigured() {
    return Boolean(this.config.apiKey);
  }

  assertConfigured() {
    if (!this.isConfigured()) {
      throw new LlmProviderNotConfiguredError('Google AI is not configured');
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
      contents: [
        ...(system ? [{ role: 'user', parts: [{ text: system }] }] : []),
        { role: 'user', parts: [{ text: user }] },
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    };

    const url = `${this.config.baseUrl}/models/${model}:generateContent?key=${this.config.apiKey}`;

    let response;
    try {
      response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (error) {
      if (error.code === 'TIMEOUT') {
        throw new LlmTimeoutError('Google AI request timed out');
      }
      throw new LlmProviderError('Google AI request failed', { cause: error.message });
    }

    if (response.status === 429) {
      throw new LlmRateLimitError('Google AI rate limit exceeded');
    }

    if (!response.ok) {
      const text = await response.text();
      throw new LlmProviderError(`Google AI request failed with status ${response.status}`, {
        status: response.status,
        body: text,
      });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const latencyMs = Date.now() - start;

    return {
      provider: this.name,
      model,
      content,
      purpose,
      promptTokens: data.usageMetadata?.promptTokenCount || 0,
      completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: data.usageMetadata?.totalTokenCount || 0,
      latencyMs,
      finishReason: data.candidates?.[0]?.finishReason || null,
      raw: data,
    };
  }

  async embed() {
    throw new LlmProviderError('Google embeddings are not yet implemented');
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

export default GoogleProvider;