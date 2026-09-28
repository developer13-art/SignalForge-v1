/**
 * Risk Profile Controller
 *
 * @module signalforge/server/modules/risk/profile/controller
 */
const { RiskProfileService } = require('./risk-profile.service.js');
const { validateRiskProfilePayload, validateEmergencyStopPayload } = require('./risk-profile.validator.js');
const { ValidationError } = require('../../../lib/errors/validation-error.js');
class RiskProfileController {
  constructor(service = null) {
    this.service = service || new RiskProfileService();
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

  getProfile = async (req, res, next) => {
    try {
      const brokerAccountId = req.query.brokerAccountId || null;
      const profile = await this.service.getOrCreate(req.user.id, brokerAccountId);
      res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req, res, next) => {
    try {
      this.validateOrThrow(validateRiskProfilePayload, req.body);
      const profile = await this.service.update(req.user.id, req.params.profileId, req.body);
      res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  };

  activateEmergencyStop = async (req, res, next) => {
    try {
      this.validateOrThrow(validateEmergencyStopPayload, req.body);
      const profile = await this.service.activateEmergencyStop(
        req.user.id,
        req.params.profileId,
        req.body.reason,
      );
      res.status(200).json({ profile, emergencyStopActive: true });
    } catch (error) {
      next(error);
    }
  };

  deactivateEmergencyStop = async (req, res, next) => {
    try {
      const profile = await this.service.deactivateEmergencyStop(
        req.user.id,
        req.params.profileId,
      );
      res.status(200).json({ profile, emergencyStopActive: false });
    } catch (error) {
      next(error);
    }
  };
}
module.exports = RiskProfileController;
module.exports.RiskProfileController = RiskProfileController;
