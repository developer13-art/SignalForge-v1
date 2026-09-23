/**
 * MetaApi Account Service
 *
 * @module signalforge/server/modules/brokers/metaapi/account
 */

import { MetaApiClient } from './metaapi.client.js';
import { BrokerRepository } from '../broker.repository.js';
import { AccountRepository } from '../accounts/account.repository.js';
import { AccountCredentialService } from '../accounts/account-credential.service.js';
import { BrokerDeploymentError } from '../broker.errors.js';
import { isMetaApiSupported } from '../broker.constants.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

export class MetaApiAccountService {
  constructor(dependencies = {}) {
    this.client = dependencies.client || new MetaApiClient();
    this.repository = dependencies.repository || new BrokerRepository();
    this.accountRepository = dependencies.accountRepository || new AccountRepository();
    this.credentials = dependencies.credentials || new AccountCredentialService();
    this.logger = getLogger('metaapi-account');
  }

  async registerAccount(account) {
    if (!isMetaApiSupported(account.platform)) {
      throw new BrokerDeploymentError('Platform is not supported by MetaApi', {
        platform: account.platform,
      });
    }

    const credentials = this.credentials.decrypt(account.credentials_encrypted);

    const payload = {
      login: credentials.accountNumber,
      password: credentials.password,
      name: account.account_nickname || `Account ${credentials.accountNumber}`,
      server: credentials.server,
      platform: account.platform === 'MT4' ? 'mt4' : 'mt5',
      magic: 0,
      type: 'cloud-g2',
      provisioningProfileId: null,
      manualTrading: false,
      metastatsApiEnabled: false,
      reliability: 'high',
    };

    const response = await this.client.createAccount(payload);

    const metaApiAccountId = response.id || response._id;
    if (!metaApiAccountId) {
      throw new BrokerDeploymentError('MetaApi did not return an account id');
    }

    await this.accountRepository.update(account.id, {
      metaapiAccountId,
      metaapiRegion: response.region || null,
      status: 'CONNECTED',
      connectedAt: new Date(),
    });

    this.logger.info(
      { accountId: account.id, metaApiAccountId },
      'MetaApi account registered',
    );

    return {
      metaApiAccountId,
      region: response.region || null,
      raw: response,
    };
  }

  async getAccount(metaApiAccountId) {
    return this.client.getAccount(metaApiAccountId);
  }

  async removeAccount(metaApiAccountId) {
    try {
      await this.client.deleteAccount(metaApiAccountId);
      return { deleted: true };
    } catch (error) {
      this.logger.warn({ err: error, metaApiAccountId }, 'Failed to delete MetaApi account');
      return { deleted: false, error: error.message };
    }
  }

  async updateAccount(metaApiAccountId, payload) {
    return this.client.updateAccount(metaApiAccountId, payload);
  }
}

export default MetaApiAccountService;