/**
 * LLM Provider Interface
 *
 * @module signalforge/server/modules/ai-signal-intelligence/llm/interface
 */

export class LlmProviderInterface {
  constructor(name) {
    this.name = name;
  }

  async complete(payload) {
    throw new Error(`${this.name} must implement complete()`);
  }

  async embed(text) {
    throw new Error(`${this.name} must implement embed()`);
  }

  isConfigured() {
    return false;
  }
}

export default LlmProviderInterface;