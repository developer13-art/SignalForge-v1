/**
 * Compliance Report Routes
 *
 * @module server/modules/compliance/reports/compliance-report.routes
 */

import { Router } from 'express';
import { complianceReportService } from './compliance-report.service';
import { asyncHandler } from '../../../lib/async-handler';
import { successResponse } from '../../../lib/response/success.response';

const router = Router();

router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const { from, to, granularity } = req.query;
    const report = await complianceReportService.generateComplianceReport({ from, to, granularity });
    return successResponse(res, { report });
  }),
);

router.get(
  '/kyc-status',
  asyncHandler(async (req, res) => {
    const { from, to, granularity } = req.query;
    const report = await complianceReportService.generateKycStatusReport({ from, to, granularity });
    return successResponse(res, { report });
  }),
);

router.get(
  '/approval-rate',
  asyncHandler(async (req, res) => {
    const { from, to } = req.query;
    const report = await complianceReportService.generateApprovalRateReport({ from, to });
    return successResponse(res, { report });
  }),
);

router.get(
  '/risk-flags',
  asyncHandler(async (req, res) => {
    const { from, to } = req.query;
    const report = await complianceReportService.generateRiskFlagReport({ from, to });
    return successResponse(res, { report });
  }),
);

router.get(
  '/reviewer-performance',
  asyncHandler(async (req, res) => {
    const { from, to } = req.query;
    const report = await complianceReportService.generateReviewerPerformanceReport({ from, to });
    return successResponse(res, { report });
  }),
);

router.get(
  '/document-usage',
  asyncHandler(async (req, res) => {
    const { from, to } = req.query;
    const report = await complianceReportService.generateDocumentUsageReport({ from, to });
    return successResponse(res, { report });
  }),
);

router.get(
  '/export',
  asyncHandler(async (req, res) => {
    const { type, from, to, granularity, format } = req.query;
    const result = await complianceReportService.exportReport({ type, from, to, granularity, format });

    if (result.format === 'CSV' && result.csv) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type || 'compliance-report'}.csv"`);
      return res.send(result.csv);
    }

    return successResponse(res, { report: result.report });
  }),
);

export default router;