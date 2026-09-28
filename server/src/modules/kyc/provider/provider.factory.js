/**
 * KYC Provider Factory
 *
 * Resolves the KYC provider implementation based on configuration.
 *
 * @module signalforge/server/modules/kyc/provider/factory
 */
const { SmileIdProvider } = require('./smile-id.provider.js');
const { VerifyMeProvider } = require('./verifyme.provider.js');
const { KYC_PROVIDERS } = require('../kyc.constants.js');
const kycConfig = require('../../../config/kyc.config.js');
const { KycProviderNotConfiguredError } = require('../kyc.errors.js');

const registered = {
  [KYC_PROVIDERS.SMILE_ID]: () => new SmileIdProvider(),
  [KYC_PROVIDERS.VERIFYME]: () => new VerifyMeProvider(),
};
class ProviderFactory {
  static register(name, factory) {
    registered[name] = factory;
  }

  static create(name = kycConfig.provider) {
    const factory = registered[name];
    if (!factory) {
      throw new KycProviderNotConfiguredError(`KYC provider "${name}" is not registered`);
    }
    return factory();
  }

  static list() {
    return Object.keys(registered);
  }
}
module.exports = ProviderFactory;
module.exports.ProviderFactory = ProviderFactory;
