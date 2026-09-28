'use strict';

const routeDecision = require('./route-decision.schema.cjs');
const instrumentClass = require('./instrument-class.schema.cjs');
const dexOrder = require('./dex-order.schema.cjs');
const dexSwap = require('./dex-swap.schema.cjs');
const routePolicy = require('./route-policy.schema.cjs');
const cryptoPosition = require('./crypto-position.schema.cjs');

module.exports = {
  ...routeDecision,
  ...instrumentClass,
  ...dexOrder,
  ...dexSwap,
  ...routePolicy,
  ...cryptoPosition,
};