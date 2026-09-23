/**
 * Report Repository
 *
 * @module signalforge/server/modules/analytics/reports/repository
 */

import { AnalyticsRepository } from '../analytics.repository.js';

export class ReportRepository {
  constructor(db = null) {
    this.analyticsRepository = new AnalyticsRepository(db);
  }

  async create(data) {
    return this.analyticsRepository.createReport(data);
  }

  async findById(reportId) {
    return this.analyticsRepository.findReportById(reportId);
  }

  async findByIdForUser(reportId, userId) {
    return this.analyticsRepository.findReportByIdForUser(reportId, userId);
  }

  async update(reportId, data) {
    return this.analyticsRepository.updateReport(reportId, data);
  }

  async list(userId, filters, pagination) {
    return this.analyticsRepository.listReports(userId, filters, pagination);
  }

  async delete(reportId) {
    return this.analyticsRepository.deleteReport(reportId);
  }
}

export default ReportRepository;