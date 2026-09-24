/**
 * KYC API
 *
 * @module client/src/api/kyc.api
 */

import { get, post, upload } from './client.js';
import { endpoints } from './endpoints.js';

export const kycApi = {
  getStatus: () => get(endpoints.kyc.status),

  getApplication: () => get(endpoints.kyc.application),

  submitPersonalInfo: (payload) => post(endpoints.kyc.submitPersonalInfo, payload),

  listDocumentTypes: () => get(endpoints.kyc.documentTypes),

  uploadDocument: (formData, onProgress) => upload(endpoints.kyc.uploadDocument, formData, onProgress),

  uploadSelfie: (formData, onProgress) => upload(endpoints.kyc.uploadSelfie, formData, onProgress),

  submitApplication: (payload) => post(endpoints.kyc.submitApplication, payload),

  resubmit: (payload) => post(endpoints.kyc.resubmit, payload),

  listDocuments: () => get(endpoints.kyc.documents),

  getDocument: (documentId) => get(endpoints.kyc.document(documentId)),

  getVerificationResult: () => get(endpoints.kyc.verificationResult),
};

export default kycApi;