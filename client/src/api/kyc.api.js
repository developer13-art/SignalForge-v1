/**
 * KYC API
 *
 * Thin wrapper around the KYC endpoints. The server models every
 * submission as a resource on an application, so most calls require
 * an applicationId. The helper `ensureApplication()` fetches or
 * creates the current user's application and returns it, letting
 * individual KYC pages work with a single call.
 *
 * @module client/src/api/kyc.api
 */

import { get, post, del, upload } from './client.js';
import { endpoints } from './endpoints.js';

let cachedApplicationId = null;

export const kycApi = {
  getStatus: () => get(endpoints.kyc.status),

  /**
   * Fetches the current user's KYC application, creating one on the
   * server if none exists yet. Returns the application object with
   * its id.
   */
  ensureApplication: async () => {
    if (cachedApplicationId) {
      return { id: cachedApplicationId };
    }
    try {
      const existing = await get(endpoints.kyc.application);
      if (existing && existing.application && existing.application.id) {
        cachedApplicationId = existing.application.id;
        return existing.application;
      }
      if (existing && existing.id) {
        cachedApplicationId = existing.id;
        return existing;
      }
    } catch (_error) {
      // Fall through and create one.
    }
    const created = await post(endpoints.kyc.createApplication, {});
    const application = created.application || created;
    if (application && application.id) {
      cachedApplicationId = application.id;
    }
    return application;
  },

  clearApplicationCache: () => {
    cachedApplicationId = null;
  },

  submitPersonalInfo: async (payload) => {
    const application = await kycApi.ensureApplication();
    const url = endpoints.kyc.submitPersonalInfo(application.id);
    return post(url, payload);
  },

  listDocumentTypes: () => get(endpoints.kyc.documentTypes),

  uploadDocument: async (formData, onProgress) => {
    const application = await kycApi.ensureApplication();
    const url = endpoints.kyc.uploadDocument(application.id);
    return upload(url, formData, onProgress);
  },

  uploadSelfie: async (formData, onProgress) => {
    const application = await kycApi.ensureApplication();
    const url = endpoints.kyc.uploadSelfie(application.id);
    return upload(url, formData, onProgress);
  },

  submitApplication: async (payload) => {
    const application = await kycApi.ensureApplication();
    const url = endpoints.kyc.submitApplication(application.id);
    return post(url, payload);
  },

  resubmit: async (payload) => {
    const application = await kycApi.ensureApplication();
    const url = endpoints.kyc.resubmit(application.id);
    return post(url, payload);
  },

  listDocuments: async () => {
    const application = await kycApi.ensureApplication();
    const url = endpoints.kyc.documents(application.id);
    return get(url);
  },

  getDocument: async (documentId) => {
    const application = await kycApi.ensureApplication();
    const url = endpoints.kyc.document(application.id, documentId);
    return get(url);
  },

  getVerificationResult: async () => {
    const application = await kycApi.ensureApplication();
    const url = endpoints.kyc.verificationResult(application.id);
    return get(url);
  },
};

export default kycApi;