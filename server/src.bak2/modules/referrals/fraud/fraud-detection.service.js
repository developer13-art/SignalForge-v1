/**
 * Fraud Detection Service
 *
 * @module signalforge/server/modules/referrals/fraud/detection
 */
const { ReferralRepository } = require('../referral.repository.js');
const { SelfReferralCheck } = require('./self-referral.check.js');
const { DuplicateAccountCheck } = require('./duplicate-account.check.js');
const { AbnormalActivityCheck } = require('./abnormal-activity.check.js');
const { FakeVolumeCheck } = require('./fake-volume.check.js');
const { ReversalCheck } = require('./reversal.check.js');
const { DEFAULT_REFERRAL_FRAUD_SCORE_THRESHOLD, DEFAULT_REVIEW_REQUIRED_SCORE } = require('../referral.constants.js');
const { emitFraudFlagRaised } = require('../referral.events.js');

export class FraudDetectionService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new ReferralRepository();
    this.checks = dependencies.checks || [
      new SelfReferralCheck(),
      new DuplicateAccountCheck(dependencies.db),
      new AbnormalActivityCheck(),
      new FakeVolumeCheck(dependencies.db),
      new ReversalCheck(dependencies.db),
    ];
  }

  async runChecks({
    referrerId,
    referredUserId,
    settlementPeriod,
    relationshipId = null,
    rewardId = null,
    context = {},
  }) {
    const flags = [];

    for (const check of this.checks) {
      try {
        let result;
        switch (check.constructor.name) {
          case 'SelfReferralCheck':
            result = await check.run(referrerId, referredUserId);
            break;
          case 'DuplicateAccountCheck':
            result = await check.run(referrerId, referredUserId);
            break;
          case 'AbnormalActivityCheck':
            result = await check.run(context);
            break;
          case 'FakeVolumeCheck':
            result = await check.run(referredUserId, settlementPeriod);
            break;
          case 'ReversalCheck':
            result = await check.run(referredUserId, settlementPeriod);
            break;
          default:
            result = { detected: false };
        }

        if (result && result.detected) {
          flags.push(result);

          const created = await this.repository.createFraudFlag({
            referrerId,
            referredUserId,
            relationshipId,
            rewardId,
            flagType: result.flagType,
            severity: result.severity,
            score: result.score,
            description: result.description,
            metadata: result.details || null,
          });

          await emitFraudFlagRaised(referrerId, created.id, result.flagType, result.severity);
        }
      } catch (error) {
        // Non-critical: continue with other checks
      }
    }

    const scores = flags.map((f) => Number(f.score || 0));
    const fraudScore =
      scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(4)) : 0;

    return {
      fraudScore,
      flags,
      requiresReview: fraudScore >= DEFAULT_REVIEW_REQUIRED_SCORE,
      flagged: fraudScore >= DEFAULT_REFERRAL_FRAUD_SCORE_THRESHOLD,
    };
  }

  async listFlags(filters, pagination) {
    return this.repository.listFraudFlags(filters, pagination);
  }
}
module.exports = FraudDetectionService;