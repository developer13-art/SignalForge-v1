/**
 * Confidence Controller
 *
 * @module signalforge/server/modules/ai-signal-intelligence/confidence/controller
 */

import { ConfidenceService } from './confidence.service.js';

export class ConfidenceController {
  constructor(service = null) {
    this.service = service || new ConfidenceService();
  }

  score = async (req, res, next) => {
    try {
      const result = await this.service.scoreAndPersist(
        req.body.signalId,
        req.body.messageId || null,
        req.body.fields || {},
        req.body.parserConfidence ?? 0.5,
      );
      res.status(200).json({ confidence: result });
    } catch (error) {
      next(error);
    }
  };

  getBySignal = async (req, res, next) => {
    try {
      const confidence = await this.service.getBySignal(req.params.signalId);
      res.status(200).json({ confidence });
    } catch (error) {
      next(error);
    }
  };

  average = async (req, res, next) => {
    try {
      const filters = {
        since: req.query.since,
        model: req.query.model,
      };
      const stats = await this.service.average(filters);
      res.status(200).json({ stats });
    } catch (error) {
      next(error);
    }
  };
}

export default ConfidenceController;