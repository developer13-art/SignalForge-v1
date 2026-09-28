/**
 * Verification Service
 *
 * Orchestrates the KYC verification flow: sends documents and
 * personal information to the configured provider, normalizes the
 * response, computes a risk score, and stores the result.
 *
 * @module signalforge/server/modules/kyc/verification/service
 */
const { VerificationRepository } = require('./verification.repository.js');
const { LivenessService } = require('./liveness.service.js');
const { NameMatchService } = require('./name-match.service.js');
const { DobMatchService } = require('./dob-match.service.js');
const { RiskScoreService } = require('./risk-score.service.js');
const { KYC_PROVIDERS, VERIFICATION_RESULTS } = require('../kyc.constants.js');
const { KycProviderNotConfiguredError } = require('../kyc.errors.js');
const { emitVerificationStarted, emitVerificationCompleted, emitVerificationFailed } = require('../kyc.events.js');
const { ApplicationRepository } = require('../application/application.repository.js');
const { KycRepository } = require('../kyc.repository.js');

export class VerificationService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new VerificationRepository();
    this.applicationRepository = dependencies.applicationRepository || new ApplicationRepository();
    this.kycRepository = dependencies.kycRepository || new KycRepository();
    this.provider = dependencies.provider || null;
    this.livenessService = new LivenessService(this.provider);
    this.nameMatchService = new NameMatchService();
    this.dobMatchService = new DobMatchService();
    this.riskScoreService = new RiskScoreService();
  }

  async verify(applicationId, options = {}) {
    const application = await this.applicationRepository.findById(applicationId);
    if (!application) {
      throw new Error('KYC application not found');
    }

    if (!this.provider) {
      throw new KycProviderNotConfiguredError();
    }

    const documents = await this.kycRepository.listDocumentsByApplication(applicationId);

    await emitVerificationStarted(
      application.user_id,
      applicationId,
      this.provider.name || KYC_PROVIDERS.MANUAL,
    );

    let providerResponse;
    try {
      providerResponse = await this.provider.verify({
        applicationId,
        userId: application.user_id,
        personalInfo: application.personal_info,
        documentType: application.document_type,
        documents,
        options,
      });
    } catch (error) {
      await this.repository.create({
        applicationId,
        userId: application.user_id,
        provider: this.provider.name || KYC_PROVIDERS.MANUAL,
        result: VERIFICATION_RESULTS.ERROR,
        providerResponse: { error: error.message },
      });

      await emitVerificationFailed(
        application.user_id,
        applicationId,
        this.provider.name || KYC_PROVIDERS.MANUAL,
        error.message,
      );

      throw error;
    }

    const nameMatch = this.nameMatchService.compare(
      `${application.personal_info?.firstName || ''} ${application.personal_info?.lastName || ''}`.trim(),
      providerResponse.documentName || '',
    );

    const dobMatch = this.dobMatchService.compare(
      application.personal_info?.dateOfBirth,
      providerResponse.documentDob,
    );

    const risk = this.riskScoreService.compute({
      nameMatch: nameMatch.result === VERIFICATION_RESULTS.PASSED,
      dobMatch: dobMatch.result === VERIFICATION_RESULTS.PASSED,
      liveness: providerResponse.livenessScore,
      documentCheck: providerResponse.documentCheck,
      identityCheck: providerResponse.identityCheck,
    });

    const overallResult =
      nameMatch.result === VERIFICATION_RESULTS.PASSED &&
      dobMatch.result === VERIFICATION_RESULTS.PASSED &&
      providerResponse.documentCheck !== false &&
      providerResponse.identityCheck !== false
        ? VERIFICATION_RESULTS.PASSED
        : VERIFICATION_RESULTS.FAILED;

    const verification = await this.repository.create({
      applicationId,
      userId: application.user_id,
      provider: this.provider.name || KYC_PROVIDERS.MANUAL,
      documentCheck: providerResponse.documentCheck,
      identityCheck: providerResponse.identityCheck,
      livenessCheck: providerResponse.livenessCheck,
      nameMatch: nameMatch.result === VERIFICATION_RESULTS.PASSED,
      dobMatch: dobMatch.result === VERIFICATION_RESULTS.PASSED,
      riskScore: risk.score,
      result: overallResult,
      providerResponse,
    });

    await emitVerificationCompleted(
      application.user_id,
      applicationId,
      this.provider.name || KYC_PROVIDERS.MANUAL,
      overallResult,
    );

    return {
      verificationId: verification.id,
      result: overallResult,
      riskScore: risk.score,
      nameMatch,
      dobMatch,
      providerResponse,
    };
  }

  async getLatest(applicationId) {
    return this.repository.findLatest(applicationId);
  }

  async list(applicationId) {
    return this.repository.list(applicationId);
  }
}
module.exports = VerificationService;