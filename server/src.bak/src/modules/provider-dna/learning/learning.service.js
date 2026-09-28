/**
 * Learning Service
 *
 * @module signalforge/server/modules/provider-dna/learning/service
 */
const { LearningPathService } = require('./learning-path.service.js');
const { FastPathService } = require('./fast-path.service.js');
const { ReinforcementService } = require('./reinforcement.service.js');
const { DnaRepository } = require('../dna.repository.js');
const { DNA_PATHS } = require('../dna.constants.js');

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
module.exports = LearningService;