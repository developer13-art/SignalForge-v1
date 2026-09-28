'use strict';

const supportedPairs = require('./supported-pairs.cjs');
const pairMappings = require('./pair-mappings.cjs');
const dexRegistry = require('./dex-registry.cjs');
const tokenRegistry = require('./token-registry.cjs');
const slippageDefaults = require('./slippage-defaults.cjs');
const priorityFeePresets = require('./priority-fee-presets.cjs');

module.exports = {
  ...supportedPairs,
  ...pairMappings,
  ...dexRegistry,
  ...tokenRegistry,
  ...slippageDefaults,
  ...priorityFeePresets,
};