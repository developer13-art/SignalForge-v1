/**
 * Learning Service
 *
 * @module signalforge/server/modules/provider-dna/learning/service
 */

import { LearningPathService } from './learning-path.service.js';
import { FastPathService } from './fast-path.service.js';
import { ReinforcementService } from './reinforcement.service.js';
import { DnaRepository } from '../dna.repository.js';
import { DNA_PATHS } from '../dna.constants.js';

export class LearningService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new DnaRepository();
    this.learningPath = dependencies.learningPath || new LearningPathService({
      repository: this.repository,
    });
    this.fastPath = dependencies.fastPath || new FastPathService(this.repository);
    this.reinforcement = dependencies.reinforcement || new ReinforcementService();
  }

  async tryFastPath(providerId, message, options) {
    return this.fastPath.apply(providerId, message, options);
  }

  async learnFromHistory(providerId, messages, parsedSignals, options) {
    return this.learningPath.learnFromHistory(providerId, messages, parsedSignals, options);
  }

  async applyReinforcement(providerId) {
    const rules = await this.repository.findEnabledRulesByProvider(providerId);
    if (rules.length === 0) {
      return { applied: 0 };
    }
    const adjustments = await this.reinforcement.applyBatch(providerId, rules);

    for (const adjustment of adjustments) {
      await this.repository.updateRule(adjustment.ruleId, {
        confidence: adjustment.next,
        enabled: adjustment.disabled ? false : true,
      });
    }

    return { applied: adjustments.length, adjustments };
  }

  async recordOutcome(providerId, ruleId, success) {
    if (!ruleId) {
      return { recorded: false };
    }
    await this.repository.incrementRuleUsage(ruleId, success);
    return { recorded: true };
  }

  async classifyPath(providerId, message, options) {
    const fastResult = await this.tryFastPath(providerId, message, options);
    if (fastResult.hit) {
      return { path: DNA_PATHS.FAST_PATH, result: fastResult };
    }
    return { path: DNA_PATHS.LEARNING_PATH, reason: fastResult.reason };
  }
}

export default LearningService;