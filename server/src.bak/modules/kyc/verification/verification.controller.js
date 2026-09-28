/**
 * Verification Controller
 *
 * @module signalforge/server/modules/kyc/verification/controller
 */

import { VerificationService } from './verification.service.js';
import { ApplicationService } from '../application/application.service.js';

export class VerificationController {
  constructor(service = null, applicationService = null) {
    this.service = service || new VerificationService();
    this.applicationService = applicationService || new ApplicationService();
  }

  startVerification = async (req, res, next) => {
    try {
      const application = await this.applicationService.getByUserId(req.user.id);
      if (!application) {
        return res.status(404).json({
          error: { code: 'KYC_APPLICATION_NOT_FOUND', message: 'No KYC application found' },
        });
      }
      const result = await this.service.verify(application.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getLatestVerification = async (req, res, next) => {
    try {
      const application = await this.applicationService.getByUserId(req.user.id);
      if (!application) {
        return res.status(404).json({
          error: { code: 'KYC_APPLICATION_NOT_FOUND', message: 'No KYC application found' },
        });
      }
      const verification = await this.service.getLatest(application.id);
      res.status(200).json({ verification });
    } catch (error) {
      next(error);
    }
  };

  listVerifications = async (req, res, next) => {
    try {
      const application = await this.applicationService.getByUserId(req.user.id);
      if (!application) {
        return res.status(404).json({
          error: { code: 'KYC_APPLICATION_NOT_FOUND', message: 'No KYC application found' },
        });
      }
      const verifications = await this.service.list(application.id);
      res.status(200).json({ verifications });
    } catch (error) {
      next(error);
    }
  };
}

export default VerificationController;