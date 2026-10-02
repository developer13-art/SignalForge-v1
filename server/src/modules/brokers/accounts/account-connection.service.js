/**
 * Broker Account Connection Service
 *
 * @module signalforge/server/modules/brokers/accounts/connection
 */
const { AccountRepository } = require('./account.repository.js');
const { AccountCredentialService } = require('./account-credential.service.js');
const { MetaApiAccountService } = require('../metaapi/metaapi-account.service.js');
const { MetaApiDeploymentService } = require('../metaapi/metaapi-deployment.service.js');
const { BrokerRegistryService } = require('../registry/broker-registry.service.js');
const { BrokerSpecService } = require('../registry/broker-spec.service.js');
const { getLogger } = require('../../../bootstrap/initLogger.js');
const { isMetaApiSupported } = require('../broker.constants.js');
const { BrokerAccountAlreadyExistsError, UnsupportedBrokerPlatformError, BrokerDeploymentError } = require('../broker.errors.js');
const { emitAccountCreated, emitAccountConnecting, emitAccountConnected, emitAccountError } = require('../broker.events.js');
class AccountConnectionService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new AccountRepository();
    this.credentials = dependencies.credentials || new AccountCredentialService();
    this.metaApiAccount = dependencies.metaApiAccount || new MetaApiAccountService();
    this.metaApiDeployment = dependencies.metaApiDeployment || new MetaApiDeploymentService();
    this.registry = dependencies.registry || new BrokerRegistryService();
    this.spec = dependencies.spec || new BrokerSpecService();
    this.logger = getLogger('broker-connection');
  }

  async connectAccount(userId, payload) {
    if (!isMetaApiSupported(payload.platform)) {
      throw new UnsupportedBrokerPlatformError(undefined, { platform: payload.platform });
    }

    const accountNumberHash = this.credentials.fingerprintAccountNumber(payload.accountNumber);
    const existing = await this.repository.findByUserAndNumber(userId, accountNumberHash, payload.server);
    if (existing && existing.status !== 'ERROR') {
      throw new BrokerAccountAlreadyExistsError();
    }

    const broker = payload.brokerName
      ? await this.registry.getOrCreateDefaultBroker(
          payload.brokerName,
          payload.platform,
          payload.server,
        )
      : null;

    const encrypted = this.credentials.encrypt({
      accountNumber: payload.accountNumber,
      password: payload.password,
      server: payload.server,
      platform: payload.platform,
    });
    const encryptedAccountNumber = this.credentials.encrypt({
      accountNumber: payload.accountNumber,
    });
    const maskedAccountNumber = this.credentials.maskCredentials({
      accountNumber: payload.accountNumber,
    }).accountNumber;

    const defaultSpec = this.spec.getSpec(payload.server);

    const accountData = {
      userId,
      brokerId: broker?.id || null,
      brokerName: payload.brokerName || broker?.name || null,
      platform: payload.platform,
      accountNumber: payload.accountNumber,
      accountNumberEncrypted: encryptedAccountNumber,
      accountNumberHash,
      accountNumberMasked: maskedAccountNumber,
      accountNickname: payload.accountNickname || null,
      server: payload.server,
      accountType: payload.accountType || 'DEMO',
      accountCurrency: payload.accountCurrency || defaultSpec.accountCurrency,
      leverage: payload.leverage ?? defaultSpec.leverage,
      status: 'PENDING',
      credentialsEncrypted: encrypted,
    };

    let created;
    if (existing) {
      if (!existing.metaapi_account_id) {
        await this.repository.update(existing.id, {
          ...accountData,
          lastError: null,
          lastErrorAt: null,
        });
      } else {
        await this.repository.update(existing.id, {
          status: 'PENDING',
          lastError: null,
          lastErrorAt: null,
        });
      }
      created = await this.repository.findById(existing.id);
    } else {
      created = await this.repository.create(accountData);
    }

    if (!existing) {
      await emitAccountCreated(created.id, userId, {
        platform: created.platform,
        accountNumber: created.account_number,
      });
    }
    await emitAccountConnecting(created.id, userId);

    try {
      const metaApiResult = created.metaapi_account_id
        ? { metaApiAccountId: created.metaapi_account_id }
        : await this.metaApiAccount.registerAccount({
            id: created.id,
            platform: created.platform,
            account_nickname: created.account_nickname,
            credentials_encrypted: encrypted,
          });

      await this.metaApiDeployment.deploy(created.id);

      const account = await this.repository.findById(created.id);
      await emitAccountConnected(created.id, userId, {
        metaApiAccountId: metaApiResult.metaApiAccountId,
      });

      return this.serialize(account);
    } catch (error) {
      const failureDetails = {
        cause: error.details?.cause || error.message,
        ...(error.details?.networkCode ? { networkCode: error.details.networkCode } : {}),
      };
      await this.repository.update(created.id, {
        status: 'ERROR',
        lastError: failureDetails.cause,
        lastErrorAt: new Date(),
      });
      await emitAccountError(created.id, userId, error);
      this.logger.error({ err: error, accountId: created.id }, 'Account connection failed');
      throw new BrokerDeploymentError('Account connection failed', failureDetails);
    }
  }

  async disconnectAccount(userId, accountId) {
    const account = await this.repository.findByIdForUser(accountId, userId);
    if (!account) {
      throw new Error('Account not found');
    }

    if (account.metaapi_account_id) {
      try {
        await this.metaApiDeployment.undeploy(account.id);
      } catch (error) {
        this.logger.warn({ err: error, accountId }, 'Undeploy failed');
      }
    }

    await this.repository.update(account.id, {
      status: 'DISCONNECTED',
      disconnectedAt: new Date(),
    });

    return { disconnected: true };
  }

  async removeAccount(userId, accountId) {
    const account = await this.repository.findByIdForUser(accountId, userId);
    if (!account) {
      throw new Error('Account not found');
    }

    if (account.metaapi_account_id) {
      await this.metaApiAccount.removeAccount(account.metaapi_account_id);
    }

    await this.repository.delete(account.id);
    return { deleted: true };
  }

  async updateCredentials(userId, accountId, payload) {
    const account = await this.repository.findByIdForUser(accountId, userId);
    if (!account) {
      throw new Error('Account not found');
    }

    const existing = this.credentials.decrypt(account.credentials_encrypted);
    const updated = {
      ...existing,
      password: payload.password,
    };

    const encrypted = this.credentials.encrypt(updated);
    await this.repository.update(account.id, { credentialsEncrypted: encrypted });

    return { updated: true };
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      brokerId: row.broker_id,
      brokerName: row.broker_name,
      platform: row.platform,
      accountNumber: row.account_number,
      accountNickname: row.account_nickname,
      server: row.server,
      accountType: row.account_type,
      accountCurrency: row.account_currency,
      leverage: row.leverage,
      status: row.status,
      metaApiAccountId: row.metaapi_account_id,
      balance: row.balance,
      equity: row.equity,
      margin: row.margin,
      freeMargin: row.free_margin,
      marginLevel: row.margin_level,
      lastSyncAt: row.last_sync_at,
      lastError: row.last_error,
      lastErrorAt: row.last_error_at,
      connectedAt: row.connected_at,
      disconnectedAt: row.disconnected_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
module.exports = AccountConnectionService;
module.exports.AccountConnectionService = AccountConnectionService;
