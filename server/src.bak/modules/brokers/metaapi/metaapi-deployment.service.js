/**
 * MetaApi Deployment Service
 *
 * @module signalforge/server/modules/brokers/metaapi/deployment
 */

import { MetaApiClient } from './metaapi.client.js';
import { AccountRepository } from '../accounts/account.repository.js';
import { getLogger } from '../../../bootstrap/initLogger.js';
import {
  emitAccountDeploying,
  emitAccountDeployed,
  emitAccountDeploymentFailed,
} from '../broker.events.js';

export class MetaApiDeploymentService {
  constructor(dependencies = {}) {
    this.client = dependencies.client || new MetaApiClient();
    this.repository = dependencies.repository || new AccountRepository();
    this.logger = getLogger('metaapi-deployment');
  }

  async deploy(accountId) {
    const account = await this.repository.findById(accountId);
    if (!account) {
      throw new Error('Broker account not found');
    }
    if (!account.metaapi_account_id) {
      throw new Error('MetaApi account id is missing');
    }

    await this.repository.update(account.id, { status: 'DEPLOYING' });
    await emitAccountDeploying(account.id, account.user_id);

    try {
      await this.client.deployAccount(account.metaapi_account_id);

      await this.repository.update(account.id, {
        status: 'DEPLOYED',
        connectedAt: new Date(),
      });

      await emitAccountDeployed(account.id, account.user_id);

      this.logger.info({ accountId: account.id }, 'MetaApi account deployed');
      return { deployed: true };
    } catch (error) {
      await this.repository.update(account.id, {
        status: 'ERROR',
        lastError: error.message,
        lastErrorAt: new Date(),
      });
      await emitAccountDeploymentFailed(account.id, account.user_id, error);
      throw error;
    }
  }

  async undeploy(accountId) {
    const account = await this.repository.findById(accountId);
    if (!account || !account.metaapi_account_id) {
      throw new Error('MetaApi account not found');
    }

    await this.client.undeployAccount(account.metaapi_account_id);

    await this.repository.update(account.id, {
      status: 'DISCONNECTED',
      disconnectedAt: new Date(),
    });

    return { undeployed: true };
  }

  async redeploy(accountId) {
    await this.undeploy(accountId);
    return this.deploy(accountId);
  }
}

export default MetaApiDeploymentService;