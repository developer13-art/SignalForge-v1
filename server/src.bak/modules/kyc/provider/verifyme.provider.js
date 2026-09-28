/**
 * VerifyMe KYC Provider
 *
 * Integration with VerifyMe for Nigerian identity verification.
 *
 * @module signalforge/server/modules/kyc/provider/verifyme
 */

import verifyMeConfig from '../../../config/verifyme.config.js';
import { KycProviderInterface } from './kyc-provider.interface.js';
import { KycProviderError, KycProviderNotConfiguredError } from '../kyc.errors.js';
import { VERIFICATION_RESULTS } from '../kyc.constants.js';

let tokenCache = null;

export class VerifyMeProvider extends KycProviderInterface {
  constructor(config = null) {
    super('verifyme');
    this.config = config || verifyMeConfig;
  }

  assertConfigured() {
    if (!this.config.clientId || !this.config.clientSecret) {
      throw new KycProviderNotConfiguredError('VerifyMe is not configured');
    }
  }

  async getToken() {
    if (tokenCache && tokenCache.expiresAt > Date.now() + 60000) {
      return tokenCache.token;
    }

    const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new KycProviderError('VerifyMe authentication failed', {
        status: response.status,
      });
    }

    const result = await response.json();
    const token = result?.access_token || result?.token;
    if (!token) {
      throw new KycProviderError('VerifyMe did not return an access token');
    }

    tokenCache = {
      token,
      expiresAt: Date.now() + (this.config.tokenCache.ttlSeconds || 3000) * 1000,
    };

    return token;
  }

  endpointForDocumentType(documentType) {
    const map = {
      NATIONAL_ID: this.config.endpoints.ninVerification,
      VOTERS_CARD: this.config.endpoints.votersCardVerification,
      DRIVERS_LICENSE: this.config.endpoints.driversLicenseVerification,
      INTERNATIONAL_PASSPORT: this.config.endpoints.passportVerification,
    };
    return map[documentType] || this.config.endpoints.ninVerification;
  }

  async verify(payload) {
    this.assertConfigured();

    const token = await this.getToken();
    const endpoint = this.endpointForDocumentType(payload.documentType);

    const body = {
      firstname: payload.personalInfo?.firstName,
      lastname: payload.personalInfo?.lastName,
      dob: payload.personalInfo?.dateOfBirth,
      phone: payload.personalInfo?.phoneNumber,
    };

    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new KycProviderError(`VerifyMe request failed: ${response.status}`, {
          status: response.status,
          body: text,
        });
      }

      const result = await response.json();
      const passed = result?.status === true || result?.success === true;

      return {
        documentCheck: passed,
        identityCheck: passed,
        livenessCheck: null,
        livenessScore: null,
        documentName: `${result?.firstName || ''} ${result?.lastName || ''}`.trim() || null,
        documentDob: result?.dateOfBirth || null,
        reference: result?.reference || null,
        raw: result,
      };
    } catch (error) {
      if (error instanceof KycProviderError) {
        throw error;
      }
      throw new KycProviderError('VerifyMe verification failed', {
        cause: error.message,
      });
    }
  }

  async checkLiveness(applicationId, selfieBuffer, options = {}) {
    return {
      result: VERIFICATION_RESULTS.INCONCLUSIVE,
      score: null,
      reason: 'Liveness is not supported by VerifyMe for this integration',
    };
  }

  async compareSelfie(selfieBuffer, referenceImageBuffer) {
    this.assertConfigured();
    const token = await this.getToken();

    const formData = new FormData();
    formData.append('selfie', new Blob([selfieBuffer]), 'selfie.jpg');
    formData.append('reference', new Blob([referenceImageBuffer]), 'reference.jpg');

    const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.selfieVerification}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      throw new KycProviderError('VerifyMe selfie comparison failed');
    }

    const result = await response.json();
    const similarity = Number(result?.similarity ?? result?.confidence ?? 0);

    return { similarity, raw: result };
  }

  async handleWebhook(payload) {
    return {
      applicationId: payload?.reference || null,
      result: payload?.status === true ? VERIFICATION_RESULTS.PASSED : VERIFICATION_RESULTS.FAILED,
      raw: payload,
    };
  }
}

export default VerifyMeProvider;