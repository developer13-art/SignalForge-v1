/**
 * KYC Provider Interface
 *
 * Defines the contract that all KYC providers must implement. Providers
 * are injected into the KYC module, keeping the module decoupled from
 * any specific vendor.
 *
 * @module signalforge/server/modules/kyc/provider/interface
 */

export class KycProviderInterface {
  constructor(name) {
    this.name = name;
  }

  async verify(payload) {
    throw new Error('KYC provider must implement verify()');
  }

  async checkLiveness(applicationId, selfieBuffer, options = {}) {
    throw new Error('KYC provider must implement checkLiveness()');
  }

  async compareSelfie(selfieBuffer, referenceImageBuffer) {
    throw new Error('KYC provider must implement compareSelfie()');
  }

  async handleWebhook(payload) {
    throw new Error('KYC provider must implement handleWebhook()');
  }

  getProviderReference(response) {
    return response?.reference || response?.jobId || null;
  }
}

export default KycProviderInterface;