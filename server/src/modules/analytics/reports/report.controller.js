/**
 * Report Controller
 *
 * @module signalforge/server/modules/analytics/reports/controller
 */

import { ReportService } from './report.service.js';

export class ReportController {
  constructor(service = null) {
    this.service = service || new ReportService();
  }

  requestReport = async (req, res, next) => {
    try {
      const report = await this.service.requestReport(req.user.id, req.body);
      res.status(202).json({ report });
    } catch (error) {
      next(error);
    }
  };

  listReports = async (req, res, next) => {
    try {
      const filters = {
        reportType: req.query.reportType,
        status: req.query.status,
        since: req.query.since,
      };
      const pagination = {
        limit: req.query.limit,
        offset: req.query.offset,
      };
      const result = await this.service.listReports(req.user.id, filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getReport = async (req, res, next) => {
    try {
      const report = await this.service.getReport(req.user.id, req.params.reportId);
      res.status(200).json({ report });
    } catch (error) {
      next(error);
    }
  };

  exportReport = async (req, res, next) => {
    try {
      const exported = await this.service.exportReport(
        req.user.id,
        req.params.reportId,
        req.query.format,
      );
      res.setHeader('Content-Type', exported.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="report.${exported.format.toLowerCase()}"`);
      res.send(exported.content);
    } catch (error) {
      next(error);
    }
  };

  deleteReport = async (req, res, next) => {
    try {
      const result = await this.service.deleteReport(req.user.id, req.params.reportId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default ReportController;