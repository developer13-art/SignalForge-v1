/**
 * Report Exporter Service
 *
 * @module signalforge/server/modules/analytics/reports/report-exporter
 */

import { REPORT_FORMATS } from '../analytics.constants.js';
import { ReportExportError } from '../analytics.errors.js';

export class ReportExporterService {
  export(report, format) {
    switch (format) {
      case REPORT_FORMATS.JSON:
        return this.toJson(report);
      case REPORT_FORMATS.CSV:
        return this.toCsv(report);
      case REPORT_FORMATS.PDF:
        return this.toPdf(report);
      default:
        throw new ReportExportError(`Unsupported format: ${format}`);
    }
  }

  toJson(report) {
    return {
      format: REPORT_FORMATS.JSON,
      mimeType: 'application/json',
      content: JSON.stringify(report, null, 2),
      sizeBytes: Buffer.byteLength(JSON.stringify(report), 'utf8'),
    };
  }

  toCsv(report) {
    if (!report || !Array.isArray(report.trades)) {
      throw new ReportExportError('CSV export requires a trades array');
    }

    const headers = [
      'id',
      'symbol',
      'direction',
      'volume',
      'entryPrice',
      'exitPrice',
      'profit',
      'commission',
      'swap',
      'openedAt',
      'closedAt',
    ];

    const lines = [headers.join(',')];

    for (const trade of report.trades) {
      lines.push(
        [
          trade.id,
          trade.symbol,
          trade.direction,
          trade.volume,
          trade.entryPrice,
          trade.exitPrice,
          trade.profit,
          trade.commission,
          trade.swap,
          trade.openedAt,
          trade.closedAt,
        ]
          .map((value) => this.escapeCsv(value))
          .join(','),
      );
    }

    const content = lines.join('\n');
    return {
      format: REPORT_FORMATS.CSV,
      mimeType: 'text/csv',
      content,
      sizeBytes: Buffer.byteLength(content, 'utf8'),
    };
  }

  toPdf() {
    throw new ReportExportError('PDF export is not yet implemented');
  }

  escapeCsv(value) {
    if (value === null || value === undefined) {
      return '';
    }
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
}

export default ReportExporterService;