/**
 * Embedding Service
 *
 * Provides vector embeddings for similarity search across messages,
 * provider DNA signals, and duplicate detection.
 *
 * @module signalforge/server/modules/ai-signal-intelligence/llm/embedding
 */

import { getLogger } from '../../../bootstrap/initLogger.js';
import aiConfig from '../../../config/ai.config.js';

export class EmbeddingService {
  constructor(provider = null) {
    this.provider = provider;
    this.logger = getLogger('embeddings');
    this.cache = new Map();
  }

  async embed(text) {
    if (!aiConfig.embeddings.enabled) {
      return null;
    }
    if (typeof text !== 'string' || text.length === 0) {
      return null;
    }
    const key = text.substring(0, 512);
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    if (!this.provider || typeof this.provider.embed !== 'function') {
      return null;
    }
    try {
      const vector = await this.provider.embed(text);
      if (Array.isArray(vector)) {
        if (this.cache.size >= aiConfig.caching.maxEntries) {
          const oldest = this.cache.keys().next().value;
          this.cache.delete(oldest);
        }
        this.cache.set(key, vector);
      }
      return vector;
    } catch (error) {
      this.logger.error({ err: error }, 'Embedding failed');
      return null;
    }
  }

  cosineSimilarity(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      return null;
    }
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) {
      return null;
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export default EmbeddingService;