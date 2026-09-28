/**
 * Learning Path Service
 *
 * Runs the full AI parsing pipeline for messages that the fast path
 * did not resolve, and feeds the result back into the DNA learning
 * loop so the fast path improves over time.
 *
 * @module signalforge/server/modules/provider-dna/learning/learning-path
 */

import { getLogger } from '../../../bootstrap/initLogger.js';
import { DnaRepository } from '../dna.repository.js';
import { RuleExtractorService } from './rule-extractor.service.js';
import { PatternLearnerService } from './pattern-learner.service.js';
import { DEFAULT_AUTO_LEARN_THRESHOLD } from '../dna.constants.js';
import { emitDnaLearningStarted, emitDnaLearningCompleted, emitDnaLearningFailed } from '../dna.events.js';

export class LearningPathService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new DnaRepository();
    this.ruleExtractor = dependencies.ruleExtractor || new RuleExtractorService();
    this.patternLearner = dependencies.patternLearner || new PatternLearnerService();
    this.logger = getLogger('dna-learning-path');
  }

  async learnFromHistory(providerId, messages, parsedSignals, options = {}) {
    if (!Array.isArray(messages) || !Array.isArray(parsedSignals)) {
      throw new Error('Messages and parsedSignals must be arrays');
    }
    if (messages.length !== parsedSignals.length) {
      throw new Error('Messages and parsedSignals must have the same length');
    }

    await emitDnaLearningStarted(providerId, messages.length);

    try {
      const extracted = this.ruleExtractor.extract(messages, parsedSignals);
      const candidateRules = this.patternLearner.learn(extracted, {
        autoLearnThreshold: options.autoLearnThreshold ?? DEFAULT_AUTO_LEARN_THRESHOLD,
      });

      const dna = await this.repository.findDnaByProviderId(providerId);
      if (!dna) {
        throw new Error(`No DNA record exists for provider ${providerId}`);
      }

      let created = 0;
      for (const rule of candidateRules) {
        try {
          await this.repository.createRule({
            dnaId: dna.id,
            providerId,
            ruleType: rule.ruleType,
            matchType: rule.matchType,
            pattern: rule.pattern,
            caseSensitive: rule.caseSensitive,
            priority: rule.priority,
            action: rule.action,
            confidence: rule.confidence,
            enabled: true,
          });
          created++;
        } catch (error) {
          this.logger.warn({ err: error, rule: rule.pattern }, 'Failed to create DNA rule');
        }
      }

      await this.repository.updateDna(providerId, {
        symbolMappings: extracted.symbolMappings,
        abbreviationMappings: extracted.abbreviationMappings,
        riskStyle: extracted.riskStyle,
        tradeManagementStyle: extracted.tradeManagementStyle,
        ruleCount: await this.repository.countRulesByProvider(providerId),
      });

      await emitDnaLearningCompleted(providerId, created);

      return { rulesLearned: created, extracted };
    } catch (error) {
      await emitDnaLearningFailed(providerId, error);
      throw error;
    }
  }
}

export default LearningPathService;