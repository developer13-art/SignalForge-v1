/**
 * LLM Provider Factory
 *
 * @module signalforge/server/modules/ai-signal-intelligence/llm/factory
 */

import { OpenAiProvider } from './openai.provider.js';
import { AnthropicProvider } from './anthropic.provider.js';
import { GoogleProvider } from './google.provider.js';
import { LocalProvider } from './local.provider.js';
import { LLM_PROVIDERS } from '../ai.constants.js';
import { LlmProviderNotConfiguredError } from '../ai.errors.js';

const registry = new Map([
  [LLM_PROVIDERS.OPENAI, () => new OpenAiProvider()],
  [LLM_PROVIDERS.ANTHROPIC, () => new AnthropicProvider()],
  [LLM_PROVIDERS.GOOGLE, () => new GoogleProvider()],
  [LLM_PROVIDERS.LOCAL, () => new LocalProvider()],
]);

export class LlmProviderFactory {
  static register(name, factory) {
    if (typeof factory !== 'function') {
      throw new Error('Provider factory must be a function');
    }
    registry.set(name, factory);
  }

  static create(name) {
    const factory = registry.get(name);
    if (!factory) {
      throw new LlmProviderNotConfiguredError(`LLM provider "${name}" is not registered`);
    }
    const provider = factory();
    if (!provider.isConfigured()) {
      throw new LlmProviderNotConfiguredError(`LLM provider "${name}" is not configured`);
    }
    return provider;
  }

  static list() {
    return Array.from(registry.keys());
  }

  static createIfConfigured(name) {
    const factory = registry.get(name);
    if (!factory) {
      return null;
    }
    const provider = factory();
    return provider.isConfigured() ? provider : null;
  }
}

export default LlmProviderFactory;