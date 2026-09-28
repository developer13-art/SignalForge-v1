/**
 * Referral Controller
 *
 * @module signalforge/server/modules/referrals/controller
 */

import { ReferralService } from './referral.service.js';
import {
  validateCreateCodePayload,
  validateRelationshipPayload,
  validateSettlementPayload,
  validateRewardDecisionPayload,
} from './referral.validator.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export class ReferralController {
  constructor(service = null) {
    this.service = service || new ReferralService();
  }

  validateOrThrow(validator, body) {
    const result = validator(body);
    if (!result.valid) {
      throw new ValidationError('Validation failed', {
        code: 'VALIDATION_FAILED',
        details: { errors: result.errors },
      });
    }
  }

  getMyCode = async (req, res, next) => {
    try {
      const code = await this.service.getOrCreateCode(req.user.id);
      res.status(200).json({ code });
    } catch (error) {
      next(error);
    }
  };

  createCode = async (req, res, next) => {
    try {
      this.validateOrThrow(validateCreateCodePayload, req.body);
      const code = await this.service.codes.createForUser(req.user.id, req.body);
      res.status(201).json({ code });
    } catch (error) {
      next(error);
    }
  };

  regenerateCode = async (req, res, next) => {
    try {
      const code = await this.service.regenerateCode(req.user.id);
      res.status(200).json({ code });
    } catch (error) {
      next(error);
    }
  };

  listMyCodes = async (req, res, next) => {
    try {
      const codes = await this.service.listCodes(req.user.id);
      res.status(200).json({ codes });
    } catch (error) {
      next(error);
    }
  };

  createRelationship = async (req, res, next) => {
    try {
      this.validateOrThrow(validateRelationshipPayload, req.body);
      const relationship = await this.service.createRelationship(
        req.user.id,
        req.body.referralCode,
        {
          attributionSource: req.body.attributionSource,
          attributionContext: req.body.attributionContext,
        },
      );
      res.status(201).json({ relationship });
    } catch (error) {
      next(error);
    }
  };

  getMyRelationship = async (req, res, next) => {
    try {
      const relationship = await this.service.getRelationshipForUser(req.user.id);
      res.status(200).json({ relationship });
    } catch (error) {
      next(error);
    }
  };

  listReferrals = async (req, res, next) => {
    try {
      const filters = { status: req.query.status };
      const referrals = await this.service.listReferralsForUser(req.user.id, filters);
      res.status(200).json({ referrals });
    } catch (error) {
      next(error);
    }
  };

  getDashboard = async (req, res, next) => {
    try {
      const dashboard = await this.service.getReferralDashboard(req.user.id);
      res.status(200).json(dashboard);
    } catch (error) {
      next(error);
    }
  };

  listRewards = async (req, res, next) => {
    try {
      const filters = {
        status: req.query.status,
        settlementPeriod: req.query.settlementPeriod,
        since: req.query.since,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listRewardsForUser(
        req.user.id,
        filters,
        pagination,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getReward = async (req, res, next) => {
    try {
      const reward = await this.service.getReward(req.params.rewardId);
      res.status(200).json({ reward });
    } catch (error) {
      next(error);
    }
  };

  getWallet = async (req, res, next) => {
    try {
      const wallet = await this.service.getWallet(
        req.user.id,
        req.query.currency || 'USD',
      );
      res.status(200).json({ wallet });
    } catch (error) {
      next(error);
    }
  };

  listLedger = async (req, res, next) => {
    try {
      const wallet = await this.service.getWallet(req.user.id);
      const filters = {
        entryType: req.query.entryType,
        direction: req.query.direction,
        since: req.query.since,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listLedger(wallet.id, filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  adminRunSettlement = async (req, res, next) => {
    try {
      this.validateOrThrow(validateSettlementPayload, req.body);
      const result = await this.service.runSettlement(req.body.settlementPeriod, {
        force: req.body.force,
        freezeHours: req.body.freezeHours,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  adminFinalizeSettlement = async (req, res, next) => {
    try {
      const result = await this.service.finalizeSettlement(req.params.settlementPeriod);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  adminListSettlements = async (req, res, next) => {
    try {
      const filters = {
        status: req.query.status,
        since: req.query.since,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listSettlements(filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  adminGetSettlement = async (req, res, next) => {
    try {
      const settlement = await this.service.getSettlement(req.params.settlementId);
      res.status(200).json({ settlement });
    } catch (error) {
      next(error);
    }
  };

  adminListSettlementRewards = async (req, res, next) => {
    try {
      const filters = { status: req.query.status };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listRewardsForSettlement(
        req.params.settlementPeriod,
        filters,
        pagination,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  adminApproveReward = async (req, res, next) => {
    try {
      const reward = await this.service.approveReward(req.params.rewardId, req.user.id);
      res.status(200).json({ reward });
    } catch (error) {
      next(error);
    }
  };

  adminRejectReward = async (req, res, next) => {
    try {
      this.validateOrThrow(validateRewardDecisionPayload, {
        ...req.body,
        decision: 'REJECT',
      });
      const reward = await this.service.rejectReward(
        req.params.rewardId,
        req.user.id,
        req.body.reason,
      );
      res.status(200).json({ reward });
    } catch (error) {
      next(error);
    }
  };

  adminReverseReward = async (req, res, next) => {
    try {
      this.validateOrThrow(validateRewardDecisionPayload, {
        ...req.body,
        decision: 'REVERSE',
      });
      const reward = await this.service.reverseReward(
        req.params.rewardId,
        req.user.id,
        req.body.reason,
      );
      res.status(200).json({ reward });
    } catch (error) {
      next(error);
    }
  };

  adminListFraudFlags = async (req, res, next) => {
    try {
      const filters = {
        referrerId: req.query.referrerId,
        severity: req.query.severity,
        flagType: req.query.flagType,
        since: req.query.since,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listFraudFlags(filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  adminListOpenFraudFlags = async (req, res, next) => {
    try {
      const filters = {
        referrerId: req.query.referrerId,
        severity: req.query.severity,
        flagType: req.query.flagType,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listOpenFraudFlags(filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  adminAssignFraudFlag = async (req, res, next) => {
    try {
      const result = await this.service.assignFraudFlag(
        req.params.flagId,
        req.user.id,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  adminResolveFraudFlag = async (req, res, next) => {
    try {
      const result = await this.service.resolveFraudFlag(
        req.params.flagId,
        req.body.resolution,
        req.body.metadata,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default ReferralController;