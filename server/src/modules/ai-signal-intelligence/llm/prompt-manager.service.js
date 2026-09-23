/**
 * Prompt Manager Service
 *
 * @module signalforge/server/modules/ai-signal-intelligence/llm/prompt-manager
 */

import { PromptVersioningService } from './prompt-versioning.service.js';

export class PromptManagerService {
  constructor(versioning = null) {
    this.versioning = versioning || new PromptVersioningService();
    this.cache = new Map();
  }

  getPrompt(key) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const template = this.versioning.getActiveTemplate(key);
    if (template) {
      this.cache.set(key, template);
    }
    return template;
  }

  buildRequest(templateKey, userContent, options = {}) {
    const template = this.getPrompt(templateKey);
    if (!template) {
      throw new Error(`Prompt template "${templateKey}" is not registered`);
    }
    return {
      templateKey,
      templateVersion: template.version,
      system: template.system,
      user: userContent,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      purpose: options.purpose || templateKey,
    };
  }

  invalidateCache() {
    this.cache.clear();
  }
}

export default PromptManagerService;