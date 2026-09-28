/**
 * Smile ID KYC Provider
 *
 * Integration with Smile Identity for document verification,
 * biometric KYC, and selfie authentication.
 *
 * @module signalforge/server/modules/kyc/provider/smile-id
 */

import smileIdConfig from '../../../config/smileid.config.js';
import { KycProviderInterface } from './kyc-provider.interface.js';
import { KycProviderError, KycProviderNotConfiguredError } from '../kyc.errors.js';
import { VERIFICATION_RESULTS } from '../kyc.constants.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

export class SmileIdProvider extends KycProviderInterface {
  constructor(config = null) {
    super('smileid');
    this.config = config || smileIdConfig;
    this.logger = getLogger('kyc-smileid');
  }

  assertConfigured() {
    if (!this.config.partnerId || !this.config.apiKey) {
      throw new KycProviderNotConfiguredError('Smile ID is not configured');
    }
  }

  buildRequestBody(payload) {
    return {
      partner_id: this.config.partnerId,
      source_sdk: 'rest_api',
      source_sdk_version: '1.0.0',
      partner_params: {
        user_id: payload.userId,
        job_id: payload.applicationId,
        job_type: this.config.jobTypes.documentVerification,
      },
      id_info: {
        first_name: payload.personalInfo?.firstName,
        middle_name: payload.personalInfo?.middleName,
        last_name: payload.personalInfo?.lastName,
        dob: payload.personalInfo?.dateOfBirth,
        country: payload.personalInfo?.country,
        id_type: payload.documentType,
      },
    };
  }

  async verify(payload) {
    this.assertConfigured();

    const body = this.buildRequestBody(payload);

    try {
      const response = await fetch(`${this.config.baseUrl}/id_verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new KycProviderError(`Smile ID request failed: ${response.status}`, {
          status: response.status,
          body: text,
        });
      }

      const result = await response.json();

      return {
        documentCheck: result?.Actions?.Document_Check === 'Passed',
        identityCheck: result?.Actions?.Verify_ID_Number === 'Passed',
        livenessCheck: result?.Actions?.Selfie_To_ID_Card_Compare === 'Passed',
        livenessScore: result?.Confidence_Value ?? null,
        documentName: result?.Full_Name || null,
        documentDob: result?.DOB || null,
        reference: result?.SmileJobID || result?.job_id || null,
        raw: result,
      };
    } catch (error) {
      if (error instanceof KycProviderError) {
        throw error;
      }
      throw new KycProviderError('Smile ID verification failed', {
        cause: error.message,
      });
    }
  }

  async checkLiveness(applicationId, selfieBuffer, options = {}) {
    this.assertConfigured();
    return {
      result: VERIFICATION_RESULTS.INCONCLUSIVE,
      score: null,
      reason: 'Liveness is handled as part of verify() for Smile ID',
    };
  }

  async compareSelfie(selfieBuffer, referenceImageBuffer) {
    return {
      result: VERIFICATION_RESULTS.INCONCLUSIVE,
      similarity: null,
      reason: 'Selfie comparison is handled as part of verify() for Smile ID',
    };
  }

  async handleWebhook(payload) {
    return {
      applicationId: payload?.partner_params?.job_id || payload?.SmileJobID || null,
      result: payload?.ResultCode === '0810' ? VERIFICATION_RESULTS.PASSED : VERIFICATION_RESULTS.FAILED,
      raw: payload,
    };
  }
}

export default SmileIdProvider;