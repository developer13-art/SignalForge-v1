/**
 * AI Classifier
 *
 * Uses the LLM gateway to classify messages when rule-based scoring
 * is inconclusive. Falls back gracefully when the gateway is not
 * configured.
 *
 * @module signalforge/server/modules/signal-classification/classifiers/ai
 */

import { BaseClassifier } from './base.classifier.js';
import { CLASSIFICATION_TYPES, CLASSIFIER_KINDS } from '../classification.constants.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

const SYSTEM_PROMPT = `You are a trading message classifier. Classify the user-provided trading message into exactly one of these categories:

- NEW_TRADE: A new trading signal with entry, direction, or explicit trade instruction.
- TRADE_MANAGEMENT: An instruction to manage an existing trade (close, trail, breakeven, partial).
- MARKET_ANALYSIS: Commentary, chart analysis, or market outlook without a specific trade.
- NEWS: Economic news or event reporting.
- EDUCATION: Educational or tutorial content.
- ADVERTISEMENT: Promotional content or a call to join a group.
- CONVERSATION: General chat, greetings, or off-topic discussion.
- UNKNOWN: Anything that does not clearly match the above.

Respond with a JSON object: {"classification": "<TYPE>", "confidence": <0.0-1.0>}.
Do not include any other text.`;

export class AiClassifier extends BaseClassifier {
  constructor(llmGateway = null) {
    super(CLASSIFIER_KINDS.AI, '1.0.0');
    this.llmGateway = llmGateway;
    this.logger = getLogger('ai-classifier');
  }

  parseResponse(content) {
    if (!content || typeof content !== 'string') {
      return null;
    }
    try {
      const startIndex = content.indexOf('{');
      const endIndex = content.lastIndexOf('}');
      if (startIndex === -1 || endIndex === -1) {
        return null;
      }
      const json = content.substring(startIndex, endIndex + 1);
      const parsed = JSON.parse(json);
      const classification = String(parsed.classification || '').toUpperCase();
      const confidence = Number(parsed.confidence);
      if (!Object.values(CLASSIFICATION_TYPES).includes(classification)) {
        return null;
      }
      if (!Number.isFinite(confidence)) {
        return null;
      }
      return { classification, confidence: Math.max(0, Math.min(1, confidence)) };
    } catch {
      return null;
    }
  }

  async classify(message) {
    const start = Date.now();
    const text = message && typeof message.text === 'string' ? message.text : '';

    if (!text || text.trim().length === 0) {
      const result = this.buildResult(
        CLASSIFICATION_TYPES.UNKNOWN,
        0.3,
        null,
        { reason: 'empty_message' },
      );
      result.durationMs = Date.now() - start;
      return result;
    }

    if (!this.llmGateway || typeof this.llmGateway.complete !== 'function') {
      const result = this.buildResult(
        CLASSIFICATION_TYPES.UNKNOWN,
        0.3,
        null,
        { reason: 'llm_gateway_not_configured' },
      );
      result.durationMs = Date.now() - start;
      return result;
    }

    try {
      const response = await this.llmGateway.complete({
        system: SYSTEM_PROMPT,
        user: text,
        temperature: 0.1,
        maxTokens: 100,
      });

      const parsed = this.parseResponse(response?.content);
      if (!parsed) {
        const result = this.buildResult(
          CLASSIFICATION_TYPES.UNKNOWN,
          0.3,
          null,
          { reason: 'invalid_llm_response' },
        );
        result.durationMs = Date.now() - start;
        return result;
      }

      const result = this.buildResult(
        parsed.classification,
        parsed.confidence,
        null,
        { model: response?.model || null },
      );
      result.durationMs = Date.now() - start;
      return result;
    } catch (error) {
      this.logger.error({ err: error }, 'AI classification failed');
      const result = this.buildResult(
        CLASSIFICATION_TYPES.UNKNOWN,
        0.3,
        null,
        { reason: 'llm_error', error: error.message },
      );
      result.durationMs = Date.now() - start;
      return result;
    }
  }
}

export default AiClassifier;