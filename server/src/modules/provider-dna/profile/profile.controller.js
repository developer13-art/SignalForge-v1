/**
 * Profile Controller
 *
 * @module signalforge/server/modules/provider-dna/profile/controller
 */

import { ProfileService } from './profile.service.js';

export class ProfileController {
  constructor(service = null) {
    this.service = service || new ProfileService();
  }

  getFullProfile = async (req, res, next) => {
    try {
      const profile = await this.service.buildFullProfile(req.params.providerId);
      res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  };

  getLanguageProfile = async (req, res, next) => {
    try {
      const profile = await this.service.buildLanguageProfile(req.params.providerId);
      res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  };

  getSymbolProfile = async (req, res, next) => {
    try {
      const profile = await this.service.buildSymbolProfile(req.params.providerId);
      res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  };

  getRiskProfile = async (req, res, next) => {
    try {
      const profile = await this.service.buildRiskProfile(req.params.providerId);
      res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  };

  getManagementProfile = async (req, res, next) => {
    try {
      const profile = await this.service.buildManagementProfile(req.params.providerId);
      res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  };

  getReliabilityProfile = async (req, res, next) => {
    try {
      const profile = await this.service.buildReliabilityProfile(req.params.providerId);
      res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  };
}

export default ProfileController;