/**
 * Report Service
 *
 * @module signalforge/server/modules/analytics/reports/service
 */

import crypto from 'node:crypto';

import { ReportRepository } from './report.repository.js';
import { ReportGeneratorService } from './report-generator.service.js';
import { ReportExporterService } from './report-exporter.service.js';
import { AnalyticsRepository } from '../analytics.repository.js';
import { AnalyticsFilterService } from '../filters/analytics-filter.service.js';
import { ReportNotFoundError, ReportGenerationError } from '../analytics.errors.js';
import {
  REPORT_STATUSES,
  DEFAULT_REPORT_RETENTION_DAYS,
} from '../analytics.constants.js';
import {
  emitReportRequested,
  emitReportGenerated,
  emitReportFailed,
  emitReportExported,
} from '../analytics.events.js';

export class ReportService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new ReportRepository();
    this.analyticsRepository = dependencies.analyticsRepository || new AnalyticsRepository();
    this.generator = dependencies.generator || new ReportGeneratorService();
    this.exporter = dependencies.exporter || new ReportExporterService();
    this.filters = dependencies.filters || new AnalyticsFilterService();
  }

  async requestReport(userId, payload) {
    const filters = this.filters.build(payload.filters || payload);

    const report = await this.repository.create({
      userId,
      reportType: payload.reportType,
      format: payload.format || 'JSON',
      status: REPORT_STATUSES.PENDING,
      parameters: { filters },
      periodStart: filters.since || null,
      periodEnd: filters.until || null,
      requestedBy: userId,
    });

    await emitReportRequested(userId, report.id, payload.reportType);

    return this.generateReport(userId, report.id);
  }

  async generateReport(userId, reportId) {
    const report = await this.repository.findByIdForUser(reportId, userId);
    if (!report) {
      throw new ReportNotFoundError();
    }

    await this.repository.update(report.id, {
      status: REPORT_STATUSES.GENERATING,
      startedAt: new Date(),
    });

    try {
      const parameters = this.parseJson(report.parameters) || {};
      const filters = parameters.filters || {};

      const trades = await this.analyticsRepository.getClosedTradesForPeriod(
        userId,
        filters,
      );

      const generated = this.generator.generate(report.report_type, trades, {
        period: { since: report.period_start, until: report.period_end },
        startingEquity: parameters.startingEquity || 0,
      });

      const exported = this.exporter.export(generated, report.format || 'JSON');

      const filePath = `analytics/reports/${userId}/${report.id}.${this.extensionFor(report.format)}`;

      await this.repository.update(report.id, {
        status: REPORT_STATUSES.COMPLETED,
        filePath,
        fileSizeBytes: exported.sizeBytes,
        completedAt: new Date(),
        expiresAt: new Date(
          Date.now() + DEFAULT_REPORT_RETENTION_DAYS * 24 * 60 * 60 * 1000,
        ),
      });

      await emitReportGenerated(userId, report.id);

      return {
        reportId: report.id,
        status: REPORT_STATUSES.COMPLETED,
        filePath,
        fileSizeBytes: exported.sizeBytes,
        format: report.format,
      };
    } catch (error) {
      await this.repository.update(report.id, {
        status: REPORT_STATUSES.FAILED,
        error: error.message,
        completedAt: new Date(),
      });

      await emitReportFailed(userId, report.id, error);
      throw new ReportGenerationError(error.message, { reportId: report.id });
    }
  }

  async exportReport(userId, reportId, format) {
    const report = await this.repository.findByIdForUser(reportId, userId);
    if (!report) {
      throw new ReportNotFoundError();
    }

    const parameters = this.parseJson(report.parameters) || {};
    const filters = parameters.filters || {};

    const trades = await this.analyticsRepository.getClosedTradesForPeriod(
      userId,
      filters,
    );

    const generated = this.generator.generate(report.report_type, trades, {
      period: { since: report.period_start, until: report.period_end },
    });

    const exported = this.exporter.export(generated, format || report.format || 'JSON');

    await emitReportExported(userId, report.id, format || report.format);

    return exported;
  }

  async getReport(userId, reportId) {
    const row = await this.repository.findByIdForUser(reportId, userId);
    if (!row) {
      throw new ReportNotFoundError();
    }
    return this.serialize(row);
  }

  async listReports(userId, filters = {}, pagination = {}) {
    const result = await this.repository.list(userId, filters, pagination);
    return {
      reports: result.reports.map((r) => this.serialize(r)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async deleteReport(userId, reportId) {
    const report = await this.repository.findByIdForUser(reportId, userId);
    if (!report) {
      throw new ReportNotFoundError();
    }
    await this.repository.delete(report.id);
    return { deleted: true };
  }

  extensionFor(format) {
    switch (format) {
      case 'CSV':
        return 'csv';
      case 'PDF':
        return 'pdf';
      default:
        return 'json';
    }
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      reportType: row.report_type,
      format: row.format,
      status: row.status,
      parameters: this.parseJson(row.parameters),
      periodStart: row.period_start,
      periodEnd: row.period_end,
      filePath: row.file_path,
      fileSizeBytes: row.file_size_bytes,
      error: row.error,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  parseJson(input) {
    if (!input) {
      return null;
    }
    if (typeof input === 'string') {
      try {
        return JSON.parse(input);
      } catch {
        return null;
      }
    }
    return input;
  }
}

export default ReportService;