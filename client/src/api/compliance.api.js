/**
 * Compliance API
 *
 * @module client/src/api/compliance.api
 */

import { get, post, patch, del } from './client.js';
import { endpoints } from './endpoints.js';

export const complianceApi = {
  getDashboard: (params) => get(endpoints.compliance.dashboard, { params }),

  listSlaBreaches: (params) => get(endpoints.compliance.slaBreaches, { params }),

  listQueue: (params) => get(endpoints.compliance.kycQueue, { params }),

  getQueueStats: () => get(endpoints.compliance.kycQueueStats),

  listAssignedToMe: (params) => get(endpoints.compliance.kycQueueAssignedToMe, { params }),

  assignReviewer: (applicationId, payload) =>
    post(endpoints.compliance.assignReviewer(applicationId), payload),

  releaseReviewer: (applicationId) =>
    post(endpoints.compliance.releaseReviewer(applicationId)),

  getApplicationForReview: (applicationId) =>
    get(endpoints.compliance.reviewApplication(applicationId)),

  approveApplication: (applicationId, payload) =>
    post(endpoints.compliance.approveApplication(applicationId), payload),

  rejectApplication: (applicationId, payload) =>
    post(endpoints.compliance.rejectApplication(applicationId), payload),

  requestResubmission: (applicationId, payload) =>
    post(endpoints.compliance.resubmitApplication(applicationId), payload),

  suspendApplication: (applicationId, payload) =>
    post(endpoints.compliance.suspendApplication(applicationId), payload),

  escalateApplication: (applicationId, payload) =>
    post(endpoints.compliance.escalateApplication(applicationId), payload),

  listDocumentTypes: (params) => get(endpoints.compliance.documentTypes, { params }),

  createDocumentType: (payload) => post(endpoints.compliance.documentTypes, payload),

  getDocumentType: (documentTypeId) =>
    get(endpoints.compliance.documentType(documentTypeId)),

  updateDocumentType: (documentTypeId, payload) =>
    patch(endpoints.compliance.documentType(documentTypeId), payload),

  deactivateDocumentType: (documentTypeId) =>
    post(`${endpoints.compliance.documentType(documentTypeId)}/deactivate`),

  deleteDocumentType: (documentTypeId) =>
    del(endpoints.compliance.documentType(documentTypeId)),

  listVerificationProviders: (params) =>
    get(endpoints.compliance.verificationProviders, { params }),

  createVerificationProvider: (payload) =>
    post(endpoints.compliance.verificationProviders, payload),

  getVerificationProvider: (providerId) =>
    get(endpoints.compliance.verificationProvider(providerId)),

  updateVerificationProvider: (providerId, payload) =>
    patch(endpoints.compliance.verificationProvider(providerId), payload),

  deleteVerificationProvider: (providerId) =>
    del(endpoints.compliance.verificationProvider(providerId)),

  listRiskFlags: (params) => get(endpoints.compliance.riskFlags, { params }),

  getRiskFlag: (flagId) => get(endpoints.compliance.riskFlag(flagId)),

  resolveRiskFlag: (flagId, payload) =>
    post(endpoints.compliance.resolveRiskFlag(flagId), payload),

  getRiskFlagSeverityBreakdown: () =>
    get(endpoints.compliance.riskFlagSeverityBreakdown),

  listAuditEntries: (params) => get(endpoints.compliance.auditEntries, { params }),

  listAuditByResource: (resourceType, resourceId, params) =>
    get(endpoints.compliance.auditByResource(resourceType, resourceId), { params }),

  getActorSummary: (actorId, params) =>
    get(endpoints.compliance.actorSummary(actorId), { params }),

  getReportSummary: (params) => get(endpoints.compliance.reportSummary, { params }),

  getKycStatusReport: (params) => get(endpoints.compliance.reportKycStatus, { params }),

  getApprovalRateReport: (params) =>
    get(endpoints.compliance.reportApprovalRate, { params }),

  getRiskFlagsReport: (params) => get(endpoints.compliance.reportRiskFlags, { params }),

  getReviewerPerformanceReport: (params) =>
    get(endpoints.compliance.reportReviewerPerformance, { params }),

  getDocumentUsageReport: (params) =>
    get(endpoints.compliance.reportDocumentUsage, { params }),

  exportReport: (params) =>
    get(endpoints.compliance.reportExport, { params, responseType: 'blob' }),
};

export default complianceApi;