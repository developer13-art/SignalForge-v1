/**
 * Consensus Controller
 *
 * @module signalforge/server/modules/consensus/controller
 */

import { ConsensusService } from './consensus.service.js';

export class ConsensusController {
  constructor(service = null) {
    this.service = service || new ConsensusService();
  }

  compute = async (req, res, next) => {
    try {
      const result = await this.service.computeConsensus(
        req.body.signals || [],
        req.body.options || {},
      );
      res.status(201).json({ consensus: result });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const result = await this.service.getById(req.params.consensusId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listMembers = async (req, res, next) => {
    try {
      const members = await this.service.listMembers(req.params.consensusId);
      res.status(200).json({ members });
    } catch (error) {
      next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const filters = {
        symbol: req.query.symbol,
        result: req.query.result,
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

  stats = async (req, res, next) => {
    try {
      const filters = { since: req.query.since };
      const stats = await this.service.stats(filters);
      res.status(200).json({ stats });
    } catch (error) {
      next(error);
    }
  };
}

export default ConsensusController;