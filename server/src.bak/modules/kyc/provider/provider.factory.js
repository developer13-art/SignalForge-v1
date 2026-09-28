/**
 * KYC Provider Factory
 *
 * Resolves the KYC provider implementation based on configuration.
 *
 * @module signalforge/server/modules/kyc/provider/factory
 */

import { SmileIdProvider } from './smile-id.provider.js';
import { VerifyMeProvider } from './verifyme.provider.js';
import { KYC_PROVIDERS } from '../kyc.constants.js';
import kycConfig from '../../../config/kyc.config.js';
import { KycProviderNotConfiguredError } from '../kyc.errors.js';

const registered = {
  [KYC_PROVIDERS.SMILE_ID]: () => new SmileIdProvider(),
  [KYC_PROVIDERS.VERIFYME]: () => new VerifyMeProvider(),
};

export class ProviderFactory {
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

export default ProviderFactory;