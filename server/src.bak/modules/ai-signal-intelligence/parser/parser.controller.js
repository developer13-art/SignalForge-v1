/**
 * Parser Controller
 *
 * @module signalforge/server/modules/ai-signal-intelligence/parser/controller
 */

import { ParserService } from './parser.service.js';

export class ParserController {
  constructor(service = null) {
    this.service = service || new ParserService();
  }

  parse = async (req, res, next) => {
    try {
      const result = await this.service.parseMessage({
        id: req.body.messageId || null,
        sourceId: req.body.sourceId || null,
        userId: req.body.userId || req.user?.id || null,
        channelId: req.body.channelId || null,
        senderName: req.body.senderName || null,
        text: req.body.text,
      }, {
        history: req.body.history || [],
        provider: req.body.provider,
        fastPathThreshold: req.body.fastPathThreshold,
      });
      res.status(200).json({ parse: result });
    } catch (error) {
      next(error);
    }
  };

  getParse = async (req, res, next) => {
    try {
      const parse = await this.service.getParseById(req.params.parseId);
      res.status(200).json({ parse });
    } catch (error) {
      next(error);
    }
  };

  listByMessage = async (req, res, next) => {
    try {
      const parses = await this.service.listByMessage(req.params.messageId);
      res.status(200).json({ parses });
    } catch (error) {
      next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const filters = {
        parserType: req.query.parserType,
        sourceId: req.query.sourceId,
        minConfidence: req.query.minConfidence !== undefined ? Number(req.query.minConfidence) : undefined,
        maxConfidence: req.query.maxConfidence !== undefined ? Number(req.query.maxConfidence) : undefined,
        since: req.query.since,
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
}

export default ParserController;