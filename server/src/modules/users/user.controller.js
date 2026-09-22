/**
 * User Controller
 *
 * @module signalforge/server/modules/users/controller
 */

import { UserService } from './user.service.js';
import { ProfileService } from './profile/profile.service.js';
import { PreferencesService } from './preferences/preferences.service.js';
import { validateUpdateUserPayload } from './user.validator.js';
import { validateProfilePayload } from './profile/profile.validator.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export class UserController {
  constructor(service = null) {
    this.service = service || new UserService();
    this.profileService = new ProfileService();
    this.preferencesService = new PreferencesService();
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

  getMe = async (req, res, next) => {
    try {
      const user = await this.service.getByIdWithRoles(req.user.id);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  };

  updateMe = async (req, res, next) => {
    try {
      this.validateOrThrow(validateUpdateUserPayload, req.body);
      const user = await this.service.update(req.user.id, req.body);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  };

  deactivateMe = async (req, res, next) => {
    try {
      const result = await this.service.deactivate(req.user.id, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  reactivateMe = async (req, res, next) => {
    try {
      const result = await this.service.reactivate(req.user.id, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteMe = async (req, res, next) => {
    try {
      const result = await this.service.softDelete(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req, res, next) => {
    try {
      const profile = await this.profileService.getByUserId(req.user.id);
      res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req, res, next) => {
    try {
      this.validateOrThrow(validateProfilePayload, req.body);
      const profile = await this.profileService.update(req.user.id, req.body);
      res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  };

  getPreferences = async (req, res, next) => {
    try {
      const preferences = await this.preferencesService.get(req.user.id);
      res.status(200).json({ preferences });
    } catch (error) {
      next(error);
    }
  };

  updatePreferences = async (req, res, next) => {
    try {
      const preferences = await this.preferencesService.update(req.user.id, req.body);
      res.status(200).json({ preferences });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const user = await this.service.getById(req.params.userId);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  };

  listUsers = async (req, res, next) => {
    try {
      const filters = {
        status: req.query.status,
        kycStatus: req.query.kycStatus,
        accountType: req.query.accountType,
        search: req.query.search,
      };
      const pagination = {
        limit: req.query.limit,
        offset: req.query.offset,
      };
      const result = await this.service.list(filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req, res, next) => {
    try {
      const stats = await this.service.getStats();
      res.status(200).json({ stats });
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;