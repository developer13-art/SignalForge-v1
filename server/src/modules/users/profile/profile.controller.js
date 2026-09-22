/**
 * Profile Controller
 *
 * @module signalforge/server/modules/users/profile/controller
 */

import { ProfileService } from './profile.service.js';
import { AvatarService } from './avatar.service.js';
import { validateProfilePayload } from './profile.validator.js';
import { ValidationError } from '../../../lib/errors/validation-error.js';

export class ProfileController {
  constructor(service = null, avatarService = null) {
    this.service = service || new ProfileService();
    this.avatarService = avatarService || new AvatarService();
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
      const profile = await this.service.getByUserId(req.user.id);
      res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req, res, next) => {
    try {
      this.validateOrThrow(validateProfilePayload, req.body);
      const profile = await this.service.update(req.user.id, req.body);
      res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  };

  deleteProfile = async (req, res, next) => {
    try {
      const result = await this.service.delete(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  uploadAvatar = async (req, res, next) => {
    try {
      const result = await this.avatarService.upload(req.user.id, req.file);
      res.status(200).json({ avatar: result });
    } catch (error) {
      next(error);
    }
  };

  removeAvatar = async (req, res, next) => {
    try {
      const result = await this.avatarService.remove(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAvatarUrl = async (req, res, next) => {
    try {
      const url = await this.avatarService.getSignedUrl(req.user.id);
      res.status(200).json({ url });
    } catch (error) {
      next(error);
    }
  };
}

export default ProfileController;