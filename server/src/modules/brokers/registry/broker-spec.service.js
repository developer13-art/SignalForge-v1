/**
 * Broker Spec Service
 *
 * @module signalforge/server/modules/brokers/registry/broker-spec
 */

import { BROKER_PLATFORMS } from '../broker.constants.js';

const BROKER_SPECS = Object.freeze({
  'Exness-MT4-Real': {
    platform: BROKER_PLATFORMS.MT4,
    accountCurrency: 'USD',
    leverage: 2000,
    minLotSize: 0.01,
    maxLotSize: 200,
    lotStep: 0.01,
  },
  'Exness-MT5-Real': {
    platform: BROKER_PLATFORMS.MT5,
    accountCurrency: 'USD',
    leverage: 2000,
    minLotSize: 0.01,
    maxLotSize: 200,
    lotStep: 0.01,
  },
  'ICMarkets-MT4-Live': {
    platform: BROKER_PLATFORMS.MT4,
    accountCurrency: 'USD',
    leverage: 500,
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
  },
  'ICMarkets-MT5-Live': {
    platform: BROKER_PLATFORMS.MT5,
    accountCurrency: 'USD',
    leverage: 500,
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
  },
});

const DEFAULT_SPEC = Object.freeze({
  platform: BROKER_PLATFORMS.MT5,
  accountCurrency: 'USD',
  leverage: 100,
  minLotSize: 0.01,
  maxLotSize: 100,
  lotStep: 0.01,
});

export class BrokerSpecService {
  getSpec(server) {
    if (!server) {
      return DEFAULT_SPEC;
    }
    return BROKER_SPECS[server] || DEFAULT_SPEC;
  }

  getDefaultSpec() {
    return DEFAULT_SPEC;
  }

  getDefaultLeverage(server) {
    return this.getSpec(server).leverage;
  }

  getDefaultCurrency(server) {
    return this.getSpec(server).accountCurrency;
  }
}

export default BrokerSpecService;