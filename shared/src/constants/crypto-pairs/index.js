'use strict';

const supportedPairs = require('./supported-pairs');
const pairMappings = require('./pair-mappings');
const dexRegistry = require('./dex-registry');
const tokenRegistry = require('./token-registry');
const slippageDefaults = require('./slippage-defaults');
const priorityFeePresets = require('./priority-fee-presets');

module.exports = {
  ...supportedPairs,
  ...pairMappings,
  ...dexRegistry,
  ...tokenRegistry,
  ...slippageDefaults,
  ...priorityFeePresets,
};