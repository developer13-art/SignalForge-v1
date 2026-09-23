/**
 * AI Signal Intelligence Controller
 *
 * @module signalforge/server/modules/ai-signal-intelligence/controller
 */

import { AiService } from './ai.service.js';
import { ParserController } from './parser/parser.controller.js';
import { ConfidenceController } from './confidence/confidence.controller.js';

export class AiController {
  constructor(service = null) {
    this.service = service || new AiService();
    this.parserController = new ParserController(this.service.parser);
    this.confidenceController = new ConfidenceController(this.service.confidence);
  }

  parse = async (req, res, next) => {
    return this.parserController.parse(req, res, next);
  };

  getParse = async (req, res, next) => {
    return this.parserController.getParse(req, res, next);
  };

  listParsesByMessage = async (req, res, next) => {
    return this.parserController.listByMessage(req, res, next);
  };

  listParses = async (req, res, next) => {
    return this.parserController.list(req, res, next);
  };

  scoreConfidence = async (req, res, next) => {
    return this.confidenceController.score(req, res, next);
  };

  getConfidence = async (req, res, next) => {
    return this.confidenceController.getBySignal(req, res, next);
  };

  confidenceStats = async (req, res, next) => {
    return this.confidenceController.average(req, res, next);
  };

  overview = async (req, res, next) => {
    try {
      const metrics = await this.service.summarizeMetrics({
        since: req.query.since,
        until: req.query.until,
      });
      const confidence = await this.service.averageConfidence({ since: req.query.since });
      res.status(200).json({ overview: { metrics, confidence } });
    } catch (error) {
      next(error);
    }
  };

  listLogs = async (req, res, next) => {
    try {
      const filters = {
        provider: req.query.provider,
        model: req.query.model,
        status: req.query.status,
        since: req.query.since,
      };
      const pagination = {
        limit: req.query.limit,
        offset: req.query.offset,
      };
      const result = await this.service.listLogs(filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default AiController;