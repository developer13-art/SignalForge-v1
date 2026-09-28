/**
 * Preferences Controller
 *
 * @module signalforge/server/modules/users/preferences/controller
 */
const { PreferencesService } = require('./preferences.service.js');
const { validatePreferencesUpdatePayload } = require('./preferences.validator.js');
const { ValidationError } = require('../../../lib/errors/validation-error.js');
class PreferencesController {
  constructor(service = null) {
    this.service = service || new PreferencesService();
  }

  getPreferences = async (req, res, next) => {
    try {
      const preferences = await this.service.get(req.user.id);
      res.status(200).json({ preferences });
    } catch (error) {
      next(error);
    }
  };

  updatePreferences = async (req, res, next) => {
    try {
      const result = validatePreferencesUpdatePayload(req.body);
      if (!result.valid) {
        throw new ValidationError('Validation failed', {
          code: 'VALIDATION_FAILED',
          details: { errors: result.errors },
        });
      }
      const preferences = await this.service.update(req.user.id, req.body);
      res.status(200).json({ preferences });
    } catch (error) {
      next(error);
    }
  };
}
module.exports = PreferencesController;
module.exports.PreferencesController = PreferencesController;
