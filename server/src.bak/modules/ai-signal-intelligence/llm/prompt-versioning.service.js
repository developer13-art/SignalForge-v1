/**
 * Prompt Versioning Service
 *
 * @module signalforge/server/modules/ai-signal-intelligence/llm/prompt-versioning
 */

import { PROMPT_TEMPLATES } from './prompt-templates.js';

export class PromptVersioningService {
  constructor() {
    this.overrides = new Map();
    this.history = new Map();
  }

  getActiveTemplate(key) {
    if (this.overrides.has(key)) {
      return this.overrides.get(key);
    }
    return PROMPT_TEMPLATES[key] || null;
  }

  getTemplateVersion(key) {
    const template = this.getActiveTemplate(key);
    return template?.version || null;
  }

  applyOverride(key, override) {
    if (!override || typeof override !== 'object') {
      throw new Error('Override must be an object');
    }
    const previous = this.getActiveTemplate(key);
    if (previous) {
      if (!this.history.has(key)) {
        this.history.set(key, []);
      }
      this.history.get(key).push(previous);
    }
    this.overrides.set(key, {
      ...(previous || {}),
      ...override,
      version: override.version || `${previous?.version || '0.0.0'}-override`,
      overriddenAt: new Date().toISOString(),
    });
    return this.overrides.get(key);
  }

  clearOverride(key) {
    this.overrides.delete(key);
  }

  getHistory(key) {
    return this.history.get(key) || [];
  }

  listActive() {
    const result = {};
    const keys = new Set([...Object.keys(PROMPT_TEMPLATES), ...this.overrides.keys()]);
    for (const key of keys) {
      result[key] = this.getActiveTemplate(key);
    }
    return result;
  }
}

export default PromptVersioningService;